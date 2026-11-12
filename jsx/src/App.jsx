import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { DashboardView } from './components/DashboardView.jsx';
import { RoomsView } from './components/RoomsView.jsx';
import { ResidentsView } from './components/ResidentsView.jsx';
import { FeesView } from './components/FeesView.jsx';
import { MaintenanceView } from './components/MaintenanceView.jsx';
import { VisitorsView } from './components/VisitorsView.jsx';
import { MessView } from './components/MessView.jsx';
import { NoticesView } from './components/NoticesView.jsx';
import { NewAdmissionModal } from './components/NewAdmissionModal.jsx';
import { AllocateBedModal } from './components/AllocateBedModal.jsx';
import { api } from './services/api.js';
import { Loader2, AlertCircle, Building2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('hostel_theme') === 'dark' ||
        (!('hostel_theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  // State caches
  const [overview, setOverview] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [residents, setResidents] = useState([]);
  const [fees, setFees] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [mess, setMess] = useState([]);
  const [notices, setNotices] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState(null);

  // Modals state
  const [isNewAdmissionOpen, setIsNewAdmissionOpen] = useState(false);
  const [allocateBedTarget, setAllocateBedTarget] = useState(null);
  const [selectedResidentId, setSelectedResidentId] = useState(null);

  // Sync dark mode with HTML root
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('hostel_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('hostel_theme', 'light');
    }
  }, [darkMode]);

  // Load all data
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [
        overviewRes,
        roomsRes,
        residentsRes,
        feesRes,
        maintenanceRes,
        visitorsRes,
        messRes,
        noticesRes,
      ] = await Promise.all([
        api.getOverview(),
        api.getRooms(),
        api.getResidents(),
        api.getFees(),
        api.getMaintenance(),
        api.getVisitors(),
        api.getMess(),
        api.getNotices(),
      ]);

      setOverview(overviewRes);
      setRooms(roomsRes);
      setResidents(residentsRes);
      setFees(feesRes);
      setMaintenance(maintenanceRes);
      setVisitors(visitorsRes);
      setMess(messRes);
      setNotices(noticesRes);
    } catch (err) {
      console.error('Error fetching hostel data:', err);
      setError(err.message || 'Failed to connect to hostel backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResetDb = async () => {
    if (!confirm('Reset hostel database to initial sample records?')) return;
    try {
      setIsResetting(true);
      await api.resetDatabase();
      await fetchData();
    } catch (err) {
      alert(err.message || 'Error resetting database');
    } finally {
      setIsResetting(false);
    }
  };

  const handleOpenBedAllocation = (roomId, bedNumber) => {
    setAllocateBedTarget({ roomId, bedNumber });
  };

  const handleViewResident = (residentId) => {
    setSelectedResidentId(residentId);
    setActiveTab('residents');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenNewAdmission={() => setIsNewAdmissionOpen(true)}
        onResetDb={handleResetDb}
        isResetting={isResetting}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Initializing HostelFlow ERP & loading database records...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl max-w-lg mx-auto text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Connection Error</h2>
            <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
            <button
              onClick={() => {
                setIsLoading(true);
                fetchData();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                overview={overview}
                rooms={rooms}
                residents={residents}
                maintenance={maintenance}
                mess={mess}
                setActiveTab={setActiveTab}
                onOpenNewAdmission={() => setIsNewAdmissionOpen(true)}
                onOpenNewMaintenance={() => setActiveTab('maintenance')}
                onOpenNewFee={() => setActiveTab('fees')}
                onOpenNewVisitor={() => setActiveTab('visitors')}
              />
            )}

            {activeTab === 'rooms' && (
              <RoomsView
                rooms={rooms}
                residents={residents}
                onRefresh={fetchData}
                onOpenAllocateBedModal={handleOpenBedAllocation}
                onViewResident={handleViewResident}
              />
            )}

            {activeTab === 'residents' && (
              <ResidentsView
                residents={residents}
                rooms={rooms}
                onRefresh={fetchData}
                onOpenNewAdmission={() => setIsNewAdmissionOpen(true)}
                selectedResidentId={selectedResidentId}
                onClearSelectedResident={() => setSelectedResidentId(null)}
              />
            )}

            {activeTab === 'fees' && (
              <FeesView fees={fees} residents={residents} onRefresh={fetchData} />
            )}

            {activeTab === 'maintenance' && (
              <MaintenanceView
                maintenance={maintenance}
                rooms={rooms}
                residents={residents}
                onRefresh={fetchData}
              />
            )}

            {activeTab === 'visitors' && (
              <VisitorsView visitors={visitors} residents={residents} onRefresh={fetchData} />
            )}

            {activeTab === 'mess' && <MessView mess={mess} onRefresh={fetchData} />}

            {activeTab === 'notices' && <NoticesView notices={notices} onRefresh={fetchData} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">HostelFlow Management System</span>
            <span aria-hidden="true">·</span>
            <span>Node.js Backend & Database</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="tabular-nums font-mono text-[11px]">
              {rooms.length} Rooms · {overview?.totalBeds ?? 0} Beds · {residents.length} Residents
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {isNewAdmissionOpen && (
        <NewAdmissionModal
          rooms={rooms}
          onClose={() => setIsNewAdmissionOpen(false)}
          onSuccess={fetchData}
        />
      )}

      {allocateBedTarget && (
        <AllocateBedModal
          roomId={allocateBedTarget.roomId}
          bedNumber={allocateBedTarget.bedNumber}
          rooms={rooms}
          residents={residents}
          onClose={() => setAllocateBedTarget(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
