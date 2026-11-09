import services from '../services';

const storeMap: Record<string, () => Promise<any>> = {
  global: () => import('../stores/global').then((m) => m.useGlobalStore),
  auth: () => import('../stores/auth').then((m) => m.useAuthStore),
};

export interface ApiRequestOptions {
  module?: 'global' | 'auth' | string;
  service: string;
  payload?: any;
  filter?: any;
  pinia?: boolean;
  loadingKey?: string;
}

export default defineNuxtPlugin((nuxtApp) => {
  const API = (nuxtApp as any).$fetch;

  const apiRequest = async ({
    module = 'global',
    service,
    payload,
    filter,
    pinia,
    loadingKey,
  }: ApiRequestOptions) => {
    const globalStore = (await storeMap.global())();

    if (!services[service]) {
      throw new Error(`[ApiRequest] Service "${service}" does not exist in services registry.`);
    }

    try {
      globalStore.setLoading([loadingKey ?? service, true]);

      // Execute request via services layer
      const response = await services[service]({ API, payload, filter });

      // Handle Pinia Store sync if requested (matching Bya3 pattern)
      if (pinia && storeMap[module]) {
        const store = (await storeMap[module]())();
        if (typeof store.MAIN === 'function') {
          await store.MAIN({
            service,
            payload,
            filter,
            response,
          });
        }
      }

      return response;
    } catch (error) {
      throw error;
    } finally {
      globalStore.setLoading([loadingKey ?? service, false]);
    }
  };

  nuxtApp.provide('apiRequest', apiRequest);
});
