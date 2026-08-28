import pandas as pd
from pathlib import Path

from app.feature_engine.feature_engine import TrafficFeatureEngine


def main():

    input_file = "data/sample/tracking_sample.csv"

    df = pd.read_csv(input_file)

    engine = TrafficFeatureEngine(
        queue_speed_threshold=5.0
    )

    features = engine.generate_features(df)

    output_dir = Path("Backend/outputs")
    output_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    output_file = (
        output_dir / "test_traffic_features.csv"
    )

    features.to_csv(
        output_file,
        index=False
    )

    print("\n=== Backend Feature Engine Test ===\n")
    print(features.to_string(index=False))

    print(
        f"\nFeatures saved to: {output_file}"
    )


if __name__ == "__main__":
    main()
