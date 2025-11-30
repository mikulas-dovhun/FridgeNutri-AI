# services/alternative.py

import base64
import json
import re
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

ALREADY_GREAT = {
    "extra virgin olive oil", "olive oil extra virgin", "evoo",
    "avocado oil", "avocado",
    "almonds", "walnuts", "hazelnuts", "pistachios", "macadamia", "brazil nuts",
    "salmon", "mackerel", "sardines", "anchovies",
    "eggs", "organic eggs", "free-range eggs",
    "berries", "blueberries", "strawberries", "raspberries", "blackberries",
    "spinach", "kale", "arugula", "swiss chard", "broccoli", "brussels sprouts",
    "sweet potato", "quinoa", "oats", "chia seeds", "flax seeds",
    "greek yogurt", "natural yogurt", "full-fat yogurt",
    "dark chocolate 85%", "cacao", "cocoa 85%", "cocoa 90%"
}

async def suggest_healthier_alternatives(image_bytes: bytes) -> dict:
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    response = client.chat.completions.create(
        model="gpt-4o-2024-08-06",
        temperature=0.2,
        max_tokens=1500,
        messages=[
            {
                "role": "system",
                "content": "You are a professional nutritionist. Always respond with ONLY valid JSON. No markdown, no text outside JSON."
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": """
Analyze the food product in the photo.

Return ONLY valid JSON with this exact structure:

{
  "detected_product": "Extra Virgin Olive Oil",
  "category": "cooking oil",
  "assessment": "great" | "good" | "moderate" | "suboptimal",
  "message": "Short friendly message to user (1 sentence)",
  "why": "Explanation why this product has this rating (2-3 sentences)",
  "alternatives": [
    {
      "name": "Avocado Oil",
      "why_better_or_similar": "Has even higher smoke point, rich in vitamin E",
      "price_per_100ml_eur": 3.2,
      "best_for": "high-heat cooking, frying"
    }
  ]
}

Rules:
- If the product is already one of the healthiest (olive oil EV, avocado oil, nuts, fatty fish, eggs, berries, leafy greens, Greek yogurt, dark chocolate 85%+, etc.) → set "assessment": "great"
- If it's decent but can be improved (e.g. refined olive oil, milk chocolate, white rice) → "good" or "moderate"
- If clearly unhealthy (sunflower oil, margarine, sugary cereal, soda) → "suboptimal"
- Always suggest 3–6 alternatives — even for "great" products (variety is good!)
- For "great" products, use phrase like "Great choice! Here are some excellent alternatives..."
- Never use health scores like +7, +10
- Prices = realistic European averages 2025
- Only valid JSON — nothing else!
"""},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                    }
                ]
            }
        ]
    )

    raw = response.choices[0].message.content.strip()
    cleaned = re.sub(r"^```json\s*|```$", "", raw, flags=re.MULTILINE).strip()

    try:
        result = json.loads(cleaned)

        result.setdefault("assessment", "moderate")
        result.setdefault("message", "Product analyzed.")
        result.setdefault("why", "")
        result.setdefault("alternatives", [])
        result.setdefault("detected_product", "Unknown product")
        result.setdefault("category", "unknown")

        return result

    except json.JSONDecodeError:
        return {
            "error": "Failed to parse model response",
            "raw": cleaned
        }
