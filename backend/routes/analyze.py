from fastapi import APIRouter, File, UploadFile
from services.vision import analyze_fridge_image
from services.recipes import calculate_gaps

router = APIRouter()

# Store last analysis in memory (for demo)
last_analysis = None

@router.post("/analyze")
async def analyze_fridge(file: UploadFile = File(...)):
    global last_analysis
    contents = await file.read()
    last_analysis = await analyze_fridge_image(contents)
    return last_analysis

@router.post("/gaps")
async def get_gaps(recipe_name: str):
    if not last_analysis:
        return {"error": "Upload a fridge photo first!"}
    return calculate_gaps(recipe_name, last_analysis)