import services from '@/services';
import { resolveI18nText } from '@/composables/useI18n';
import { useGlobalStore } from '@/stores/global';
import { useAuthStore } from '@/stores/auth';

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

    // Automatically provide localized fallback properties based on client active language
    if ((obj.name_ar !== undefined || obj.name_en !== undefined) && !obj.name) {
      obj.name = resolveI18nText({ ar: obj.name_ar, en: obj.name_en });
    }
    if ((obj.title_ar !== undefined || obj.title_en !== undefined) && !obj.title) {
      obj.title = resolveI18nText({ ar: obj.title_ar, en: obj.title_en });
    }
    if ((obj.description_ar !== undefined || obj.description_en !== undefined) && !obj.description) {
      obj.description = resolveI18nText({ ar: obj.description_ar, en: obj.description_en });
    }
    if ((obj.availability_text_ar !== undefined || obj.availability_text_en !== undefined) && !obj.availability_text) {
      obj.availability_text = resolveI18nText({ ar: obj.availability_text_ar, en: obj.availability_text_en });
    }
  }
  return obj;
}

const storeMap: Record<string, () => any> = {
  global: useGlobalStore,
  auth: useAuthStore,
};

// In-Memory SWR Cache for Static Read Endpoints (15 min TTL as per PERFORMANCE_OPTIMIZATION.md)
interface CacheEntry {
  timestamp: number;
  data: any;
}

const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const SWR_CANDIDATE_SERVICES = new Set([
  'CLINICS',
  'CATEGORIES',
  'EXAMINATIONS',
  'SERVICES',
  'DOCTORS',
  'PROMOTIONS',
  'OFFERS',
]);

export interface ApiRequestOptions {
  module?: 'global' | 'auth' | string;
  service: string;
  payload?: any;
  filter?: any;
  pinia?: boolean;
  bypassCache?: boolean;
}

export default defineNuxtPlugin((nuxtApp) => {
  const API = (nuxtApp as any).$fetch;

  const syncToStore = async (module: string, service: string, payload: any, filter: any, response: any) => {
    if (storeMap[module]) {
      const storeGetter = storeMap[module];
      if (storeGetter) {
        const store = storeGetter();
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
  };

  const revalidateInBackground = (
    module: string,
    service: string,
    filter: any,
    pinia: boolean | undefined,
    cacheKey: string
  ) => {
    // Background fetch without showing full-page loading indicators
    services[service]({ API, payload: undefined, filter })
      .then(async (freshResponse: any) => {
        freshResponse = sanitizeLocalizedData(freshResponse);
        apiCache.set(cacheKey, {
          timestamp: Date.now(),
          data: freshResponse,
        });
        if (pinia) {
          await syncToStore(module, service, undefined, filter, freshResponse);
        }
      })
      .catch((err: any) => {
        // Silent fail in background revalidation
        console.warn(`[ApiRequest SWR Background Revalidation] ${service} failed:`, err?.message || err);
      });
  };

  const apiRequest = async ({
    module = 'global',
    service,
    payload,
    filter,
    pinia,
    bypassCache,
  }: ApiRequestOptions) => {
    const globalStore = useGlobalStore();

    if (!services[service]) {
      throw new Error(`[ApiRequest] Service "${service}" does not exist in services registry.`);
    }

    const isMutation = !!payload || /^(CREATE_|UPDATE_|DELETE_|ADD_|CHANGE_|REMOVE_|POST_|PUT_|PATCH_)/i.test(service);

    // If performing a mutation, invalidate cache to keep UI consistent
    if (isMutation) {
      apiCache.clear();
    }

    // Check SWR cache for candidate read services
    const cacheKey = `${service}:${filter ? JSON.stringify(filter) : ''}`;
    if (!isMutation && !bypassCache && SWR_CANDIDATE_SERVICES.has(service)) {
      const cached = apiCache.get(cacheKey);
      if (cached) {
        const isFresh = Date.now() - cached.timestamp < CACHE_TTL_MS;
        if (isFresh) {
          // 0ms instant return from memory cache
          if (pinia) {
            syncToStore(module, service, payload, filter, cached.data).catch(() => {});
          }
          return cached.data;
        }

        // Stale: Return stale cache immediately and revalidate in background
        revalidateInBackground(module, service, filter, pinia, cacheKey);
        if (pinia) {
          syncToStore(module, service, payload, filter, cached.data).catch(() => {});
        }
        return cached.data;
      }
    }

    try {
      globalStore.setLoading([service, true]);

      // Call Request
      let response = await services[service]({ API, payload, filter });
      response = sanitizeLocalizedData(response);

      // Save to SWR Cache if candidate
      if (!isMutation && SWR_CANDIDATE_SERVICES.has(service)) {
        apiCache.set(cacheKey, {
          timestamp: Date.now(),
          data: response,
        });
      }

      // Handle Store
      if (pinia) {
        await syncToStore(module, service, payload, filter, response);
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
