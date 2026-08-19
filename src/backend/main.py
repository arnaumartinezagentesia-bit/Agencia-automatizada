from fastapi import FastAPI

app = FastAPI(title="Trading Enterprise Backend")

@app.get("/")
async def root():
    return {"message": "Welcome to the Trading Enterprise Backend API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
