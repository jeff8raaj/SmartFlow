# SmartFlow AI Traffic Management System Prototype

> **SmartFlow**: Adaptive AI Traffic Optimization, Computer Vision Vehicle Tracking (YOLO11 + ByteTrack), Priority Emergency Clearance, and SUMO Controller Integration.

---

## 👥 Team Work Division & Architecture

```text
                 Traffic Video
                      │
                      ▼
      ┌─────────────────────────────────┐
      │ Member 2                        │
      │ Computer Vision Engineer        │
      │ YOLO11 + ByteTrack              │
      └─────────────────────────────────┘
                      │
                      ▼
     Vehicle Count • Queue Length • Speed
                      │
                      ▼
      ┌─────────────────────────────────┐
      │ Member 1                        │
      │ AI Lead & System Integration    │
      └─────────────────────────────────┘
                      │
                      ▼
          Traffic State Information
                      │
                      ▼
      ┌─────────────────────────────────┐
      │ Member 3                        │
      │ Traffic Control Engineer (SUMO) │
      └─────────────────────────────────┘
                      │
                      ▼
      Waiting Time • Delay • Throughput
                      │
                      ▼
      ┌─────────────────────────────────┐
      │ Member 4                        │
      │ Dashboard & Documentation       │
      └─────────────────────────────────┘
                      │
                      ▼
       Final Software Prototype & Demo
```

---

## 🚀 Focus: Member 2 – Computer Vision Engineer

### 📋 Member 2 Responsibilities
1. **Traffic Video Collection & Processing**: Support MP4, AVI, and MOV traffic video sources.
2. **YOLO11 Object Detection**: Multi-class vehicle detection (`Car`, `Truck`, `Bus`, `Emergency Ambulance`).
3. **ByteTrack Multi-Object Tracking**: Unique persistent ID assignment across video frames.
4. **Vehicle Density & Count Extraction**: Frame-by-frame vehicle counts per corridor (*North*, *South*, *East*, *West*).
5. **Queue Length Estimation**: Meter-based queue occupancy calculation.
6. **Speed Estimation**: Centroid displacement velocity tracking ($\text{km/h}$).
7. **Perception Telemetry Export**: Export structured CSV files for **Member 1 (AI Lead)** and **Member 3 (Traffic Control Engineer)**.

---

## 🛠 Project Directory Structure

```text
Trafficflow/
│
├── datasets/                            # Member 2: Labeled traffic dataset images/labels
├── videos/                              # Member 2: Input traffic videos (MP4, AVI, MOV)
├── notebooks/                           # Member 2: Jupyter / Colab notebooks
│   └── Member2_YOLO11_ByteTrack_Pipeline.ipynb
├── models/                              # Member 2: Trained YOLO11 weights (yolo11n.pt, yolo11s.pt)
├── outputs/                             # Member 2: Tracked videos & perception CSVs
│   ├── tracked_traffic_video.mp4
│   └── traffic_perception_metrics.csv
│
├── detection/                           # Member 2: Vision & Tracking Engine
│   └── yolo11_bytetrack_pipeline.py
├── tracking/                            # Member 2: ByteTrack configuration
├── feature_engine/                      # Member 1: Traffic State Generator
├── controller/                          # Member 3: Adaptive Max-Pressure Logic
├── sumo/                                # Member 3: SUMO Simulation network
├── src/                                 # Member 4: React Web Dashboard & Canvas
├── requirements.txt                     # Dependencies
└── README.md                            # Documentation
```

---

## ⚡ Member 2 Execution Guide

### Option A: Run Standalone Python Script (Windows 11 / Linux)

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Execute YOLO11 + ByteTrack Pipeline**:
   ```bash
   python detection/yolo11_bytetrack_pipeline.py --input videos/traffic.mp4 --output outputs/tracked_traffic_video.mp4 --csv outputs/traffic_perception_metrics.csv
   ```

---

### Option B: Run in Google Colab (GPU Accelerated)

Open `notebooks/Member2_YOLO11_ByteTrack_Pipeline.ipynb` in Google Colab to run GPU-accelerated YOLO11 inference and download `traffic_perception_metrics.csv`.

---

## 📊 Member 2 Output Contract (Structured CSV for Member 1 & Member 3)

The vision pipeline outputs `outputs/traffic_perception_metrics.csv` containing:

| `frame_id` | `timestamp_sec` | `corridor_lane` | `vehicle_count` | `queue_length_m` | `average_speed_kmh` | `emergency_detected` |
| ---------- | --------------- | --------------- | --------------- | ---------------- | ------------------- | -------------------- |
| 30         | 1.0             | NORTH 4-LANE    | 12              | 132m             | 28.5 km/h           | 0                    |
| 30         | 1.0             | SOUTH 4-LANE    | 14              | 154m             | 36.2 km/h           | 1 (AMBULANCE)        |
| 30         | 1.0             | EAST 4-LANE     | 10              | 110m             | 30.0 km/h           | 0                    |
| 30         | 1.0             | WEST 4-LANE     | 6               | 66m              | 44.1 km/h           | 0                    |

---

## 💻 Running the Web Dashboard (Member 4 Interface)

1. **Install Node Dependencies**:
   ```bash
   npm install
   ```

2. **Start Local Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.
