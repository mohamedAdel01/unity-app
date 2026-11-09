import type { ApiRequestOptions } from '../plugins/02.api-request';

export function useApiRequest() {
  const nuxtApp = useNuxtApp();
  const apiRequest = (nuxtApp as any).$apiRequest as (options: ApiRequestOptions) => Promise<any>;

  return {
    apiRequest,
    $apiRequest: apiRequest,
  };
}
