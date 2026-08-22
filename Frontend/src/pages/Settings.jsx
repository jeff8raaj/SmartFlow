import { useState } from 'react';
import { useTraffic } from '../context/TrafficContext';
import { Sliders, ShieldCheck, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const { signalState, setSignalState } = useTraffic();
  const [minTimer, setMinTimer] = useState(signalState.minGreen || 8);
  const [maxTimer, setMaxTimer] = useState(signalState.maxGreen || 45);
  const [confidence, setConfidence] = useState(85);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSignalState((prev) => ({
      ...prev,
      minGreen: Number(minTimer),
      maxGreen: Number(maxTimer),
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Hero Header - Clean Borderless Transparent Layout */}
      <section className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            SYSTEM PREFERENCES
          </span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">Traffic Engine Settings</h2>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Configure dynamic signal cycle limits, confidence thresholds, and priority settings.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-700"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{saved ? 'Settings Saved!' : 'Save Configuration'}</span>
        </button>
      </section>

      <div className="grid gap-6">
        {/* Signal Timing Limits */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Dynamic Signal Duration Limits</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Minimum Green Light Phase (seconds)</label>
              <input
                type="number"
                value={minTimer}
                onChange={(e) => setMinTimer(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Maximum Green Light Phase (seconds)</label>
              <input
                type="number"
                value={maxTimer}
                onChange={(e) => setMaxTimer(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>
        </section>

        {/* AI Model Sensitivity */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-bold text-slate-900">AI Vision Detection Confidence Threshold</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Confidence Threshold</span>
              <strong className="text-blue-600">{confidence}%</strong>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
              className="w-full accent-blue-600"
            />
            <p className="text-xs text-slate-500 font-medium">
              Bounding boxes with confidence score lower than threshold will be ignored to reduce false positives.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
