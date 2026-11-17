import { Capacitor } from '@capacitor/core';
import { storage } from '@shared/utils/storage';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const API_URL = config.public.API_URL

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
    const targetUrl = `${API_URL}/v1/${cleanEndpoint}`;

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        headers: finalHeaders,
        body,
        ...restOptions,
      });
    } catch (networkErr: any) {
      const method = (options.method || 'GET').toUpperCase();
      const rawMessage = networkErr?.message || 'Failed to fetch';
      const detailedMessage = `[Network Error] ${rawMessage} (${method} ${targetUrl}) - Check connection / API_URL`;
      console.error(`❌ ${detailedMessage}`, networkErr);
      const err = new Error(detailedMessage);
      (err as any).isNetworkError = true;
      (err as any).targetUrl = targetUrl;
      throw err;
    }

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch (_) {
        try {
          const rawText = await response.text();
          errorBody = { message: rawText };
        } catch (__) {
          errorBody = { message: response.statusText || `Request failed with status ${response.status}` };
        }
      }

      const method = (options.method || 'GET').toUpperCase();
      const serverMsg = errorBody?.message || errorBody?.error || response.statusText || `Request failed (${response.status})`;
      const detailedMsg = `[HTTP ${response.status}] ${serverMsg} (${method} ${cleanEndpoint})`;
      console.error(`❌ ${detailedMsg}`, errorBody);

      const err = new Error(detailedMsg);
      (err as any).status = response.status;
      (err as any).data = errorBody;
      (err as any).serverMessage = serverMsg;
      throw err;
    }

    if ([204].includes(response.status))
      return { message: 'Success! Your request has been processed.' };

    return await response.json();
  };

  nuxtApp.provide('fetch', fetchInstance);
});
