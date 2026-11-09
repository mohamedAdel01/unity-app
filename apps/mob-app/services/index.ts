export default {
  // ==========================================
  // 1. AUTHENTICATION SERVICES
  // ==========================================
  async LOGIN({ API, payload }: { API: any; payload: any }) {
    return await API('auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async REGISTER({ API, payload }: { API: any; payload: any }) {
    return await API('auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async GET_PROFILE({ API }: { API: any }) {
    return await API('auth/profile', {
      method: 'GET',
    });
  },

  async UPDATE_PROFILE({ API, payload }: { API: any; payload: any }) {
    return await API('auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async LOGOUT({ API }: { API: any }) {
    return await API('auth/logout', {
      method: 'POST',
    });
  },

  async GOOGLE_TOKEN_LOGIN({ API, payload }: { API: any; payload: any }) {
    return await API('auth/google/token', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async APPLE_LOGIN({ API, payload }: { API: any; payload: any }) {
    return await API('auth/apple/native-callback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ==========================================
  // 2. CLINIC & MEDICAL SERVICES
  // ==========================================
  async CLINICS({ API }: { API: any }) {
    return await API('client/clinics', {
      method: 'GET',
    });
  },

  async SERVICES({ API }: { API: any }) {
    return await API('client/services', {
      method: 'GET',
    });
  },

  async DOCTORS({ API, filter }: { API: any; filter?: any }) {
    const query = filter?.clinic_id ? `?clinic_id=${filter.clinic_id}` : '';
    return await API(`client/doctors${query}`, {
      method: 'GET',
    });
  },

  async DOCTOR_BY_ID({ API, filter }: { API: any; filter: { id: string } }) {
    return await API(`client/doctors/${filter.id}`, {
      method: 'GET',
    });
  },

  async DOCTOR_SLOTS({ API, filter }: { API: any; filter: { id: string; date: string } }) {
    const query = filter?.date ? `?date=${encodeURIComponent(filter.date)}` : '';
    return await API(`client/doctors/${filter.id}/slots${query}`, {
      method: 'GET',
    });
  },

  // ==========================================
  // 3. APPOINTMENTS & BOOKING
  // ==========================================
  async BOOK_APPOINTMENT({ API, payload }: { API: any; payload: any }) {
    return await API('client/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async PATIENT_APPOINTMENTS({ API }: { API: any }) {
    return await API('client/appointments', {
      method: 'GET',
    });
  },

  async CANCEL_APPOINTMENT({ API, payload }: { API: any; payload: { id: string } }) {
    return await API(`client/appointments/${payload.id}/cancel`, {
      method: 'PATCH',
    });
  },

  // ==========================================
  // 4. PATIENT RECORDS, INVOICES & NOTIFICATIONS
  // ==========================================
  async PATIENT_RECORDS({ API }: { API: any }) {
    return await API('client/patient/records', {
      method: 'GET',
    });
  },

  async PATIENT_INVOICES({ API }: { API: any }) {
    return await API('client/patient/invoices', {
      method: 'GET',
    });
  },

  async NOTIFICATIONS({ API }: { API: any }) {
    return await API('client/notifications', {
      method: 'GET',
    });
  },

  async MARK_NOTIFICATION_READ({ API, payload }: { API: any; payload: { id: string } }) {
    return await API(`client/notifications/${payload.id}/read`, {
      method: 'PATCH',
    });
  },

  async MARK_ALL_NOTIFICATIONS_READ({ API }: { API: any }) {
    return await API('client/notifications/read-all', {
      method: 'PATCH',
    });
  },

  async PAYMOB_INITIATE({ API, payload }: { API: any; payload: { invoice_id: string } }) {
    return await API('client/payments/paymob/initiate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ==========================================
  // 5. ADMIN SERVICES
  // ==========================================
  async ADMIN_PATIENTS({ API }: { API: any }) {
    return await API('admin/patients', {
      method: 'GET',
    });
  },

  async ADMIN_DOCTORS({ API }: { API: any }) {
    return await API('admin/doctors', {
      method: 'GET',
    });
  },

  async ADMIN_APPOINTMENTS({ API }: { API: any }) {
    return await API('admin/appointments', {
      method: 'GET',
    });
  },

  async ADMIN_CLINICS({ API }: { API: any }) {
    return await API('admin/clinics', {
      method: 'GET',
    });
  },
} as Record<string, (args: { API: any; payload?: any; filter?: any }) => Promise<any>>;
