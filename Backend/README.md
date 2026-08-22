# SmartFlow Backend

This folder contains a small FastAPI backend that wraps the existing vision pipeline in `detection/yolo11_bytetrack_pipeline.py`.

Quick start (from repo root):

```bash
python -m pip install -r requirements.txt
python -m pip install -r Backend/requirements.txt
uvicorn Backend.app.main:app --reload --port 8000
```

Endpoints:
- `GET /health` — returns status
- `POST /upload-video` — multipart upload (field `file`); processing runs in background when the `Background-Tasks` mechanism is used

Notes:
- The backend imports the `detection` package relative to the repo root. Run the server from the repo root so imports resolve correctly.
