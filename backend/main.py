from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# FastAPI backend init
app = FastAPI(
    title="EduMath API",
    description="Backend API dla platformy hybrydowej EduMath",
    version="1.0.0"
)

# Configuration of CORS - to connect with frontend on vorcel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: restrict only to "https://edumath.vercel.app" or smth
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
async def health_check():
    """
    Prosty endpoint sprawdzajacy dostepnosc serwisu.
    Wykorzystywany do diagnostyki na frontendzie.
    """
    return {"status": "ok"}
