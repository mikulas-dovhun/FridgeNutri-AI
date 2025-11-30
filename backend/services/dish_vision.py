# backend/services/dish_vision.py
import base64
import json
import re
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Comprehensive Slovak → English translation map (updated for Slovak dishes)
ENGLISH_NAMES = {
    # Meats
    "hovädzie mäso": "beef",
    "hovädzie": "beef",
    "bravčové mäso": "pork",
    "kuracie mäso": "chicken",
    "morčacie mäso": "turkey",
    "klobása": "sausage",
    "slanina": "bacon",
    "údené mäso": "smoked meat",

    # Dairy & Eggs
    "bryndza": "bryndza cheese",
    "syrové halušky": "cheese dumplings",
    "smotana": "cooking cream",
    "kyslá smotana": "sour cream",
    "mlieko": "milk",
    "maslo": "butter",
    "vajcia": "eggs",
    "vajíčka": "eggs",
    "syrov": "cheese",

    # Vegetables
    "zemiaky": "potatoes",
    "koreňová zelenina": "root vegetables",
    "mrkva": "carrots",
    "mrkev": "carrots",
    "petržlen": "parsley root",
    "celer": "celery",
    "cibuľa": "onion",
    "cesnak": "garlic",
    "kapusta": "cabbage",
    "kyslá kapusta": "sauerkraut",
    "paradajky": "tomatoes",
    "paprika": "bell pepper",

    # Grains & Flour
    "múka": "flour",
    "hladká múka": "all-purpose flour",
    "ryža": "rice",

    # Other
    "soľ": "salt",
    "korenie": "black pepper",
    "olej": "oil",
    "cukor": "sugar",
    "ocot": "vinegar",

    # Full dishes (for recognition)
    "bryndzové halušky": "bryndza dumplings",
    "kapustnica": "sauerkraut soup",
    "sviečková na smotane": "beef sirloin in cream sauce",
    "guláš": "goulash",
    "rezne": "schnitzel",
    "cesnačka": "garlic soup",
}

async def analyze_dish_image(image_bytes: bytes) -> dict:
    base64_image = base64.b64encode(image_bytes).decode('utf-8')

    response = client.chat.completions.create(
        model="gpt-4o-2024-08-06",
        temperature=0.0,
        max_tokens=2000,
        messages=[
            {
                "role": "system",
                "content": "You are a world-class Slovak chef. Analyze the finished dish in the photo and return ONLY valid JSON using this exact structure. Use Slovak names for ingredients (e.g. 'zemiaky', 'bryndza') so we can match prices in Slovak shops."
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": """
Analyze this photo of a finished Slovak or international dish and return ONLY valid JSON with this exact structure:

{
  "recognized_dish": "Bryndzové halušky",
  "certainty_percent": 98,
  "serves": 4,
  "prep_time_min": 45,
  "instructions": "1. Peel and grate potatoes... (full recipe in English)",
  "ingredients": [
    {"name": "zemiaky", "amount": "1 kg"},
    {"name": "bryndza", "amount": "300 g"},
    {"name": "slanina", "amount": "150 g"}
  ]
}

Use only Slovak ingredient names in the list (e.g. 'zemiaky', not 'potatoes'). Be very accurate.
"""},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ]
    )

    raw = response.choices[0].message.content.strip()

    # Clean code blocks
    if raw.startswith("```json"):
        raw = raw[7:]
    if raw.endswith("```"):
        raw = raw[:-3]
    raw = raw.strip()

    try:
        result = json.loads(raw)

        # Translate ingredient names to clean English for frontend display
        translated_ingredients = []
        for ing in result.get("ingredients", []):
            original_name = ing.get("name", "").strip().lower()
            english_name = ENGLISH_NAMES.get(original_name, original_name.title())
            translated_ingredients.append({
                "name": english_name,
                "amount": ing.get("amount", "1 portion")
            })
        result["ingredients"] = translated_ingredients

        # Ensure shopping_list will be filled later
        result.setdefault("shopping_list", {
            "items": [],
            "estimated_total": 0,
            "currency": "€",
            "note": "Fetching real-time prices..."
        })

        return result

    except json.JSONDecodeError as e:
        return {
            "error": "Failed to parse GPT response as JSON",
            "raw_output": raw,
            "exception": str(e)
        }
    except Exception as e:
        return {
            "error": "Unexpected error in dish analysis",
            "details": str(e)
        }