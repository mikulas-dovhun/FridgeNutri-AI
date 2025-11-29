# backend/main.py
import os
from dotenv import load_dotenv
from openai import OpenAI
import base64

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

print("FridgeNutri AI — Vision Edition")
print("Put your fridge photo in the 'backend' folder")
print("Then type the filename (e.g. fridge.jpg) or 'quit'\n")

while True:
    user_input = input("Photo filename (or quit): ").strip()

    if user_input.lower() in ["quit", "exit", "bye"]:
        print("Good luck at the hackathon! You're going to crush it!")
        break

    image_path = os.path.join(os.path.dirname(__file__), user_input)

    if not os.path.exists(image_path):
        print("File not found! Make sure it's in the backend folder.")
        continue

    print("Analyzing your fridge with GPT-4o vision...")

    base64_image = encode_image(image_path)

    response = client.chat.completions.create(
        model="gpt-4o",   # ← must be gpt-4o or gpt-4o-mini with vision
        temperature=0.3,
        max_tokens=1500,
        messages=[
            {
                "role": "system",
                "content": "You are a world-class fridge analyst and nutrition chef. Be extremely precise with quantities."
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": """
Analyze this fridge photo and return ONLY a valid JSON object with this exact structure:

{
  "ingredients": [
    {"name": "chicken breast", "amount": "600g"},
    {"name": "broccoli", "amount": "2 heads"},
    {"name": "greek yogurt", "amount": "500g"},
    ...
  ],
  "recipes": [
    {
      "name": "Grilled Chicken & Broccoli Bowl",
      "ingredients_used": ["chicken breast 500g", "broccoli 1.5 heads"],
      "instructions": "1. Season chicken... 2. Steam broccoli...",
      "protein": "62g",
      "missing_nutrients": "Add bell pepper for vitamin C"
    }
  ],
  "shopping_suggestions": ["bell peppers", "olive oil", "brown rice"]
}

Be realistic — only suggest recipes using what's clearly visible.
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

    result = response.choices[0].message.content
    print("\n" + "="*60)
    print("FRIDGE ANALYSIS RESULT")
    print("="*60)
    print(result)
    print("="*60 + "\n")