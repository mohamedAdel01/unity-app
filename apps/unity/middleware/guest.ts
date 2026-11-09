import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuthStore } from '../stores/auth';

/**
 * Guest Middleware:
 * Protects auth pages (Login, Register, OTP) from already logged-in users.
 * Redirects authenticated users based on their active role:
 * - Admin -> '/' (or admin dashboard)
 * - Doctor -> '/'
 * - Patient -> '/profile'
 */
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();
  authStore.initAuth();

  if (authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      return navigateTo('/');
    } else if (authStore.isDoctor) {
      return navigateTo('/');
    } else {
      return navigateTo('/profile');
    }
  }
});
