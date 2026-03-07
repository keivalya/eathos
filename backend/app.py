"""FastAPI server that wraps the ADK agent for the frontend.

Endpoints:
  POST /api/analyze      — Upload a fridge photo to start a new session
  POST /api/action       — Handle user actions (confirm inventory, accept/reject recipe)
  GET  /api/inventory/{session_id} — Get current inventory for a session
"""

# IMPORTANT: Load .env BEFORE any ADK/genai imports so the API key is available
from pathlib import Path as _Path
from dotenv import load_dotenv
load_dotenv(_Path(__file__).parent / ".env", override=True)

import json
import os
from contextlib import asynccontextmanager
from typing import Optional

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from pydantic import BaseModel

from .agent import root_agent

# --- Session Management ---
session_service = InMemorySessionService()
runner = Runner(
    agent=root_agent,
    session_service=session_service,
    app_name="fridge-recipe",
)

# Track active sessions
_sessions: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup/shutdown hooks."""
    yield


app = FastAPI(title="Fridge-to-Recipe API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated images as static files
_images_dir = _Path(__file__).parent / "generated_images"
_images_dir.mkdir(exist_ok=True)
app.mount("/images", StaticFiles(directory=str(_images_dir)), name="images")

# Serve uploaded fridge photos
_uploads_dir = _Path(__file__).parent / "uploads"
_uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_uploads_dir)), name="uploads")


class UserAction(BaseModel):
    """Request body for the /api/action endpoint."""
    session_id: str
    action: str  # "confirm_inventory", "accept_recipe", "reject_recipe", "free_input"
    data: Optional[dict] = None


@app.post("/api/analyze")
async def analyze_fridge(image: UploadFile = File(...)):
    """Upload a fridge photo to start a new session."""
    print("\n" + "=" * 60)
    print("[ANALYZE] Starting new analysis...")

    # Create a new session
    session = await session_service.create_session(
        app_name="fridge-recipe", user_id="user"
    )
    session_id = session.id
    _sessions[session_id] = session
    print(f"[ANALYZE] Session created: {session_id}")

    # Read raw image bytes for the vision model
    image_bytes = await image.read()
    mime_type = image.content_type or "image/jpeg"
    print(f"[ANALYZE] Image received: {len(image_bytes)} bytes, type={mime_type}")

    # Save the uploaded image locally for persistence
    ext = mime_type.split("/")[-1] if "/" in mime_type else "jpg"
    if ext == "jpeg":
        ext = "jpg"
    
    file_name = f"{session_id}.{ext}"
    file_path = _uploads_dir / file_name
    file_path.write_bytes(image_bytes)

    # Persist the URL in session state
    image_url = f"http://localhost:8000/uploads/{file_name}"
    session.state["fridge_image_url"] = image_url

    # Send image to the orchestrator
    user_message = types.Content(
        role="user",
        parts=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            types.Part(text="Analyze this fridge image and identify all food items."),
        ],
    )

    events = []
    event_count = 0
    async for event in runner.run_async(
        session_id=session_id, user_id="user", new_message=user_message
    ):
        event_count += 1
        print(f"\n[EVENT #{event_count}] author={event.author}")
        if event.actions and event.actions.state_delta:
            print(f"  [STATE_DELTA] keys={list(event.actions.state_delta.keys())}")
            for k, v in event.actions.state_delta.items():
                preview = str(v)[:200] if v else "None"
                print(f"    {k} = {preview}")
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    print(f"  [TEXT] {part.text[:300]}...")
                    try:
                        parsed = json.loads(part.text)
                        events.append(parsed)
                        print(f"  [PARSED] action={parsed.get('action', 'N/A')}")
                    except json.JSONDecodeError:
                        events.append({"text": part.text})
                        print(f"  [RAW TEXT] (not JSON)")

    # Log final session state
    print(f"\n[SESSION STATE after analyze]")
    for k, v in session.state.items():
        preview = str(v)[:200] if v else "None"
        print(f"  {k} = {preview}")

    print(f"\n[ANALYZE] Total events collected: {len(events)}")
    for i, ev in enumerate(events):
        print(f"  event[{i}] action={ev.get('action', 'N/A')}, keys={list(ev.keys())}")
    print("=" * 60 + "\n")

    return {"session_id": session_id, "events": events}


@app.post("/api/action")
async def user_action(action: UserAction):
    """Handle user actions: confirm inventory, accept/reject recipe."""
    session_id = action.session_id

    # Update session state based on user action
    session = await session_service.get_session(
        app_name="fridge-recipe", user_id="user", session_id=session_id
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Set the phase based on user action
    if action.action == "confirm_inventory":
        session.state["phase"] = "generate_recipe"
        if action.data and "edited_inventory" in action.data:
            session.state["inventory"] = json.dumps(action.data["edited_inventory"])
        if action.data and "dietary_preferences" in action.data:
            session.state["dietary_preferences"] = action.data["dietary_preferences"]
    elif action.action == "accept_recipe":
        session.state["phase"] = "accept_recipe"
    elif action.action == "reject_recipe":
        session.state["phase"] = "reject_recipe"
    elif action.action == "free_input":
        session.state["phase"] = "generate_recipe"
        if action.data and "user_input" in action.data:
            session.state["dietary_preferences"] = action.data["user_input"]

    # Resume the orchestrator
    user_message = types.Content(
        role="user",
        parts=[types.Part(text=f"User action: {action.action}")],
    )

    events = []
    async for event in runner.run_async(
        session_id=session_id, user_id="user", new_message=user_message
    ):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    try:
                        events.append(json.loads(part.text))
                    except json.JSONDecodeError:
                        events.append({"text": part.text})

    return {"session_id": session_id, "events": events}


@app.get("/api/inventory/{session_id}")
async def get_inventory(session_id: str):
    """Get the current inventory for a session."""
    session = await session_service.get_session(
        app_name="fridge-recipe", user_id="user", session_id=session_id
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "inventory": json.loads(session.state.get("inventory", "[]")),
        "fridge_image_url": session.state.get("fridge_image_url")
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
