import services from '@/services';
import { resolveI18nText } from '@/composables/useI18n';

function sanitizeLocalizedData(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeLocalizedData(item));
  }
  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (
          trimmed.startsWith('{') &&
          trimmed.endsWith('}') &&
          (trimmed.includes('"ar"') || trimmed.includes('"en"'))
        ) {
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed && typeof parsed === 'object' && (parsed.ar !== undefined || parsed.en !== undefined)) {
              if (parsed.ar && !obj[`${key}_ar`]) obj[`${key}_ar`] = parsed.ar;
              if (parsed.en && !obj[`${key}_en`]) obj[`${key}_en`] = parsed.en;
              obj[key] = resolveI18nText(parsed);
            }
          } catch (_) {}
        }
      } else if (typeof val === 'object') {
        obj[key] = sanitizeLocalizedData(val);
      }
    }
  }
  return obj;
}

const storeMap: Record<string, () => Promise<any>> = {
  global: () => import('@/stores/global').then((m) => m.useGlobalStore),
  auth: () => import('@/stores/auth').then((m) => m.useAuthStore),
  // advertisement: () => import('@/stores/advertisement').then((m) => m.useAdvertisementStore),
  // setting: () => import('@/stores/setting').then((m) => m.useSettingStore),
  // account: () => import('@/stores/account').then((m) => m.useAccountStore),
};

export interface ApiRequestOptions {
  module?: 'global' | 'auth' | string;
  service: string;
  payload?: any;
  filter?: any;
  pinia?: boolean;
}

export default defineNuxtPlugin((nuxtApp) => {
  const API = (nuxtApp as any).$fetch;

  const apiRequest = async ({
    module = 'global',
    service,
    payload,
    filter,
    pinia,
  }: ApiRequestOptions) => {
    const globalStore = (await storeMap.global())();

    if (!services[service]) {
      throw new Error(`[ApiRequest] Service "${service}" does not exist in services registry.`);
    }

    try {
      globalStore.setLoading([service, true]);

      // Call Request
      let response = await services[service]({ API, payload, filter });
      response = sanitizeLocalizedData(response);

      // Handle Store
      if (pinia && storeMap[module]) {
        const storeGetter = storeMap[module];
        if (storeGetter) {
          const store = (await storeGetter())();
          if (typeof store?.MAIN === 'function') {
            await store.MAIN({
              service,
              payload,
              filter,
              response,
            });
          }
        }
      }

      return response;
    } catch (error: any) {
      if (!error.message && error?.data?.message) {
        error.message = error.data.message;
      }
      console.error(`❌ [ApiRequest: ${service}]`, error?.message || error);
      throw error;
    } finally {
      globalStore.setLoading([service, false]);
    }
  };

  nuxtApp.provide('apiRequest', apiRequest);
});
