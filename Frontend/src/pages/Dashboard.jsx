import { motion } from 'framer-motion';
import { useTraffic } from '../context/TrafficContext';
import AIVisionOverlay from '../components/AIVisionOverlay';
import EmergencyAlertBanner from '../components/EmergencyAlertBanner';
import IntersectionDiagram from '../components/IntersectionDiagram';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bolt,
  Gauge,
  ShieldCheck,
  Video,
  Sparkles,
  ArrowRight,
  TrendingUp,
  PieChart,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    totalVehicleCount,
    avgSpeed,
    activeEmergency,
    laneMetrics,
    signalState,
    videoUrl,
  } = useTraffic();

  const navigate = useNavigate();

  // Stats KPI cards
  const stats = [
    {
      label: 'Total Active Vehicles',
      value: totalVehicleCount.toString(),
      description: 'Active vehicles across 4 junction corridors',
      icon: Activity,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Average Flow Speed',
      value: `${avgSpeed} km/h`,
      description: 'Network-wide traffic velocity',
      icon: Gauge,
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Emergency Priority',
      value: activeEmergency ? `${activeEmergency.lane.toUpperCase()} ACTIVE` : 'NONE ACTIVE',
      description: activeEmergency ? `Priority green wave on ${activeEmergency.lane.toUpperCase()} 4-Lane` : 'Standard signal cycle active',
      icon: Bolt,
      iconBg: activeEmergency ? 'bg-red-600 text-white' : 'bg-amber-50 text-amber-600',
      highlight: !!activeEmergency,
    },
    {
      label: 'Congested Corridor',
      value: `${Object.entries(laneMetrics).sort((a, b) => b[1].count - a[1].count)[0][0].toUpperCase()} 4-Lane`,
      description: 'Highest vehicle density corridor',
      icon: BarChart3,
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Active Signal Green',
      value: `${signalState.activeGreenLane.toUpperCase()} (${signalState.greenTimer}s)`,
      description: 'Current green phase corridor',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Optimization Index',
      value: `${signalState.delayReduction}% Wait Saved`,
      description: 'AI dynamic queue clearance score',
      icon: AlertTriangle,
      iconBg: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section - Clean Transparent Borderless Header (No Heavy BG Box Color) */}
      <section className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            EXECUTIVE CONTROL CENTER
          </span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">AI Traffic Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Live operational telemetry, 4-lane vision feeds, and dynamic signal controller charts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Upload Video
          </button>
          <button
            onClick={() => navigate('/optimizer')}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
          >
            <span>Traffic Optimizer</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Flashing Emergency Priority Banner if active */}
      <EmergencyAlertBanner />

      {/* Stats KPI Cards Grid - Ultra Clean Light Mode Cards */}
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ y: -4 }}
              className={`rounded-3xl border p-6 transition duration-200 ${
                stat.highlight
                  ? 'border-red-200 bg-red-50/70 shadow-md'
                  : 'border-slate-200/80 bg-white shadow-card hover:shadow-card-hover'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <p className={`mt-2 text-2xl font-extrabold tracking-tight ${stat.highlight ? 'text-red-700' : 'text-slate-900'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`flex h-13 w-13 items-center justify-center rounded-2xl ${stat.iconBg}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-slate-500">{stat.description}</p>
            </motion.div>
          );
        })}
      </section>

      {/* Video Streams: Raw Traffic Feed vs Live 4-Lane AI Detection Feed */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Raw Footage Stream */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Raw Stream</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">Original Traffic Footage</h3>
            </div>
            <Video className="h-5 w-5 text-slate-400" />
          </div>
          <div className="overflow-hidden rounded-2xl bg-slate-900 border border-slate-200 h-[380px]">
            <video src={videoUrl} autoPlay loop muted playsInline className="h-full w-full object-cover" />
          </div>
        </motion.div>

        {/* Live 4-Lane AI Vision Detection Feed */}
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Analytics</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Live Video 4-Lane AI Detection Feed</span>
                <Sparkles className="h-4 w-4 text-blue-600" />
              </h3>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold border ${
              activeEmergency ? 'bg-red-600 text-white border-red-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {activeEmergency ? '🚨 PRIORITY OVERRIDE DETECTED' : '4-Lane Grid Active'}
            </span>
          </div>

          <AIVisionOverlay showControls={true} height="380px" />
        </motion.div>
      </section>

      {/* Dynamic Charts Section */}
      <section className="grid gap-6 xl:grid-cols-3">
        {/* Chart 1: 4-Lane Corridor Car Density Bar Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Real-Time Density</p>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-1">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>4-Lane Corridor Car Density Comparison</span>
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">Live Telemetry</span>
          </div>

          <div className="space-y-4 pt-2">
            {Object.entries(laneMetrics).map(([laneKey, data]) => {
              const maxVal = 20;
              const percent = Math.min(100, Math.round((data.count / maxVal) * 100));
              const isGreenActive = signalState.activeGreenLane === laneKey;

              return (
                <div key={laneKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
                    <span className="uppercase font-bold text-slate-900 flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${isGreenActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      {laneKey} 4-Lane Corridor
                    </span>
                    <span className="font-bold text-slate-900">
                      {data.count} Vehicles ({data.density})
                    </span>
                  </div>
                  <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex items-center p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        data.density === 'Critical'
                          ? 'bg-red-500 shadow-sm'
                          : data.density === 'High'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Signal Optimization Efficiency Gauge */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Efficiency</p>
              <PieChart className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Queue Clearance Index</h3>

            <div className="relative my-6 flex items-center justify-center">
              <svg className="h-44 w-44 -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#2563eb"
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset="45"
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000"
                />
              </svg>

              <div className="absolute text-center">
                <p className="text-4xl font-extrabold text-slate-900">{signalState.delayReduction}%</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Delay Saved</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1 font-medium">
            <div className="flex justify-between">
              <span>Green Phase Allocation:</span> <strong className="text-emerald-700 font-bold">96.8%</strong>
            </div>
            <div className="flex justify-between">
              <span>Avg Emergency Clearance:</span> <strong className="text-blue-700 font-bold">12.4s</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Chart 3: Hourly Traffic Flow Area Chart */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Flow Telemetry</p>
            <h3 className="mt-2 text-lg font-bold text-slate-900 flex items-center gap-2 mt-1">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Hourly Traffic Throughput Curve (24h Peak Index)</span>
            </h3>
          </div>
          <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
            Peak Hour: <strong>16:00 - 18:00</strong>
          </span>
        </div>

        <div className="h-48 w-full pt-4">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradientLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d="M 0 100 Q 60 40, 120 70 T 240 30 T 360 80 T 500 20 L 500 120 L 0 120 Z"
              fill="url(#areaGradientLight)"
            />

            <path
              d="M 0 100 Q 60 40, 120 70 T 240 30 T 360 80 T 500 20"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
            />
          </svg>
        </div>
      </section>

      {/* Embedded 2D Intersection Simulation Widget */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Simulation</p>
            <h3 className="text-xl font-bold text-slate-900">2D Diagrammatic Intersection Optimizer</h3>
          </div>
          <button
            onClick={() => navigate('/optimizer')}
            className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 font-bold"
          >
            <span>Open Full Interactive Optimizer Canvas</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <IntersectionDiagram />
      </section>
    </div>
  );
}
