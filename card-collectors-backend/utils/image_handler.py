import os
import shutil
from fastapi import UploadFile
from pathlib import Path
from datetime import datetime

# Create images directory if it doesn't exist
IMAGES_DIR = Path("static/images")
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

async def save_image(image: UploadFile) -> str:
    """
    Save an uploaded image and return its file path
    """
    # Create a unique filename
    file_extension = os.path.splitext(image.filename)[1]
    file_name = f"card_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}{file_extension}"
    file_path = IMAGES_DIR / file_name

    # Save the file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    return str(file_path) 