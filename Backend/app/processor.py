import os
import sys
from pathlib import Path


def run_detection(input_video: str, output_video: str | None = None, csv_output: str | None = None, model: str = "yolo11n.pt") -> dict:
    # Ensure repo root is on path so we can import detection module
    repo_root = Path(__file__).resolve().parents[2]
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))

    try:
        from detection.yolo11_bytetrack_pipeline import SmartFlowPerceptionEngine
    except Exception as e:
        raise RuntimeError(f"Failed to import detection pipeline: {e}")

    engine = SmartFlowPerceptionEngine(model_path=model)

    in_path = Path(input_video)
    outputs_dir = Path(repo_root) / "Backend" / "outputs"
    outputs_dir.mkdir(parents=True, exist_ok=True)

    if output_video is None:
        output_video = str(outputs_dir / f"{in_path.stem}_tracked.mp4")
    if csv_output is None:
        csv_output = str(outputs_dir / f"{in_path.stem}_perception.csv")

    engine.process_video(str(in_path), output_video, csv_output)
    return {"video": output_video, "csv": csv_output}
