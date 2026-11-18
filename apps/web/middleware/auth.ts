import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuthStore } from '../stores/auth';

/**
 * Authentication Middleware:
 * Ensures the user has a valid session before accessing protected routes.
 * If not authenticated, redirects to the login screen with the return URL.
 */
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  authStore.initAuth();

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    });
  }

  // Ensure mobile verified
  if (authStore.user?.role === 'patient' && authStore.user?.mobile_verified === false) {
    return navigateTo({
      path: '/auth/verify-mobile',
      query: { phone: authStore.user.phone || '' },
    });
  }
});

