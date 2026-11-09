import { defineNuxtRouteMiddleware, navigateTo, abortNavigation } from '#app';
import { useAuthStore } from '../stores/auth';

/**
 * Admin Role Middleware:
 * Strictly restricts route access to users with role 'admin'.
 * 1. If unauthenticated -> redirects to '/auth/login'.
 * 2. If authenticated as non-admin -> redirects to home or aborts with 403 Forbidden.
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

  // 2. Must be an admin
  if (!authStore.isAdmin) {
    return abortNavigation({
      statusCode: 403,
      statusMessage: 'Access Denied: Admin privileges required.',
    });
  }
});

