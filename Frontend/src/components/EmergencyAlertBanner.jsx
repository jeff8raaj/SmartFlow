import { useTraffic } from '../context/TrafficContext';
import { Siren, CheckCircle2, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function EmergencyAlertBanner() {
  const { activeEmergency, clearEmergency, signalState } = useTraffic();
  const [muted, setMuted] = useState(false);

  if (!activeEmergency) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-red-200 bg-red-50/90 p-5 shadow-md backdrop-blur-md animate-pulse">
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-red-600 text-white shadow-md shadow-red-500/30">
            <Siren className="h-6 w-6 animate-bounce" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                CRITICAL PRIORITY OVERRIDE
              </span>
              <span className="text-xs text-red-700">Detected at {activeEmergency.detectedAt}</span>
            </div>

            <h3 className="mt-1 text-lg font-bold text-red-950 flex items-center gap-2">
              <span>{activeEmergency.type} Approaching</span>
              <span className="text-xs font-semibold text-red-700 uppercase">({activeEmergency.lane} CORRIDOR)</span>
            </h3>

            <p className="mt-0.5 text-xs text-red-800">
              Signal locked to <strong className="text-emerald-700">GREEN WAVE</strong> on {activeEmergency.lane.toUpperCase()} lane. Intersecting corridors set to <strong className="text-red-700">RED STOP</strong>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setMuted(!muted)}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-800 shadow-sm transition hover:bg-red-100/50"
          >
            {muted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-emerald-600 animate-pulse" />}
            <span>{muted ? 'Audio Muted' : 'Siren Audio On'}</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>Green Corridor ({signalState.greenTimer}s)</span>
          </div>

          <button
            onClick={clearEmergency}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-red-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Clear Priority</span>
          </button>
        </div>
      </div>
    </div>
  );
}
