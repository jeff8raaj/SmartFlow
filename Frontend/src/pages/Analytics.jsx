import { useTraffic } from '../context/TrafficContext';
import { BarChart3, TrendingUp, Clock, ShieldCheck } from 'lucide-react';

export default function AnalyticsPage() {
  const { breakdown, totalVehicleCount, signalState } = useTraffic();

  return (
    <div className="space-y-8">
      {/* Hero Header - Clean Borderless Transparent Layout */}
      <section className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            TELEMETRY & ANALYTICS
          </span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">AI Traffic Performance</h2>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Detailed network performance telemetry, flow indices, and vehicle category distribution.
          </p>
        </div>

        <span className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm">
          Real-Time Data Engine
        </span>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Traffic Efficiency</p>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-4 text-4xl font-extrabold text-slate-900">94.8%</p>
          <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
            Overall flow optimization index compared to fixed-timer traffic light signals.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Clearance</p>
            <ShieldCheck className="h-5 w-5 text-red-600" />
          </div>
          <p className="mt-4 text-4xl font-extrabold text-slate-900">1.8s</p>
          <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
            Average signal override activation speed upon computer vision detection.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Queue Stability</p>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-4 text-4xl font-extrabold text-slate-900">{signalState.delayReduction}%</p>
          <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
            Reduction in vehicle queue spillback at key city junctions.
          </p>
        </div>
      </section>

      {/* Visual Analytics Graphs */}
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Vehicle Category Breakdown</h3>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4 pt-2">
            {[
              { label: 'Passenger Cars', count: breakdown.cars, color: 'bg-sky-500', percentage: Math.round((breakdown.cars / (totalVehicleCount || 1)) * 100) },
              { label: 'Commercial Trucks', count: breakdown.trucks, color: 'bg-amber-500', percentage: Math.round((breakdown.trucks / (totalVehicleCount || 1)) * 100) },
              { label: 'Public Transit Buses', count: breakdown.buses, color: 'bg-purple-500', percentage: Math.round((breakdown.buses / (totalVehicleCount || 1)) * 100) },
              { label: 'Emergency Ambulances', count: breakdown.emergency, color: 'bg-red-600', percentage: Math.round((breakdown.emergency / (totalVehicleCount || 1)) * 100) },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.label}</span>
                  <span className="font-bold text-slate-900">{item.count} units ({item.percentage}%)</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Hourly Traffic Congestion Trend</h3>
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { hour: '06:00', val: 30 },
              { hour: '08:00', val: 85 },
              { hour: '10:00', val: 65 },
              { hour: '12:00', val: 50 },
              { hour: '14:00', val: 58 },
              { hour: '16:00', val: 92 },
              { hour: '18:00', val: 88 },
              { hour: '20:00', val: 40 },
            ].map((bar) => (
              <div key={bar.hour} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-100 border border-slate-200 rounded-t-xl overflow-hidden h-48 flex items-end">
                  <div
                    className={`w-full transition-all duration-500 ${
                      bar.val > 80 ? 'bg-red-500' : 'bg-blue-600'
                    }`}
                    style={{ height: `${bar.val}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500">{bar.hour}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
