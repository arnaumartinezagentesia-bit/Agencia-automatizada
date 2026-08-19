from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
import json
import asyncio
from src.backend.api.endpoints import router as api_router

app = FastAPI(title="Trading Enterprise Backend")

# Connection Manager to handle WebSocket clients
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                # Handle broken connections silently
                pass

manager = ConnectionManager()

app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to the Trading Enterprise Backend API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages if needed
            data = await websocket.receive_text()
            # For now, we just echo or ignore, the primary purpose is broadcasting state from backend
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket Error: {e}")
        manager.disconnect(websocket)

# Background task to simulate agent state changes for verification
# In a real scenario, this would be triggered by the actual agent logic in src.backend.agents
async def simulate_agent_updates():
    import random
    agents = ["Agent1", "Agent2", "Agent3"]
    states = ['IDLE', 'WORKING', 'THINKING', 'ALERT', 'COLLABORATING']

    while True:
        await asyncio.sleep(5) # Update every 5 seconds
        agent = random.choice(agents)
        state = random.choice(states)
        await manager.broadcast({
            "type": "AGENT_STATE_UPDATE",
            "payload": {
                "agentId": agent,
                "state": state
            }
        })

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_agent_updates())
