import { storage } from '../utils/storage';

let isHandlingUnauthorized = false;

const handleUnauthorized = async () => {
  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;

  try {
    await storage.remove('unity_token');
    await storage.remove('token');
    await storage.remove('unity_user');
    await storage.remove('user');
  } catch (_) {}

  if (import.meta.client && typeof window !== 'undefined') {
    try {
      localStorage.removeItem('unity_token');
      localStorage.removeItem('token');
      localStorage.removeItem('unity_user');
      localStorage.removeItem('user');
    } catch (_) {}

    try {
      const { useAuthStore } = await import('../stores/auth');
      const authStore = useAuthStore();
      authStore.logout();
    } catch (_) {}

    try {
      const { useAppToast } = await import('../composables/useAppToast');
      const { useI18n } = await import('../composables/useI18n');
      const toast = useAppToast();
      const { t } = useI18n();
      toast.warning(t('Session expired. Please log in again.'));
    } catch (_) {}

    const pathname = window.location.pathname;
    if (!pathname.includes('/auth/login') && !pathname.includes('/auth/register')) {
      const fullUrl = window.location.pathname + window.location.search;
      const redirectQuery = fullUrl && fullUrl !== '/' ? `?redirect=${encodeURIComponent(fullUrl)}` : '';
      await navigateTo(`/auth/login${redirectQuery}`, { replace: true });
    }
  }

  setTimeout(() => {
    isHandlingUnauthorized = false;
  }, 2500);
};

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

    let serializedBody = body;
    if (body !== undefined && body !== null) {
      if (body instanceof FormData) {
        delete finalHeaders['Content-Type'];
      } else {
        if (!finalHeaders['Content-Type']) {
          finalHeaders['Content-Type'] = 'application/json';
        }
        if (typeof body === 'object') {
          serializedBody = JSON.stringify(body);
        }
      }
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${getBaseUrl()}/v1/${cleanEndpoint}`;

    const response = await fetch(url, {
      headers: finalHeaders,
      body: serializedBody,
      ...restOptions,
    });

    if (!response.ok) {
      let errData: any = {};
      try {
        errData = await response.json();
      } catch {
        errData = { message: response.statusText || `Request failed with status ${response.status}` };
      }
      errData.status = response.status;
      errData.statusCode = response.status;

      // Handle 401 Unauthorized for non-auth requests (session expired/invalid token)
      const isAuthEndpoint = cleanEndpoint.startsWith('auth/') || 
                             cleanEndpoint.includes('login') || 
                             cleanEndpoint.includes('register') || 
                             cleanEndpoint.includes('verify-otp');

      if (response.status === 401 && !isAuthEndpoint) {
        handleUnauthorized();
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
