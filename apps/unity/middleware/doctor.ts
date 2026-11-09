import { defineNuxtRouteMiddleware, navigateTo, abortNavigation } from '#app';
import { useAuthStore } from '../stores/auth';

/**
 * Doctor Role Middleware:
 * Strictly restricts route access to registered medical doctors.
 * 1. If unauthenticated -> redirects to '/auth/login'.
 * 2. If authenticated as non-doctor -> aborts with 403 or redirects to home.
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

  // 2. Must be a doctor
  if (!authStore.isDoctor && !authStore.isAdmin) {
    return abortNavigation({
      statusCode: 403,
      statusMessage: 'Access Denied: Doctor credentials required.',
    });
  }
});
