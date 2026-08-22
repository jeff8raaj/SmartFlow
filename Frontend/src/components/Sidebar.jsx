import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Camera,
  CircleDollarSign,
  LayoutDashboard,
  Settings,
  Zap,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Upload Video', to: '/upload', icon: Camera },
  { label: 'Traffic Optimizer', to: '/optimizer', icon: Zap },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Reports', to: '/reports', icon: CircleDollarSign },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden w-full max-w-[260px] flex-none flex-col gap-6 py-2 lg:flex">
      {/* Brand Header - Clean Light Mode */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <Zap className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Smart Flow</h2>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">AI Traffic OS</p>
        </div>
      </div>

      {/* Navigation Items - Clean Borderless Transparent Layout */}
      <div className="mt-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`group flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-blue-600 shadow-card border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Priority Mode Badge */}
      <div className="mt-auto rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-900 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Priority Emergency Active</span>
        </p>
        <p className="mt-1 text-slate-500 leading-relaxed">
          Green wave corridors automatically clear path for emergency units.
        </p>
      </div>
    </aside>
  );
}
