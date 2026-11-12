import React, { useState } from 'react';
import { VisitorLog, Resident } from '../types/hostel';
import {
  UserCheck,
  Search,
  Plus,
  Clock,
  Phone,
  CheckCircle2,
  LogOut,
  X,
  Shield,
} from 'lucide-react';
import { api } from '../services/api';

interface VisitorsViewProps {
  visitors: VisitorLog[];
  residents: Resident[];
  onRefresh: () => void;
  onOpenNewVisitor?: () => void;
}

export const VisitorsView: React.FC<VisitorsViewProps> = ({
  visitors,
  residents,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isLogOpen, setIsLogOpen] = useState(false);

  // New visitor form state
  const [newVisitor, setNewVisitor] = useState({
    visitorName: '',
    residentId: residents[0]?.id || '',
    relationship: 'Parent',
    phone: '',
    idProofType: 'National ID' as VisitorLog['idProofType'],
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeInsideCount = visitors.filter((v) => v.status === 'Inside').length;

  const filteredVisitors = visitors.filter((v) => {
    const query = search.toLowerCase();
    const matchesSearch =
      v.visitorName.toLowerCase().includes(query) ||
      v.residentName.toLowerCase().includes(query) ||
      v.roomNumber.toLowerCase().includes(query) ||
      v.phone.includes(query);

    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleLogVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitor.visitorName.trim() || !newVisitor.residentId || !newVisitor.phone.trim()) {
      setFormError('Visitor name, resident, and contact phone are required');
      return;
    }

    const resident = residents.find((r) => r.id === newVisitor.residentId);
    if (!resident) return;

    try {
      setIsSubmitting(true);
      setFormError('');

      await api.logVisitor({
        visitorName: newVisitor.visitorName,
        residentId: resident.id,
        residentName: resident.fullName,
        roomNumber: resident.roomNumber || 'N/A',
        relationship: newVisitor.relationship,
        phone: newVisitor.phone,
        idProofType: newVisitor.idProofType,
      });

      setIsLogOpen(false);
      onRefresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error logging visitor entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = async (id: string, name: string) => {
    try {
      await api.checkoutVisitor(id);
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error checking out visitor');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Campus Visitor Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hostel gate logs, parent check-ins, security credentials, and departure tracking
          </p>
        </div>

        <button
          onClick={() => {
            setNewVisitor({
              visitorName: '',
              residentId: residents[0]?.id || '',
              relationship: 'Parent',
              phone: '',
              idProofType: 'National ID',
            });
            setFormError('');
            setIsLogOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Guest Entry</span>
        </button>
      </div>

      {/* KPI banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Currently Inside Campus</span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 font-mono tabular-nums">
            {activeInsideCount}
          </p>
          <span className="text-[11px] text-slate-400">Active visitor passes</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Check-Ins</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono tabular-nums">
            {visitors.length}
          </p>
          <span className="text-[11px] text-slate-400">Total recorded entries</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Departed Today</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono tabular-nums">
            {visitors.filter((v) => v.status === 'Departed').length}
          </p>
          <span className="text-[11px] text-slate-400">Checked out via gate</span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search visitor name, resident, phone..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Visitors</option>
              <option value="Inside">Inside Campus (Active)</option>
              <option value="Departed">Departed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Visitor Name</th>
                <th className="py-3 px-4 font-semibold">Resident Visited</th>
                <th className="py-3 px-4 font-semibold">Room</th>
                <th className="py-3 px-4 font-semibold">Relationship</th>
                <th className="py-3 px-4 font-semibold">ID Proof</th>
                <th className="py-3 px-4 font-semibold">Check-In Time</th>
                <th className="py-3 px-4 font-semibold">Check-Out Time</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No visitor logs recorded.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((v) => {
                  const isInside = v.status === 'Inside';
                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {v.visitorName}
                        <span className="font-mono text-slate-400 block text-[11px] font-normal">
                          {v.phone}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        {v.residentName}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                        {v.roomNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {v.relationship}
                      </td>

                      <td className="py-3 px-4 text-slate-500 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{v.idProofType}</span>
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {v.checkIn}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {v.checkOut || '—'}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            isInside
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {isInside ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                          <span>{v.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isInside ? (
                          <button
                            onClick={() => handleCheckout(v.id, v.visitorName)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors ml-auto cursor-pointer"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Mark Exit</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Logged Out</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Visitor Modal */}
      {isLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Register Visitor Entry</h2>
              <button
                onClick={() => setIsLogOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleLogVisitor} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Visitor Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newVisitor.visitorName}
                  onChange={(e) => setNewVisitor({ ...newVisitor, visitorName: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Hostel Resident Visited <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={newVisitor.residentId}
                  onChange={(e) => setNewVisitor({ ...newVisitor, residentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Select Resident --</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} (Room {r.roomNumber || 'N/A'}) - {r.rollNo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={newVisitor.relationship}
                    onChange={(e) => setNewVisitor({ ...newVisitor, relationship: e.target.value })}
                    placeholder="e.g. Father, Mother, Sibling"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newVisitor.phone}
                    onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ID Document Verified
                </label>
                <select
                  value={newVisitor.idProofType}
                  onChange={(e) => setNewVisitor({ ...newVisitor, idProofType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="National ID">National ID Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Confirm Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
