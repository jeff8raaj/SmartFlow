import pandas as pd

from app.feature_engine.feature_engine import TrafficFeatureEngine


def main():

    input_file = (
        "data/sample/tracking_sample.csv"
    )

    df = pd.read_csv(input_file)

    print("\nInput tracking data:")
    print(df.head())

    engine = TrafficFeatureEngine(
        queue_speed_threshold=5.0
    )

    features = engine.generate_features(df)

    print("\n=== SmartFlow Traffic Features ===\n")
    print(features.to_string(index=False))

    output_file = (
        "data/sample/traffic_features.csv"
    )

    features.to_csv(
        output_file,
        index=False
    )

    print(
        f"\nFeatures saved to: {output_file}"
    )


if __name__ == "__main__":
    main()
