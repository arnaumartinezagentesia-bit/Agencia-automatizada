import redis
import json
from typing import Any, Optional
from src.backend.core.state import AgentState

class DepartmentContextStore:
    def __init__(self, host='localhost', port=6379, db=0, redis_client=None):
        if redis_client:
            self.client = redis_client
        else:
            self.client = redis.Redis(host=host, port=port, db=db, decode_responses=True)

    def save_state(self, session_id: str, state: AgentState) -> None:
        # State is a TypedDict, so we serialize it to JSON
        self.client.set(f"state:{session_id}", json.dumps(state))

    def get_state(self, session_id: str) -> Optional[AgentState]:
        data = self.client.get(f"state:{session_id}")
        if data:
            return json.loads(data)
        return None
