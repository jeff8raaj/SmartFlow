from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
from pathlib import Path

from .processor import run_detection

app = FastAPI(title="SmartFlow Backend")

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload-video")
async def upload_video(file: UploadFile = File(...), background_tasks: BackgroundTasks = None, model: str = "yolo11n.pt"):
    save_path = UPLOAD_DIR / file.filename
    try:
        with open(save_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    finally:
        file.file.close()

    if background_tasks is not None:
        background_tasks.add_task(run_detection, str(save_path), None, None, model)
        return JSONResponse(status_code=202, content={"message": "Processing started", "input": str(save_path)})
    else:
        try:
            result = run_detection(str(save_path), model=model)
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
