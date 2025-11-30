# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze import router as fridge_router
from routes.dish import router as dish_router  # Fixed import

app = FastAPI(title="FridgeNutri AI + DishToShop", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fridge_router)
app.include_router(dish_router)  # Now works with full path in dish.py

@app.get("/")
def home():
    return {"message": "Backend running! Endpoints: /analyze, /analyze-dish"}