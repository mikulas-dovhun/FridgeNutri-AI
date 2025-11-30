from fastapi import APIRouter, File, UploadFile
from services.vision import analyze_fridge_image, analyze_dish_image
from services.recipes import calculate_gaps

router = APIRouter()

# Store last analysis in memory (for demo)
last_analysis = None
last_dish = None
@router.post("/analyze")
async def analyze_fridge(file: UploadFile = File(...)):
    global last_analysis
    contents = await file.read()
    last_analysis = await analyze_fridge_image(contents)
    return last_analysis

@router.post("/analyze/dish")
async def analyze_dish(file: UploadFile = File(...)):
    global last_dish
    contents = await file.read()
    last_dish = await analyze_dish_image(contents)
    return last_dish