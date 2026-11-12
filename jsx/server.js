import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API Endpoints
app.get('/api/overview', (_req, res) => {
  try {
    const stats = db.getOverview();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// Rooms
app.get('/api/rooms', (_req, res) => {
  try {
    res.json(db.getRooms());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', (req, res) => {
  try {
    const { roomNumber, block, floor, roomType, capacity, monthlyRent, amenities, status } = req.body;
    if (!roomNumber || !block || !capacity || !monthlyRent) {
      return res.status(400).json({ error: 'Room number, block, capacity and monthly rent are required.' });
    }
    const newRoom = db.createRoom({
      roomNumber,
      block,
      floor: Number(floor) || 1,
      roomType: roomType || 'Double',
      capacity: Number(capacity),
      monthlyRent: Number(monthlyRent),
      amenities: amenities || ['Attached Bath', 'Study Desk'],
      status: status || 'Available',
    });
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rooms/:id', (req, res) => {
  try {
    const updated = db.updateRoom(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Room not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rooms/:id', (req, res) => {
  try {
    const success = db.deleteRoom(req.params.id);
    if (!success) return res.status(404).json({ error: 'Room not found' });
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Residents
app.get('/api/residents', (_req, res) => {
  try {
    res.json(db.getResidents());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/residents', (req, res) => {
  try {
    const { fullName, rollNo, gender, email, phone, course, emergencyContact, roomId, bedNumber, checkInDate, expectedCheckOutDate, status, kycStatus } = req.body;
    if (!fullName || !rollNo || !email || !phone) {
      return res.status(400).json({ error: 'Full name, roll number, email and phone are required.' });
    }
    const newResident = db.createResident({
      fullName,
      rollNo,
      gender: gender || 'Male',
      email,
      phone,
      course: course || 'General Undergraduate',
      emergencyContact: emergencyContact || { name: 'Parent/Guardian', relation: 'Guardian', phone },
      roomId: roomId || null,
      roomNumber: null,
      bedNumber: bedNumber ? Number(bedNumber) : null,
      checkInDate: checkInDate || new Date().toISOString().split('T')[0],
      expectedCheckOutDate: expectedCheckOutDate || '2027-05-30',
      status: status || 'Active',
      kycStatus: kycStatus || 'Verified',
    });
    res.status(201).json(newResident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/residents/:id', (req, res) => {
  try {
    const updated = db.updateResident(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Resident not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/residents/:id/vacate', (req, res) => {
  try {
    const vacated = db.vacateResident(req.params.id);
    if (!vacated) return res.status(404).json({ error: 'Resident not found' });
    res.json(vacated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/residents/:id', (req, res) => {
  try {
    const success = db.deleteResident(req.params.id);
    if (!success) return res.status(404).json({ error: 'Resident not found' });
    res.json({ success: true, message: 'Resident removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fees
app.get('/api/fees', (_req, res) => {
  try {
    res.json(db.getFees());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/fees', (req, res) => {
  try {
    const { residentId, residentName, roomNumber, amount, type, billingMonth, dueDate, notes, status } = req.body;
    if (!residentId || !amount || !dueDate) {
      return res.status(400).json({ error: 'Resident, amount, and due date are required.' });
    }
    const newFee = db.createFee({
      residentId,
      residentName: residentName || 'Resident',
      roomNumber: roomNumber || 'N/A',
      amount: Number(amount),
      type: type || 'Room Rent',
      billingMonth: billingMonth || 'November 2026',
      dueDate,
      paidDate: status === 'Paid' ? new Date().toISOString().split('T')[0] : null,
      paymentMethod: status === 'Paid' ? 'UPI' : null,
      status: status || 'Pending',
      notes: notes || '',
    });
    res.status(201).json(newFee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/fees/:id/pay', (req, res) => {
  try {
    const { paymentMethod, notes } = req.body;
    const paid = db.recordPayment(req.params.id, paymentMethod, notes);
    if (!paid) return res.status(404).json({ error: 'Fee invoice not found' });
    res.json(paid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Maintenance
app.get('/api/maintenance', (_req, res) => {
  try {
    res.json(db.getMaintenance());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/maintenance', (req, res) => {
  try {
    const { roomId, roomNumber, residentName, category, priority, title, description, assignedStaff, cost } = req.body;
    if (!roomId || !title || !category) {
      return res.status(400).json({ error: 'Room, title and category are required.' });
    }
    const newTicket = db.createTicket({
      roomId,
      roomNumber: roomNumber || 'Unknown Room',
      residentName: residentName || 'Resident Request',
      category: category || 'Electrical',
      priority: priority || 'Medium',
      title,
      description: description || '',
      assignedStaff: assignedStaff || null,
      cost: Number(cost) || 0,
    });
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/maintenance/:id', (req, res) => {
  try {
    const updated = db.updateTicket(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Ticket not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Visitors
app.get('/api/visitors', (_req, res) => {
  try {
    res.json(db.getVisitors());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/visitors', (req, res) => {
  try {
    const { visitorName, residentId, residentName, roomNumber, relationship, phone, idProofType } = req.body;
    if (!visitorName || !residentId || !phone) {
      return res.status(400).json({ error: 'Visitor name, resident, and phone number are required.' });
    }
    const newVisitor = db.logVisitor({
      visitorName,
      residentId,
      residentName: residentName || 'Hostel Resident',
      roomNumber: roomNumber || 'N/A',
      relationship: relationship || 'Parent/Guardian',
      phone,
      idProofType: idProofType || 'National ID',
    });
    res.status(201).json(newVisitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/visitors/:id/checkout', (req, res) => {
  try {
    const updated = db.checkoutVisitor(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Visitor log not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mess
app.get('/api/mess', (_req, res) => {
  try {
    res.json(db.getMess());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/mess/:day', (req, res) => {
  try {
    const updated = db.updateMessDay(req.params.day, req.body);
    if (!updated) return res.status(404).json({ error: 'Mess day not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notices
app.get('/api/notices', (_req, res) => {
  try {
    res.json(db.getNotices());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notices', (req, res) => {
  try {
    const { title, content, category, priority, targetAudience } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }
    const newNotice = db.createNotice({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Normal',
      targetAudience: targetAudience || 'All Residents',
    });
    res.status(201).json(newNotice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notices/:id', (req, res) => {
  try {
    const success = db.deleteNotice(req.params.id);
    if (!success) return res.status(404).json({ error: 'Notice not found' });
    res.json({ success: true, message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset database
app.post('/api/reset', (_req, res) => {
  try {
    const reset = db.resetDatabase();
    res.json({ success: true, message: 'Database reset to initial sample records', data: reset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export CSV
app.get('/api/export/:type', (req, res) => {
  try {
    const { type } = req.params;
    let csv = '';
    const filename = `hostel_${type}_${new Date().toISOString().split('T')[0]}.csv`;

    if (type === 'residents') {
      const residents = db.getResidents();
      csv = 'ID,Full Name,Roll No,Gender,Email,Phone,Course,Room,Bed,CheckIn,Status,Dues\n';
      csv += residents
        .map(
          (r) =>
            `"${r.id}","${r.fullName}","${r.rollNo}","${r.gender}","${r.email}","${r.phone}","${r.course}","${r.roomNumber || ''}","${r.bedNumber || ''}","${r.checkInDate}","${r.status}","${r.duesAmount}"`
        )
        .join('\n');
    } else if (type === 'fees') {
      const fees = db.getFees();
      csv = 'Invoice,Resident,Room,Amount,Type,Month,DueDate,PaidDate,Method,Status\n';
      csv += fees
        .map(
          (f) =>
            `"${f.invoiceNumber}","${f.residentName}","${f.roomNumber}","${f.amount}","${f.type}","${f.billingMonth}","${f.dueDate}","${f.paidDate || ''}","${f.paymentMethod || ''}","${f.status}"`
        )
        .join('\n');
    } else if (type === 'rooms') {
      const rooms = db.getRooms();
      csv = 'Room,Block,Floor,Type,Capacity,Occupied,Rent,Status\n';
      csv += rooms
        .map((r) => `"${r.roomNumber}","${r.block}","${r.floor}","${r.roomType}","${r.capacity}","${r.occupiedBeds}","${r.monthlyRent}","${r.status}"`)
        .join('\n');
    } else {
      return res.status(400).json({ error: 'Invalid export type. Supported: residents, fees, rooms' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mount Vite in dev, static dist in prod
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HostelFlow Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
