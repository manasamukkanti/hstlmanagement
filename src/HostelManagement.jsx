import React, { useState, useEffect } from 'react';

// ==========================================
// HOSTEL MANAGEMENT SYSTEM (PURE REACT JSX)
// ==========================================

export default function HostelManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Simple state data
  const [rooms, setRooms] = useState([
    { id: 1, number: '101', block: 'Block A', type: 'Double', beds: 2, occupied: 2, rent: 400 },
    { id: 2, number: '102', block: 'Block A', type: 'Single', beds: 1, occupied: 1, rent: 600 },
    { id: 3, number: '103', block: 'Block A', type: 'Double', beds: 2, occupied: 1, rent: 400 },
    { id: 4, number: '201', block: 'Block B', type: 'Triple', beds: 3, occupied: 2, rent: 350 },
    { id: 5, number: '202', block: 'Block B', type: 'Double', beds: 2, occupied: 0, rent: 400 },
  ]);

  const [students, setStudents] = useState([
    { id: 1, name: 'Rahul Sharma', rollNo: 'CS-2024-01', phone: '9876543210', room: '101', bed: 1, course: 'B.Tech CS' },
    { id: 2, name: 'Ananya Verma', rollNo: 'CS-2024-02', phone: '9876543211', room: '101', bed: 2, course: 'B.Tech IT' },
    { id: 3, name: 'Vikram Singh', rollNo: 'ME-2023-14', phone: '9876543212', room: '102', bed: 1, course: 'Mechanical' },
    { id: 4, name: 'Priya Patel', rollNo: 'EE-2024-08', phone: '9876543213', room: '103', bed: 1, course: 'Electrical' },
  ]);

  const [fees, setFees] = useState([
    { id: 1, studentName: 'Rahul Sharma', room: '101', amount: 400, month: 'November 2026', status: 'Paid', date: '2026-11-02' },
    { id: 2, studentName: 'Ananya Verma', room: '101', amount: 400, month: 'November 2026', status: 'Pending', date: '-' },
    { id: 3, studentName: 'Vikram Singh', room: '102', amount: 600, month: 'November 2026', status: 'Paid', date: '2026-11-01' },
    { id: 4, studentName: 'Priya Patel', room: '103', amount: 400, month: 'November 2026', status: 'Pending', date: '-' },
  ]);

  const [complaints, setComplaints] = useState([
    { id: 1, room: '101', title: 'Bathroom tap is leaking', reportedBy: 'Rahul Sharma', status: 'In Progress' },
    { id: 2, room: '103', title: 'Ceiling fan is running very slow', reportedBy: 'Priya Patel', status: 'Pending' },
    { id: 3, room: '201', title: 'Tube light flickering', reportedBy: 'Caretaker', status: 'Fixed' },
  ]);

  // Modal open/close state
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddComplaint, setShowAddComplaint] = useState(false);

  // Simple Form Inputs
  const [newStudent, setNewStudent] = useState({ name: '', rollNo: '', phone: '', room: '103', course: 'B.Tech' });
  const [newRoom, setNewRoom] = useState({ number: '', block: 'Block A', type: 'Double', beds: 2, rent: 400 });
  const [newComplaint, setNewComplaint] = useState({ room: '101', title: '', reportedBy: '' });

  // Add new student function
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.rollNo) return alert('Please enter name and roll number');

    const studentItem = {
      id: Date.now(),
      name: newStudent.name,
      rollNo: newStudent.rollNo,
      phone: newStudent.phone || 'N/A',
      room: newStudent.room,
      bed: 1,
      course: newStudent.course,
    };

    setStudents([...students, studentItem]);

    // Also add pending fee invoice
    setFees([...fees, {
      id: Date.now() + 1,
      studentName: newStudent.name,
      room: newStudent.room,
      amount: 400,
      month: 'Current Month',
      status: 'Pending',
      date: '-',
    }]);

    setShowAddStudent(false);
    setNewStudent({ name: '', rollNo: '', phone: '', room: '103', course: 'B.Tech' });
  };

  // Add new room function
  const handleAddRoom = (e) => {
    e.preventDefault();
    if (!newRoom.number) return alert('Please enter a room number');

    const roomItem = {
      id: Date.now(),
      number: newRoom.number,
      block: newRoom.block,
      type: newRoom.type,
      beds: Number(newRoom.beds),
      occupied: 0,
      rent: Number(newRoom.rent),
    };

    setRooms([...rooms, roomItem]);
    setShowAddRoom(false);
    setNewRoom({ number: '', block: 'Block A', type: 'Double', beds: 2, rent: 400 });
  };

  // Add new complaint function
  const handleAddComplaint = (e) => {
    e.preventDefault();
    if (!newComplaint.title) return alert('Please describe the problem');

    const complaintItem = {
      id: Date.now(),
      room: newComplaint.room,
      title: newComplaint.title,
      reportedBy: newComplaint.reportedBy || 'Student',
      status: 'Pending',
    };

    setComplaints([complaintItem, ...complaints]);
    setShowAddComplaint(false);
    setNewComplaint({ room: '101', title: '', reportedBy: '' });
  };

  // Pay fee button action
  const handlePayFee = (id) => {
    setFees(fees.map(f => f.id === id ? { ...f, status: 'Paid', date: new Date().toISOString().split('T')[0] } : f));
  };

  // Fix complaint button action
  const handleFixComplaint = (id) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: 'Fixed' } : c));
  };

  // Remove student
  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  // Quick stats
  const totalBeds = rooms.reduce((sum, r) => sum + r.beds, 0);
  const occupiedBeds = students.length;
  const freeBeds = totalBeds - occupiedBeds;
  const pendingFeesCount = fees.filter(f => f.status === 'Pending').length;

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* 1. TOP HEADER */}
      <header style={{ backgroundColor: '#4338ca', color: '#ffffff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>🏠 Hostel Management System</h2>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['dashboard', 'rooms', 'students', 'fees', 'complaints'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                backgroundColor: activeTab === tab ? '#1e1b4b' : 'transparent',
                color: '#ffffff',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <div style={{ maxWidth: '1000px', margin: '24px auto', padding: '0 16px' }}>

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px' }}>Dashboard Overview</h1>
                <p style={{ margin: '4px 0 0', color: '#64748b' }}>Quick summary of rooms, students, and hostel dues</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowAddStudent(true)}
                  style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  + Add Student
                </button>
                <button
                  onClick={() => setShowAddRoom(true)}
                  style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  + Add Room
                </button>
              </div>
            </div>

            {/* 4 Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>TOTAL ROOMS</span>
                <h3 style={{ margin: '8px 0 0', fontSize: '24px' }}>{rooms.length}</h3>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>TOTAL STUDENTS</span>
                <h3 style={{ margin: '8px 0 0', fontSize: '24px', color: '#4f46e5' }}>{students.length}</h3>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>AVAILABLE BEDS</span>
                <h3 style={{ margin: '8px 0 0', fontSize: '24px', color: '#16a34a' }}>{freeBeds}</h3>
              </div>
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>PENDING FEES</span>
                <h3 style={{ margin: '8px 0 0', fontSize: '24px', color: '#ea580c' }}>{pendingFeesCount}</h3>
              </div>
            </div>

            {/* List preview */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginTop: 0 }}>Recent Students in Hostel</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {students.map((s) => (
                  <li key={s.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>{s.name}</strong> ({s.rollNo}) - {s.course}</span>
                    <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      Room {s.room}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* --- ROOMS TAB --- */}
        {activeTab === 'rooms' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>Hostel Rooms List</h2>
              <button
                onClick={() => setShowAddRoom(true)}
                style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                + Add Room
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {rooms.map((room) => (
                <div key={room.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Room {room.number}</h3>
                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      {room.beds} Beds ({room.type})
                    </span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '8px 0' }}>{room.block} · Rent: ${room.rent}/month</p>
                  <p style={{ margin: 0, fontSize: '13px' }}>
                    Occupied: <strong>{room.occupied}</strong> / {room.beds} beds
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- STUDENTS TAB --- */}
        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>All Students</h2>
              <button
                onClick={() => setShowAddStudent(true)}
                style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                + Add Student
              </button>
            </div>

            <table style={{ width: '100%', backgroundColor: '#fff', borderCollapse: 'collapse', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Roll No</th>
                  <th style={{ padding: '12px' }}>Room</th>
                  <th style={{ padding: '12px' }}>Course</th>
                  <th style={{ padding: '12px' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}><strong>{s.name}</strong></td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{s.rollNo}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#4338ca' }}>Room {s.room}</td>
                    <td style={{ padding: '12px' }}>{s.course}</td>
                    <td style={{ padding: '12px' }}>{s.phone}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteStudent(s.id)}
                        style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- FEES TAB --- */}
        {activeTab === 'fees' && (
          <div>
            <h2>Student Fee Status</h2>
            <table style={{ width: '100%', backgroundColor: '#fff', borderCollapse: 'collapse', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Student</th>
                  <th style={{ padding: '12px' }}>Room</th>
                  <th style={{ padding: '12px' }}>Month</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}><strong>{f.studentName}</strong></td>
                    <td style={{ padding: '12px' }}>Room {f.room}</td>
                    <td style={{ padding: '12px' }}>{f.month}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>${f.amount}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        backgroundColor: f.status === 'Paid' ? '#dcfce7' : '#ffedd5',
                        color: f.status === 'Paid' ? '#166534' : '#c2410c',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}>
                        {f.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {f.status !== 'Paid' ? (
                        <button
                          onClick={() => handlePayFee(f.id)}
                          style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span style={{ color: '#16a34a', fontSize: '13px' }}>Paid on {f.date}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- COMPLAINTS TAB --- */}
        {activeTab === 'complaints' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>Hostel Complaints & Repairs</h2>
              <button
                onClick={() => setShowAddComplaint(true)}
                style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                + Report Complaint
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {complaints.map((c) => (
                <div key={c.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#4338ca' }}>Room {c.room}</span>
                    <span style={{
                      backgroundColor: c.status === 'Fixed' ? '#dcfce7' : '#fef3c7',
                      color: c.status === 'Fixed' ? '#166534' : '#b45309',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {c.status}
                    </span>
                  </div>
                  <h4 style={{ margin: '8px 0 4px', fontSize: '16px' }}>{c.title}</h4>
                  <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>Reported by: {c.reportedBy}</p>
                  
                  {c.status !== 'Fixed' && (
                    <button
                      onClick={() => handleFixComplaint(c.id)}
                      style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}
                    >
                      ✓ Mark as Fixed
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* --- SIMPLE POPUP MODALS --- */}

      {/* Add Student Popup */}
      {showAddStudent && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '380px' }}>
            <h3 style={{ marginTop: 0 }}>Add New Student</h3>
            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Student Name *"
                required
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="Roll Number *"
                required
                value={newStudent.rollNo}
                onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <input
                type="text"
                placeholder="Course (e.g. B.Tech CS)"
                value={newStudent.course}
                onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <select
                value={newStudent.room}
                onChange={(e) => setNewStudent({ ...newStudent, room: e.target.value })}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.number}>Assign Room {r.number}</option>
                ))}
              </select>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddStudent(false)} style={{ padding: '8px 14px', border: 'none', background: '#e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 14px', border: 'none', background: '#4f46e5', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Popup */}
      {showAddRoom && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '340px' }}>
            <h3 style={{ marginTop: 0 }}>Add Room</h3>
            <form onSubmit={handleAddRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Room Number (e.g. 104) *"
                required
                value={newRoom.number}
                onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <select
                value={newRoom.beds}
                onChange={(e) => setNewRoom({ ...newRoom, beds: Number(e.target.value), type: e.target.value === '1' ? 'Single' : 'Double' })}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              >
                <option value="1">1 Bed (Single)</option>
                <option value="2">2 Beds (Double)</option>
                <option value="3">3 Beds (Triple)</option>
              </select>
              <input
                type="number"
                placeholder="Monthly Rent ($)"
                value={newRoom.rent}
                onChange={(e) => setNewRoom({ ...newRoom, rent: Number(e.target.value) })}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddRoom(false)} style={{ padding: '8px 14px', border: 'none', background: '#e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 14px', border: 'none', background: '#4f46e5', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Complaint Popup */}
      {showAddComplaint && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '360px' }}>
            <h3 style={{ marginTop: 0 }}>Report an Issue</h3>
            <form onSubmit={handleAddComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select
                value={newComplaint.room}
                onChange={(e) => setNewComplaint({ ...newComplaint, room: e.target.value })}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.number}>Room {r.number}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={newComplaint.reportedBy}
                onChange={(e) => setNewComplaint({ ...newComplaint, reportedBy: e.target.value })}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <textarea
                rows="3"
                placeholder="Describe problem (e.g. Light not working) *"
                required
                value={newComplaint.title}
                onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddComplaint(false)} style={{ padding: '8px 14px', border: 'none', background: '#e2e8f0', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 14px', border: 'none', background: '#4f46e5', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
