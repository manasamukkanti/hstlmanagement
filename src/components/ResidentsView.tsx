import React, { useState } from 'react';
import { Resident, Room } from '../types/hostel';
import {
  Users,
  Search,
  Plus,
  Download,
  ShieldCheck,
  Clock,
  Phone,
  Mail,
  Home,
  CheckCircle2,
  Trash2,
  Edit2,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';

interface ResidentsViewProps {
  residents: Resident[];
  rooms: Room[];
  onRefresh: () => void;
  onOpenNewAdmission: () => void;
  selectedResidentId?: string | null;
  onClearSelectedResident?: () => void;
}

export const ResidentsView: React.FC<ResidentsViewProps> = ({
  residents,
  rooms,
  onRefresh,
  onOpenNewAdmission,
  selectedResidentId,
  onClearSelectedResident,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [kycFilter, setKycFilter] = useState<string>('All');
  const [viewingResident, setViewingResident] = useState<Resident | null>(
    selectedResidentId ? residents.find((r) => r.id === selectedResidentId) || null : null
  );
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    rollNo: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    email: '',
    phone: '',
    course: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    roomId: '',
    bedNumber: 1,
    status: 'Active' as Resident['status'],
    kycStatus: 'Verified' as Resident['kycStatus'],
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep viewingResident updated if prop changes
  React.useEffect(() => {
    if (selectedResidentId) {
      const match = residents.find((r) => r.id === selectedResidentId);
      if (match) setViewingResident(match);
    }
  }, [selectedResidentId, residents]);

  // Filtered
  const filteredResidents = residents.filter((r) => {
    const query = search.toLowerCase();
    const matchesSearch =
      r.fullName.toLowerCase().includes(query) ||
      r.rollNo.toLowerCase().includes(query) ||
      r.course.toLowerCase().includes(query) ||
      (r.roomNumber && r.roomNumber.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesKyc = kycFilter === 'All' || r.kycStatus === kycFilter;
    return matchesSearch && matchesStatus && matchesKyc;
  });

  const handleOpenEdit = (res: Resident) => {
    setEditingResident(res);
    setEditFormData({
      fullName: res.fullName,
      rollNo: res.rollNo,
      gender: res.gender,
      email: res.email,
      phone: res.phone,
      course: res.course,
      emergencyName: res.emergencyContact.name,
      emergencyRelation: res.emergencyContact.relation,
      emergencyPhone: res.emergencyContact.phone,
      roomId: res.roomId || '',
      bedNumber: res.bedNumber || 1,
      status: res.status,
      kycStatus: res.kycStatus,
    });
    setFormError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResident) return;

    try {
      setIsSubmitting(true);
      setFormError('');

      await api.updateResident(editingResident.id, {
        fullName: editFormData.fullName,
        rollNo: editFormData.rollNo,
        gender: editFormData.gender,
        email: editFormData.email,
        phone: editFormData.phone,
        course: editFormData.course,
        emergencyContact: {
          name: editFormData.emergencyName,
          relation: editFormData.emergencyRelation,
          phone: editFormData.emergencyPhone,
        },
        roomId: editFormData.roomId || null,
        bedNumber: editFormData.roomId ? editFormData.bedNumber : null,
        status: editFormData.status,
        kycStatus: editFormData.kycStatus,
      });

      setEditingResident(null);
      onRefresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error updating resident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVacate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to mark ${name} as checked-out and release their bed?`)) return;
    try {
      await api.vacateResident(id);
      onRefresh();
      if (viewingResident?.id === id) {
        setViewingResident(null);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error vacating room');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently remove record for resident ${name}?`)) return;
    try {
      await api.deleteResident(id);
      onRefresh();
      if (viewingResident?.id === id) {
        setViewingResident(null);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting resident');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Resident Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active admissions, student profiles, room assignments, and guardian contacts
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={api.getExportUrl('residents')}
            download
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={onOpenNewAdmission}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll no, course, room..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Resident Statuses</option>
              <option value="Active">Active Residents</option>
              <option value="Notice Period">Notice Period</option>
              <option value="Checked-out">Checked-out / Alumni</option>
            </select>
          </div>

          <div>
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All KYC Statuses</option>
              <option value="Verified">Verified Documents</option>
              <option value="Pending">Pending Verification</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resident Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Resident & Roll No</th>
                <th className="py-3 px-4 font-semibold">Academic Course</th>
                <th className="py-3 px-4 font-semibold">Assigned Room</th>
                <th className="py-3 px-4 font-semibold">Emergency Contact</th>
                <th className="py-3 px-4 font-semibold">KYC</th>
                <th className="py-3 px-4 font-semibold">Fee Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No residents found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((res) => {
                  const hasDues = res.duesAmount > 0;
                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setViewingResident(res)}
                          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left block"
                        >
                          {res.fullName}
                        </button>
                        <span className="font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                          {res.rollNo} · {res.gender}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {res.course}
                      </td>

                      <td className="py-3 px-4">
                        {res.roomNumber ? (
                          <div className="font-mono tabular-nums">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {res.roomNumber}
                            </span>
                            <span className="text-slate-500 text-[11px] block">
                              Bed {res.bedNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Unallocated
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {res.emergencyContact.name} ({res.emergencyContact.relation})
                        </p>
                        <p className="font-mono text-[11px] text-slate-400">
                          {res.emergencyContact.phone}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-medium ${
                            res.kycStatus === 'Verified'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {res.kycStatus === 'Verified' ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          <span>{res.kycStatus}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {hasDues ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                            ${res.duesAmount} Due
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Clear
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingResident(res)}
                            title="View student profile"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(res)}
                            title="Edit resident info"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {res.roomId && (
                            <button
                              onClick={() => handleVacate(res.id, res.fullName)}
                              title="Checkout / Release Bed"
                              className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(res.id, res.fullName)}
                            title="Delete resident"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Resident Profile Modal */}
      {viewingResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Resident Student Card</h2>
              <button
                onClick={() => {
                  setViewingResident(null);
                  if (onClearSelectedResident) onClearSelectedResident();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {viewingResident.fullName}
                    </h3>
                    <p className="font-mono text-slate-500 tabular-nums">
                      Roll: {viewingResident.rollNo} · {viewingResident.gender}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{viewingResident.course}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      viewingResident.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {viewingResident.status}
                  </span>
                </div>
              </div>

              {/* Room & Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Room Assignment</span>
                  <p className="font-bold text-slate-900 dark:text-white font-mono">
                    {viewingResident.roomNumber
                      ? `${viewingResident.roomNumber} (Bed ${viewingResident.bedNumber})`
                      : 'None'}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">Admitted Date</span>
                  <p className="font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                    {viewingResident.checkInDate}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-semibold text-slate-900 dark:text-white block">Student Contacts</span>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${viewingResident.email}`} className="hover:underline">
                    {viewingResident.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono tabular-nums">{viewingResident.phone}</span>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Guardian / Emergency Contact
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {viewingResident.emergencyContact.name} ({viewingResident.emergencyContact.relation})
                </p>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono tabular-nums">
                    {viewingResident.emergencyContact.phone}
                  </span>
                </div>
              </div>

              {/* Financial status */}
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block">Pending Outstanding Balance</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    ${viewingResident.duesAmount}
                  </p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  KYC: <strong className="text-slate-800 dark:text-slate-200">{viewingResident.kycStatus}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  const res = viewingResident;
                  setViewingResident(null);
                  handleOpenEdit(res);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Edit Info
              </button>
              <button
                onClick={() => {
                  setViewingResident(null);
                  if (onClearSelectedResident) onClearSelectedResident();
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resident Modal */}
      {editingResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Resident: {editingResident.fullName}
              </h2>
              <button
                onClick={() => setEditingResident(null)}
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

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Roll / ID Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.rollNo}
                    onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Enrolled Course / Degree
                </label>
                <input
                  type="text"
                  value={editFormData.course}
                  onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Room & Bed */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Allocated Room
                  </label>
                  <select
                    value={editFormData.roomId}
                    onChange={(e) => setEditFormData({ ...editFormData, roomId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  >
                    <option value="">-- No Room Assigned --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} ({r.roomType} - {r.occupiedBeds}/{r.capacity} beds)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bed Slot
                  </label>
                  <select
                    value={editFormData.bedNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, bedNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  >
                    <option value="1">Bed 1</option>
                    <option value="2">Bed 2</option>
                    <option value="3">Bed 3</option>
                    <option value="4">Bed 4</option>
                  </select>
                </div>
              </div>

              {/* Emergency */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.emergencyName}
                    onChange={(e) => setEditFormData({ ...editFormData, emergencyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Relation
                  </label>
                  <input
                    type="text"
                    value={editFormData.emergencyRelation}
                    onChange={(e) => setEditFormData({ ...editFormData, emergencyRelation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Guardian Phone
                  </label>
                  <input
                    type="text"
                    value={editFormData.emergencyPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Status & KYC */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Residence Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as Resident['status'] })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Active">Active Resident</option>
                    <option value="Notice Period">Notice Period</option>
                    <option value="Checked-out">Checked-out / Left Hostel</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    KYC Verification
                  </label>
                  <select
                    value={editFormData.kycStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, kycStatus: e.target.value as Resident['kycStatus'] })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Verified">Verified Documents</option>
                    <option value="Pending">Pending Verification</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingResident(null)}
                  className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
