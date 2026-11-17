import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuthStore } from '../stores/auth';

/**
 * 01.role-guard.global.ts
 * Enforces strict role routing across the entire application:
 * - Admin: strictly restricted to admin dashboard routes (/admin, /admin/*, /profile).
 *   Never allowed into patient screens (/, /services, /appointments, /records, etc.).
 *   Redirects automatically to /admin.
 * - Receptionist: strictly restricted to ONLY 3 pages:
 *   1. /admin/appointments (الحجوزات)
 *   2. /admin/patients (المرضى)
 *   3. /profile (حسابي)
 *   Never allowed into patient screens or general admin screens.
 *   Redirects automatically to /admin/appointments.
 */
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  authStore.initAuth();

  if (!authStore.isAuthenticated) {
    return;
  }

  const path = to.path;

  // Allow auth routes in case of logout / login
  if (path.startsWith('/auth')) {
    return;
  }

  // 1. Receptionist restrictions
  if (authStore.isReceptionist) {
    const isAllowed = 
      path.startsWith('/admin/appointments') ||
      path.startsWith('/admin/patients') ||
      path === '/profile';

    if (!isAllowed) {
      return navigateTo('/admin/appointments');
    }
    return;
  }

  // 2. Admin restrictions (Never allow patient interface at all!)
  if (authStore.isAdmin) {
    const isAllowed = 
      path.startsWith('/admin') ||
      path === '/profile';

    if (!isAllowed) {
      return navigateTo('/admin');
    }
    return;
  }
});
