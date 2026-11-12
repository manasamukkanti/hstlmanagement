import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  Wrench,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  X,
  Phone,
  Mail,
  Home,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { api } from './services/api';
import { Room, Resident, FeeRecord, MaintenanceTicket, RoomBlock, RoomType } from './types/hostel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rooms' | 'students' | 'fees' | 'complaints'>('dashboard');

  // Data states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Resident[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [complaints, setComplaints] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showPayFee, setShowPayFee] = useState<FeeRecord | null>(null);
  const [showAddComplaint, setShowAddComplaint] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Resident | null>(null);

  // Form error state
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const [studentForm, setStudentForm] = useState({
    name: '',
    rollNo: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    course: '',
    phone: '',
    email: '',
    parentName: '',
    parentPhone: '',
    roomId: '',
    bedNumber: 1,
  });

  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    block: 'Block A (North)' as RoomBlock,
    roomType: 'Double' as RoomType,
    capacity: 2,
    rent: 400,
  });

  const [complaintForm, setComplaintForm] = useState({
    roomId: '',
    studentName: '',
    issue: '',
    category: 'Plumbing' as MaintenanceTicket['category'],
    priority: 'Medium' as MaintenanceTicket['priority'],
  });

  // Load all data from Node.js backend
  const loadData = async () => {
    try {
      const [r, s, f, c] = await Promise.all([
        api.getRooms(),
        api.getResidents(),
        api.getFees(),
        api.getMaintenance(),
      ]);
      setRooms(r);
      setStudents(s);
      setFees(f);
      setComplaints(c);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Temporary feedback toast
  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Quick stats calculation
  const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const occupiedBeds = rooms.reduce((sum, r) => sum + r.occupiedBeds, 0);
  const vacantBeds = totalBeds - occupiedBeds;
  const pendingFeesTotal = fees
    .filter((f) => f.status !== 'Paid')
    .reduce((sum, f) => sum + f.amount, 0);
  const openComplaintsCount = complaints.filter((c) => c.status !== 'Resolved').length;

  // Add Student Handler
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.rollNo.trim() || !studentForm.phone.trim()) {
      setFormError('Please fill in Student Name, Roll Number, and Phone');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      const selectedRoom = rooms.find((r) => r.id === studentForm.roomId);

      await api.createResident({
        fullName: studentForm.name.trim(),
        rollNo: studentForm.rollNo.trim(),
        gender: studentForm.gender,
        email: studentForm.email.trim() || `${studentForm.rollNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@hostel.edu`,
        phone: studentForm.phone.trim(),
        course: studentForm.course.trim() || 'B.Tech / Undergraduate',
        emergencyContact: {
          name: studentForm.parentName.trim() || 'Parent/Guardian',
          relation: 'Parent',
          phone: studentForm.parentPhone.trim() || studentForm.phone.trim(),
        },
        roomId: studentForm.roomId || null,
        roomNumber: selectedRoom?.roomNumber || null,
        bedNumber: studentForm.roomId ? Number(studentForm.bedNumber) : null,
        checkInDate: new Date().toISOString().split('T')[0],
        expectedCheckOutDate: '2028-05-30',
        status: 'Active',
        kycStatus: 'Verified',
      });

      setShowAddStudent(false);
      setStudentForm({
        name: '',
        rollNo: '',
        gender: 'Male',
        course: '',
        phone: '',
        email: '',
        parentName: '',
        parentPhone: '',
        roomId: '',
        bedNumber: 1,
      });
      await loadData();
      showToast('Student added successfully!');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error adding student');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Room Handler
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.roomNumber.trim()) {
      setFormError('Please enter a room number (e.g. 101, A-102)');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      await api.createRoom({
        roomNumber: roomForm.roomNumber.trim(),
        block: roomForm.block,
        floor: 1,
        roomType: roomForm.roomType,
        capacity: Number(roomForm.capacity),
        monthlyRent: Number(roomForm.rent),
        amenities: ['Fan', 'Bed', 'Study Table', 'Attached Bath'],
        status: 'Available',
      });

      setShowAddRoom(false);
      setRoomForm({
        roomNumber: '',
        block: 'Block A (North)',
        roomType: 'Double',
        capacity: 2,
        rent: 400,
      });
      await loadData();
      showToast('New room created successfully!');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error creating room');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pay Fee Handler
  const handlePayFee = async (feeId: string, method: string) => {
    try {
      await api.recordPayment(feeId, method, 'Fee cleared by student');
      setShowPayFee(null);
      await loadData();
      showToast('Fee payment recorded!');
    } catch (err) {
      console.error(err);
    }
  };

  // Add Complaint Handler
  const handleAddComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    const room = rooms.find((r) => r.id === complaintForm.roomId);
    if (!room || !complaintForm.issue.trim()) {
      setFormError('Please select a room and describe the problem');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      await api.createTicket({
        roomId: room.id,
        roomNumber: room.roomNumber,
        residentName: complaintForm.studentName.trim() || 'Student',
        category: complaintForm.category,
        priority: complaintForm.priority,
        title: complaintForm.issue.trim(),
        description: complaintForm.issue.trim(),
        assignedStaff: 'Hostel Caretaker',
        cost: 0,
      });

      setShowAddComplaint(false);
      setComplaintForm({
        roomId: '',
        studentName: '',
        issue: '',
        category: 'Plumbing',
        priority: 'Medium',
      });
      await loadData();
      showToast('Complaint submitted to caretaker!');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error reporting complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark Complaint Fixed
  const handleResolveComplaint = async (id: string) => {
    try {
      await api.updateTicket(id, { status: 'Resolved' });
      await loadData();
      showToast('Complaint marked as fixed!');
    } catch (err) {
      console.error(err);
    }
  };

  // Remove Student confirmation
  const handleConfirmDeleteStudent = async () => {
    if (!deletingStudent) return;
    try {
      await api.deleteResident(deletingStudent.id);
      setDeletingStudent(null);
      await loadData();
      showToast('Student removed from hostel.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Toast notification */}
      {feedbackMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-200" />
            <span className="text-xl font-bold tracking-tight">Hostel Management System</span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => { setActiveTab('dashboard'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-indigo-900 text-white shadow-xs' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('rooms'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === 'rooms' ? 'bg-indigo-900 text-white shadow-xs' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              Rooms
            </button>
            <button
              onClick={() => { setActiveTab('students'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === 'students' ? 'bg-indigo-900 text-white shadow-xs' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => { setActiveTab('fees'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === 'fees' ? 'bg-indigo-900 text-white shadow-xs' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              Fees
            </button>
            <button
              onClick={() => { setActiveTab('complaints'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeTab === 'complaints' ? 'bg-indigo-900 text-white shadow-xs' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              Complaints
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-24 text-slate-500">
            <p className="text-base font-medium">Connecting to hostel database...</p>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome to Hostel Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">
                      Easily manage student admissions, room allocations, monthly fees, and repair complaints.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setFormError(''); setShowAddStudent(true); }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Student</span>
                    </button>
                    <button
                      onClick={() => { setFormError(''); setShowAddRoom(true); }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Room</span>
                    </button>
                  </div>
                </div>

                {/* 4 Simple Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Rooms</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{rooms.length}</p>
                    <p className="text-xs text-slate-400 mt-1">Across all blocks</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Available Beds</span>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{vacantBeds}</p>
                    <p className="text-xs text-slate-500 mt-1">{occupiedBeds} of {totalBeds} occupied</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Students</span>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">{students.length}</p>
                    <p className="text-xs text-slate-400 mt-1">Enrolled & staying</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Fees</span>
                    <p className="text-2xl font-bold text-amber-600 mt-1">${pendingFeesTotal}</p>
                    <p className="text-xs text-slate-500 mt-1">{openComplaintsCount} complaints open</p>
                  </div>
                </div>

                {/* Recent Students & Active Complaints preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Students List Preview */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-slate-900 text-sm">Recently Added Students</h2>
                      <button
                        onClick={() => setActiveTab('students')}
                        className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                      >
                        View all
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      {students.slice(0, 4).map((s) => (
                        <div key={s.id} className="py-2.5 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-800">{s.fullName}</p>
                            <p className="text-slate-400">Roll: {s.rollNo} · {s.course}</p>
                          </div>
                          <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {s.roomNumber ? `Room ${s.roomNumber}` : 'No Room'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Complaints Preview */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-slate-900 text-sm">Open Complaints / Repairs</h2>
                      <button
                        onClick={() => setActiveTab('complaints')}
                        className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                      >
                        View all
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      {complaints.filter((c) => c.status !== 'Resolved').slice(0, 4).map((c) => (
                        <div key={c.id} className="py-2.5 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-800">{c.title}</p>
                            <p className="text-slate-400">Room: {c.roomNumber} · By: {c.residentName}</p>
                          </div>
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            {c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ROOMS TAB */}
            {activeTab === 'rooms' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">Hostel Rooms</h1>
                    <p className="text-xs text-slate-500">View rooms, check available beds, or add new rooms</p>
                  </div>
                  <button
                    onClick={() => { setFormError(''); setShowAddRoom(true); }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Room</span>
                  </button>
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {rooms.map((room) => {
                    const isFull = room.occupiedBeds >= room.capacity;
                    return (
                      <div key={room.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">Room {room.roomNumber}</h3>
                            <p className="text-xs text-slate-400">{room.block} · {room.roomType} Sharing</p>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              isFull ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isFull ? 'Full' : `${room.capacity - room.occupiedBeds} Bed Available`}
                          </span>
                        </div>

                        {/* Bed Slots */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                          <span className="font-semibold text-slate-600 block">Beds in this Room:</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {room.bedSlots.map((b) => (
                              <div
                                key={b.bedNumber}
                                className={`p-2 rounded border text-center ${
                                  b.residentName ? 'bg-slate-50 border-slate-200 font-medium text-slate-800' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                }`}
                              >
                                <span className="block font-bold">Bed {b.bedNumber}</span>
                                <span className="text-[11px] truncate block">
                                  {b.residentName || 'Vacant'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span>Monthly Rent:</span>
                          <span className="font-bold text-slate-900">${room.monthlyRent}/month</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. STUDENTS TAB */}
            {activeTab === 'students' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">Students Directory</h1>
                    <p className="text-xs text-slate-500">List of all students currently residing in the hostel</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search student or roll no..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => { setFormError(''); setShowAddStudent(true); }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Student</span>
                    </button>
                  </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="py-3 px-4 font-bold">Student Name</th>
                        <th className="py-3 px-4 font-bold">Roll Number</th>
                        <th className="py-3 px-4 font-bold">Course</th>
                        <th className="py-3 px-4 font-bold">Room & Bed</th>
                        <th className="py-3 px-4 font-bold">Contact Phone</th>
                        <th className="py-3 px-4 font-bold">Parent Contact</th>
                        <th className="py-3 px-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {students
                        .filter(
                          (s) =>
                            s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (s.roomNumber && s.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-900">{s.fullName}</td>
                            <td className="py-3 px-4 text-slate-500">{s.rollNo}</td>
                            <td className="py-3 px-4">{s.course}</td>
                            <td className="py-3 px-4">
                              {s.roomNumber ? (
                                <span className="font-semibold text-indigo-700">
                                  Room {s.roomNumber} (Bed {s.bedNumber})
                                </span>
                              ) : (
                                <span className="text-amber-600 font-medium">Unassigned</span>
                              )}
                            </td>
                            <td className="py-3 px-4">{s.phone}</td>
                            <td className="py-3 px-4 text-slate-500">
                              {s.emergencyContact.name} ({s.emergencyContact.phone})
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setDeletingStudent(s)}
                                title="Remove Student"
                                className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. FEES TAB */}
            {activeTab === 'fees' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">Fees & Payments</h1>
                    <p className="text-xs text-slate-500">Track student fee payments, pending dues, and issue receipts</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="py-3 px-4 font-bold">Invoice #</th>
                        <th className="py-3 px-4 font-bold">Student</th>
                        <th className="py-3 px-4 font-bold">Room</th>
                        <th className="py-3 px-4 font-bold">Fee Type</th>
                        <th className="py-3 px-4 font-bold">Amount</th>
                        <th className="py-3 px-4 font-bold">Due Date</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {fees.map((f) => {
                        const isPaid = f.status === 'Paid';
                        return (
                          <tr key={f.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-bold">{f.invoiceNumber}</td>
                            <td className="py-3 px-4 font-medium text-slate-900">{f.residentName}</td>
                            <td className="py-3 px-4 text-slate-500">{f.roomNumber}</td>
                            <td className="py-3 px-4">{f.type}</td>
                            <td className="py-3 px-4 font-bold text-slate-900">${f.amount}</td>
                            <td className="py-3 px-4 text-slate-500">{f.dueDate}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 font-semibold ${
                                  isPaid ? 'text-emerald-700' : 'text-amber-600'
                                }`}
                              >
                                {isPaid ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                <span>{f.status}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {isPaid ? (
                                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                                  Paid on {f.paidDate}
                                </span>
                              ) : (
                                <button
                                  onClick={() => setShowPayFee(f)}
                                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded transition cursor-pointer"
                                >
                                  Pay Fee
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. COMPLAINTS TAB */}
            {activeTab === 'complaints' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">Hostel Complaints & Repairs</h1>
                    <p className="text-xs text-slate-500">Student maintenance requests (electricity, water, plumbing, internet)</p>
                  </div>
                  <button
                    onClick={() => { setFormError(''); setShowAddComplaint(true); }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Report New Complaint</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complaints.map((c) => {
                    const isFixed = c.status === 'Resolved';
                    return (
                      <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-indigo-700">Room {c.roomNumber}</span>
                            <h3 className="font-bold text-slate-900 text-sm mt-0.5">{c.title}</h3>
                            <p className="text-xs text-slate-500">Reported by {c.residentName}</p>
                          </div>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                              isFixed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-400">Category: {c.category}</span>
                          {!isFixed && (
                            <button
                              onClick={() => handleResolveComplaint(c.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded transition cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Fixed</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- SAFE INLINE MODALS --- */}

      {/* Modal 1: Add Student */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add New Student</h2>
              <button onClick={() => setShowAddStudent(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Roll / ID Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024CS01"
                    value={studentForm.rollNo}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course / Department</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech Computer Science"
                  value={studentForm.course}
                  onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mobile number"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Email</label>
                  <input
                    type="email"
                    placeholder="student@email.com"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    placeholder="Father/Mother name"
                    value={studentForm.parentName}
                    onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Phone</label>
                  <input
                    type="text"
                    placeholder="Parent mobile number"
                    value={studentForm.parentPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Room</label>
                  <select
                    value={studentForm.roomId}
                    onChange={(e) => setStudentForm({ ...studentForm, roomId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  >
                    <option value="">-- Assign Later --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.roomNumber} ({r.capacity - r.occupiedBeds} beds free)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bed Number</label>
                  <select
                    disabled={!studentForm.roomId}
                    value={studentForm.bedNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, bedNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="1">Bed 1</option>
                    <option value="2">Bed 2</option>
                    <option value="3">Bed 3</option>
                    <option value="4">Bed 4</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Room */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add New Room</h2>
              <button onClick={() => setShowAddRoom(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddRoom} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101, 202, A-105"
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Block / Wing</label>
                <select
                  value={roomForm.block}
                  onChange={(e) => setRoomForm({ ...roomForm, block: e.target.value as RoomBlock })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Block A (North)">Block A (North)</option>
                  <option value="Block B (East)">Block B (East)</option>
                  <option value="Block C (West)">Block C (West)</option>
                  <option value="Block D (South)">Block D (South)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity (Beds)</label>
                  <select
                    value={roomForm.capacity}
                    onChange={(e) => {
                      const cap = Number(e.target.value);
                      const typeMap: Record<number, RoomType> = {
                        1: 'Single',
                        2: 'Double',
                        3: 'Triple',
                        4: 'Quad',
                      };
                      setRoomForm({
                        ...roomForm,
                        capacity: cap,
                        roomType: typeMap[cap] || 'Double',
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="1">1 Bed (Single)</option>
                    <option value="2">2 Beds (Double)</option>
                    <option value="3">3 Beds (Triple)</option>
                    <option value="4">4 Beds (Quad)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Rent ($)</label>
                  <input
                    type="number"
                    value={roomForm.rent}
                    onChange={(e) => setRoomForm({ ...roomForm, rent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Pay Fee */}
      {showPayFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Record Fee Payment</h2>
              <button onClick={() => setShowPayFee(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <p className="font-semibold text-slate-900">Student: {showPayFee.residentName}</p>
              <p className="text-slate-500">Room: {showPayFee.roomNumber} · {showPayFee.type}</p>
              <p className="text-lg font-bold text-indigo-700 mt-2">Amount: ${showPayFee.amount}</p>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-slate-700 block">Select Payment Mode:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePayFee(showPayFee.id, 'Cash')}
                  className="p-2 border rounded-lg font-medium hover:bg-indigo-50 hover:border-indigo-300 text-center cursor-pointer"
                >
                  💵 Cash
                </button>
                <button
                  onClick={() => handlePayFee(showPayFee.id, 'UPI')}
                  className="p-2 border rounded-lg font-medium hover:bg-indigo-50 hover:border-indigo-300 text-center cursor-pointer"
                >
                  📱 Online / UPI
                </button>
                <button
                  onClick={() => handlePayFee(showPayFee.id, 'Bank Transfer')}
                  className="p-2 border rounded-lg font-medium hover:bg-indigo-50 hover:border-indigo-300 text-center cursor-pointer"
                >
                  🏦 Bank Transfer
                </button>
                <button
                  onClick={() => handlePayFee(showPayFee.id, 'Credit Card')}
                  className="p-2 border rounded-lg font-medium hover:bg-indigo-50 hover:border-indigo-300 text-center cursor-pointer"
                >
                  💳 Debit / Credit Card
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setShowPayFee(null)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Add Complaint */}
      {showAddComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Report an Issue / Complaint</h2>
              <button onClick={() => setShowAddComplaint(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddComplaint} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Room *</label>
                <select
                  required
                  value={complaintForm.roomId}
                  onChange={(e) => setComplaintForm({ ...complaintForm, roomId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                >
                  <option value="">-- Choose Room --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.block})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  placeholder="Who is reporting?"
                  value={complaintForm.studentName}
                  onChange={(e) => setComplaintForm({ ...complaintForm, studentName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={complaintForm.category}
                  onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Plumbing">Water / Tap / Plumbing</option>
                  <option value="Electrical">Light / Fan / Electrical</option>
                  <option value="WiFi / Internet">Wi-Fi / Internet</option>
                  <option value="Carpentry / Furniture">Bed / Table / Furniture</option>
                  <option value="Housekeeping">Cleaning / Housekeeping</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Describe the Problem *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Bathroom tap leaking, or fan regulator not working"
                  value={complaintForm.issue}
                  onChange={(e) => setComplaintForm({ ...complaintForm, issue: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddComplaint(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Delete Student Confirmation */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Student Removal</span>
            </div>
            <p className="text-slate-600">
              Are you sure you want to remove <strong>{deletingStudent.fullName}</strong> ({deletingStudent.rollNo}) from the hostel? This will also release their bed slot.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteStudent}
                className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Yes, Remove Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
