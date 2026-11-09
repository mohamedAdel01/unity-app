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

  // ==========================================
  // 4. PATIENT RECORDS & INVOICES
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
} as Record<string, (args: { API: any; payload?: any; filter?: any }) => Promise<any>>;

