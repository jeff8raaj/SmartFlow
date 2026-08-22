import IntersectionDiagram from '../components/IntersectionDiagram';
import EmergencyAlertBanner from '../components/EmergencyAlertBanner';
import { useTraffic } from '../context/TrafficContext';
import { Zap, Clock, ShieldCheck, Activity, BarChart2 } from 'lucide-react';

export default function TrafficOptimizerPage() {
  const { laneMetrics, signalState, totalVehicleCount } = useTraffic();

  return (
    <div className="space-y-8">
      {/* Hero Header - Clean Borderless Transparent Layout */}
      <section className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            LIVE SIMULATION & CONTROL
          </span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">Interactive Signal Optimizer</h2>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Real-time 2D animated 4-lane intersection optimization driven by AI vehicle density calculation and priority emergency clearance corridors.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <Zap className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span>AI Dynamic Signal Active</span>
        </div>
      </section>

      {/* Emergency Priority Alert Banner if active */}
      <EmergencyAlertBanner />

      {/* Dynamic Metric KPI Cards */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Delay Reduction</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{signalState.delayReduction}%</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Average vehicle wait time saved</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Priority Clearance</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">12.4 s</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Emergency vehicle clearance window</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Junction Cars</span>
            <Activity className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{totalVehicleCount}</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Active cars across 4 lanes</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Signal Efficiency</span>
            <BarChart2 className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">96.8%</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Throughput stability index</p>
        </div>
      </section>

      {/* Main Diagrammatic Animation Component */}
      <IntersectionDiagram />

      {/* Lane Performance Breakdown Table */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Real-Time Corridor Density & Signal Allocation</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
              <tr>
                <th className="py-3 px-4">Corridor Lane</th>
                <th className="py-3 px-4">Vehicle Count</th>
                <th className="py-3 px-4">Car Density</th>
                <th className="py-3 px-4">Avg Speed</th>
                <th className="py-3 px-4">Queue Length</th>
                <th className="py-3 px-4">Signal Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {Object.entries(laneMetrics).map(([key, data]) => {
                const isGreen = signalState.activeGreenLane === key;
                return (
                  <tr key={key} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold uppercase text-slate-900">{key} 4-Lane</td>
                    <td className="py-3.5 px-4">{data.count} vehicles</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        data.density === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                        data.density === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {data.density}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{data.speed} km/h</td>
                    <td className="py-3.5 px-4">{data.queue}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                        isGreen ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`h-2 w-2 rounded-full ${isGreen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        {isGreen ? `GREEN (${signalState.greenTimer}s)` : 'RED STOP'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
