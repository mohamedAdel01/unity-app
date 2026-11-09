import { ofetch } from 'ofetch';
import type { ApiResponse } from '../types';

export const getBaseApiUrl = () => {
  if (typeof window !== 'undefined') {
    return (window as any).__UNITY_API_URL__ || 'http://localhost:4000';
  }
  return process.env.API_URL || 'http://localhost:4000';
};

export const apiFetch = ofetch.create({
  baseURL: getBaseApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  onRequest({ options }) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('unity_token');
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
  },
  onResponseError({ response }) {
    if (response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('unity_token');
        localStorage.removeItem('unity_user');
      }
    }
  },
});

export async function request<T>(url: string, options: any = {}): Promise<T> {
  const res = await apiFetch<ApiResponse<T>>(url, options);
  if (!res.success && res.error) {
    throw new Error(res.error.messageAr || res.error.message || 'API request failed');
  }
  return res.data;
}

