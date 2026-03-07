"""In-memory session state store for MVP.

In production, replace with a persistent store (e.g., Redis, Postgres).
ADK provides InMemorySessionService out of the box, so this module is
a placeholder for any additional session-level helpers you may need.
"""

from typing import Any, Dict, Optional


class SessionStore:
    """Simple in-memory key-value store keyed by session ID."""

    def __init__(self) -> None:
        self._sessions: Dict[str, Dict[str, Any]] = {}

    def get(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self._sessions.get(session_id)

    def create(self, session_id: str) -> Dict[str, Any]:
        self._sessions[session_id] = {}
        return self._sessions[session_id]

    def update(self, session_id: str, key: str, value: Any) -> None:
        if session_id not in self._sessions:
            self._sessions[session_id] = {}
        self._sessions[session_id][key] = value

    def delete(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)


# Module-level singleton
session_store = SessionStore()
