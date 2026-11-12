const BASE_URL = '/api';

async function handleResponse(res) {
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
  return res.json();
}

export const api = {
  // Overview
  async getOverview() {
    const res = await fetch(`${BASE_URL}/overview`);
    return handleResponse(res);
  },

  // Rooms
  async getRooms() {
    const res = await fetch(`${BASE_URL}/rooms`);
    return handleResponse(res);
  },

  async createRoom(roomData) {
    const res = await fetch(`${BASE_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData),
    });
    return handleResponse(res);
  },

  async updateRoom(id, updates) {
    const res = await fetch(`${BASE_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async deleteRoom(id) {
    const res = await fetch(`${BASE_URL}/rooms/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Residents
  async getResidents() {
    const res = await fetch(`${BASE_URL}/residents`);
    return handleResponse(res);
  },

  async createResident(residentData) {
    const res = await fetch(`${BASE_URL}/residents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(residentData),
    });
    return handleResponse(res);
  },

  async updateResident(id, updates) {
    const res = await fetch(`${BASE_URL}/residents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  async vacateResident(id) {
    const res = await fetch(`${BASE_URL}/residents/${id}/vacate`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async deleteResident(id) {
    const res = await fetch(`${BASE_URL}/residents/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Fees
  async getFees() {
    const res = await fetch(`${BASE_URL}/fees`);
    return handleResponse(res);
  },

  async createFee(feeData) {
    const res = await fetch(`${BASE_URL}/fees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feeData),
    });
    return handleResponse(res);
  },

  async recordPayment(id, paymentMethod, notes) {
    const res = await fetch(`${BASE_URL}/fees/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod, notes }),
    });
    return handleResponse(res);
  },

  // Maintenance
  async getMaintenance() {
    const res = await fetch(`${BASE_URL}/maintenance`);
    return handleResponse(res);
  },

  async createTicket(ticketData) {
    const res = await fetch(`${BASE_URL}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    });
    return handleResponse(res);
  },

  async updateTicket(id, updates) {
    const res = await fetch(`${BASE_URL}/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  // Visitors
  async getVisitors() {
    const res = await fetch(`${BASE_URL}/visitors`);
    return handleResponse(res);
  },

  async logVisitor(visitorData) {
    const res = await fetch(`${BASE_URL}/visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitorData),
    });
    return handleResponse(res);
  },

  async checkoutVisitor(id) {
    const res = await fetch(`${BASE_URL}/visitors/${id}/checkout`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Mess
  async getMess() {
    const res = await fetch(`${BASE_URL}/mess`);
    return handleResponse(res);
  },

  async updateMessDay(day, updates) {
    const res = await fetch(`${BASE_URL}/mess/${day}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  // Notices
  async getNotices() {
    const res = await fetch(`${BASE_URL}/notices`);
    return handleResponse(res);
  },

  async createNotice(noticeData) {
    const res = await fetch(`${BASE_URL}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noticeData),
    });
    return handleResponse(res);
  },

  async deleteNotice(id) {
    const res = await fetch(`${BASE_URL}/notices/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Reset database
  async resetDatabase() {
    const res = await fetch(`${BASE_URL}/reset`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Export
  getExportUrl(type) {
    return `${BASE_URL}/export/${type}`;
  },
};
