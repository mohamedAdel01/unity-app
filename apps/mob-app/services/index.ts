const toQuery = (filter?: any): string => {
  if (!filter || typeof filter !== 'object') return '';
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(filter)) {
    if (val !== undefined && val !== null && val !== '') {
      params.append(key, String(val));
    }
  }
  const str = params.toString();
  return str ? `?${str}` : '';
};

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
  // 2. CLIENT CLINIC & MEDICAL SERVICES
  // ==========================================
  async CLINICS({ API }: { API: any }) {
    return await API('client/clinics', {
      method: 'GET',
    });
  },

  async CLINIC_BY_ID({ API, filter }: { API: any; filter: { id: string | number } }) {
    return await API(`client/clinics/${filter.id}`, {
      method: 'GET',
    });
  },

  async EXAMINATIONS({ API }: { API: any }) {
    return await API('client/examinations', {
      method: 'GET',
    });
  },

  async EXAMINATION_BY_ID({ API, filter }: { API: any; filter: { id: string | number } }) {
    return await API(`client/examinations/${filter.id}`, {
      method: 'GET',
    });
  },

  async SERVICES({ API, filter }: { API: any; filter?: any }) {
    return await API(`client/examinations${toQuery(filter)}`, {
      method: 'GET',
    });
  },

  async SERVICE_BY_ID({ API, filter }: { API: any; filter: { id: string | number } }) {
    return await API(`client/examinations/${filter.id}`, {
      method: 'GET',
    });
  },

  async DOCTORS({ API, filter }: { API: any; filter?: any }) {
    return await API(`client/doctors${toQuery(filter)}`, {
      method: 'GET',
    });
  },

  async DOCTOR_BY_ID({ API, filter }: { API: any; filter: { id: string | number } }) {
    return await API(`client/doctors/${filter.id}`, {
      method: 'GET',
    });
  },

  async DOCTOR_SLOTS({ API, filter }: { API: any; filter: { id: string | number; date: string } }) {
    const query = filter?.date ? `?date=${encodeURIComponent(filter.date)}` : '';
    return await API(`client/doctors/${filter.id}/slots${query}`, {
      method: 'GET',
    });
  },

  // ==========================================
  // 3. CLIENT APPOINTMENTS & BOOKING
  // ==========================================
  async BOOK_APPOINTMENT({ API, payload }: { API: any; payload: any }) {
    return await API('client/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async PATIENT_APPOINTMENTS({ API, filter }: { API: any; filter?: any }) {
    return await API(`client/appointments${toQuery(filter)}`, {
      method: 'GET',
    });
  },

  async APPOINTMENT_BY_ID({ API, filter }: { API: any; filter: { id: string | number } }) {
    return await API(`client/appointments/${filter.id}`, {
      method: 'GET',
    });
  },

  async CANCEL_APPOINTMENT({ API, payload }: { API: any; payload: { id: string | number } }) {
    return await API(`client/appointments/${payload.id}/cancel`, {
      method: 'POST',
    });
  },

  // ==========================================
  // 4. CLIENT PATIENT RECORDS, INVOICES & NOTIFICATIONS
  // ==========================================
  async PATIENT_RECORDS({ API, filter }: { API: any; filter?: any }) {
    return await API(`client/patient/medical-records${toQuery(filter)}`, {
      method: 'GET',
    });
  },

  async PATIENT_INVOICES({ API, filter }: { API: any; filter?: any }) {
    return await API(`client/patient/invoices${toQuery(filter)}`, {
      method: 'GET',
    });
  },

  async NOTIFICATIONS({ API, filter }: { API: any; filter?: any }) {
    return await API(`client/notifications${toQuery(filter)}`, {
      method: 'GET',
    });
  },

  async MARK_NOTIFICATION_READ({ API, payload }: { API: any; payload: { id: string | number } }) {
    return await API(`client/notifications/${payload.id}/read`, {
      method: 'PATCH',
    });
  },

  async MARK_ALL_NOTIFICATIONS_READ({ API }: { API: any }) {
    return await API('client/notifications/read-all', {
      method: 'PATCH',
    });
  },

  async PAYMOB_INITIATE({ API, payload }: { API: any; payload: { invoice_id: string | number } }) {
    return await API('client/payments/paymob/initiate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async INVOICE_STATUS({ API, filter }: { API: any; filter: { id: string | number } }) {
    return await API(`client/payments/invoice/${filter.id}`, {
      method: 'GET',
    });
  },

  // ==========================================
  // 5. ADMIN DASHBOARD & OVERVIEW
  // ==========================================
  async ADMIN_DASHBOARD({ API }: { API: any }) {
    return await API('admin/dashboard', {
      method: 'GET',
    });
  },

  // ==========================================
  // 6. ADMIN PATIENTS MANAGEMENT
  // ==========================================
  async ADMIN_PATIENTS({ API, filter }: { API: any; filter?: any }) {
    return await API(`admin/patients${toQuery(filter)}`, {
      method: 'GET',
    });
  },

  async ADMIN_PATIENT_BY_ID({ API, filter }: { API: any; filter: { id: string | number } }) {
    return await API(`admin/patients/${filter.id}`, {
      method: 'GET',
    });
  },

  async ADMIN_CREATE_PATIENT({ API, payload }: { API: any; payload: { name: string; phone: string } }) {
    return await API('admin/patients', {
      method: 'POST',
      body: payload,
    });
  },

  async ADMIN_UPDATE_PATIENT({ API, payload }: { API: any; payload: { id: string | number; name?: string; phone?: string; gender?: string } }) {
    const { id, ...data } = payload;
    return await API(`admin/patients/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  // ==========================================
  // 7. ADMIN DOCTORS & SCHEDULES
  // ==========================================
  async ADMIN_DOCTORS({ API, filter }: { API: any; filter?: any }) {
    return await API(`admin/doctors${toQuery(filter)}`, {
      method: 'GET',
    });
  },

  async ADMIN_DOCTOR_BY_ID({ API, filter }: { API: any; filter: { id: string | number } }) {
    return await API(`admin/doctors/${filter.id}`, {
      method: 'GET',
    });
  },

  async ADMIN_CREATE_DOCTOR({ API, payload }: { API: any; payload: any }) {
    return await API('admin/doctors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async ADMIN_UPDATE_DOCTOR({ API, payload }: { API: any; payload: { id: string | number; [key: string]: any } }) {
    const { id, ...data } = payload;
    return await API(`admin/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async ADMIN_DELETE_DOCTOR({ API, payload }: { API: any; payload: { id: string | number } }) {
    return await API(`admin/doctors/${payload.id}`, {
      method: 'DELETE',
    });
  },

  async ADMIN_RESTORE_DOCTOR({ API, payload }: { API: any; payload: { id: string | number } }) {
    return await API(`admin/doctors/${payload.id}/restore`, {
      method: 'PATCH',
    });
  },

  async ADMIN_UPDATE_DOCTOR_SCHEDULES({ API, payload }: { API: any; payload: { id: string | number; schedules: any[] } }) {
    const { id, schedules } = payload;
    return await API(`admin/doctors/${id}/schedules`, {
      method: 'PUT',
      body: JSON.stringify({ schedules }),
    });
  },

  async ADMIN_TOGGLE_SCHEDULE({ API, payload }: { API: any; payload: { schedule_id: string | number } }) {
    return await API(`admin/doctors/schedules/${payload.schedule_id}/toggle`, {
      method: 'PATCH',
    });
  },

  // ==========================================
  // 8. ADMIN CLINICS MANAGEMENT
  // ==========================================
  async ADMIN_CLINICS({ API, filter }: { API: any; filter?: any }) {
    return await API(`admin/clinics${toQuery(filter)}`, {
      method: 'GET',
    });
  },

  async ADMIN_CREATE_CLINIC({ API, payload }: { API: any; payload: any }) {
    return await API('admin/clinics', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async ADMIN_UPDATE_CLINIC({ API, payload }: { API: any; payload: { id: string | number; [key: string]: any } }) {
    const { id, ...data } = payload;
    return await API(`admin/clinics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async ADMIN_TOGGLE_CLINIC({ API, payload }: { API: any; payload: { id: string | number; is_active?: boolean } }) {
    return await API(`admin/clinics/${payload.id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // ==========================================
  // 9. ADMIN MEDICAL EXAMINATIONS MANAGEMENT
  // ==========================================
  async ADMIN_EXAMINATIONS({ API, filter }: { API: any; filter?: any }) {
    return await API(`admin/examinations${toQuery(filter)}`, {
      method: 'GET',
    });
  },

  async ADMIN_CREATE_EXAMINATION({ API, payload }: { API: any; payload: any }) {
    return await API('admin/examinations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async ADMIN_UPDATE_EXAMINATION({ API, payload }: { API: any; payload: { id: string | number; [key: string]: any } }) {
    const { id, ...data } = payload;
    return await API(`admin/examinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async ADMIN_TOGGLE_EXAMINATION({ API, payload }: { API: any; payload: { id: string | number; is_active?: boolean } }) {
    return await API(`admin/examinations/${payload.id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async ADMIN_DELETE_EXAMINATION({ API, payload }: { API: any; payload: { id: string | number } }) {
    return await API(`admin/examinations/${payload.id}`, {
      method: 'DELETE',
    });
  },

  // Aliases for Services
  async ADMIN_SERVICES({ API, filter }: { API: any; filter?: any }) {
    return await API(`admin/examinations${toQuery(filter)}`, {
      method: 'GET',
    });
  },

  async ADMIN_CREATE_SERVICE({ API, payload }: { API: any; payload: any }) {
    return await API('admin/examinations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async ADMIN_UPDATE_SERVICE({ API, payload }: { API: any; payload: { id: string | number; [key: string]: any } }) {
    const { id, ...data } = payload;
    return await API(`admin/examinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async ADMIN_TOGGLE_SERVICE({ API, payload }: { API: any; payload: { id: string | number } }) {
    return await API(`admin/examinations/${payload.id}/toggle`, {
      method: 'PATCH',
    });
  },

  async ADMIN_DELETE_SERVICE({ API, payload }: { API: any; payload: { id: string | number } }) {
    return await API(`admin/examinations/${payload.id}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // 10. ADMIN APPOINTMENTS MANAGEMENT
  // ==========================================
  async ADMIN_APPOINTMENTS({ API, filter }: { API: any; filter?: any }) {
    return await API(`admin/appointments${toQuery(filter)}`, {
      method: 'GET',
    });
  },

  async ADMIN_APPOINTMENT_BY_ID({ API, filter }: { API: any; filter: { id: string | number } }) {
    return await API(`admin/appointments/${filter.id}`, {
      method: 'GET',
    });
  },

  async ADMIN_BOOK_APPOINTMENT({ API, payload }: { API: any; payload: any }) {
    return await API('admin/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async ADMIN_UPDATE_APPOINTMENT_STATUS({ API, payload }: { API: any; payload: { id: string | number; status: string } }) {
    return await API(`admin/appointments/${payload.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: payload.status }),
    });
  },

  // ==========================================
  // 11. ADMIN BILLING & INVOICES
  // ==========================================
  async ADMIN_BILLING_INVOICES({ API, filter }: { API: any; filter?: any }) {
    return await API(`admin/billing/invoices${toQuery(filter)}`, {
      method: 'GET',
    });
  },

  async ADMIN_BILLING_STATS({ API }: { API: any }) {
    return await API('admin/billing/stats', {
      method: 'GET',
    });
  },

  async ADMIN_UPDATE_INVOICE_STATUS({ API, payload }: { API: any; payload: { id: string | number; status: string } }) {
    return await API(`admin/billing/invoices/${payload.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: payload.status }),
    });
  },

  // ==========================================
  // 12. ADMIN NOTIFICATIONS
  // ==========================================
  async ADMIN_NOTIFICATIONS_HISTORY({ API }: { API: any }) {
    return await API('admin/notifications/history', {
      method: 'GET',
    });
  },

  async ADMIN_BROADCAST_NOTIFICATION({ API, payload }: { API: any; payload: { title: string; body: string } }) {
    return await API('admin/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async ADMIN_SEND_NOTIFICATION({ API, payload }: { API: any; payload: { user_id: string | number; title: string; body: string } }) {
    return await API('admin/notifications/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
} as Record<string, (args: { API: any; payload?: any; filter?: any }) => Promise<any>>;
