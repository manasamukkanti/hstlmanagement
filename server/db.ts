import fs from 'fs';
import path from 'path';

export interface BedSlot {
  bedNumber: number;
  residentId: string | null;
  residentName: string | null;
}

export interface Room {
  id: string;
  roomNumber: string;
  block: 'Block A (North)' | 'Block B (East)' | 'Block C (West)' | 'Block D (South)';
  floor: number;
  roomType: 'Single' | 'Double' | 'Triple' | 'Quad';
  capacity: number;
  occupiedBeds: number;
  monthlyRent: number;
  amenities: string[];
  status: 'Available' | 'Occupied' | 'Maintenance';
  bedSlots: BedSlot[];
}

export interface Resident {
  id: string;
  fullName: string;
  rollNo: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  phone: string;
  course: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
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

export interface HostelDatabase {
  rooms: Room[];
  residents: Resident[];
  fees: FeeRecord[];
  maintenance: MaintenanceTicket[];
  visitors: VisitorLog[];
  mess: MessDay[];
  notices: Notice[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'hostel_database.json');

// Initial seed data generator
function generateInitialData(): HostelDatabase {
  const rooms: Room[] = [
    // Block A - 1st Floor
    {
      id: 'rm-101',
      roomNumber: 'A-101',
      block: 'Block A (North)',
      floor: 1,
      roomType: 'Double',
      capacity: 2,
      occupiedBeds: 2,
      monthlyRent: 420,
      amenities: ['AC', 'Attached Bath', 'Study Desk', 'High-Speed Wi-Fi'],
      status: 'Occupied',
      bedSlots: [
        { bedNumber: 1, residentId: 'res-01', residentName: 'Aarav Sharma' },
        { bedNumber: 2, residentId: 'res-02', residentName: 'Liam Chen' },
      ],
    },
    {
      id: 'rm-102',
      roomNumber: 'A-102',
      block: 'Block A (North)',
      floor: 1,
      roomType: 'Single',
      capacity: 1,
      occupiedBeds: 1,
      monthlyRent: 650,
      amenities: ['AC', 'Attached Bath', 'Balcony', 'Study Desk', 'Mini Fridge'],
      status: 'Occupied',
      bedSlots: [{ bedNumber: 1, residentId: 'res-03', residentName: 'Devansh Patel' }],
    },
    {
      id: 'rm-103',
      roomNumber: 'A-103',
      block: 'Block A (North)',
      floor: 1,
      roomType: 'Double',
      capacity: 2,
      occupiedBeds: 1,
      monthlyRent: 420,
      amenities: ['AC', 'Attached Bath', 'Study Desk'],
      status: 'Available',
      bedSlots: [
        { bedNumber: 1, residentId: 'res-04', residentName: 'Marcus Vance' },
        { bedNumber: 2, residentId: null, residentName: null },
      ],
    },
    {
      id: 'rm-104',
      roomNumber: 'A-104',
      block: 'Block A (North)',
      floor: 1,
      roomType: 'Triple',
      capacity: 3,
      occupiedBeds: 3,
      monthlyRent: 350,
      amenities: ['Attached Bath', 'Individual Lockers', 'Ceiling Fan'],
      status: 'Occupied',
      bedSlots: [
        { bedNumber: 1, residentId: 'res-05', residentName: 'Rohan Gupta' },
        { bedNumber: 2, residentId: 'res-06', residentName: 'Ethan Brooks' },
        { bedNumber: 3, residentId: 'res-07', residentName: 'Kavya Reddy' },
      ],
    },
    // Block A - 2nd Floor
    {
      id: 'rm-201',
      roomNumber: 'A-201',
      block: 'Block A (North)',
      floor: 2,
      roomType: 'Single',
      capacity: 1,
      occupiedBeds: 0,
      monthlyRent: 650,
      amenities: ['AC', 'Attached Bath', 'Balcony', 'Study Desk'],
      status: 'Available',
      bedSlots: [{ bedNumber: 1, residentId: null, residentName: null }],
    },
    {
      id: 'rm-202',
      roomNumber: 'A-202',
      block: 'Block A (North)',
      floor: 2,
      roomType: 'Double',
      capacity: 2,
      occupiedBeds: 2,
      monthlyRent: 420,
      amenities: ['AC', 'Attached Bath', 'Study Desk'],
      status: 'Occupied',
      bedSlots: [
        { bedNumber: 1, residentId: 'res-08', residentName: 'Siddharth Roy' },
        { bedNumber: 2, residentId: 'res-09', residentName: 'Noah Tanaka' },
      ],
    },
    {
      id: 'rm-203',
      roomNumber: 'A-203',
      block: 'Block A (North)',
      floor: 2,
      roomType: 'Quad',
      capacity: 4,
      occupiedBeds: 2,
      monthlyRent: 300,
      amenities: ['Spacious Layout', 'Lockers', 'Ceiling Fan'],
      status: 'Available',
      bedSlots: [
        { bedNumber: 1, residentId: 'res-10', residentName: 'Zane Gallagher' },
        { bedNumber: 2, residentId: 'res-11', residentName: 'Aditya Sen' },
        { bedNumber: 3, residentId: null, residentName: null },
        { bedNumber: 4, residentId: null, residentName: null },
      ],
    },
    // Block B
    {
      id: 'rm-105',
      roomNumber: 'B-101',
      block: 'Block B (East)',
      floor: 1,
      roomType: 'Double',
      capacity: 2,
      occupiedBeds: 2,
      monthlyRent: 400,
      amenities: ['Attached Bath', 'Study Desk', 'Garden View'],
      status: 'Occupied',
      bedSlots: [
        { bedNumber: 1, residentId: 'res-12', residentName: 'Priya Iyer' },
        { bedNumber: 2, residentId: 'res-13', residentName: 'Maya Thorne' },
      ],
    },
    {
      id: 'rm-106',
      roomNumber: 'B-102',
      block: 'Block B (East)',
      floor: 1,
      roomType: 'Single',
      capacity: 1,
      occupiedBeds: 1,
      monthlyRent: 600,
      amenities: ['AC', 'Attached Bath', 'Balcony'],
      status: 'Occupied',
      bedSlots: [{ bedNumber: 1, residentId: 'res-14', residentName: 'Ananya Verma' }],
    },
    {
      id: 'rm-107',
      roomNumber: 'B-103',
      block: 'Block B (East)',
      floor: 1,
      roomType: 'Double',
      capacity: 2,
      occupiedBeds: 0,
      monthlyRent: 400,
      amenities: ['Attached Bath', 'Study Desk'],
      status: 'Maintenance',
      bedSlots: [
        { bedNumber: 1, residentId: null, residentName: null },
        { bedNumber: 2, residentId: null, residentName: null },
      ],
    },
    {
      id: 'rm-108',
      roomNumber: 'B-201',
      block: 'Block B (East)',
      floor: 2,
      roomType: 'Triple',
      capacity: 3,
      occupiedBeds: 2,
      monthlyRent: 340,
      amenities: ['Lockers', 'Attached Bath', 'Ceiling Fan'],
      status: 'Available',
      bedSlots: [
        { bedNumber: 1, residentId: 'res-15', residentName: 'Chloe Bennett' },
        { bedNumber: 2, residentId: 'res-16', residentName: 'Nisha Pillai' },
        { bedNumber: 3, residentId: null, residentName: null },
      ],
    },
    // Block C
    {
      id: 'rm-109',
      roomNumber: 'C-101',
      block: 'Block C (West)',
      floor: 1,
      roomType: 'Double',
      capacity: 2,
      occupiedBeds: 1,
      monthlyRent: 420,
      amenities: ['AC', 'Attached Bath', 'Study Desk'],
      status: 'Available',
      bedSlots: [
        { bedNumber: 1, residentId: 'res-17', residentName: 'Kunal Joshi' },
        { bedNumber: 2, residentId: null, residentName: null },
      ],
    },
    {
      id: 'rm-110',
      roomNumber: 'C-102',
      block: 'Block C (West)',
      floor: 1,
      roomType: 'Single',
      capacity: 1,
      occupiedBeds: 0,
      monthlyRent: 650,
      amenities: ['AC', 'Attached Bath', 'Balcony'],
      status: 'Available',
      bedSlots: [{ bedNumber: 1, residentId: null, residentName: null }],
    },
    {
      id: 'rm-111',
      roomNumber: 'C-201',
      block: 'Block C (West)',
      floor: 2,
      roomType: 'Quad',
      capacity: 4,
      occupiedBeds: 3,
      monthlyRent: 310,
      amenities: ['Individual Wardrobes', 'Attached Bath'],
      status: 'Available',
      bedSlots: [
        { bedNumber: 1, residentId: 'res-18', residentName: 'Farhan Ali' },
        { bedNumber: 2, residentId: 'res-19', residentName: 'Lucas Oliveira' },
        { bedNumber: 3, residentId: 'res-20', residentName: 'Vikram Seth' },
        { bedNumber: 4, residentId: null, residentName: null },
      ],
    },
    // Block D
    {
      id: 'rm-112',
      roomNumber: 'D-101',
      block: 'Block D (South)',
      floor: 1,
      roomType: 'Double',
      capacity: 2,
      occupiedBeds: 0,
      monthlyRent: 380,
      amenities: ['Attached Bath', 'Study Desk', 'Quiet Zone'],
      status: 'Available',
      bedSlots: [
        { bedNumber: 1, residentId: null, residentName: null },
        { bedNumber: 2, residentId: null, residentName: null },
      ],
    },
    {
      id: 'rm-113',
      roomNumber: 'D-201',
      block: 'Block D (South)',
      floor: 2,
      roomType: 'Double',
      capacity: 2,
      occupiedBeds: 2,
      monthlyRent: 380,
      amenities: ['Attached Bath', 'Ceiling Fan'],
      status: 'Occupied',
      bedSlots: [
        { bedNumber: 1, residentId: 'res-21', residentName: 'Tanya Mehra' },
        { bedNumber: 2, residentId: 'res-22', residentName: 'Sofia Rossi' },
      ],
    },
  ];

  const residents: Resident[] = [
    {
      id: 'res-01',
      fullName: 'Aarav Sharma',
      rollNo: 'HST-2024-001',
      gender: 'Male',
      email: 'aarav.sharma@campus.edu',
      phone: '+1 (555) 234-8901',
      course: 'B.Tech Computer Science',
      emergencyContact: { name: 'Rajesh Sharma', relation: 'Father', phone: '+1 (555) 901-2345' },
      roomId: 'rm-101',
      roomNumber: 'A-101',
      bedNumber: 1,
      checkInDate: '2024-08-15',
      expectedCheckOutDate: '2027-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-02',
      fullName: 'Liam Chen',
      rollNo: 'HST-2024-002',
      gender: 'Male',
      email: 'liam.chen@campus.edu',
      phone: '+1 (555) 345-6789',
      course: 'BS Mechanical Engineering',
      emergencyContact: { name: 'Mei Chen', relation: 'Mother', phone: '+1 (555) 890-1234' },
      roomId: 'rm-101',
      roomNumber: 'A-101',
      bedNumber: 2,
      checkInDate: '2024-08-15',
      expectedCheckOutDate: '2027-05-30',
      status: 'Active',
      duesAmount: 420,
      kycStatus: 'Verified',
    },
    {
      id: 'res-03',
      fullName: 'Devansh Patel',
      rollNo: 'HST-2023-018',
      gender: 'Male',
      email: 'devansh.patel@campus.edu',
      phone: '+1 (555) 456-7890',
      course: 'M.Sc Data Analytics',
      emergencyContact: { name: 'Sanjay Patel', relation: 'Father', phone: '+1 (555) 789-0123' },
      roomId: 'rm-102',
      roomNumber: 'A-102',
      bedNumber: 1,
      checkInDate: '2023-09-01',
      expectedCheckOutDate: '2026-12-15',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-04',
      fullName: 'Marcus Vance',
      rollNo: 'HST-2024-029',
      gender: 'Male',
      email: 'm.vance@campus.edu',
      phone: '+1 (555) 567-8901',
      course: 'BA Economics & Finance',
      emergencyContact: { name: 'Arthur Vance', relation: 'Guardian', phone: '+1 (555) 678-9012' },
      roomId: 'rm-103',
      roomNumber: 'A-103',
      bedNumber: 1,
      checkInDate: '2024-08-20',
      expectedCheckOutDate: '2027-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-05',
      fullName: 'Rohan Gupta',
      rollNo: 'HST-2025-004',
      gender: 'Male',
      email: 'rohan.g@campus.edu',
      phone: '+1 (555) 678-9012',
      course: 'B.Sc Electronics',
      emergencyContact: { name: 'Alok Gupta', relation: 'Father', phone: '+1 (555) 567-8901' },
      roomId: 'rm-104',
      roomNumber: 'A-104',
      bedNumber: 1,
      checkInDate: '2025-01-10',
      expectedCheckOutDate: '2028-05-30',
      status: 'Active',
      duesAmount: 350,
      kycStatus: 'Verified',
    },
    {
      id: 'res-06',
      fullName: 'Ethan Brooks',
      rollNo: 'HST-2025-005',
      gender: 'Male',
      email: 'ethan.brooks@campus.edu',
      phone: '+1 (555) 789-0123',
      course: 'B.Tech Robotics',
      emergencyContact: { name: 'Sarah Brooks', relation: 'Mother', phone: '+1 (555) 456-7890' },
      roomId: 'rm-104',
      roomNumber: 'A-104',
      bedNumber: 2,
      checkInDate: '2025-01-10',
      expectedCheckOutDate: '2028-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-07',
      fullName: 'Kavya Reddy',
      rollNo: 'HST-2025-006',
      gender: 'Female',
      email: 'kavya.reddy@campus.edu',
      phone: '+1 (555) 890-1234',
      course: 'B.Arch Architecture',
      emergencyContact: { name: 'Venkat Reddy', relation: 'Father', phone: '+1 (555) 345-6789' },
      roomId: 'rm-104',
      roomNumber: 'A-104',
      bedNumber: 3,
      checkInDate: '2025-01-12',
      expectedCheckOutDate: '2028-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-08',
      fullName: 'Siddharth Roy',
      rollNo: 'HST-2024-055',
      gender: 'Male',
      email: 'sid.roy@campus.edu',
      phone: '+1 (555) 901-2345',
      course: 'BBA Global Business',
      emergencyContact: { name: 'Debashis Roy', relation: 'Father', phone: '+1 (555) 234-5678' },
      roomId: 'rm-202',
      roomNumber: 'A-202',
      bedNumber: 1,
      checkInDate: '2024-08-16',
      expectedCheckOutDate: '2027-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-09',
      fullName: 'Noah Tanaka',
      rollNo: 'HST-2024-056',
      gender: 'Male',
      email: 'noah.t@campus.edu',
      phone: '+1 (555) 123-4567',
      course: 'BS Cognitive Science',
      emergencyContact: { name: 'Kenji Tanaka', relation: 'Father', phone: '+1 (555) 987-6543' },
      roomId: 'rm-202',
      roomNumber: 'A-202',
      bedNumber: 2,
      checkInDate: '2024-08-17',
      expectedCheckOutDate: '2027-05-30',
      status: 'Active',
      duesAmount: 420,
      kycStatus: 'Verified',
    },
    {
      id: 'res-10',
      fullName: 'Zane Gallagher',
      rollNo: 'HST-2025-077',
      gender: 'Male',
      email: 'zane.g@campus.edu',
      phone: '+1 (555) 210-9876',
      course: 'B.Tech Civil Engineering',
      emergencyContact: { name: 'Claire Gallagher', relation: 'Mother', phone: '+1 (555) 876-5432' },
      roomId: 'rm-203',
      roomNumber: 'A-203',
      bedNumber: 1,
      checkInDate: '2025-02-01',
      expectedCheckOutDate: '2028-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Pending',
    },
    {
      id: 'res-11',
      fullName: 'Aditya Sen',
      rollNo: 'HST-2025-078',
      gender: 'Male',
      email: 'aditya.sen@campus.edu',
      phone: '+1 (555) 321-0987',
      course: 'B.Sc Mathematics',
      emergencyContact: { name: 'Pranab Sen', relation: 'Father', phone: '+1 (555) 765-4321' },
      roomId: 'rm-203',
      roomNumber: 'A-203',
      bedNumber: 2,
      checkInDate: '2025-02-01',
      expectedCheckOutDate: '2028-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-12',
      fullName: 'Priya Iyer',
      rollNo: 'HST-2024-112',
      gender: 'Female',
      email: 'priya.iyer@campus.edu',
      phone: '+1 (555) 432-1098',
      course: 'B.Tech Biotechnology',
      emergencyContact: { name: 'Lakshmi Iyer', relation: 'Mother', phone: '+1 (555) 654-3210' },
      roomId: 'rm-105',
      roomNumber: 'B-101',
      bedNumber: 1,
      checkInDate: '2024-08-14',
      expectedCheckOutDate: '2027-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-13',
      fullName: 'Maya Thorne',
      rollNo: 'HST-2024-113',
      gender: 'Female',
      email: 'm.thorne@campus.edu',
      phone: '+1 (555) 543-2109',
      course: 'BA English Literature',
      emergencyContact: { name: 'David Thorne', relation: 'Father', phone: '+1 (555) 543-2100' },
      roomId: 'rm-105',
      roomNumber: 'B-101',
      bedNumber: 2,
      checkInDate: '2024-08-14',
      expectedCheckOutDate: '2027-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-14',
      fullName: 'Ananya Verma',
      rollNo: 'HST-2023-044',
      gender: 'Female',
      email: 'ananya.v@campus.edu',
      phone: '+1 (555) 654-3210',
      course: 'MBA Healthcare Mgmt',
      emergencyContact: { name: 'Ritu Verma', relation: 'Mother', phone: '+1 (555) 432-1099' },
      roomId: 'rm-106',
      roomNumber: 'B-102',
      bedNumber: 1,
      checkInDate: '2023-08-20',
      expectedCheckOutDate: '2026-12-20',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-15',
      fullName: 'Chloe Bennett',
      rollNo: 'HST-2025-130',
      gender: 'Female',
      email: 'c.bennett@campus.edu',
      phone: '+1 (555) 765-4321',
      course: 'B.Des Product Design',
      emergencyContact: { name: 'Laura Bennett', relation: 'Mother', phone: '+1 (555) 321-0988' },
      roomId: 'rm-108',
      roomNumber: 'B-201',
      bedNumber: 1,
      checkInDate: '2025-01-08',
      expectedCheckOutDate: '2028-05-30',
      status: 'Active',
      duesAmount: 340,
      kycStatus: 'Verified',
    },
    {
      id: 'res-16',
      fullName: 'Nisha Pillai',
      rollNo: 'HST-2025-131',
      gender: 'Female',
      email: 'nisha.p@campus.edu',
      phone: '+1 (555) 876-5432',
      course: 'B.Sc Physics',
      emergencyContact: { name: 'Gopal Pillai', relation: 'Father', phone: '+1 (555) 210-9877' },
      roomId: 'rm-108',
      roomNumber: 'B-201',
      bedNumber: 2,
      checkInDate: '2025-01-08',
      expectedCheckOutDate: '2028-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-17',
      fullName: 'Kunal Joshi',
      rollNo: 'HST-2024-201',
      gender: 'Male',
      email: 'kunal.j@campus.edu',
      phone: '+1 (555) 987-6543',
      course: 'B.Tech IT',
      emergencyContact: { name: 'Manoj Joshi', relation: 'Father', phone: '+1 (555) 109-8765' },
      roomId: 'rm-109',
      roomNumber: 'C-101',
      bedNumber: 1,
      checkInDate: '2024-08-18',
      expectedCheckOutDate: '2027-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-18',
      fullName: 'Farhan Ali',
      rollNo: 'HST-2025-215',
      gender: 'Male',
      email: 'farhan.ali@campus.edu',
      phone: '+1 (555) 098-7654',
      course: 'B.Tech Chemical',
      emergencyContact: { name: 'Tariq Ali', relation: 'Father', phone: '+1 (555) 012-3456' },
      roomId: 'rm-111',
      roomNumber: 'C-201',
      bedNumber: 1,
      checkInDate: '2025-01-15',
      expectedCheckOutDate: '2028-05-30',
      status: 'Active',
      duesAmount: 310,
      kycStatus: 'Verified',
    },
    {
      id: 'res-19',
      fullName: 'Lucas Oliveira',
      rollNo: 'HST-2025-216',
      gender: 'Male',
      email: 'lucas.o@campus.edu',
      phone: '+1 (555) 112-2334',
      course: 'B.Sc Marine Biology',
      emergencyContact: { name: 'Beatriz Oliveira', relation: 'Mother', phone: '+1 (555) 223-3445' },
      roomId: 'rm-111',
      roomNumber: 'C-201',
      bedNumber: 2,
      checkInDate: '2025-01-15',
      expectedCheckOutDate: '2028-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-20',
      fullName: 'Vikram Seth',
      rollNo: 'HST-2025-217',
      gender: 'Male',
      email: 'vikram.seth@campus.edu',
      phone: '+1 (555) 334-4556',
      course: 'BA Political Science',
      emergencyContact: { name: 'Harish Seth', relation: 'Father', phone: '+1 (555) 445-5667' },
      roomId: 'rm-111',
      roomNumber: 'C-201',
      bedNumber: 3,
      checkInDate: '2025-01-15',
      expectedCheckOutDate: '2028-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-21',
      fullName: 'Tanya Mehra',
      rollNo: 'HST-2024-301',
      gender: 'Female',
      email: 'tanya.m@campus.edu',
      phone: '+1 (555) 556-6778',
      course: 'B.Sc Psychology',
      emergencyContact: { name: 'Sunita Mehra', relation: 'Mother', phone: '+1 (555) 667-7889' },
      roomId: 'rm-113',
      roomNumber: 'D-201',
      bedNumber: 1,
      checkInDate: '2024-08-19',
      expectedCheckOutDate: '2027-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
    {
      id: 'res-22',
      fullName: 'Sofia Rossi',
      rollNo: 'HST-2024-302',
      gender: 'Female',
      email: 'sofia.rossi@campus.edu',
      phone: '+1 (555) 778-8990',
      course: 'BFA Fine Arts',
      emergencyContact: { name: 'Marco Rossi', relation: 'Father', phone: '+1 (555) 889-9001' },
      roomId: 'rm-113',
      roomNumber: 'D-201',
      bedNumber: 2,
      checkInDate: '2024-08-19',
      expectedCheckOutDate: '2027-05-30',
      status: 'Active',
      duesAmount: 0,
      kycStatus: 'Verified',
    },
  ];

  const fees: FeeRecord[] = [
    {
      id: 'fee-101',
      residentId: 'res-01',
      residentName: 'Aarav Sharma',
      roomNumber: 'A-101',
      invoiceNumber: 'INV-2026-1101',
      amount: 420,
      type: 'Room Rent',
      billingMonth: 'November 2026',
      dueDate: '2026-11-05',
      paidDate: '2026-11-03',
      paymentMethod: 'UPI',
      status: 'Paid',
      notes: 'Cleared on time',
    },
    {
      id: 'fee-102',
      residentId: 'res-01',
      residentName: 'Aarav Sharma',
      roomNumber: 'A-101',
      invoiceNumber: 'INV-2026-1102',
      amount: 180,
      type: 'Mess Charges',
      billingMonth: 'November 2026',
      dueDate: '2026-11-05',
      paidDate: '2026-11-03',
      paymentMethod: 'UPI',
      status: 'Paid',
      notes: 'Monthly mess subscription',
    },
    {
      id: 'fee-103',
      residentId: 'res-02',
      residentName: 'Liam Chen',
      roomNumber: 'A-101',
      invoiceNumber: 'INV-2026-1103',
      amount: 420,
      type: 'Room Rent',
      billingMonth: 'November 2026',
      dueDate: '2026-11-05',
      paidDate: null,
      paymentMethod: null,
      status: 'Overdue',
      notes: 'First reminder sent on Nov 7',
    },
    {
      id: 'fee-104',
      residentId: 'res-03',
      residentName: 'Devansh Patel',
      roomNumber: 'A-102',
      invoiceNumber: 'INV-2026-1104',
      amount: 650,
      type: 'Room Rent',
      billingMonth: 'November 2026',
      dueDate: '2026-11-05',
      paidDate: '2026-11-01',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      notes: 'Single room AC premium',
    },
    {
      id: 'fee-105',
      residentId: 'res-05',
      residentName: 'Rohan Gupta',
      roomNumber: 'A-104',
      invoiceNumber: 'INV-2026-1105',
      amount: 350,
      type: 'Room Rent',
      billingMonth: 'November 2026',
      dueDate: '2026-11-05',
      paidDate: null,
      paymentMethod: null,
      status: 'Pending',
      notes: 'Awaiting student allowance',
    },
    {
      id: 'fee-106',
      residentId: 'res-09',
      residentName: 'Noah Tanaka',
      roomNumber: 'A-202',
      invoiceNumber: 'INV-2026-1106',
      amount: 420,
      type: 'Room Rent',
      billingMonth: 'November 2026',
      dueDate: '2026-11-05',
      paidDate: null,
      paymentMethod: null,
      status: 'Overdue',
      notes: 'Second reminder notice delivered',
    },
    {
      id: 'fee-107',
      residentId: 'res-14',
      residentName: 'Ananya Verma',
      roomNumber: 'B-102',
      invoiceNumber: 'INV-2026-1107',
      amount: 600,
      type: 'Room Rent',
      billingMonth: 'November 2026',
      dueDate: '2026-11-05',
      paidDate: '2026-11-04',
      paymentMethod: 'Credit Card',
      status: 'Paid',
      notes: 'Card authorization success',
    },
    {
      id: 'fee-108',
      residentId: 'res-15',
      residentName: 'Chloe Bennett',
      roomNumber: 'B-201',
      invoiceNumber: 'INV-2026-1108',
      amount: 340,
      type: 'Room Rent',
      billingMonth: 'November 2026',
      dueDate: '2026-11-05',
      paidDate: null,
      paymentMethod: null,
      status: 'Pending',
      notes: 'Promised by Friday',
    },
    {
      id: 'fee-109',
      residentId: 'res-18',
      residentName: 'Farhan Ali',
      roomNumber: 'C-201',
      invoiceNumber: 'INV-2026-1109',
      amount: 310,
      type: 'Room Rent',
      billingMonth: 'November 2026',
      dueDate: '2026-11-05',
      paidDate: null,
      paymentMethod: null,
      status: 'Overdue',
      notes: 'Parent contacted via phone',
    },
    {
      id: 'fee-110',
      residentId: 'res-21',
      residentName: 'Tanya Mehra',
      roomNumber: 'D-201',
      invoiceNumber: 'INV-2026-1110',
      amount: 380,
      type: 'Room Rent',
      billingMonth: 'November 2026',
      dueDate: '2026-11-05',
      paidDate: '2026-11-02',
      paymentMethod: 'UPI',
      status: 'Paid',
      notes: 'UPI auto-debit verified',
    },
  ];

  const maintenance: MaintenanceTicket[] = [
    {
      id: 'mnt-01',
      ticketNumber: 'MNT-1041',
      roomId: 'rm-101',
      roomNumber: 'A-101',
      residentName: 'Aarav Sharma',
      category: 'Plumbing',
      priority: 'Medium',
      title: 'Slow water drainage in attached shower',
      description: 'The shower drain water is accumulating slowly. Needs pipe inspection.',
      createdAt: '2026-11-09 10:30',
      status: 'In Progress',
      assignedStaff: 'Ramesh Carpenter / Plumber',
      resolvedAt: null,
      cost: 45,
    },
    {
      id: 'mnt-02',
      ticketNumber: 'MNT-1042',
      roomId: 'rm-107',
      roomNumber: 'B-103',
      residentName: 'Warden Inspection',
      category: 'HVAC / AC',
      priority: 'High',
      title: 'Split AC compressor not cooling',
      description: 'Compressor trips after 5 minutes of running. Room currently marked under maintenance.',
      createdAt: '2026-11-08 14:15',
      status: 'In Progress',
      assignedStaff: 'Carrier HVAC Support',
      resolvedAt: null,
      cost: 150,
    },
    {
      id: 'mnt-03',
      ticketNumber: 'MNT-1043',
      roomId: 'rm-104',
      roomNumber: 'A-104',
      residentName: 'Rohan Gupta',
      category: 'Electrical',
      priority: 'High',
      title: 'Flickering ceiling tube light near Bed 2',
      description: 'The ballast or LED driver is buzzing loudly and causing eye strain while studying.',
      createdAt: '2026-11-10 18:20',
      status: 'Reported',
      assignedStaff: null,
      resolvedAt: null,
      cost: 0,
    },
    {
      id: 'mnt-04',
      ticketNumber: 'MNT-1044',
      roomId: 'rm-111',
      roomNumber: 'C-201',
      residentName: 'Lucas Oliveira',
      category: 'WiFi / Internet',
      priority: 'Medium',
      title: 'Weak Wi-Fi signal in corner room',
      description: 'Speed drops below 5 Mbps during peak evening hours (8 PM - 11 PM).',
      createdAt: '2026-11-10 21:00',
      status: 'Reported',
      assignedStaff: 'IT Helpdesk',
      resolvedAt: null,
      cost: 0,
    },
    {
      id: 'mnt-05',
      ticketNumber: 'MNT-1038',
      roomId: 'rm-105',
      roomNumber: 'B-101',
      residentName: 'Priya Iyer',
      category: 'Carpentry / Furniture',
      priority: 'Low',
      title: 'Study desk drawer hinge loose',
      description: 'The right side hinge needs tightening screws replaced.',
      createdAt: '2026-11-05 09:00',
      status: 'Resolved',
      assignedStaff: 'Sunil M.',
      resolvedAt: '2026-11-06 11:30',
      cost: 20,
    },
  ];

  const visitors: VisitorLog[] = [
    {
      id: 'vis-01',
      visitorName: 'Rajesh Sharma',
      residentId: 'res-01',
      residentName: 'Aarav Sharma',
      roomNumber: 'A-101',
      relationship: 'Father',
      phone: '+1 (555) 901-2345',
      checkIn: '2026-11-11 14:30',
      checkOut: null,
      idProofType: 'National ID',
      status: 'Inside',
    },
    {
      id: 'vis-02',
      visitorName: 'Sarah Brooks',
      residentId: 'res-06',
      residentName: 'Ethan Brooks',
      roomNumber: 'A-104',
      relationship: 'Mother',
      phone: '+1 (555) 456-7890',
      checkIn: '2026-11-11 11:00',
      checkOut: '2026-11-11 13:45',
      idProofType: 'Driving License',
      status: 'Departed',
    },
    {
      id: 'vis-03',
      visitorName: 'Alok Gupta',
      residentId: 'res-05',
      residentName: 'Rohan Gupta',
      roomNumber: 'A-104',
      relationship: 'Father',
      phone: '+1 (555) 567-8901',
      checkIn: '2026-11-11 16:15',
      checkOut: null,
      idProofType: 'Passport',
      status: 'Inside',
    },
    {
      id: 'vis-04',
      visitorName: 'David Thorne',
      residentId: 'res-13',
      residentName: 'Maya Thorne',
      roomNumber: 'B-101',
      relationship: 'Father',
      phone: '+1 (555) 543-2100',
      checkIn: '2026-11-10 15:00',
      checkOut: '2026-11-10 18:00',
      idProofType: 'Driving License',
      status: 'Departed',
    },
  ];

  const mess: MessDay[] = [
    {
      day: 'Monday',
      breakfast: 'Masala Dosa, Sambar, Coconut Chutney, Boiled Eggs / Banana, Tea / Coffee',
      lunch: 'Steamed Basmati Rice, Dal Tadka, Paneer Butter Masala, Mixed Salad, Papad',
      snacks: 'Vegetable Samosa with Mint Dip & Hot Masala Chai',
      dinner: 'Phulka Rotis, Rajma Masala, Jeera Rice, Gulab Jamun',
      specialDiet: 'Gluten-free Millet Roti & Tofu option available on request',
    },
    {
      day: 'Tuesday',
      breakfast: 'Poha with Roasted Peanuts, Sprouted Moong, Boiled Eggs, Fresh Fruit juice',
      lunch: 'Vegetable Biryani, Boondi Raita, Mirchi Ka Salan, Sweet Corn Salad',
      snacks: 'Crispy Bread Pakora & Filter Coffee',
      dinner: 'Tawa Parathas, Aloo Gobi Matar, Chana Dal, Fresh Curd, Fruit Custard',
      specialDiet: 'Low-sodium steamed veggies for diet-registered residents',
    },
    {
      day: 'Wednesday',
      breakfast: 'Idli, Medu Vada, Tomato-Onion Relish, Filter Coffee, Boiled Eggs',
      lunch: 'Chicken Curry (or Malai Kofta for Veg), Yellow Dal Fry, Rice, Butter Naan',
      snacks: 'Pav Bhaji with Lemon Onion Slices & Masala Tea',
      dinner: 'Chapati, Kadai Mushroom, Steamed Rice, Sambar, Rasgulla',
      specialDiet: 'High-protein boiled chickpeas & grilled paneer bowl',
    },
    {
      day: 'Thursday',
      breakfast: 'Aloo Paratha with White Butter, Curd, Pickle, Tea / Coffee',
      lunch: 'Gujarati Kadhi, Khichdi, Batata Nu Shaak, Papad, Kachumber Salad',
      snacks: 'Vegetable Cutlet with Coriander Chutney & Tea',
      dinner: 'Roti, Dal Makhani, Paneer Tikka Masala, Pulao, Moong Dal Halwa',
      specialDiet: 'Jain preparation (no onion/garlic) served at Counter 2',
    },
    {
      day: 'Friday',
      breakfast: 'Puri Bhaji with Halwa, Fresh Cut Papaya, Boiled Eggs, Tea / Coffee',
      lunch: 'Fish Curry / Egg Curry (or Paneer Lababdar for Veg), Steamed Rice, Dal Palak',
      snacks: 'Bhel Puri & South Indian Filter Kaapi',
      dinner: 'Veg Pulao, Butter Chicken / Dum Aloo Kashmiri, Roti, Ice Cream scoop',
      specialDiet: 'Vegan alternative with almond milk pudding dessert',
    },
    {
      day: 'Saturday',
      breakfast: 'Upma with Coconut Chutney, French Toast, Fresh Bananas, Coffee',
      lunch: 'Chole Bhature with Pickled Onions, Mint Raita, Sweet Lassi',
      snacks: 'Grilled Cheese Sandwich & Tomato Soup',
      dinner: 'Hakka Noodles, Chilli Paneer Gravy, Fried Rice, Manchurian, Brownie',
      specialDiet: 'Zero-oil stir-fried tofu noodles available upon sign-up',
    },
    {
      day: 'Sunday',
      breakfast: 'Special English Breakfast (Baked Beans, Hash Brown, Toast, Scrambled Eggs / Paneer)',
      lunch: 'Hyderabadi Dum Biryani (Chicken & Veg), Salan, Dahi Chutney, Kheer',
      snacks: 'Assorted Biscuits, Cookies & Masala Tea',
      dinner: 'Light Dinner: Khichdi with Ghee, Roasted Papad, Tomato Chutney, Warm Milk',
      specialDiet: 'Special weekend feast diet preferences handled automatically',
    },
  ];

  const notices: Notice[] = [
    {
      id: 'not-01',
      title: 'Quarterly Fire Safety & Smoke Detector Inspection',
      content: 'The campus safety engineering team will conduct smoke detector tests in Block A and Block B this Saturday between 10:00 AM and 01:00 PM. Please keep hallway exits clear.',
      category: 'Maintenance',
      priority: 'Normal',
      postedDate: '2026-11-10',
      targetAudience: 'Block A & B',
    },
    {
      id: 'not-02',
      title: 'Hostel Night Curfew & Biometric Check-In Timing',
      content: 'Residents are reminded that the main hostel gate curfew is strictly 10:30 PM on weekdays and 11:30 PM on weekends. Late entry requests must be pre-approved by the Chief Warden.',
      category: 'Rules & Curfew',
      priority: 'Urgent',
      postedDate: '2026-11-08',
      targetAudience: 'All Residents',
    },
    {
      id: 'not-03',
      title: 'Hostel Annual Sports League & Badminton Tournament',
      content: 'Registrations are now open for inter-block Badminton, Table Tennis, and Chess tournaments. Sign up at the recreation room counter before November 18.',
      category: 'Event',
      priority: 'Normal',
      postedDate: '2026-11-06',
      targetAudience: 'All Residents',
    },
  ];

  return { rooms, residents, fees, maintenance, visitors, mess, notices };
}

// Ensure data folder and file exist
function getDb(): HostelDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData = generateInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, reinitializing:', err);
    const initialData = generateInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

// Atomic file write using a temp file
function saveDb(data: HostelDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempPath = path.join(DATA_DIR, `temp_${Date.now()}.json`);
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}

// Database helper operations
export const db = {
  // Stats overview
  getOverview() {
    const data = getDb();
    const totalRooms = data.rooms.length;
    const totalBeds = data.rooms.reduce((acc, r) => acc + r.capacity, 0);
    const occupiedBeds = data.rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    const activeResidents = data.residents.filter(r => r.status === 'Active').length;

    const totalDues = data.fees
      .filter(f => f.status === 'Pending' || f.status === 'Overdue')
      .reduce((acc, f) => acc + f.amount, 0);

    const monthlyCollected = data.fees
      .filter(f => f.status === 'Paid')
      .reduce((acc, f) => acc + f.amount, 0);

    const openMaintenance = data.maintenance.filter(m => m.status !== 'Resolved').length;
    const activeVisitors = data.visitors.filter(v => v.status === 'Inside').length;

    return {
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate,
      activeResidents,
      totalDues,
      monthlyCollected,
      openMaintenance,
      activeVisitors,
    };
  },

  // Rooms
  getRooms() {
    return getDb().rooms;
  },

  createRoom(roomData: Omit<Room, 'id' | 'occupiedBeds' | 'bedSlots'>) {
    const data = getDb();
    const id = `rm-${Date.now().toString().slice(-6)}`;
    const bedSlots: BedSlot[] = Array.from({ length: roomData.capacity }, (_, idx) => ({
      bedNumber: idx + 1,
      residentId: null,
      residentName: null,
    }));

    const newRoom: Room = {
      ...roomData,
      id,
      occupiedBeds: 0,
      bedSlots,
    };

    data.rooms.push(newRoom);
    saveDb(data);
    return newRoom;
  },

  updateRoom(id: string, updates: Partial<Room>) {
    const data = getDb();
    const index = data.rooms.findIndex(r => r.id === id);
    if (index === -1) return null;

    data.rooms[index] = { ...data.rooms[index], ...updates };
    saveDb(data);
    return data.rooms[index];
  },

  deleteRoom(id: string) {
    const data = getDb();
    const room = data.rooms.find(r => r.id === id);
    if (!room) return false;
    if (room.occupiedBeds > 0) {
      throw new Error('Cannot delete a room with active residents. Vacate or reassign residents first.');
    }
    data.rooms = data.rooms.filter(r => r.id !== id);
    saveDb(data);
    return true;
  },

  // Residents
  getResidents() {
    return getDb().residents;
  },

  createResident(residentData: Omit<Resident, 'id' | 'duesAmount'>) {
    const data = getDb();
    const id = `res-${Date.now().toString().slice(-6)}`;
    const newResident: Resident = {
      ...residentData,
      id,
      duesAmount: 0,
    };

    // If allocated to a room, update the room's bed slot
    if (newResident.roomId && newResident.bedNumber) {
      const room = data.rooms.find(r => r.id === newResident.roomId);
      if (room) {
        const slot = room.bedSlots.find(b => b.bedNumber === newResident.bedNumber);
        if (slot) {
          slot.residentId = id;
          slot.residentName = newResident.fullName;
          room.occupiedBeds = room.bedSlots.filter(s => s.residentId !== null).length;
          room.status = room.occupiedBeds >= room.capacity ? 'Occupied' : 'Available';
          newResident.roomNumber = room.roomNumber;
        }
      }
    }

    data.residents.push(newResident);
    saveDb(data);
    return newResident;
  },

  updateResident(id: string, updates: Partial<Resident>) {
    const data = getDb();
    const index = data.residents.findIndex(r => r.id === id);
    if (index === -1) return null;

    const current = data.residents[index];

    // Handle room/bed change if specified
    if (
      (updates.roomId !== undefined && updates.roomId !== current.roomId) ||
      (updates.bedNumber !== undefined && updates.bedNumber !== current.bedNumber)
    ) {
      // Clear old slot
      if (current.roomId && current.bedNumber) {
        const oldRoom = data.rooms.find(r => r.id === current.roomId);
        if (oldRoom) {
          const oldSlot = oldRoom.bedSlots.find(b => b.bedNumber === current.bedNumber);
          if (oldSlot) {
            oldSlot.residentId = null;
            oldSlot.residentName = null;
          }
          oldRoom.occupiedBeds = oldRoom.bedSlots.filter(s => s.residentId !== null).length;
          oldRoom.status = oldRoom.occupiedBeds >= oldRoom.capacity ? 'Occupied' : 'Available';
        }
      }

      // Assign new slot
      const targetRoomId = updates.roomId ?? current.roomId;
      const targetBedNum = updates.bedNumber ?? current.bedNumber;
      if (targetRoomId && targetBedNum) {
        const newRoom = data.rooms.find(r => r.id === targetRoomId);
        if (newRoom) {
          const newSlot = newRoom.bedSlots.find(b => b.bedNumber === targetBedNum);
          if (newSlot) {
            newSlot.residentId = id;
            newSlot.residentName = updates.fullName || current.fullName;
          }
          newRoom.occupiedBeds = newRoom.bedSlots.filter(s => s.residentId !== null).length;
          newRoom.status = newRoom.occupiedBeds >= newRoom.capacity ? 'Occupied' : 'Available';
          updates.roomNumber = newRoom.roomNumber;
        }
      }
    }

    data.residents[index] = { ...current, ...updates };
    saveDb(data);
    return data.residents[index];
  },

  vacateResident(id: string) {
    const data = getDb();
    const resident = data.residents.find(r => r.id === id);
    if (!resident) return null;

    if (resident.roomId && resident.bedNumber) {
      const room = data.rooms.find(r => r.id === resident.roomId);
      if (room) {
        const slot = room.bedSlots.find(b => b.bedNumber === resident.bedNumber);
        if (slot) {
          slot.residentId = null;
          slot.residentName = null;
        }
        room.occupiedBeds = room.bedSlots.filter(s => s.residentId !== null).length;
        room.status = room.occupiedBeds >= room.capacity ? 'Occupied' : 'Available';
      }
    }

    resident.roomId = null;
    resident.roomNumber = null;
    resident.bedNumber = null;
    resident.status = 'Checked-out';

    saveDb(data);
    return resident;
  },

  deleteResident(id: string) {
    const data = getDb();
    const resident = data.residents.find(r => r.id === id);
    if (!resident) return false;

    // Free bed
    if (resident.roomId && resident.bedNumber) {
      const room = data.rooms.find(r => r.id === resident.roomId);
      if (room) {
        const slot = room.bedSlots.find(b => b.bedNumber === resident.bedNumber);
        if (slot) {
          slot.residentId = null;
          slot.residentName = null;
        }
        room.occupiedBeds = room.bedSlots.filter(s => s.residentId !== null).length;
        room.status = room.occupiedBeds >= room.capacity ? 'Occupied' : 'Available';
      }
    }

    data.residents = data.residents.filter(r => r.id !== id);
    saveDb(data);
    return true;
  },

  // Fees
  getFees() {
    return getDb().fees;
  },

  createFee(feeData: Omit<FeeRecord, 'id' | 'invoiceNumber'>) {
    const data = getDb();
    const id = `fee-${Date.now().toString().slice(-6)}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newFee: FeeRecord = {
      ...feeData,
      id,
      invoiceNumber,
    };

    // Update resident's dues if unpaid
    if (newFee.status !== 'Paid') {
      const resident = data.residents.find(r => r.id === newFee.residentId);
      if (resident) {
        resident.duesAmount += newFee.amount;
      }
    }

    data.fees.unshift(newFee);
    saveDb(data);
    return newFee;
  },

  recordPayment(id: string, paymentMethod: FeeRecord['paymentMethod'], notes?: string) {
    const data = getDb();
    const fee = data.fees.find(f => f.id === id);
    if (!fee) return null;

    const previousStatus = fee.status;
    fee.status = 'Paid';
    fee.paidDate = new Date().toISOString().split('T')[0];
    fee.paymentMethod = paymentMethod || 'UPI';
    if (notes) fee.notes = notes;

    // Decrease dues if it was pending or overdue
    if (previousStatus !== 'Paid') {
      const resident = data.residents.find(r => r.id === fee.residentId);
      if (resident) {
        resident.duesAmount = Math.max(0, resident.duesAmount - fee.amount);
      }
    }

    saveDb(data);
    return fee;
  },

  // Maintenance
  getMaintenance() {
    return getDb().maintenance;
  },

  createTicket(ticketData: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status' | 'resolvedAt'>) {
    const data = getDb();
    const id = `mnt-${Date.now().toString().slice(-6)}`;
    const ticketNumber = `MNT-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const createdAt = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    const newTicket: MaintenanceTicket = {
      ...ticketData,
      id,
      ticketNumber,
      createdAt,
      status: 'Reported',
      resolvedAt: null,
    };

    data.maintenance.unshift(newTicket);
    saveDb(data);
    return newTicket;
  },

  updateTicket(id: string, updates: Partial<MaintenanceTicket>) {
    const data = getDb();
    const ticket = data.maintenance.find(m => m.id === id);
    if (!ticket) return null;

    if (updates.status === 'Resolved' && ticket.status !== 'Resolved') {
      const now = new Date();
      updates.resolvedAt = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    }

    Object.assign(ticket, updates);
    saveDb(data);
    return ticket;
  },

  // Visitors
  getVisitors() {
    return getDb().visitors;
  },

  logVisitor(visitorData: Omit<VisitorLog, 'id' | 'checkIn' | 'checkOut' | 'status'>) {
    const data = getDb();
    const id = `vis-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const checkIn = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    const newVisitor: VisitorLog = {
      ...visitorData,
      id,
      checkIn,
      checkOut: null,
      status: 'Inside',
    };

    data.visitors.unshift(newVisitor);
    saveDb(data);
    return newVisitor;
  },

  checkoutVisitor(id: string) {
    const data = getDb();
    const visitor = data.visitors.find(v => v.id === id);
    if (!visitor) return null;

    const now = new Date();
    visitor.checkOut = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    visitor.status = 'Departed';

    saveDb(data);
    return visitor;
  },

  // Mess
  getMess() {
    return getDb().mess;
  },

  updateMessDay(day: string, updates: Partial<MessDay>) {
    const data = getDb();
    const index = data.mess.findIndex(m => m.day.toLowerCase() === day.toLowerCase());
    if (index === -1) return null;

    data.mess[index] = { ...data.mess[index], ...updates };
    saveDb(data);
    return data.mess[index];
  },

  // Notices
  getNotices() {
    return getDb().notices;
  },

  createNotice(noticeData: Omit<Notice, 'id' | 'postedDate'>) {
    const data = getDb();
    const id = `not-${Date.now().toString().slice(-6)}`;
    const newNotice: Notice = {
      ...noticeData,
      id,
      postedDate: new Date().toISOString().split('T')[0],
    };

    data.notices.unshift(newNotice);
    saveDb(data);
    return newNotice;
  },

  deleteNotice(id: string) {
    const data = getDb();
    data.notices = data.notices.filter(n => n.id !== id);
    saveDb(data);
    return true;
  },

  // Reset to default
  resetDatabase() {
    const initial = generateInitialData();
    saveDb(initial);
    return initial;
  },
};
