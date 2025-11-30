# services/recipes.py

# Упрощённые дневные нормы (всё в mg, кроме protein/fiber в g)
DAILY_NUTRIENTS = {
    "protein": 56,          # g
    "fiber_g": 25,          # g

    "vitamin_A_mg": 0.9,
    "vitamin_B6_mg": 1.3,
    "vitamin_B12_mg": 0.0024,  # 2.4 µg ≈ 0.0024 mg
    "vitamin_C_mg": 90,
    "vitamin_D_mg": 0.015,     # 15 µg
    "vitamin_E_mg": 15,

    "calcium_mg": 1000,
    "magnesium_mg": 400,
    "iron_mg": 8,
    "zinc_mg": 11,
    "potassium_mg": 4700,
}

def calculate_gaps(chosen_recipe_name: str, analysis_result: dict) -> dict:
    recipe = next((r for r in analysis_result["recipes"] if r["name"] == chosen_recipe_name), None)
    if not recipe:
        return {"error": "Recipe not found"}

    gaps = {}
    micros = recipe.get("micronutrients", {})
    for nutrient, daily in DAILY_NUTRIENTS.items():
        current = micros.get(nutrient, 0)
        if isinstance(current, str):
            current = float(current.replace("g", "").replace("mg", ""))

        missing = daily - current
        if missing > 0:
            unit = "g" if nutrient == "protein" or nutrient.endswith("_g") else "mg"
            gaps[nutrient] = f"Need {missing:.2f}{unit} more"

    return {
        "chosen_recipe": chosen_recipe_name,
        "covered": {k: v for k, v in micros.items() if k in DAILY_NUTRIENTS},
        "still_missing_today": gaps or "You're all set!"
    }
