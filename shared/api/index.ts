import { request } from './client';
import type { User, Appointment, Branch, QueueEntry } from '../types';

export const authApi = {
  login: (credentials: { login: string; password: string }) =>
    request<{ accessToken: string; refreshToken: string; user: User }>('/api/v1/auth/login', {
      method: 'POST',
      body: credentials,
    }),

  register: (data: any) =>
    request<{ accessToken: string; refreshToken: string; user: User }>('/api/v1/auth/register', {
      method: 'POST',
      body: data,
    }),

  getProfile: () => request<User>('/api/v1/auth/me'),

  logout: (refreshToken: string) =>
    request<{ message: string }>('/api/v1/auth/logout', {
      method: 'POST',
      body: { refreshToken },
    }),
};

export const appointmentsApi = {
  book: (data: {
    doctorId: string;
    clinicId: string;
    type: 'SCHEDULED' | 'QUEUE';
    date: string;
    time?: string;
    familyMemberId?: string;
    notes?: string;
  }) =>
    request<Appointment>('/api/v1/appointments/book', {
      method: 'POST',
      body: data,
    }),

  createWalkIn: (data: {
    patientId: string;
    doctorId: string;
    clinicId: string;
    notes?: string;
    isEmergency?: boolean;
  }) =>
    request<Appointment>('/api/v1/appointments/walk-in', {
      method: 'POST',
      body: data,
    }),

  list: (params?: any) =>
    request<Appointment[]>('/api/v1/appointments', {
      params,
    }),

  checkIn: (id: string) =>
    request<Appointment>(`/api/v1/appointments/${id}/check-in`, {
      method: 'PUT',
    }),

  startConsultation: (id: string) =>
    request<Appointment>(`/api/v1/appointments/${id}/start`, {
      method: 'PUT',
    }),

  completeConsultation: (id: string) =>
    request<Appointment>(`/api/v1/appointments/${id}/complete`, {
      method: 'PUT',
    }),

  cancel: (id: string, reason: string) =>
    request<Appointment>(`/api/v1/appointments/${id}/cancel`, {
      method: 'PUT',
      body: { reason },
    }),
};

export const branchesApi = {
  list: (activeOnly = true) =>
    request<Branch[]>('/api/v1/branches', {
      params: { activeOnly },
    }),

  getById: (id: string) => request<Branch>(`/api/v1/branches/${id}`),
};

export const queueApi = {
  getClinicQueue: (clinicId: string) =>
    request<QueueEntry[]>(`/api/v1/queue/clinic/${clinicId}/today`),

  callNext: (clinicId: string) =>
    request<QueueEntry>(`/api/v1/queue/clinic/${clinicId}/call-next`, {
      method: 'POST',
    }),

  getMyPosition: () =>
    request<{
      appointmentId: string;
      queueNumber: number;
      aheadCount: number;
      clinic: any;
      doctor: any;
      estimatedWaitMinutes: number;
    }>('/api/v1/queue/my-position'),
};

export const financeApi = {
  getOverview: (branchId?: string) =>
    request<any>('/api/v1/finance/overview', {
      params: { branchId },
    }),

  getCommissions: (doctorId?: string) =>
    request<any[]>('/api/v1/finance/commissions', {
      params: { doctorId },
    }),
};

