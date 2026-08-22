import { Bell, ChevronDown, Sparkles } from 'lucide-react';

export default function TopNavbar() {
  return (
    <div className="flex flex-col gap-4 py-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            SYSTEM ONLINE
          </span>
          <span className="text-xs text-slate-500">Real-Time Signal Engine</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Smart Traffic Management System</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
          <Bell className="mr-2 h-4 w-4 text-slate-500" />
          <span>Notifications</span>
        </button>

        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-sm">
            S
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900">Sree T.</p>
            <p className="text-[10px] text-slate-500">Traffic Controller</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
