import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-8 px-4 py-6 xl:px-8">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col gap-6">
          <TopNavbar />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
