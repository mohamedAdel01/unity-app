import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import type { ApiRequestOptions } from '../plugins/02.api-request';

export function useUnityApi() {
  const nuxtApp = useNuxtApp();
  const authStore = useAuthStore();
  authStore.initAuth();

  const token = computed(() => authStore.token);
  const currentUser = computed(() => authStore.user);

  // Centralized Bya3 $fetch and $apiRequest instances
  const fetchInstance = (nuxtApp as any).$fetch as (endpoint: string, options?: any) => Promise<any>;
  const apiRequest = (nuxtApp as any).$apiRequest as (options: ApiRequestOptions) => Promise<any>;

  // Fallback direct request helper using injected $fetch
  const request = async <T = any>(endpoint: string, options: any = {}): Promise<T> => {
    return await fetchInstance(endpoint, options);
  };

  // ==========================================
  // AUTH (Via Bya3 apiRequest Pattern)
  // ==========================================
  const login = async (credential: string | { email?: string; phone?: string }, password?: string) => {
    let payload: any = {};
    if (typeof credential === 'string') {
      const isEmail = credential.includes('@');
      payload = isEmail ? { email: credential, password } : { phone: credential, password };
    } else {
      payload = credential;
    }

    return await apiRequest({
      module: 'auth',
      service: 'LOGIN',
      payload,
      pinia: true,
      loadingKey: 'login',
    });
  };

  const register = async (payload: {
    name: string;
    password: string;
    email?: string;
    phone?: string;
    gender?: string;
    date_of_birth?: string;
  }) => {
    return await apiRequest({
      module: 'auth',
      service: 'REGISTER',
      payload,
      pinia: true,
      loadingKey: 'register',
    });
  };

  const updateProfile = async (data: {
    name?: string;
    phone?: string;
    avatar?: string;
    gender?: string;
    date_of_birth?: string;
  }) => {
    return await apiRequest({
      module: 'auth',
      service: 'UPDATE_PROFILE',
      payload: data,
      pinia: true,
      loadingKey: 'updateProfile',
    });
  };

  const completeRegistration = updateProfile;
  const registerPatient = register;

  const loginWithGoogle = async (payload: {
    idToken?: string;
    accessToken?: string;
    email?: string;
    name?: string;
    avatar?: string;
    googleId?: string;
  }) => {
    return await apiRequest({
      module: 'auth',
      service: 'GOOGLE_TOKEN_LOGIN',
      payload,
      pinia: true,
      loadingKey: 'loginWithGoogle',
    });
  };

  const loginWithApple = async (payload: {
    identityToken: string;
    email?: string;
    givenName?: string;
    familyName?: string;
    userIdentifier?: string;
  }) => {
    return await apiRequest({
      module: 'auth',
      service: 'APPLE_LOGIN',
      payload,
      pinia: true,
      loadingKey: 'loginWithApple',
    });
  };

  const logout = async () => {
    try {
      await apiRequest({
        module: 'auth',
        service: 'LOGOUT',
        pinia: true,
        loadingKey: 'logout',
      });
    } catch {
      authStore.logout();
    }
  };

  // ==========================================
  // CLINICS & MEDICAL
  // ==========================================
  const getClinics = async () => {
    return await apiRequest({
      service: 'CLINICS',
      loadingKey: 'clinics',
    });
  };

  const getServices = async () => {
    return await apiRequest({
      service: 'SERVICES',
      loadingKey: 'services',
    });
  };

  const getDoctors = async (clinicId?: string) => {
    return await apiRequest({
      service: 'DOCTORS',
      filter: clinicId ? { clinic_id: clinicId } : undefined,
      loadingKey: 'doctors',
    });
  };

  const getDoctorById = async (id: string) => {
    return await request(`client/doctors/${id}`);
  };

  const getDoctorSlots = async (doctorId: string, date: string) => {
    return await request(`client/doctors/${doctorId}/slots?date=${encodeURIComponent(date)}`);
  };

  // ==========================================
  // APPOINTMENTS & BOOKINGS
  // ==========================================
  const bookAppointment = async (payload: {
    doctor_id: string;
    service_id?: string;
    date: string;
    start_time: string;
    end_time: string;
    notes?: string;
    payment_method?: 'paymob' | 'cash' | 'card';
  }) => {
    return await apiRequest({
      service: 'BOOK_APPOINTMENT',
      payload,
      loadingKey: 'bookAppointment',
    });
  };

  const getMyAppointments = async () => {
    return await apiRequest({
      service: 'PATIENT_APPOINTMENTS',
      loadingKey: 'myAppointments',
    });
  };

  const cancelAppointment = async (id: string) => {
    return await request(`client/appointments/${id}/cancel`, {
      method: 'PATCH',
    });
  };

  // ==========================================
  // PATIENT RECORDS, INVOICES & PAYMENTS
  // ==========================================
  const getMedicalRecords = async () => {
    return await apiRequest({
      service: 'PATIENT_RECORDS',
      loadingKey: 'medicalRecords',
    });
  };

  const getInvoices = async () => {
    return await apiRequest({
      service: 'PATIENT_INVOICES',
      loadingKey: 'invoices',
    });
  };

  const getNotifications = async () => {
    return await apiRequest({
      service: 'NOTIFICATIONS',
      loadingKey: 'notifications',
    });
  };

  const markNotificationRead = async (id: string) => {
    return await request(`client/notifications/${id}/read`, {
      method: 'PATCH',
    });
  };

  const markAllNotificationsRead = async () => {
    return await request('client/notifications/read-all', {
      method: 'PATCH',
    });
  };

  const initiatePaymobPayment = async (invoiceId: string) => {
    return await request('client/payments/paymob/initiate', {
      method: 'POST',
      body: JSON.stringify({ invoice_id: invoiceId }),
    });
  };

  return {
    token,
    currentUser,
    fetch: fetchInstance,
    $fetch: fetchInstance,
    apiRequest,
    $apiRequest: apiRequest,
    login,
    register,
    completeRegistration,
    registerPatient,
    loginWithGoogle,
    loginWithApple,
    logout,
    updateProfile,
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
