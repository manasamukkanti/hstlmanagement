import React, { useState } from 'react';
import { MaintenanceTicket, Room, Resident } from '../types/hostel';
import {
  Wrench,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Zap,
  Droplet,
  Wifi,
  Sparkles,
  Wind,
  X,
} from 'lucide-react';
import { api } from '../services/api';

interface MaintenanceViewProps {
  maintenance: MaintenanceTicket[];
  rooms: Room[];
  residents: Resident[];
  onRefresh: () => void;
  onOpenNewTicket?: () => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  maintenance,
  rooms,
  residents,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);
  const [resolvingTicket, setResolvingTicket] = useState<MaintenanceTicket | null>(null);
  const [resolveCost, setResolveCost] = useState<number>(25);

  // New ticket state
  const [newTicket, setNewTicket] = useState<{
    roomId: string;
    residentName: string;
    category: MaintenanceTicket['category'];
    priority: MaintenanceTicket['priority'];
    title: string;
    description: string;
    assignedStaff: string;
  }>({
    roomId: rooms[0]?.id || '',
    residentName: '',
    category: 'Plumbing',
    priority: 'Medium',
    title: '',
    description: '',
    assignedStaff: '',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered tickets
  const filteredTickets = maintenance.filter((t) => {
    const query = search.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(query) ||
      t.roomNumber.toLowerCase().includes(query) ||
      t.ticketNumber.toLowerCase().includes(query) ||
      t.residentName.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.roomId || !newTicket.title.trim()) {
      setFormError('Room and issue title are required');
      return;
    }

    const room = rooms.find((r) => r.id === newTicket.roomId);
    if (!room) return;

    try {
      setIsSubmitting(true);
      setFormError('');

      await api.createTicket({
        roomId: room.id,
        roomNumber: room.roomNumber,
        residentName: newTicket.residentName || 'Hostel Warden',
        category: newTicket.category,
        priority: newTicket.priority,
        title: newTicket.title,
        description: newTicket.description,
        assignedStaff: newTicket.assignedStaff || null,
        cost: 0,
      });

      setIsRaiseOpen(false);
      onRefresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error creating ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartWork = async (ticket: MaintenanceTicket) => {
    const staff = prompt('Enter assigned technician/staff name:', ticket.assignedStaff || 'Campus Maintenance Team');
    if (staff === null) return;
    try {
      await api.updateTicket(ticket.id, {
        status: 'In Progress',
        assignedStaff: staff || 'Duty Technician',
      });
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating ticket');
    }
  };

  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;

    try {
      setIsSubmitting(true);
      await api.updateTicket(resolvingTicket.id, {
        status: 'Resolved',
        cost: Number(resolveCost) || 0,
      });
      setResolvingTicket(null);
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error resolving ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: MaintenanceTicket['category']) => {
    switch (category) {
      case 'Electrical':
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case 'Plumbing':
        return <Droplet className="w-3.5 h-3.5 text-blue-500" />;
      case 'WiFi / Internet':
        return <Wifi className="w-3.5 h-3.5 text-indigo-500" />;
      case 'HVAC / AC':
        return <Wind className="w-3.5 h-3.5 text-cyan-500" />;
      case 'Housekeeping':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Wrench className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Maintenance & Repairs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Facility complaints, plumbing, electrical work orders, and resolution logs
          </p>
        </div>

        <button
          onClick={() => {
            setNewTicket({
              roomId: rooms[0]?.id || '',
              residentName: '',
              category: 'Plumbing',
              priority: 'Medium',
              title: '',
              description: '',
              assignedStaff: '',
            });
            setFormError('');
            setIsRaiseOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Raise Ticket</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket, room, issue..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Ticket Statuses</option>
              <option value="Reported">Reported / Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="HVAC / AC">HVAC / Air Conditioning</option>
              <option value="WiFi / Internet">WiFi / Internet</option>
              <option value="Carpentry / Furniture">Carpentry & Furniture</option>
              <option value="Housekeeping">Housekeeping</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No maintenance tickets found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            All rooms and campus utilities are operating normally.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTickets.map((ticket) => {
            const isResolved = ticket.status === 'Resolved';
            const isInProgress = ticket.status === 'In Progress';

            return (
              <div
                key={ticket.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Header: Ticket # & Priority */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {ticket.ticketNumber}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                        Room {ticket.roomNumber}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        ticket.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                          : ticket.priority === 'High'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {ticket.priority} Priority
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                    {ticket.title}
                  </h3>
                  {ticket.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                      {ticket.description}
                    </p>
                  )}

                  {/* Metadata Row */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 flex-wrap">
                    <span className="flex items-center gap-1 font-medium">
                      {getCategoryIcon(ticket.category)}
                      {ticket.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Reported by {ticket.residentName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{ticket.createdAt}</span>
                  </div>

                  {/* Staff Assignment & Cost */}
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned Technician:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {ticket.assignedStaff || 'Unassigned'}
                      </span>
                    </div>
                    {isResolved && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Repair Cost:</span>
                        <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                          ${ticket.cost} (Resolved at {ticket.resolvedAt})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Actions Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span
                      className={`font-semibold ${
                        isResolved
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isInProgress
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isResolved && !isInProgress && (
                      <button
                        onClick={() => handleStartWork(ticket)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
                      >
                        Assign & Start
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={() => {
                          setResolvingTicket(ticket);
                          setResolveCost(30);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded transition-colors cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Raise Ticket Modal */}
      {isRaiseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Raise Maintenance Request</h2>
              <button
                onClick={() => setIsRaiseOpen(false)}
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

            <form onSubmit={handleRaiseTicket} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Room Affected <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={newTicket.roomId}
                    onChange={(e) => setNewTicket({ ...newTicket, roomId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} ({r.block})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Reported By (Resident / Staff)
                  </label>
                  <input
                    type="text"
                    value={newTicket.residentName}
                    onChange={(e) => setNewTicket({ ...newTicket, residentName: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="HVAC / AC">HVAC / Air Conditioning</option>
                    <option value="WiFi / Internet">WiFi / Internet</option>
                    <option value="Carpentry / Furniture">Carpentry / Furniture</option>
                    <option value="Housekeeping">Housekeeping</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Urgency Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical (Immediate Hazard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Issue Summary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="e.g. Water heater faucet leaking"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Notes / Symptoms
                </label>
                <textarea
                  rows={3}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Describe location, symptoms, or instructions for the technician..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Staff (Optional)
                </label>
                <input
                  type="text"
                  value={newTicket.assignedStaff}
                  onChange={(e) => setNewTicket({ ...newTicket, assignedStaff: e.target.value })}
                  placeholder="e.g. John Plumber / IT Team"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRaiseOpen(false)}
                  className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Ticket Modal */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Close Work Order</h2>
              <button
                onClick={() => setResolvingTicket(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Ticket: {resolvingTicket.ticketNumber} ({resolvingTicket.title})
              </p>
              <p className="text-slate-500">
                Marking this issue as repaired and returning room to nominal status.
              </p>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Parts & Repair Labor Cost ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={resolveCost}
                  onChange={(e) => setResolveCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
