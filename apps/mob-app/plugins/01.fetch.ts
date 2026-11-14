import { Capacitor } from '@capacitor/core';
import { storage } from '@shared/utils/storage';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const getBaseUrl = () => {
    // When running in browser on localhost or 127.0.0.1, always target local API server
    if (import.meta.client && typeof window !== 'undefined' && !Capacitor.isNativePlatform()) {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return config.public.BASE_URL || config.public.API_URL || 'http://localhost:4000';
      }
    }
    return config.public.BASE_URL || config.public.API_URL || 'https://api.unity-clinics.cyou';
  };

  const fetchInstance = async (endpoint: string, options: any = {}) => {
    let raw = (await storage.get('unity_token')) || (await storage.get('token'));
    if (!raw && typeof useCookie === 'function') {
      try {
        raw = useCookie('unity_token').value || useCookie('token').value;
      } catch (e) {}
    }

    const TOKEN = raw ? String(raw).replace(/['"]+/g, '').trim() : null;
    const { headers = {}, body, ...restOptions } = options;

    const finalHeaders: Record<string, string> = {
      ...(TOKEN && TOKEN !== 'undefined' && TOKEN !== 'null'
        ? { authorization: `Bearer ${TOKEN}` }
        : {}),
      'x-platform': Capacitor.isNativePlatform() ? 'mobile' : 'web',
      ...headers,
    };
    if (!(body instanceof FormData))
      finalHeaders['Content-Type'] = 'application/json';

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    const response = await fetch(`${getBaseUrl()}/v1/${cleanEndpoint}`, {
      headers: finalHeaders,
      body,
      ...restOptions,
    });

    if (!response.ok) {
      throw await response.json().catch(() => ({
        message: response.statusText || `Request failed with status ${response.status}`,
        status: response.status,
      }));
    }

    if ([204].includes(response.status))
      return { message: 'Success! Your request has been processed.' };

    return await response.json();
  };

  nuxtApp.provide('fetch', fetchInstance);
});
