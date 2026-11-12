import {
  DashboardOverview,
  Room,
  Resident,
  FeeRecord,
  MaintenanceTicket,
  VisitorLog,
  MessDay,
  Notice,
} from '../types/hostel';

const BASE_URL = '/api';

async function handleResponse<T>(res: globalThis.Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Overview
  async getOverview(): Promise<DashboardOverview> {
    const res = await fetch(`${BASE_URL}/overview`);
    return handleResponse<DashboardOverview>(res);
  },

  // Rooms
  async getRooms(): Promise<Room[]> {
    const res = await fetch(`${BASE_URL}/rooms`);
    return handleResponse<Room[]>(res);
  },

  async createRoom(roomData: Partial<Room>): Promise<Room> {
    const res = await fetch(`${BASE_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData),
    });
    return handleResponse<Room>(res);
  },

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    const res = await fetch(`${BASE_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Room>(res);
  },

  async deleteRoom(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/rooms/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Residents
  async getResidents(): Promise<Resident[]> {
    const res = await fetch(`${BASE_URL}/residents`);
    return handleResponse<Resident[]>(res);
  },

  async createResident(residentData: Partial<Resident>): Promise<Resident> {
    const res = await fetch(`${BASE_URL}/residents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(residentData),
    });
    return handleResponse<Resident>(res);
  },

  async updateResident(id: string, updates: Partial<Resident>): Promise<Resident> {
    const res = await fetch(`${BASE_URL}/residents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<Resident>(res);
  },

  async vacateResident(id: string): Promise<Resident> {
    const res = await fetch(`${BASE_URL}/residents/${id}/vacate`, {
      method: 'POST',
    });
    return handleResponse<Resident>(res);
  },

  async deleteResident(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/residents/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Fees
  async getFees(): Promise<FeeRecord[]> {
    const res = await fetch(`${BASE_URL}/fees`);
    return handleResponse<FeeRecord[]>(res);
  },

  async createFee(feeData: Partial<FeeRecord>): Promise<FeeRecord> {
    const res = await fetch(`${BASE_URL}/fees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feeData),
    });
    return handleResponse<FeeRecord>(res);
  },

  async recordPayment(id: string, paymentMethod: string, notes?: string): Promise<FeeRecord> {
    const res = await fetch(`${BASE_URL}/fees/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod, notes }),
    });
    return handleResponse<FeeRecord>(res);
  },

  // Maintenance
  async getMaintenance(): Promise<MaintenanceTicket[]> {
    const res = await fetch(`${BASE_URL}/maintenance`);
    return handleResponse<MaintenanceTicket[]>(res);
  },

  async createTicket(ticketData: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> {
    const res = await fetch(`${BASE_URL}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    });
    return handleResponse<MaintenanceTicket>(res);
  },

  async updateTicket(id: string, updates: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> {
    const res = await fetch(`${BASE_URL}/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<MaintenanceTicket>(res);
  },

  // Visitors
  async getVisitors(): Promise<VisitorLog[]> {
    const res = await fetch(`${BASE_URL}/visitors`);
    return handleResponse<VisitorLog[]>(res);
  },

  async logVisitor(visitorData: Partial<VisitorLog>): Promise<VisitorLog> {
    const res = await fetch(`${BASE_URL}/visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitorData),
    });
    return handleResponse<VisitorLog>(res);
  },

  async checkoutVisitor(id: string): Promise<VisitorLog> {
    const res = await fetch(`${BASE_URL}/visitors/${id}/checkout`, {
      method: 'POST',
    });
    return handleResponse<VisitorLog>(res);
  },

  // Mess
  async getMess(): Promise<MessDay[]> {
    const res = await fetch(`${BASE_URL}/mess`);
    return handleResponse<MessDay[]>(res);
  },

  async updateMessDay(day: string, updates: Partial<MessDay>): Promise<MessDay> {
    const res = await fetch(`${BASE_URL}/mess/${day}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<MessDay>(res);
  },

  // Notices
  async getNotices(): Promise<Notice[]> {
    const res = await fetch(`${BASE_URL}/notices`);
    return handleResponse<Notice[]>(res);
  },

  async createNotice(noticeData: Partial<Notice>): Promise<Notice> {
    const res = await fetch(`${BASE_URL}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noticeData),
    });
    return handleResponse<Notice>(res);
  },

  async deleteNotice(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/notices/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Reset database
  async resetDatabase(): Promise<void> {
    const res = await fetch(`${BASE_URL}/reset`, {
      method: 'POST',
    });
    await handleResponse(res);
  },

  // Export
  getExportUrl(type: 'residents' | 'fees' | 'rooms'): string {
    return `${BASE_URL}/export/${type}`;
  },
};
