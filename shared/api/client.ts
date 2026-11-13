import { ofetch } from 'ofetch';
import type { ApiResponse } from '../types';

export const getBaseApiUrl = () => {
  // 1. Check window global injected by Nuxt or runtime config
  if (typeof window !== 'undefined') {
    const win = window as any;
    const nuxtApiUrl = win?.__NUXT__?.config?.public?.apiUrl || win?.__NUXT__?.config?.public?.API_URL;
    if (nuxtApiUrl) return nuxtApiUrl;

    if (win.__UNITY_API_URL__) return win.__UNITY_API_URL__;
  }

  // 2. Check import.meta.env (Vite standard)
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const metaUrl = (import.meta as any).env.NUXT_PUBLIC_API_URL || 
                      (import.meta as any).env.VITE_API_URL || 
                      (import.meta as any).env.API_URL;
      if (metaUrl) return metaUrl;
    }
  } catch (_) {}

  // 3. Check process.env (Node / Vite define)
  try {
    if (typeof process !== 'undefined' && process.env) {
      const procUrl = process.env.NUXT_PUBLIC_API_URL || process.env.API_URL || process.env.VITE_API_URL;
      if (procUrl) return procUrl;
    }
  } catch (_) {}

  // 4. Default production fallback
  return 'https://api.unity-clinics.cyou';
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

