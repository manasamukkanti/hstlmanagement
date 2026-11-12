export interface BedSlot {
  bedNumber: number;
  residentId: string | null;
  residentName: string | null;
}

export type RoomBlock = 'Block A (North)' | 'Block B (East)' | 'Block C (West)' | 'Block D (South)';
export type RoomType = 'Single' | 'Double' | 'Triple' | 'Quad';
export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance';

export interface Room {
  id: string;
  roomNumber: string;
  block: RoomBlock;
  floor: number;
  roomType: RoomType;
  capacity: number;
  occupiedBeds: number;
  monthlyRent: number;
  amenities: string[];
  status: RoomStatus;
  bedSlots: BedSlot[];
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface Resident {
  id: string;
  fullName: string;
  rollNo: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  course: string;
  emergencyContact: EmergencyContact;
  roomId: string | null;
  roomNumber: string | null;
  bedNumber: number | null;
  checkInDate: string;
  expectedCheckOutDate: string;
  status: 'Active' | 'Checked-out' | 'Notice Period';
  duesAmount: number;
  kycStatus: 'Verified' | 'Pending';
}

export interface FeeRecord {
  id: string;
  residentId: string;
  residentName: string;
  roomNumber: string;
  invoiceNumber: string;
  amount: number;
  type: 'Room Rent' | 'Mess Charges' | 'Security Deposit' | 'Utility/Maintenance';
  billingMonth: string;
  dueDate: string;
  paidDate: string | null;
  paymentMethod: 'UPI' | 'Bank Transfer' | 'Credit Card' | 'Cash' | null;
  status: 'Paid' | 'Pending' | 'Overdue';
  notes: string;
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  roomId: string;
  roomNumber: string;
  residentName: string;
  category: 'Electrical' | 'Plumbing' | 'Carpentry / Furniture' | 'WiFi / Internet' | 'Housekeeping' | 'HVAC / AC';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  createdAt: string;
  status: 'Reported' | 'In Progress' | 'Resolved';
  assignedStaff: string | null;
  resolvedAt: string | null;
  cost: number;
}

export interface VisitorLog {
  id: string;
  visitorName: string;
  residentId: string;
  residentName: string;
  roomNumber: string;
  relationship: string;
  phone: string;
  checkIn: string;
  checkOut: string | null;
  idProofType: 'Driving License' | 'Passport' | 'National ID';
  status: 'Inside' | 'Departed';
}

export interface MessDay {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  specialDiet: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Maintenance' | 'Mess' | 'Rules & Curfew' | 'Event';
  priority: 'Normal' | 'High' | 'Urgent';
  postedDate: string;
  targetAudience: string;
}

export interface DashboardOverview {
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  activeResidents: number;
  totalDues: number;
  monthlyCollected: number;
  openMaintenance: number;
  activeVisitors: number;
}
