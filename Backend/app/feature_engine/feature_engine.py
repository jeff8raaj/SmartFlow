import pandas as pd
import numpy as np


class TrafficFeatureEngine:
    """
    Converts vehicle-level tracking data into
    lane-level traffic features for SmartFlow.
    """

    def __init__(self, queue_speed_threshold=5.0):
        """
        Vehicles moving at or below this speed
        are considered queued/slow.

        Speed unit: km/h
        """
        self.queue_speed_threshold = queue_speed_threshold

    def calculate_vehicle_count(self, df):
        """Count unique vehicles per timestamp and lane."""

        return (
            df.groupby(["timestamp", "lane_id"])["vehicle_id"]
            .nunique()
            .rename("vehicle_count")
        )

    def calculate_queue_length(self, df):
        """
        Estimate queue length as the number
        of slow/stationary vehicles per lane.
        """

        queued = df[
            df["speed"] <= self.queue_speed_threshold
        ]

        return (
            queued.groupby(
                ["timestamp", "lane_id"]
            )["vehicle_id"]
            .nunique()
            .rename("queue_length")
        )

    def calculate_average_speed(self, df):
        """Calculate average speed per timestamp and lane."""

        return (
            df.groupby(["timestamp", "lane_id"])["speed"]
            .mean()
            .rename("average_speed")
        )

    def calculate_arrival_rate(self, df):
        """
        Count vehicles when they are first observed
        in a lane.

        This represents new vehicle arrivals.
        """

        first_observation = (
            df.sort_values("timestamp")
            .groupby("vehicle_id")
            .first()
            .reset_index()
        )

        return (
            first_observation
            .groupby(["timestamp", "lane_id"])
            .size()
            .rename("arrival_rate")
        )

    def calculate_queue_growth(self, features):
        """
        Calculate change in queue length for each lane.

        Positive → queue increasing
        Negative → queue decreasing
        Zero     → unchanged
        """

        features["queue_growth"] = (
            features
            .groupby(level="lane_id")["queue_length"]
            .diff()
            .fillna(0)
        )

        return features

    def calculate_congestion(self, features):
        """
        Simple interpretable congestion classification.

        HIGH:
            queue >= 20 OR average speed < 15 km/h

        MEDIUM:
            queue >= 10 OR average speed < 30 km/h

        LOW:
            otherwise
        """

        conditions = [
            (
                (features["queue_length"] >= 20)
                | (features["average_speed"] < 15)
            ),
            (
                (features["queue_length"] >= 10)
                | (features["average_speed"] < 30)
            ),
        ]

        choices = ["HIGH", "MEDIUM"]

        features["congestion"] = np.select(
            conditions,
            choices,
            default="LOW",
        )

        return features

    def generate_features(self, df):
        """
        Generate lane-level traffic features.
        """

        required_columns = {
            "timestamp",
            "vehicle_id",
            "speed",
            "lane_id",
        }

        missing_columns = (
            required_columns - set(df.columns)
        )

        if missing_columns:
            raise ValueError(
                f"Missing required columns: "
                f"{sorted(missing_columns)}"
            )

        vehicle_count = (
            self.calculate_vehicle_count(df)
        )

        queue_length = (
            self.calculate_queue_length(df)
        )

        average_speed = (
            self.calculate_average_speed(df)
        )

        arrival_rate = (
            self.calculate_arrival_rate(df)
        )

        features = pd.concat(
            [
                vehicle_count,
                queue_length,
                average_speed,
                arrival_rate,
            ],
            axis=1,
        ).fillna(0)

        features = features.sort_index()

        features = self.calculate_queue_growth(
            features
        )

        features = self.calculate_congestion(
            features
        )

        return features.reset_index()
