import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import type { ApiRequestOptions } from '../plugins/02.api-request';

/**
 * Clean Unity API Composable
 * Exposes apiRequest directly so components write explicit service calls:
 * apiRequest({ service: 'CLINICS' })
 */
export function useUnityApi() {
  const nuxtApp = useNuxtApp();
  const authStore = useAuthStore();
  const apiRequest = (nuxtApp as any).$apiRequest as (options: ApiRequestOptions) => Promise<any>;

  return {
    apiRequest,
    $apiRequest: apiRequest,
    token: computed(() => authStore.token),
    currentUser: computed(() => authStore.user),
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
  };
}
