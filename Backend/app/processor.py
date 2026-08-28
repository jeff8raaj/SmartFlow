import sys
from pathlib import Path

import pandas as pd

# Ensure repo root is on path
repo_root = Path(__file__).resolve().parents[2]
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from app.feature_engine.feature_engine import TrafficFeatureEngine


def run_detection(
    input_video: str,
    output_video: str | None = None,
    csv_output: str | None = None,
    model: str = "yolo11n.pt",
) -> dict:

    # Import detection pipeline
    try:
        from detection.yolo11_bytetrack_pipeline import (
            SmartFlowPerceptionEngine
        )
    except Exception as e:
        raise RuntimeError(
            f"Failed to import detection pipeline: {e}"
        )

    engine = SmartFlowPerceptionEngine(
        model_path=model
    )

    in_path = Path(input_video)

    outputs_dir = (
        repo_root / "Backend" / "outputs"
    )
    outputs_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    if output_video is None:
        output_video = str(
            outputs_dir /
            f"{in_path.stem}_tracked.mp4"
        )

    if csv_output is None:
        csv_output = str(
            outputs_dir /
            f"{in_path.stem}_perception.csv"
        )

    # -------------------------------------------------
    # STEP 1: YOLO11 + ByteTrack
    # -------------------------------------------------

    engine.process_video(
        str(in_path),
        output_video,
        csv_output
    )

    # -------------------------------------------------
    # STEP 2: Feature Engine
    # -------------------------------------------------

    try:
        tracking_df = pd.read_csv(csv_output)

        feature_engine = TrafficFeatureEngine(
            queue_speed_threshold=5.0
        )

        traffic_features = (
            feature_engine.generate_features(
                tracking_df
            )
        )

    except Exception as e:
        raise RuntimeError(
            f"Feature Engine failed: {e}"
        )

    # Save traffic-level features
    features_output = str(
        outputs_dir /
        f"{in_path.stem}_traffic_features.csv"
    )

    traffic_features.to_csv(
        features_output,
        index=False
    )

    return {
        "video": output_video,
        "perception_csv": csv_output,
        "traffic_features_csv": features_output,
    }
