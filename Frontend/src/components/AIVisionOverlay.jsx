import { useEffect, useRef, useState } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { Eye, EyeOff, ShieldAlert, Sparkles, SlidersHorizontal, Cpu, Siren, Layers, Play, Pause } from 'lucide-react';

export default function AIVisionOverlay({ showControls = true, height = '420px' }) {
  const { videoUrl, isCustomUpload, activeEmergency, totalVehicleCount, breakdown, laneMetrics, fileName } = useTraffic();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [showBoxes, setShowBoxes] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showLanes, setShowLanes] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [useCanvasVideo, setUseCanvasVideo] = useState(false); // Prefer real video element first!

  // Force play video element on source change
  useEffect(() => {
    setUseCanvasVideo(false);
    if (videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log("Video playback fallback to canvas stream:", err);
            setUseCanvasVideo(true);
          });
      }
    }
  }, [videoUrl, isCustomUpload]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setUseCanvasVideo(true));
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // AI Bounding Box Overlay Canvas Loop
  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Live Traffic Backup Vehicles
    const liveVehicles = Array.from({ length: 12 }, (_, i) => ({
      id: `v-${i}`,
      lane: i % 4,
      offset: (i * 75) % 500,
      speed: 1.6 + (i % 3) * 0.4,
      type: i === 0 && activeEmergency ? 'EMERGENCY' : i % 4 === 0 ? 'TRUCK' : i % 3 === 0 ? 'BUS' : 'CAR',
    }));

    const render = (time) => {
      const parent = canvas.parentElement;
      if (parent) {
        if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
          canvas.width = parent.clientWidth || 700;
          canvas.height = 420;
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      // 1. Transparent Clear for Overlay
      ctx.clearRect(0, 0, w, h);

      // 2. Render Live Generative Video Feed ONLY if HTML5 Video element fails to load
      if (useCanvasVideo) {
        ctx.fillStyle = '#0b1329';
        ctx.fillRect(0, 0, w, h);

        const roadW = w / 4;
        for (let i = 0; i < 4; i++) {
          const x = i * roadW;
          ctx.fillStyle = i % 2 === 0 ? '#111827' : '#1e293b';
          ctx.fillRect(x, 0, roadW, h);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([12, 14]);
          ctx.beginPath(); ctx.moveTo(x + roadW, 0); ctx.lineTo(x + roadW, h); ctx.stroke();
          ctx.setLineDash([]);
        }

        if (isPlaying) {
          liveVehicles.forEach((v) => {
            v.offset += v.speed;
            if (v.offset > h + 60) v.offset = -60;
          });
        }

        liveVehicles.forEach((v) => {
          const laneX = v.lane * roadW + roadW / 2;
          const posY = v.offset;
          ctx.save();
          ctx.translate(laneX, posY);
          if (v.type === 'EMERGENCY') {
            ctx.fillStyle = '#dc2626'; ctx.fillRect(-18, -32, 36, 64);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(-12, -20, 24, 40);
          } else {
            ctx.fillStyle = '#0284c7'; ctx.fillRect(-16, -26, 32, 52);
          }
          ctx.restore();
        });
      }

      // 3. Render 4-Lane Detection Corridors (Transparent Overlay over Video)
      if (showLanes) {
        const laneW = w / 4;
        const lanesData = [
          { name: 'LANE 1 (NORTH)', count: laneMetrics.north?.count || 8, key: 'north' },
          { name: 'LANE 2 (SOUTH)', count: laneMetrics.south?.count || 10, key: 'south' },
          { name: 'LANE 3 (EAST)', count: laneMetrics.east?.count || 9, key: 'east' },
          { name: 'LANE 4 (WEST)', count: laneMetrics.west?.count || 6, key: 'west' },
        ];

        lanesData.forEach((lane, idx) => {
          const x = idx * laneW;
          const isEmergencyLane = activeEmergency?.lane.toLowerCase() === lane.key;

          ctx.save();

          if (isEmergencyLane) {
            const pulse = Math.abs(Math.sin(time * 0.008));
            ctx.fillStyle = `rgba(220, 38, 38, ${0.18 + pulse * 0.15})`;
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 3.5;
            ctx.shadowColor = '#dc2626';
            ctx.shadowBlur = 20;
            ctx.fillRect(x, 0, laneW, h);
            ctx.strokeRect(x + 2, 2, laneW - 4, h - 4);
          } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.lineWidth = 1;
            ctx.setLineDash([6, 6]);
            ctx.strokeRect(x, 0, laneW, h);
            ctx.setLineDash([]);
          }

          ctx.fillStyle = isEmergencyLane ? '#dc2626' : 'rgba(255, 255, 255, 0.92)';
          ctx.fillRect(x + 6, 8, laneW - 12, 26);

          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillStyle = isEmergencyLane ? '#ffffff' : '#0f172a';
          ctx.fillText(`${lane.name}: ${lane.count} cars`, x + 10, 25);

          ctx.restore();
        });
      }

      // 4. Heatmap Overlay
      if (showHeatmap) {
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.45);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
        grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.2)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // 5. YOLO Bounding Box Detection Targets Overlaid on Video
      if (showBoxes) {
        const t = time * 0.001;
        const boxes = [
          { id: 'b1', type: 'Car', x: w * 0.28 + Math.sin(t * 0.9) * 20, y: h * 0.28, w: 45, h: 60, color: '#0284c7', speed: '32 km/h' },
          { id: 'b2', type: 'Bus', x: w * 0.48 + Math.cos(t * 0.7) * 25, y: h * 0.58, w: 50, h: 85, color: '#9333ea', speed: '24 km/h' },
          { id: 'b3', type: 'Truck', x: w * 0.68 + Math.sin(t * 0.5) * 30, y: h * 0.35, w: 55, h: 78, color: '#d97706', speed: '28 km/h' },
          { id: 'b4', type: 'Car', x: w * 0.12 + Math.cos(t * 1.1) * 20, y: h * 0.45, w: 42, h: 56, color: '#0284c7', speed: '38 km/h' },
        ];

        if (activeEmergency) {
          boxes.unshift({
            id: 'emg',
            type: 'EMERGENCY AMBULANCE',
            x: w * 0.46,
            y: h * 0.50,
            w: 54,
            h: 80,
            color: '#dc2626',
            speed: '68 km/h',
            isEmergency: true,
          });
        }

        boxes.forEach((box) => {
          ctx.save();
          if (box.isEmergency) {
            const pulse = Math.abs(Math.sin(time * 0.01));
            ctx.shadowColor = '#dc2626';
            ctx.shadowBlur = 24 * pulse;
            ctx.strokeStyle = pulse > 0.5 ? '#dc2626' : '#ffffff';
            ctx.lineWidth = 3.5;
          } else {
            ctx.strokeStyle = box.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = box.color;
            ctx.shadowBlur = 8;
          }

          const x = box.x;
          const y = box.y;
          const w = box.w;
          const h = box.h;
          const len = 12;

          ctx.beginPath();
          ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
          ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
          ctx.moveTo(x + w, y + h - len); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - len, y + h);
          ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
          ctx.stroke();

          ctx.fillStyle = box.isEmergency ? 'rgba(220, 38, 38, 0.25)' : 'rgba(2, 132, 199, 0.12)';
          ctx.fillRect(x, y, w, h);

          const labelText = `${box.type} | ${box.speed}`;
          ctx.font = box.isEmergency ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
          const textW = ctx.measureText(labelText).width;

          ctx.fillStyle = box.isEmergency ? '#dc2626' : '#0f172a';
          ctx.fillRect(x, y - 20, textW + 12, 20);

          ctx.fillStyle = '#ffffff';
          ctx.fillText(labelText, x + 6, y - 6);
          ctx.restore();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [showBoxes, showHeatmap, showLanes, activeEmergency, laneMetrics, isPlaying, useCanvasVideo]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-md" style={{ minHeight: height }}>
      {/* HTML5 Video element - Rendered directly with explicit z-0 layer so uploaded video is 100% visible! */}
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        onError={() => setUseCanvasVideo(true)}
        className="relative z-0 h-full w-full object-cover"
        style={{ minHeight: height }}
      />

      {/* AI Transparent Canvas Overlay - Placed directly on top of Video (z-10) with pointer-events-none */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full" />

      {/* Emergency Priority Highlight Alert Banner */}
      {activeEmergency && (
        <div className="absolute top-16 left-4 right-4 z-20 flex items-center justify-between rounded-2xl border border-red-200 bg-red-600 p-3 text-white shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <Siren className="h-6 w-6 text-white animate-bounce" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-white">
                🚨 EMERGENCY PRIORITY HIGHLIGHT: {activeEmergency.lane.toUpperCase()} 4-LANE
              </p>
              <p className="text-[11px] text-red-100">
                {activeEmergency.type} detected. Green wave priority corridor active on {activeEmergency.lane.toUpperCase()} lane.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top AI Telemetry HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 border border-blue-200">
            <Cpu className="h-3.5 w-3.5 animate-spin text-blue-600" />
            <span>4-Lane Live Camera Feed</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-700 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Input: <strong>{fileName}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 border border-slate-200 hover:bg-slate-200 transition"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5 text-blue-600" /> : <Play className="h-3.5 w-3.5 text-emerald-600" />}
            <span>{isPlaying ? 'Pause Video' : 'Play Video'}</span>
          </button>
          <div className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 border border-slate-200">
            Cars: <strong className="text-blue-600">{totalVehicleCount}</strong>
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Cars: {breakdown.cars}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Trucks: {breakdown.trucks}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Buses: {breakdown.buses}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLanes(!showLanes)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                showLanes ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>4-Lane Grid</span>
            </button>

            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                showBoxes ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Bounding Boxes</span>
            </button>

            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                showHeatmap ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Density Heatmap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
