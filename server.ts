import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
const allowedOrigins = (
  process.env.FRONTEND_URL || ''
).split(',').map(origin => origin.trim());

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// API Routes
app.get('/api/overview', (_req: Request, res: Response) => {
  try {
    const stats = db.getOverview();
    res.json(stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Rooms
app.get('/api/rooms', (_req: Request, res: Response) => {
  try {
    res.json(db.getRooms());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/rooms', (req: Request, res: Response) => {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.put('/api/rooms/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateRoom(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Room not found' });
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/rooms/:id', (req: Request, res: Response) => {
  try {
    const success = db.deleteRoom(req.params.id);
    if (!success) return res.status(404).json({ error: 'Room not found' });
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Residents
app.get('/api/residents', (_req: Request, res: Response) => {
  try {
    res.json(db.getResidents());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/residents', (req: Request, res: Response) => {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.put('/api/residents/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateResident(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Resident not found' });
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/residents/:id/vacate', (req: Request, res: Response) => {
  try {
    const vacated = db.vacateResident(req.params.id);
    if (!vacated) return res.status(404).json({ error: 'Resident not found' });
    res.json(vacated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/residents/:id', (req: Request, res: Response) => {
  try {
    const success = db.deleteResident(req.params.id);
    if (!success) return res.status(404).json({ error: 'Resident not found' });
    res.json({ success: true, message: 'Resident removed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Fees
app.get('/api/fees', (_req: Request, res: Response) => {
  try {
    res.json(db.getFees());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/fees', (req: Request, res: Response) => {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/fees/:id/pay', (req: Request, res: Response) => {
  try {
    const { paymentMethod, notes } = req.body;
    const paid = db.recordPayment(req.params.id, paymentMethod, notes);
    if (!paid) return res.status(404).json({ error: 'Fee invoice not found' });
    res.json(paid);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Maintenance
app.get('/api/maintenance', (_req: Request, res: Response) => {
  try {
    res.json(db.getMaintenance());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/maintenance', (req: Request, res: Response) => {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.put('/api/maintenance/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateTicket(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Ticket not found' });
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Visitors
app.get('/api/visitors', (_req: Request, res: Response) => {
  try {
    res.json(db.getVisitors());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/visitors', (req: Request, res: Response) => {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/visitors/:id/checkout', (req: Request, res: Response) => {
  try {
    const updated = db.checkoutVisitor(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Visitor log not found' });
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Mess
app.get('/api/mess', (_req: Request, res: Response) => {
  try {
    res.json(db.getMess());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.put('/api/mess/:day', (req: Request, res: Response) => {
  try {
    const updated = db.updateMessDay(req.params.day, req.body);
    if (!updated) return res.status(404).json({ error: 'Mess day not found' });
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Notices
app.get('/api/notices', (_req: Request, res: Response) => {
  try {
    res.json(db.getNotices());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.post('/api/notices', (req: Request, res: Response) => {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.delete('/api/notices/:id', (req: Request, res: Response) => {
  try {
    const success = db.deleteNotice(req.params.id);
    if (!success) return res.status(404).json({ error: 'Notice not found' });
    res.json({ success: true, message: 'Notice deleted' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Reset database
app.post('/api/reset', (_req: Request, res: Response) => {
  try {
    const reset = db.resetDatabase();
    res.json({ success: true, message: 'Database reset to initial sample records', data: reset });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Export CSV
app.get('/api/export/:type', (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    let csv = '';
    let filename = `hostel_${type}_${new Date().toISOString().split('T')[0]}.csv`;

    if (type === 'residents') {
      const residents = db.getResidents();
      csv = 'ID,Full Name,Roll No,Gender,Email,Phone,Course,Room,Bed,CheckIn,Status,Dues\n';
      csv += residents
        .map(
          r =>
            `"${r.id}","${r.fullName}","${r.rollNo}","${r.gender}","${r.email}","${r.phone}","${r.course}","${r.roomNumber || ''}","${r.bedNumber || ''}","${r.checkInDate}","${r.status}","${r.duesAmount}"`
        )
        .join('\n');
    } else if (type === 'fees') {
      const fees = db.getFees();
      csv = 'Invoice,Resident,Room,Amount,Type,Month,DueDate,PaidDate,Method,Status\n';
      csv += fees
        .map(
          f =>
            `"${f.invoiceNumber}","${f.residentName}","${f.roomNumber}","${f.amount}","${f.type}","${f.billingMonth}","${f.dueDate}","${f.paidDate || ''}","${f.paymentMethod || ''}","${f.status}"`
        )
        .join('\n');
    } else if (type === 'rooms') {
      const rooms = db.getRooms();
      csv = 'Room,Block,Floor,Type,Capacity,Occupied,Rent,Status\n';
      csv += rooms
        .map(r => `"${r.roomNumber}","${r.block}","${r.floor}","${r.roomType}","${r.capacity}","${r.occupiedBeds}","${r.monthlyRent}","${r.status}"`)
        .join('\n');
    } else {
      return res.status(400).json({ error: 'Invalid export type. Supported: residents, fees, rooms' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Mount Vite or static dist in full-stack setup
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
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HostelFlow Server] running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
