# Daily recommended values (simplified for adult male)
DAILY_NUTRIENTS = {
    "protein": 56,      # g
    "vitamin_C_mg": 90,
    "iron_mg": 8,
    "calcium_mg": 1000,
    # add more later
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
            gaps[nutrient] = f"Need {missing}{'g' if 'protein' in nutrient else 'mg'} more"

    return {
        "chosen_recipe": chosen_recipe_name,
        "covered": {k: v for k, v in micros.items() if k in DAILY_NUTRIENTS},
        "still_missing_today": gaps or "You're all set!"
    }