import { useState } from 'react';
import { Download, FileText, Check, ShieldAlert } from 'lucide-react';

export default function ReportsPage() {
  const [downloaded, setDownloaded] = useState(false);

  const handleExport = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header - Clean Borderless Transparent Layout */}
      <section className="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            SYSTEM AUDIT LOGS
          </span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">Traffic Operation Logs</h2>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            Export official system telemetry, emergency priority overrides, and signal re-allocation logs.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
        >
          {downloaded ? <Check className="h-4 w-4 text-emerald-300" /> : <Download className="h-4 w-4" />}
          <span>{downloaded ? 'Report Downloaded!' : 'Export PDF / CSV Report'}</span>
        </button>
      </section>

      {/* Incident & Signal Log Table */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Priority Clearance & Signal Switch Log History</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">Showing last 24 hours</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Target Corridor</th>
                <th className="py-3 px-4">Vehicle Density</th>
                <th className="py-3 px-4">Override Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr className="hover:bg-slate-50/80 transition">
                <td className="py-3.5 px-4 font-mono text-xs text-slate-600">11:42:08 AM</td>
                <td className="py-3.5 px-4 font-bold text-red-700 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-600" /> Ambulance Priority
                </td>
                <td className="py-3.5 px-4 uppercase font-bold text-slate-900">South 4-Lane</td>
                <td className="py-3.5 px-4">High (14 vehicles)</td>
                <td className="py-3.5 px-4"><span className="text-emerald-700 font-bold">Cleared (14s)</span></td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition">
                <td className="py-3.5 px-4 font-mono text-xs text-slate-600">11:30:15 AM</td>
                <td className="py-3.5 px-4 text-slate-900 font-bold">AI Green Re-allocation</td>
                <td className="py-3.5 px-4 uppercase font-bold text-slate-900">North 4-Lane</td>
                <td className="py-3.5 px-4">Critical (18 vehicles)</td>
                <td className="py-3.5 px-4"><span className="text-blue-700 font-bold">Green Extended (35s)</span></td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition">
                <td className="py-3.5 px-4 font-mono text-xs text-slate-600">11:15:40 AM</td>
                <td className="py-3.5 px-4 text-slate-900 font-bold">AI Green Re-allocation</td>
                <td className="py-3.5 px-4 uppercase font-bold text-slate-900">East 4-Lane</td>
                <td className="py-3.5 px-4">Moderate (9 vehicles)</td>
                <td className="py-3.5 px-4"><span className="text-blue-700 font-bold">Normal (20s)</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
