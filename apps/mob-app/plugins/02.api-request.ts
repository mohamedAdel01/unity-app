import services from '@/services';

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
    } catch (error) {
      throw error;
    } finally {
      globalStore.setLoading([service, false]);
    }
  };

  nuxtApp.provide('apiRequest', apiRequest);
});
