import { useEffect, useRef, useState } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { Siren, Cpu, Zap, Activity, Plus, Minus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ShieldCheck, Video } from 'lucide-react';

export default function IntersectionDiagram() {
  const {
    laneMetrics,
    signalState,
    activeEmergency,
    fileName,
    triggerEmergency,
    clearEmergency,
    updateLaneVehicleCount,
    vehicleClearedLane,
    setSignalState,
  } = useTraffic();

  const canvasRef = useRef(null);
  const [simSpeed, setSimSpeed] = useState(1);

  // Persistent vehicle state stored in ref to prevent flickering, blinking, or resetting positions!
  const vehiclesRef = useRef({
    south: [],
    north: [],
    east: [],
    west: [],
  });

  // Synchronize persistent vehicle queues with current video input metrics
  useEffect(() => {
    const lanes = ['south', 'north', 'east', 'west'];

    lanes.forEach((laneKey) => {
      const count = laneMetrics[laneKey]?.count || 0;
      const currentQueue = vehiclesRef.current[laneKey];

      if (currentQueue.length < count) {
        for (let i = currentQueue.length; i < count; i++) {
          const sublane = i % 2;
          const isEmergency = activeEmergency?.lane === laneKey && i === 0;

          currentQueue.push({
            id: `${laneKey}-${Date.now()}-${i}-${Math.random()}`,
            sublane,
            index: i,
            progress: -i * 45,
            speed: 2.0,
            type: isEmergency ? 'EMERGENCY' : i % 4 === 0 ? 'TRUCK' : i % 3 === 0 ? 'BUS' : 'CAR',
          });
        }
      } else if (currentQueue.length > count) {
        currentQueue.splice(count);
      }

      if (currentQueue.length > 0) {
        if (activeEmergency?.lane === laneKey) {
          currentQueue[0].type = 'EMERGENCY';
        } else if (currentQueue[0].type === 'EMERGENCY') {
          currentQueue[0].type = 'CAR';
        }
      }
    });
  }, [laneMetrics, activeEmergency]);

  // Main 60 FPS Canvas Rendering Engine
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const parent = canvas.parentElement;
      if (parent) {
        if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
          canvas.width = parent.clientWidth || 700;
          canvas.height = 480;
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      const cx = w / 2;
      const cy = h / 2;
      const roadWidth = Math.min(w, h) * 0.38;

      ctx.clearRect(0, 0, w, h);

      // Environment backdrop
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Asphalt Roads
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - roadWidth / 2, 0, roadWidth, h);
      ctx.fillRect(0, cy - roadWidth / 2, w, roadWidth);

      // Central Intersection Box
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - roadWidth / 2, cy - roadWidth / 2, roadWidth, roadWidth);

      // Active Green Wave Corridor Beam Highlight
      const activeLane = signalState.activeGreenLane;
      ctx.save();
      ctx.fillStyle = activeEmergency ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)';
      ctx.shadowColor = activeEmergency ? '#ef4444' : '#10b981';
      ctx.shadowBlur = 30;

      if (activeLane === 'north' || activeLane === 'south') {
        ctx.fillRect(cx - roadWidth / 2, 0, roadWidth, h);
      } else {
        ctx.fillRect(0, cy - roadWidth / 2, w, roadWidth);
      }
      ctx.restore();

      // Road Markings
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 2, 0); ctx.lineTo(cx - 2, cy - roadWidth / 2);
      ctx.moveTo(cx + 2, 0); ctx.lineTo(cx + 2, cy - roadWidth / 2);
      ctx.moveTo(cx - 2, cy + roadWidth / 2); ctx.lineTo(cx - 2, h);
      ctx.moveTo(cx + 2, cy + roadWidth / 2); ctx.lineTo(cx + 2, h);
      ctx.moveTo(0, cy - 2); ctx.lineTo(cx - roadWidth / 2, cy - 2);
      ctx.moveTo(0, cy + 2); ctx.lineTo(cx - roadWidth / 2, cy + 2);
      ctx.moveTo(cx + roadWidth / 2, cy - 2); ctx.lineTo(w, cy - 2);
      ctx.moveTo(cx + roadWidth / 2, cy + 2); ctx.lineTo(w, cy + 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([10, 12]);
      ctx.beginPath();
      ctx.moveTo(cx - roadWidth / 4, 0); ctx.lineTo(cx - roadWidth / 4, cy - roadWidth / 2);
      ctx.moveTo(cx + roadWidth / 4, 0); ctx.lineTo(cx + roadWidth / 4, cy - roadWidth / 2);
      ctx.moveTo(cx - roadWidth / 4, cy + roadWidth / 2); ctx.lineTo(cx - roadWidth / 4, h);
      ctx.moveTo(cx + roadWidth / 4, cy + roadWidth / 2); ctx.lineTo(cx + roadWidth / 4, h);
      ctx.moveTo(0, cy - roadWidth / 4); ctx.lineTo(cx - roadWidth / 2, cy - roadWidth / 4);
      ctx.moveTo(0, cy + roadWidth / 4); ctx.lineTo(cx - roadWidth / 2, cy + roadWidth / 4);
      ctx.moveTo(cx + roadWidth / 2, cy - roadWidth / 4); ctx.lineTo(w, cy - roadWidth / 4);
      ctx.moveTo(cx + roadWidth / 2, cy + roadWidth / 4); ctx.lineTo(w, cy + roadWidth / 4);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      const stripeW = 8;
      const stripeGap = 6;
      for (let x = cx - roadWidth / 2 + 4; x < cx + roadWidth / 2 - 4; x += stripeW + stripeGap) {
        ctx.fillRect(x, cy - roadWidth / 2 - 20, stripeW, 16);
        ctx.fillRect(x, cy + roadWidth / 2 + 4, stripeW, 16);
      }
      for (let y = cy - roadWidth / 2 + 4; y < cy + roadWidth / 2 - 4; y += stripeW + stripeGap) {
        ctx.fillRect(cx - roadWidth / 2 - 20, y, 16, stripeW);
        ctx.fillRect(cx + roadWidth / 2 + 4, y, 16, stripeW);
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - roadWidth / 2, cy - roadWidth / 2 - 4, roadWidth / 2, 4);
      ctx.fillRect(cx, cy + roadWidth / 2, roadWidth / 2, 4);
      ctx.fillRect(cx - roadWidth / 2 - 4, cy, 4, roadWidth / 2);
      ctx.fillRect(cx + roadWidth / 2, cy - roadWidth / 2, 4, roadWidth / 2);

      const isGreen = (lane) => signalState.activeGreenLane === lane;

      // SOUTH 4-LANE
      vehiclesRef.current.south.forEach((v, idx) => {
        const sublaneX = cx + (v.sublane === 0 ? roadWidth * 0.15 : roadWidth * 0.38);
        const stopY = cy + roadWidth / 2 + 30 + Math.floor(idx / 2) * 45;
        if (!v.posY) v.posY = stopY;

        if (isGreen('south')) {
          v.posY -= v.speed * simSpeed * (v.type === 'EMERGENCY' ? 1.8 : 1.2);
          if (v.posY < -40) {
            v.posY = h + 40;
            vehicleClearedLane('south');
          }
        } else {
          if (v.posY > stopY) v.posY = Math.max(stopY, v.posY - v.speed * simSpeed);
          else v.posY = stopY;
        }
        drawStructuredVehicle(ctx, sublaneX, v.posY, 22, 38, v.type, 'NORTH');
      });

      // NORTH 4-LANE
      vehiclesRef.current.north.forEach((v, idx) => {
        const sublaneX = cx - (v.sublane === 0 ? roadWidth * 0.15 : roadWidth * 0.38);
        const stopY = cy - roadWidth / 2 - 30 - Math.floor(idx / 2) * 45;
        if (!v.posY) v.posY = stopY;

        if (isGreen('north')) {
          v.posY += v.speed * simSpeed * (v.type === 'EMERGENCY' ? 1.8 : 1.2);
          if (v.posY > h + 40) {
            v.posY = -40;
            vehicleClearedLane('north');
          }
        } else {
          if (v.posY < stopY) v.posY = Math.min(stopY, v.posY + v.speed * simSpeed);
          else v.posY = stopY;
        }
        drawStructuredVehicle(ctx, sublaneX, v.posY, 22, 38, v.type, 'SOUTH');
      });

      // WEST 4-LANE
      vehiclesRef.current.west.forEach((v, idx) => {
        const sublaneY = cy + (v.sublane === 0 ? roadWidth * 0.15 : roadWidth * 0.38);
        const stopX = cx - roadWidth / 2 - 30 - Math.floor(idx / 2) * 45;
        if (!v.posX) v.posX = stopX;

        if (isGreen('west')) {
          v.posX += v.speed * simSpeed * (v.type === 'EMERGENCY' ? 1.8 : 1.2);
          if (v.posX > w + 40) {
            v.posX = -40;
            vehicleClearedLane('west');
          }
        } else {
          if (v.posX < stopX) v.posX = Math.min(stopX, v.posX + v.speed * simSpeed);
          else v.posX = stopX;
        }
        drawStructuredVehicle(ctx, v.posX, sublaneY, 38, 22, v.type, 'EAST');
      });

      // EAST 4-LANE
      vehiclesRef.current.east.forEach((v, idx) => {
        const sublaneY = cy - (v.sublane === 0 ? roadWidth * 0.15 : roadWidth * 0.38);
        const stopX = cx + roadWidth / 2 + 30 + Math.floor(idx / 2) * 45;
        if (!v.posX) v.posX = stopX;

        if (isGreen('east')) {
          v.posX -= v.speed * simSpeed * (v.type === 'EMERGENCY' ? 1.8 : 1.2);
          if (v.posX < -40) {
            v.posX = w + 40;
            vehicleClearedLane('east');
          }
        } else {
          if (v.posX > stopX) v.posX = Math.max(stopX, v.posX - v.speed * simSpeed);
          else v.posX = stopX;
        }
        drawStructuredVehicle(ctx, v.posX, sublaneY, 38, 22, v.type, 'WEST');
      });

      // LED Signals
      drawSignalHead(ctx, cx - roadWidth / 2 - 32, cy - roadWidth / 2 - 45, isGreen('north'));
      drawSignalHead(ctx, cx + roadWidth / 2 + 12, cy + roadWidth / 2 + 18, isGreen('south'));
      drawSignalHead(ctx, cx - roadWidth / 2 - 45, cy + roadWidth / 2 + 10, isGreen('west'));
      drawSignalHead(ctx, cx + roadWidth / 2 + 18, cy - roadWidth / 2 - 45, isGreen('east'));

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [signalState, simSpeed]);

  const drawStructuredVehicle = (ctx, x, y, w, h, type, dir) => {
    ctx.save();
    ctx.translate(x, y);

    if (type === 'EMERGENCY') {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 22;
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-w / 3, -h / 3, (w * 2) / 3, (h * 2) / 3);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-2, -6, 4, 12);
      ctx.fillRect(-6, -2, 12, 4);
      const strobe = Math.floor(Date.now() / 100) % 2 === 0;
      ctx.fillStyle = strobe ? '#38bdf8' : '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'BUS') {
      ctx.fillStyle = '#9333ea';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 8;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 3, -h / 2 + 4, (w * 2) / 3, h - 8);
    } else if (type === 'TRUCK') {
      ctx.fillStyle = '#d97706';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-w / 3, -h / 2 + 2, (w * 2) / 3, 8);
    } else {
      ctx.fillStyle = '#0284c7';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w / 3, -h / 4, (w * 2) / 3, h / 2);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
      if (dir === 'NORTH') ctx.fillRect(-w / 2 + 2, -h / 2 - 10, w - 4, 10);
      else if (dir === 'SOUTH') ctx.fillRect(-w / 2 + 2, h / 2, w - 4, 10);
      else if (dir === 'EAST') ctx.fillRect(w / 2, -h / 2 + 2, 10, h - 4);
      else if (dir === 'WEST') ctx.fillRect(-w / 2 - 10, -h / 2 + 2, 10, h - 4);
    }

    ctx.restore();
  };

  const drawSignalHead = (ctx, x, y, isGreen) => {
    ctx.save();
    ctx.fillStyle = '#030712';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, 26, 44);
    ctx.strokeRect(x, y, 26, 44);

    ctx.beginPath();
    ctx.arc(x + 13, y + 12, 7, 0, Math.PI * 2);
    ctx.fillStyle = !isGreen ? '#ef4444' : '#450a0a';
    if (!isGreen) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 16;
    }
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 13, y + 32, 7, 0, Math.PI * 2);
    ctx.fillStyle = isGreen ? '#10b981' : '#064e3b';
    if (isGreen) {
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 16;
    }
    ctx.fill();

    ctx.restore();
  };

  return (
    <div className="space-y-6">
      {/* Top Telemetry Header - Synchronized Video Input Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm">
            <Zap className="h-5 w-5 animate-pulse text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                DYNAMIC QUEUE CLEARANCE SIGNAL CONTROL
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Video className="h-3.5 w-3.5 text-blue-600" />
                <span>Synced with Video Input: <strong>{fileName}</strong></span>
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
              <span className="uppercase text-emerald-600 font-extrabold">{signalState.activeGreenLane} 4-LANE CORRIDOR</span>
              <span className="text-xs text-slate-500 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Green Wave Active ({signalState.greenTimer}s remaining)
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-700 font-semibold">
            <Activity className="h-4 w-4 text-emerald-600" />
            <span>Sim Speed: </span>
            <button onClick={() => setSimSpeed(1)} className={`px-2 py-0.5 rounded ${simSpeed === 1 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-200 text-slate-700'}`}>1x</button>
            <button onClick={() => setSimSpeed(2)} className={`px-2 py-0.5 rounded ${simSpeed === 2 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-200 text-slate-700'}`}>2x Turbo</button>
          </div>
        </div>
      </div>

      {/* Main 2D Canvas Intersection Box */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-4 shadow-md">
        <div className="relative h-[480px] w-full overflow-hidden rounded-2xl">
          <canvas ref={canvasRef} className="h-full w-full" />

          {/* Aerial Lane HUD Badges - Directly Driven by Video Input metrics */}
          {/* South 4-Lane Badge */}
          <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 rounded-xl border px-3 py-2 text-xs font-semibold backdrop-blur-md flex items-center gap-2 shadow-xl transition ${
            signalState.activeGreenLane === 'south'
              ? 'border-emerald-500 bg-emerald-600 text-white shadow-emerald-500/30'
              : 'border-slate-200 bg-white/95 text-slate-900'
          }`}>
            <ArrowUp className="h-4 w-4" />
            <span className="uppercase">South 4-Lane: <strong>{laneMetrics.south?.count || 0} Cars</strong></span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              signalState.activeGreenLane === 'south' ? 'bg-white text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {signalState.activeGreenLane === 'south' ? `GREEN WAVE (${signalState.greenTimer}s remaining)` : 'RED STOP'}
            </span>
          </div>

          {/* North 4-Lane Badge */}
          <div className={`absolute top-3 left-1/2 -translate-x-1/2 rounded-xl border px-3 py-2 text-xs font-semibold backdrop-blur-md flex items-center gap-2 shadow-xl transition ${
            signalState.activeGreenLane === 'north'
              ? 'border-emerald-500 bg-emerald-600 text-white shadow-emerald-500/30'
              : 'border-slate-200 bg-white/95 text-slate-900'
          }`}>
            <ArrowDown className="h-4 w-4" />
            <span className="uppercase">North 4-Lane: <strong>{laneMetrics.north?.count || 0} Cars</strong></span>
          </div>

          {/* Left & Right badges omitted for brevity in UI replication */}
        </div>
      </div>
    </div>
  );
}
