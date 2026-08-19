from fastapi import FastAPI
from src.backend.api.endpoints import router as api_router

app = FastAPI(title="Trading Enterprise Backend")

app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to the Trading Enterprise Backend API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
