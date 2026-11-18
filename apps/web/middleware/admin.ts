import { defineNuxtRouteMiddleware, navigateTo, abortNavigation } from '#app';
import { useAuthStore } from '../stores/auth';

/**
 * Admin / Receptionist Role Middleware:
 * Restricts route access to users with role 'admin' or 'receptionist'.
 * 1. If unauthenticated -> redirects to '/auth/login'.
 * 2. If authenticated as non-admin / non-receptionist -> aborts with 403 Forbidden.
 */
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  authStore.initAuth();

  // 1. Must be authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    });
  }

  // 2. Must be an admin or receptionist
  if (!authStore.isAdmin && !authStore.isReceptionist) {
    return abortNavigation({
      statusCode: 403,
      statusMessage: 'Access Denied: Admin or Receptionist privileges required.',
    });
  }
});

