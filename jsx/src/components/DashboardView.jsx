import React from 'react';
import {
  Building2,
  Users,
  CreditCard,
  Wrench,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UtensilsCrossed,
} from 'lucide-react';

export const DashboardView = ({
  overview,
  rooms = [],
  residents = [],
  maintenance = [],
  mess = [],
  setActiveTab,
  onOpenNewAdmission,
  onOpenNewMaintenance,
  onOpenNewFee,
  onOpenNewVisitor,
}) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];
  const todayMess = mess.find((m) => m.day.toLowerCase() === todayName.toLowerCase()) || mess[0] || {};

  const blocks = ['Block A (North)', 'Block B (East)', 'Block C (West)', 'Block D (South)'];
  const blockStats = blocks.map((blockName) => {
    const blockRooms = rooms.filter((r) => r.block === blockName);
    const capacity = blockRooms.reduce((acc, r) => acc + r.capacity, 0);
    const occupied = blockRooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
    const percent = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
    return {
      name: blockName,
      totalRooms: blockRooms.length,
      capacity,
      occupied,
      available: capacity - occupied,
      percent,
    };
  });

  const recentResidents = [...residents]
    .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime())
    .slice(0, 4);

  const openTickets = maintenance
    .filter((m) => m.status !== 'Resolved')
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero Banner with Campus Visual */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-xs">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/hostel_campus_hero_1794453269039.jpg"
            alt="Hostel Campus"
            className="w-full h-full object-cover opacity-25 dark:opacity-20"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 lg:p-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
            <span>Campus Living ERP</span>
            <span aria-hidden="true">·</span>
            <span>Academic Year 2026-2027</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3 text-balance">
            Residential Facilities & Dormitory Operations Center
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
            Real-time occupancy management, automated fee billing, digital room key allocations, student welfare tracking, and rapid maintenance ticketing.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewAdmission}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              + Admit New Resident
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors cursor-pointer"
            >
              View Bed Matrix
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors cursor-pointer"
            >
              Fee Invoices
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rooms & Occupancy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Bed Capacity</span>
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {overview?.occupiedBeds ?? 0}
                <span className="text-base font-normal text-slate-500 dark:text-slate-400">
                  /{overview?.totalBeds ?? 0}
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {overview?.availableBeds ?? 0} beds
                </span>{' '}
                currently vacant
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
                {overview?.occupancyRate ?? 0}% full
              </span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overview?.occupancyRate ?? 0}%` }}
            />
          </div>
        </div>

        {/* Active Residents */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Residents</span>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {overview?.activeResidents ?? 0}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>KYC Verified & Registered</span>
          </div>
        </div>

        {/* Financial Collection */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Revenue</span>
            <span className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            ${(overview?.monthlyCollected ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1 tabular-nums">
            ${(overview?.totalDues ?? 0).toLocaleString()} pending collections
          </p>
        </div>

        {/* Maintenance & Campus Life */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Open Tickets & Visitors</span>
            <span className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-4">
            <div>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {overview?.openMaintenance ?? 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Repairs active</p>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {overview?.activeVisitors ?? 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Visitors inside</p>
            </div>
          </div>
        </div>
      </div>

      {/* Block Occupancy Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Hostel Wings & Block Occupancy</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live distribution of resident capacity across campus blocks</p>
          </div>
          <button
            onClick={() => setActiveTab('rooms')}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <span>Manage All Rooms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {blockStats.map((block) => (
            <div
              key={block.name}
              className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{block.name}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums font-mono">
                  {block.occupied}/{block.capacity} Beds
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    block.percent >= 90
                      ? 'bg-rose-500'
                      : block.percent >= 60
                      ? 'bg-indigo-600 dark:bg-indigo-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${block.percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{block.totalRooms} Rooms</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                  {block.available} Vacant
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Maintenance & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-md">
                  <Wrench className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Active Maintenance Tickets</h2>
              </div>
              <button
                onClick={() => setActiveTab('maintenance')}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                View all tickets
              </button>
            </div>

            {openTickets.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <span>All facilities and rooms are in nominal working condition</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {openTickets.map((ticket) => (
                  <div key={ticket.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white">{ticket.roomNumber}</span>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-slate-500 dark:text-slate-400">{ticket.category}</span>
                        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                        <span
                          className={`font-medium ${
                            ticket.priority === 'Critical' || ticket.priority === 'High'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{ticket.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Reported by {ticket.residentName} · {ticket.createdAt}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Registrations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md">
                  <Users className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Student Admissions</h2>
              </div>
              <button
                onClick={() => setActiveTab('residents')}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Resident directory
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="pb-2 font-medium">Resident</th>
                    <th className="pb-2 font-medium">Roll No</th>
                    <th className="pb-2 font-medium">Course</th>
                    <th className="pb-2 font-medium">Room / Bed</th>
                    <th className="pb-2 font-medium">Check-In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {recentResidents.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white">{res.fullName}</td>
                      <td className="py-2.5 font-mono tabular-nums text-slate-500">{res.rollNo}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{res.course}</td>
                      <td className="py-2.5 font-mono tabular-nums">
                        {res.roomNumber ? `${res.roomNumber} (Bed ${res.bedNumber})` : 'Unassigned'}
                      </td>
                      <td className="py-2.5 font-mono tabular-nums text-slate-500">{res.checkInDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions & Today's Mess */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Quick Administrative Tasks</h2>
            <div className="space-y-2">
              <button
                onClick={onOpenNewAdmission}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Register Resident</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onOpenNewFee}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Generate Fee Invoice</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onOpenNewMaintenance}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Report Repair Ticket</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={onOpenNewVisitor}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Log Visitor Entry</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Today's Dining Hall Menu */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Mess Hall Today</h2>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{todayMess.day}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Breakfast</span>
                <p className="text-slate-600 dark:text-slate-400">{todayMess.breakfast}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Lunch</span>
                <p className="text-slate-600 dark:text-slate-400">{todayMess.lunch}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Dinner</span>
                <p className="text-slate-600 dark:text-slate-400">{todayMess.dinner}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('mess')}
              className="mt-4 w-full py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-lg text-center transition-colors cursor-pointer"
            >
              Full 7-Day Weekly Schedule →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
