import redis
import json
import os
from typing import Any, Optional
from src.backend.core.state import AgentState

class DepartmentContextStore:
    def __init__(self, host=None, port=None, db=0, redis_client=None):
        if redis_client:
            self.client = redis_client
        else:
            # Prefer REDIS_URL from environment, fall back to individual host/port
            redis_url = os.getenv('REDIS_URL')
            if redis_url:
                self.client = redis.from_url(redis_url, decode_responses=True)
            else:
                redis_host = host or os.getenv('REDIS_HOST', 'localhost')
                redis_port = port or int(os.getenv('REDIS_PORT', 6379))
                self.client = redis.Redis(host=redis_host, port=redis_port, db=db, decode_responses=True)

    def save_state(self, session_id: str, state: AgentState) -> None:
        # State is a TypedDict, so we serialize it to JSON
        self.client.set(f"state:{session_id}", json.dumps(state))

    def get_state(self, session_id: str) -> Optional[AgentState]:
        data = self.client.get(f"state:{session_id}")
        if data:
            return json.loads(data)
        return None
