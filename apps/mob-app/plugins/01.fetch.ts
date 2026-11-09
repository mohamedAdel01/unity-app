import { storage } from '../utils/storage';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const getBaseUrl = () => {
    // When running in browser on localhost or 127.0.0.1, target local Express server
    if (import.meta.client && typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:4000';
      }
    }
    return config.public?.apiUrl || 'http://localhost:4000';
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
      'x-platform': 'web',
      ...headers,
    };

    if (!(body instanceof FormData)) {
      finalHeaders['Content-Type'] = 'application/json';
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${getBaseUrl()}/v1/${cleanEndpoint}`;

    const response = await fetch(url, {
      headers: finalHeaders,
      body,
      ...restOptions,
    });

    if (!response.ok) {
      let errData: any = {};
      try {
        errData = await response.json();
      } catch {
        errData = { message: response.statusText || `Request failed with status ${response.status}` };
      }
      throw errData;
    }

    if ([204].includes(response.status)) {
      return { message: 'Success! Your request has been processed.' };
    }

    return await response.json();
  };

  nuxtApp.provide('fetch', fetchInstance);
});
