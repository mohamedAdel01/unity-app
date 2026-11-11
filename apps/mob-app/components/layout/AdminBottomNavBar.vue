<template>
  <nav class="admin-bottom-nav">
    <!-- Tab 1: Overview / نظرة عامة -->
    <NuxtLink to="/admin" class="admin-nav-btn" :class="{ 'active': route.path === '/admin' }">
      <i class="pi pi-th-large"></i>
      <span>{{ t('Overview') }}</span>
    </NuxtLink>

    <!-- Tab 2: Doctors / الأطباء -->
    <NuxtLink to="/admin/doctors" class="admin-nav-btn" :class="{ 'active': route.path.startsWith('/admin/doctors') }">
      <svg viewBox="0 0 24 24" class="nav-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4.5 3v5a6.5 6.5 0 0 0 13 0V3"/>
        <path d="M3 3h3"/>
        <path d="M16 3h3"/>
        <path d="M11 14.5V18a3 3 0 0 0 6 0v-2"/>
        <circle cx="17" cy="16" r="2"/>
      </svg>
      <span>{{ t('Doctors') }}</span>
    </NuxtLink>

    <!-- Tab 3: Clinics / العيادات -->
    <NuxtLink to="/admin/clinics" class="admin-nav-btn" :class="{ 'active': route.path.startsWith('/admin/clinics') }">
      <i class="pi pi-building"></i>
      <span>{{ t('Clinics') }}</span>
    </NuxtLink>

    <!-- Tab 4: Patients / المرضى -->
    <NuxtLink to="/admin/patients" class="admin-nav-btn" :class="{ 'active': route.path.startsWith('/admin/patients') }">
      <i class="pi pi-users"></i>
      <span>{{ t('Patients') }}</span>
    </NuxtLink>

    <!-- Tab 5: Bookings / الحجوزات -->
    <NuxtLink to="/admin/appointments" class="admin-nav-btn" :class="{ 'active': route.path.startsWith('/admin/appointments') }">
      <i class="pi pi-calendar"></i>
      <span>{{ t('Manage Bookings') }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRoute } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

const route = useRoute();

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-bottom-nav {
  position: absolute;
  bottom: max(14px, env(safe-area-inset-bottom, 14px));
  left: 16px;
  right: 16px;
  height: 66px;
  background: var(--unity-navbar-bg, rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid var(--unity-navbar-border, rgba(255, 255, 255, 0.65));
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  z-index: 45;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: background-color 0.25s ease, border-color 0.25s ease;

  .admin-nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: var(--unity-text-muted);
    text-decoration: none;
    font-size: 0.72rem;
    font-weight: 700;
    width: 62px;
    height: 48px;
    border-radius: 24px;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    i, .nav-svg {
      font-size: 1.2rem;
      width: 20px;
      height: 20px;
      transition: transform 0.2s ease;
    }

    &:hover {
      color: var(--unity-primary);
    }

    &.active {
      color: var(--unity-primary-dark);
      background: var(--unity-primary-light);

      i, .nav-svg {
        transform: scale(1.12);
        color: var(--unity-primary);
      }
    }
  }
}
</style>
