const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Inspection Records
  async getRecords(page = 1, perPage = 10, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      search
    });
    
    const response = await fetch(`${API_BASE_URL}/records?${params}`);
    if (!response.ok) throw new Error('Failed to fetch records');
    return response.json();
  },

  async getRecord(id: string) {
    const response = await fetch(`${API_BASE_URL}/records/${id}`);
    if (!response.ok) throw new Error('Failed to fetch record');
    return response.json();
  },

  async createRecord(record: any) {
    const response = await fetch(`${API_BASE_URL}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) throw new Error('Failed to create record');
    return response.json();
  },

  async updateRecord(id: string, record: any) {
    const response = await fetch(`${API_BASE_URL}/records/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) throw new Error('Failed to update record');
    return response.json();
  },

  async deleteRecord(id: string) {
    const response = await fetch(`${API_BASE_URL}/records/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete record');
    return response.json();
  },

  // Search Records
  async searchRecords(searchParams: {
    institution_name?: string;
    location?: string;
    pharmacist_name?: string;
    date_from?: string;
    date_to?: string;
    violations_text?: string;
    work_entities?: string;
  }) {
    const params = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.append(key, value);
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/records/search?${params}`);
    if (!response.ok) throw new Error('Failed to search records');
    return response.json();
  },

  // Attachments
  async uploadAttachment(attachment: any) {
    const response = await fetch(`${API_BASE_URL}/attachments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attachment),
    });
    if (!response.ok) throw new Error('Failed to upload attachment');
    return response.json();
  },

  // Notifications
  async getNotifications(userId: string) {
    const response = await fetch(`${API_BASE_URL}/notifications?user_id=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  async createNotification(notification: any) {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });
    if (!response.ok) throw new Error('Failed to create notification');
    return response.json();
  }
};

