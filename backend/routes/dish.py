# backend/routes/dish.py
from fastapi import APIRouter, File, UploadFile
from services.dish_vision import analyze_dish_image
from services.prices import get_cheapest_prices

router = APIRouter(prefix="/analyze-dish", tags=["Dish to Shopping List"])

@router.post("/")
async def analyze_dish(file: UploadFile = File(...)):
    image_bytes = await file.read()
    analysis = await analyze_dish_image(image_bytes)

    ingredients = analysis.get("ingredients", [])
    if not ingredients:
        analysis["shopping_list"] = {
            "items": [], "estimated_total": 0, "currency": "€", "note": "No ingredients"
        }
        return analysis

    shopping_data = await get_cheapest_prices(ingredients)
    analysis["shopping_list"] = shopping_data
    return analysis