import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import type { ApiRequestOptions } from '../plugins/02.api-request';

/**
 * Clean Unity API Composable
 * Thin adapter exposing $apiRequest and reactive auth state.
 * All actual network calls flow through the Services Layer (@/services) via $apiRequest.
 */
export function useUnityApi() {
  const nuxtApp = useNuxtApp();
  const authStore = useAuthStore();
  const apiRequest = (nuxtApp as any).$apiRequest as (options: ApiRequestOptions) => Promise<any>;

  return {
    apiRequest,
    $apiRequest: apiRequest,
    token: computed(() => authStore.token),
    currentUser: computed(() => authStore.user),

    // Generic invocation
    call: (service: string, payload?: any, filter?: any, module = 'global', pinia = false) =>
      apiRequest({ module, service, payload, filter, pinia }),

    // Auth actions delegating to services layer + pinia store sync
    login: (phoneOrPayload: any, password?: string) => {
      const payload = typeof phoneOrPayload === 'string'
        ? { phone: phoneOrPayload, password }
        : phoneOrPayload;
      return apiRequest({ module: 'auth', service: 'LOGIN', payload, pinia: true });
    },
    register: (payload: any) =>
      apiRequest({ module: 'auth', service: 'REGISTER', payload, pinia: true }),
    logout: () =>
      apiRequest({ module: 'auth', service: 'LOGOUT', pinia: true }),
    updateProfile: (payload: any) =>
      apiRequest({ module: 'auth', service: 'UPDATE_PROFILE', payload, pinia: true }),
    completeRegistration: (payload: any) =>
      apiRequest({ module: 'auth', service: 'UPDATE_PROFILE', payload, pinia: true }),
    loginWithGoogle: (payload: any) =>
      apiRequest({ module: 'auth', service: 'GOOGLE_TOKEN_LOGIN', payload, pinia: true }),
    loginWithApple: (payload: any) =>
      apiRequest({ module: 'auth', service: 'APPLE_LOGIN', payload, pinia: true }),

    // Medical & Clinical Services
    getClinics: () => apiRequest({ service: 'CLINICS' }),
    getServices: () => apiRequest({ service: 'SERVICES' }),
    getDoctors: (clinicId?: string) =>
      apiRequest({ service: 'DOCTORS', filter: clinicId ? { clinic_id: clinicId } : undefined }),
    getDoctorById: (id: string) =>
      apiRequest({ service: 'DOCTOR_BY_ID', filter: { id } }),
    getDoctorSlots: (id: string, date: string) =>
      apiRequest({ service: 'DOCTOR_SLOTS', filter: { id, date } }),

    // Appointments & Records
    bookAppointment: (payload: any) =>
      apiRequest({ service: 'BOOK_APPOINTMENT', payload }),
    getMyAppointments: () =>
      apiRequest({ service: 'PATIENT_APPOINTMENTS' }),
    cancelAppointment: (id: string) =>
      apiRequest({ service: 'CANCEL_APPOINTMENT', payload: { id } }),
    getMedicalRecords: () =>
      apiRequest({ service: 'PATIENT_RECORDS' }),
    getInvoices: () =>
      apiRequest({ service: 'PATIENT_INVOICES' }),
    getNotifications: () =>
      apiRequest({ service: 'NOTIFICATIONS' }),
    markNotificationRead: (id: string) =>
      apiRequest({ service: 'MARK_NOTIFICATION_READ', payload: { id } }),
    markAllNotificationsRead: () =>
      apiRequest({ service: 'MARK_ALL_NOTIFICATIONS_READ' }),
    initiatePaymobPayment: (invoice_id: string) =>
      apiRequest({ service: 'PAYMOB_INITIATE', payload: { invoice_id } }),
  };
}
