from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import analyze

app = FastAPI(title="FridgeNutri AI", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: only your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)

@app.get("/")
def home():
    return {"message": "FridgeNutri AI backend running! Go to /docs"}