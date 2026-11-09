import { ref } from 'vue';

export function useUnityApi() {
  const config = useRuntimeConfig();
  const baseUrl = config.public?.apiUrl || 'http://localhost:4000';

  const token = ref<string | null>(null);
  const currentUser = ref<any>(null);

  // Initialize token and user from localStorage on client side
  if (typeof window !== 'undefined') {
    token.value = localStorage.getItem('unity_token');
    const savedUser = localStorage.getItem('unity_user');
    if (savedUser) {
      try {
        currentUser.value = JSON.parse(savedUser);
      } catch (e) {
        currentUser.value = null;
      }
    }
  }

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`;
    }
    return headers;
  };

  const request = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${baseUrl}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  };

  // Auth (Supports Email OR Mobile Phone)
  const login = async (identifier: string, password: string) => {
    const res = await request('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (res.status && res.data?.token) {
      token.value = res.data.token;
      currentUser.value = res.data.user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('unity_token', res.data.token);
        localStorage.setItem('unity_user', JSON.stringify(res.data.user));
      }
    }
    return res;
  };

  // Universal Register (For all users; admin converted from DB)
  const register = async (payload: {
    name: string;
    password: string;
    email?: string;
    phone?: string;
    gender?: string;
    date_of_birth?: string;
  }) => {
    const res = await request('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.status && res.data?.token) {
      token.value = res.data.token;
      currentUser.value = res.data.user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('unity_token', res.data.token);
        localStorage.setItem('unity_user', JSON.stringify(res.data.user));
      }
    }
    return res;
  };

  // Backward compatible alias
  const registerPatient = register;

  // Google Sign-In (Token direct verification for mobile SDK & SPA)
  const loginWithGoogle = async (payload: {
    idToken?: string;
    accessToken?: string;
    email?: string;
    name?: string;
    avatar?: string;
    googleId?: string;
  }) => {
    const res = await request('/v1/auth/google/token', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.status && res.data?.token) {
      token.value = res.data.token;
      currentUser.value = res.data.user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('unity_token', res.data.token);
        localStorage.setItem('unity_user', JSON.stringify(res.data.user));
      }
    }
    return res;
  };

  // Apple Sign-In (Native iOS callback matching Bya3 pattern)
  const loginWithApple = async (payload: {
    identityToken: string;
    email?: string;
    givenName?: string;
    familyName?: string;
    userIdentifier?: string;
  }) => {
    const res = await request('/v1/auth/apple/native-callback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.status && res.data?.token) {
      token.value = res.data.token;
      currentUser.value = res.data.user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('unity_token', res.data.token);
        localStorage.setItem('unity_user', JSON.stringify(res.data.user));
      }
    }
    return res;
  };

  const logout = () => {
    token.value = null;
    currentUser.value = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('unity_token');
      localStorage.removeItem('unity_user');
    }
  };

  // Clinics
  const getClinics = async () => {
    return await request('/v1/client/clinics');
  };

  // Services
  const getServices = async () => {
    return await request('/v1/client/services');
  };

  // Doctors
  const getDoctors = async (clinicId?: string) => {
    const query = clinicId ? `?clinic_id=${encodeURIComponent(clinicId)}` : '';
    return await request(`/v1/client/doctors${query}`);
  };

  const getDoctorById = async (id: string) => {
    return await request(`/v1/client/doctors/${id}`);
  };

  const getDoctorSlots = async (doctorId: string, date: string) => {
    return await request(`/v1/client/doctors/${doctorId}/slots?date=${encodeURIComponent(date)}`);
  };

  // Appointments
  const bookAppointment = async (payload: {
    doctor_id: string;
    service_id?: string;
    date: string;
    start_time: string;
    end_time: string;
    notes?: string;
    payment_method?: 'paymob' | 'cash' | 'card';
  }) => {
    return await request('/v1/client/appointments/book', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  const getMyAppointments = async (status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return await request(`/v1/client/appointments/my${query}`);
  };

  const cancelAppointment = async (id: string) => {
    return await request(`/v1/client/appointments/${id}/cancel`, {
      method: 'PATCH',
    });
  };

  // Paymob Payment
  const initiatePaymobPayment = async (invoiceId: string) => {
    return await request('/v1/client/payments/paymob/initiate', {
      method: 'POST',
      body: JSON.stringify({ invoice_id: invoiceId }),
    });
  };

  // Notifications
  const getNotifications = async () => {
    return await request('/v1/client/notifications/my');
  };

  const markNotificationRead = async (id: string) => {
    return await request(`/v1/client/notifications/${id}/read`, {
      method: 'PATCH',
    });
  };

  const markAllNotificationsRead = async () => {
    return await request('/v1/client/notifications/read-all', {
      method: 'PATCH',
    });
  };

  // Medical Records & Invoices
  const getMedicalRecords = async () => {
    return await request('/v1/client/patient/medical-records');
  };

  const getInvoices = async () => {
    return await request('/v1/client/patient/invoices');
  };

  return {
    baseUrl,
    token,
    currentUser,
    login,
    register,
    registerPatient,
    loginWithGoogle,
    loginWithApple,
    logout,
    getClinics,
    getServices,
    getDoctors,
    getDoctorById,
    getDoctorSlots,
    bookAppointment,
    getMyAppointments,
    cancelAppointment,
    initiatePaymobPayment,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getMedicalRecords,
    getInvoices,
  };
}

