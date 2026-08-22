"""
================================================================================
SmartFlow - Member 2 Computer Vision Perception & Tracking Pipeline
================================================================================
Author: Member 2 (Computer Vision Engineer)
Role: Vehicle Detection (YOLO11), Tracking (ByteTrack), Vehicle Counting,
      Queue Estimation, Speed Estimation, and Telemetry CSV Export for Member 1.

Usage:
    python detection/yolo11_bytetrack_pipeline.py --input videos/traffic.mp4 --output outputs/tracked.mp4 --csv outputs/perception_metrics.csv
================================================================================
"""

import argparse
import os
import time
import cv2
import numpy as np
import pandas as pd
from ultralytics import YOLO

# Try importing Supervision for ByteTrack annotation
try:
    import supervision as sv
    HAS_SUPERVISION = True
except ImportError:
    HAS_SUPERVISION = False

# Class IDs for Vehicle Detection in COCO/YOLO11
VEHICLE_CLASSES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}

# Optional Emergency Ambulance Class ID (or custom model class 0/1)
EMERGENCY_CLASS_NAMES = ["ambulance", "fire truck", "police"]


class SmartFlowPerceptionEngine:
    def __init__(self, model_path="yolo11n.pt", conf_thresh=0.35):
        print(f"[Member 2 Vision] Loading YOLO11 Model: {model_path}...")
        self.model = YOLO(model_path)
        self.conf_thresh = conf_thresh

        # Object tracking history to compute speed
        self.track_history = {} # track_id -> list of (x, y, timestamp)

        # Telemetry logs for Member 1
        self.telemetry_records = []

    def define_corridor_polygons(self, width, height):
        """Define 4-Lane Corridors (North, South, East, West) inside video frame."""
        cx, cy = width // 2, height // 2
        rw = int(width * 0.38)
        rh = int(height * 0.38)

        corridors = {
            "north": np.array([[cx - rw // 2, 0], [cx + rw // 2, 0], [cx + rw // 2, cy - rh // 2], [cx - rw // 2, cy - rh // 2]]),
            "south": np.array([[cx - rw // 2, cy + rh // 2], [cx + rw // 2, cy + rh // 2], [cx + rw // 2, height], [cx - rw // 2, height]]),
            "west":  np.array([[0, cy - rh // 2], [cx - rw // 2, cy - rh // 2], [cx - rw // 2, cy + rh // 2], [0, cy + rh // 2]]),
            "east":  np.array([[cx + rw // 2, cy - rh // 2], [width, cy - rh // 2], [width, cy + rh // 2], [cx + rw // 2, cy + rh // 2]]),
        }
        return corridors

    def process_video(self, video_path, output_video_path="outputs/tracked.mp4", csv_output_path="outputs/perception_metrics.csv"):
        os.makedirs(os.path.dirname(output_video_path), exist_ok=True)
        os.makedirs(os.path.dirname(csv_output_path), exist_ok=True)

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"[Error] Unable to open input video: {video_path}")
            return

        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out_writer = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))

        corridor_polys = self.define_corridor_polygons(width, height)

        print(f"[Member 2 Vision] Processing {total_frames} frames from '{video_path}'...")
        frame_idx = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1
            timestamp_sec = frame_idx / fps

            # Run YOLO11 + ByteTrack Inference
            results = self.model.track(frame, persist=True, tracker="bytetrack.yaml", verbose=False, conf=self.conf_thresh)[0]

            boxes = results.boxes
            current_counts = {"north": 0, "south": 0, "east": 0, "west": 0}
            current_speeds = {"north": [], "south": [], "east": [], "west": []}
            current_queues = {"north": 0, "south": 0, "east": 0, "west": 0}
            emergency_detected = False
            emergency_lane = "none"

            if boxes is not None and len(boxes) > 0:
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    track_id = int(box.id[0].item()) if box.id is not None else 0

                    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                    center_x, center_y = (x1 + x2) // 2, (y1 + y2) // 2

                    class_name = self.model.names.get(cls_id, "vehicle")
                    is_emergency = any(emg in class_name.lower() for emg in EMERGENCY_CLASS_NAMES) or (cls_id == 0 and conf > 0.85)

                    # Determine corridor lane
                    lane_found = "south" # default fallback
                    for lane_key, poly in corridor_polys.items():
                        if cv2.pointPolygonTest(poly, (center_x, center_y), False) >= 0:
                            lane_found = lane_key
                            break

                    current_counts[lane_found] += 1
                    current_queues[lane_found] += 12 # ~12 meters per vehicle queue allocation

                    if is_emergency:
                        emergency_detected = True
                        emergency_lane = lane_found

                    # Speed Estimation via Centroid Tracking Displacement
                    if track_id not in self.track_history:
                        self.track_history[track_id] = []
                    self.track_history[track_id].append((center_x, center_y, timestamp_sec))
                    if len(self.track_history[track_id]) > 5:
                        self.track_history[track_id].pop(0)

                    if len(self.track_history[track_id]) >= 2:
                        first_pos = self.track_history[track_id][0]
                        last_pos = self.track_history[track_id][-1]
                        dist_pixels = np.hypot(last_pos[0] - first_pos[0], last_pos[1] - first_pos[1])
                        dt = last_pos[2] - first_pos[2]
                        if dt > 0:
                            speed_kmh = round((dist_pixels / dt) * 0.25, 1) # Pixel to km/h scaling
                            current_speeds[lane_found].append(speed_kmh)

                    # Draw Bounding Box & Label on Output Video Frame
                    color = (0, 0, 255) if is_emergency else (255, 165, 0) if class_name == "bus" else (0, 255, 0)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    label = f"#{track_id} {class_name.upper()} ({conf:.2f})"
                    cv2.putText(frame, label, (x1, max(15, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            # Draw Corridor Polygons on Video Output
            for lane_key, poly in corridor_polys.items():
                cv2.polylines(frame, [poly], isClosed=True, color=(255, 255, 255), thickness=1)
                poly_center = poly.mean(axis=0).astype(int)
                count_str = f"{lane_key.upper()}: {current_counts[lane_key]} cars"
                cv2.putText(frame, count_str, (poly_center[0] - 50, poly_center[1]), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)

            # Write Frame to Video
            out_writer.write(frame)

            # Log Structured Telemetry Record for Member 1
            if frame_idx % fps == 0 or frame_idx == total_frames: # Log every 1 second interval
                for lane_key in ["north", "south", "east", "west"]:
                    speeds = current_speeds[lane_key]
                    avg_speed = round(np.mean(speeds), 1) if len(speeds) > 0 else 32.0

                    self.telemetry_records.append({
                        "frame_id": frame_idx,
                        "timestamp_sec": round(timestamp_sec, 2),
                        "corridor_lane": lane_key.upper(),
                        "vehicle_count": current_counts[lane_key],
                        "queue_length_m": current_queues[lane_key],
                        "average_speed_kmh": avg_speed,
                        "emergency_detected": 1 if (emergency_detected and emergency_lane == lane_key) else 0,
                    })

        cap.release()
        out_writer.release()

        # Export Structured Perception CSV for Member 1 & Member 3
        df = pd.DataFrame(self.telemetry_records)
        df.to_csv(csv_output_path, index=False)
        print(f"[Member 2 Vision] Output Tracked Video saved to: {output_video_path}")
        print(f"[Member 2 Vision] Structured Perception Telemetry CSV saved to: {csv_output_path}")


def main():
    parser = argparse.ArgumentParser(description="Member 2 - YOLO11 + ByteTrack Vision Perception Pipeline")
    parser.add_argument("--input", type=str, default="videos/sample_traffic.mp4", help="Input traffic video file path")
    parser.add_argument("--output", type=str, default="outputs/tracked_traffic_video.mp4", help="Output tracked video path")
    parser.add_argument("--csv", type=str, default="outputs/traffic_perception_metrics.csv", help="Output perception CSV path for Member 1")
    parser.add_argument("--model", type=str, default="yolo11n.pt", help="YOLO11 weights file (yolo11n.pt, yolo11s.pt, yolo11m.pt)")

    args = parser.parse_args()
    engine = SmartFlowPerceptionEngine(model_path=args.model)

    if os.path.exists(args.input):
        engine.process_video(args.input, args.output, args.csv)
    else:
        print(f"[Member 2 Warning] Input file '{args.input}' not found. Generating sample structured perception CSV...")
        # Fallback dummy generator for test runs
        dummy_data = []
        for sec in range(1, 60):
            for lane in ["NORTH", "SOUTH", "EAST", "WEST"]:
                dummy_data.append({
                    "frame_id": sec * 30,
                    "timestamp_sec": sec,
                    "corridor_lane": lane,
                    "vehicle_count": np.random.randint(4, 18),
                    "queue_length_m": np.random.randint(40, 160),
                    "average_speed_kmh": np.random.randint(22, 45),
                    "emergency_detected": 1 if (sec > 20 and sec < 35 and lane == "SOUTH") else 0,
                })
        df = pd.DataFrame(dummy_data)
        os.makedirs(os.path.dirname(args.csv), exist_ok=True)
        df.to_csv(args.csv, index=False)
        print(f"[Member 2 Success] Generated sample Perception Telemetry CSV at: {args.csv}")


if __name__ == "__main__":
    main()
