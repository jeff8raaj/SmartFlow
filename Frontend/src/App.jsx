import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import DashboardPage from './pages/Dashboard';
import UploadVideoPage from './pages/UploadVideo';
import TrafficOptimizerPage from './pages/TrafficOptimizer';
import AnalyticsPage from './pages/Analytics';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';
import AppLayout from './layouts/AppLayout';
import { TrafficProvider } from './context/TrafficContext';

function App() {
  const location = useLocation();

  return (
    <TrafficProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="upload" element={<UploadVideoPage />} />
            <Route path="optimizer" element={<TrafficOptimizerPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </TrafficProvider>
  );
}

export default App;
