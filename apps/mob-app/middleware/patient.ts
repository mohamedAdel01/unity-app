import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuthStore } from '../stores/auth';

/**
 * Patient Role Middleware:
 * Ensures the authenticated user has a patient account or administrative access.
 * If unauthenticated, redirects to '/auth/login'.
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

  // 2. Strictly redirect staff away from patient screens
  if (authStore.isAdmin) {
    return navigateTo('/admin');
  }
  if (authStore.isReceptionist) {
    return navigateTo('/admin/appointments');
  }

  // 3. Must be a patient
  if (!authStore.isPatient) {
    return navigateTo('/');
  }
});

