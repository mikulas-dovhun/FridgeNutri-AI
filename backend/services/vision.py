# services/vision.py
import base64
import json
import re
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def analyze_fridge_image(image_bytes: bytes) -> dict:
    base64_image = base64.b64encode(image_bytes).decode('utf-8')

    response = client.chat.completions.create(
        model="gpt-4o-2024-08-06",  # newest & most accurate vision model
        temperature=0.0,
        max_tokens=2000,
        messages=[
            {"role": "system",
             "content": "You are a world-class fridge analyst. Return ONLY valid JSON. No markdown, no explanations, no code blocks."},
            {"role": "user", "content": [
                {"type": "text", "text": """
            Look at this fridge photo and return ONLY valid JSON with this exact structure:
            
            {
              "ingredients": [
                {"name": "eggs", "amount": "dozen"},
                {"name": "milk", "amount": "1.5L"},
                {"name": "chicken thighs", "amount": "1kg"},
                {"name": "greek yogurt", "amount": "500g"},
                {"name": "broccoli", "amount": "3 heads"},
                {"name": "tomatoes", "amount": "6"},
                {"name": "cheese", "amount": "300g"},
                {"name": "bell peppers", "amount": "4"}
              ],
              "recipes": [
                {
                  "name": "Creamy Chicken Pasta",
                  "ingredients_used": ["chicken thighs 600g", "milk 400ml", "cheese 150g", "tomatoes 4"],
                  "instructions": "1. Cook chicken. 2. Make creamy sauce with milk and cheese. 3. Add tomatoes.",
                  "macros": {"calories": 720, "protein": 68, "carbs": 48, "fat": 32, "sugar_g": 10},
                  "micronutrients": {"vitamin_A_mg": 0.3, "vitamin_B6_mg": 0.5, "vitamin_B12_mg": 0.001, "vitamin_C_mg": 85,
                  "vitamin_D_mg": 0.01, "vitamin_E_mg": 5, "fiber_g": 8, "calcium_mg": 400, "magnesium_mg": 120, "iron_mg": 4, "zinc_mg": 3, "potassium_mg": 900
}
                },
                {
                  "name": "Broccoli & Cheese Frittata",
                  "ingredients_used": ["eggs 8", "broccoli 2 heads", "cheese 150g", "bell peppers 2"],
                  "instructions": "1. Whisk eggs. 2. Add chopped veggies and cheese. 3. Bake 20 min.",
                  "macros": {"calories": 580, "protein": 48, "carbs": 22, "fat": 38, "sugar_g": 10},
                  "micronutrients": {"vitamin_A_mg": 0.3, "vitamin_B6_mg": 0.5, "vitamin_B12_mg": 0.001, "vitamin_C_mg": 85,
                  "vitamin_D_mg": 0.01, "vitamin_E_mg": 5, "fiber_g": 8, "calcium_mg": 400, "magnesium_mg": 120, "iron_mg": 4, "zinc_mg": 3, "potassium_mg": 900
                }
              ],
              "shopping_suggestions": ["pasta", "olive oil", "garlic", "onions", "herbs"]
            }
            
                "RULES:
                - List EVERY visible food item with realistic quantity
                - Create 5–12 realistic recipes using only what you see
                - NEVER return empty arrays unless the fridge is truly empty
                - For EVERY recipe, ALWAYS include both 'macros' and 'micronutrients' with numeric values.
                - Use ONLY these micronutrient keys: vitamin_A_mg, vitamin_B6_mg, vitamin_B12_mg, vitamin_C_mg, vitamin_D_mg, vitamin_E_mg, fiber_g, calcium_mg, magnesium_mg, iron_mg, zinc_mg, potassium_mg.
                - Only valid JSON, nothing else"
            """},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            ]}
        ]
    )

    raw = response.choices[0].message.content.strip()

    # Remove any markdown
    cleaned = re.sub(r"^```json\s*|```$", "", raw, flags=re.MULTILINE).strip()

    try:
        result = json.loads(cleaned)
        # Guarantee structure
        result.setdefault("ingredients", [])
        result.setdefault("recipes", [])
        result.setdefault("shopping_suggestions", [])
        return result
    except json.JSONDecodeError as e:
        return {"error": "Invalid JSON", "raw": cleaned, "parse_error": str(e)}


async def analyze_dish_image(image_bytes: bytes):
    base64_image = base64.b64encode(image_bytes).decode('utf-8')

    response = client.chat.completions.create(
        model="gpt-4o-2024-08-06",  # newest & most accurate vision model
        temperature=0.0,
        max_tokens=2000,
        messages=[
            {"role": "system",
             "content": "You are a world-class fridge analyst. Return ONLY valid JSON. No markdown, no explanations, no code blocks."},
            {"role": "user", "content": [
                {"type": "text", "text": """
                    You are an expert culinary analyst. Return ONLY valid JSON.

TASK:
1. Identify the cooked dish in the image.
2. Estimate number of servings.
3. Estimate preparation time (in minutes).
4. Extract all ingredients with realistic estimated amounts.
5. Write simple cooking instructions (5–10 short steps).
6. Create a shopping list where each ingredient includes:
   - normalized product name,
   - estimated amount,
   - price in euros,
   - most likely store (Tesco, Lidl, Kaufland, Billa)
7. Calculate total estimated cost.

RETURN JSON EXACTLY in this structure:

{
  "recognized_dish": "string",
  "serves": 2,
  "prep_time_min": 25,
  "instructions": "1. ...\\n2. ...",
  "ingredients": [
    { "name": "string", "amount": "string" }
  ],
  "shopping_list": {
    "items": [
      { "item": "string", "amount": "string", "price": float, "store": "string" }
    ],
    "estimated_total": float,
    "currency": "€"
  }
}           
            """},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            ]}
        ]
    )

    raw = response.choices[0].message.content.strip()

    # Remove any markdown
    cleaned = re.sub(r"^```json\s*|```$", "", raw, flags=re.MULTILINE).strip()

    try:
        result = json.loads(cleaned)
        # Guarantee structure
        result.setdefault("ingredients", [])
        result.setdefault("recipes", [])
        result.setdefault("shopping_suggestions", [])
        return result
    except json.JSONDecodeError as e:
        return {"error": "Invalid JSON", "raw": cleaned, "parse_error": str(e)}
