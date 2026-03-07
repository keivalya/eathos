"""FastAPI server that wraps the ADK agent for the frontend.

Endpoints:
  POST /api/analyze      — Upload a fridge photo to start a new session
  POST /api/action       — Handle user actions (confirm inventory, accept/reject recipe)
  GET  /api/inventory/{session_id} — Get current inventory for a session
"""

import json
import os
from contextlib import asynccontextmanager
from typing import Optional

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from pydantic import BaseModel

from .agent import root_agent

# Load environment variables from .env
load_dotenv()

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


class UserAction(BaseModel):
    """Request body for the /api/action endpoint."""
    session_id: str
    action: str  # "confirm_inventory", "accept_recipe", "reject_recipe", "free_input"
    data: Optional[dict] = None


@app.post("/api/analyze")
async def analyze_fridge(image: UploadFile = File(...)):
    """Upload a fridge photo to start a new session."""
    # Create a new session
    session = await session_service.create_session(
        app_name="fridge-recipe", user_id="user"
    )
    session_id = session.id
    _sessions[session_id] = session

    # Read raw image bytes for the vision model
    image_bytes = await image.read()
    mime_type = image.content_type or "image/jpeg"

    # Send image to the orchestrator
    user_message = types.Content(
        role="user",
        parts=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            types.Part(text="Analyze this fridge image and identify all food items."),
        ],
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

    return json.loads(session.state.get("inventory", "{}"))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
