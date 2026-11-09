<template>
  <nav class="admin-bottom-nav">
    <!-- Tab 1: Overview / نظرة عامة -->
    <NuxtLink to="/admin" class="admin-nav-btn" :class="{ 'active': route.path === '/admin' }">
      <i class="pi pi-th-large"></i>
      <span>{{ t('Overview') }}</span>
    </NuxtLink>

    <!-- Tab 2: Doctors / الأطباء -->
    <NuxtLink to="/admin/doctors" class="admin-nav-btn" :class="{ 'active': route.path.startsWith('/admin/doctors') }">
      <i class="pi pi-heart"></i>
      <span>{{ t('Doctors') }}</span>
    </NuxtLink>

    <!-- Tab 3: Clinics / العيادات -->
    <NuxtLink to="/admin/clinics" class="admin-nav-btn" :class="{ 'active': route.path.startsWith('/admin/clinics') }">
      <i class="pi pi-plus-circle"></i>
      <span>{{ t('Clinics') }}</span>
    </NuxtLink>

    <!-- Tab 4: Patients / المرضى -->
    <NuxtLink to="/admin/patients" class="admin-nav-btn" :class="{ 'active': route.path.startsWith('/admin/patients') }">
      <i class="pi pi-users"></i>
      <span>{{ t('Patients') }}</span>
    </NuxtLink>

    <!-- Tab 5: Bookings / الحجوزات -->
    <NuxtLink to="/admin/appointments" class="admin-nav-btn" :class="{ 'active': route.path.startsWith('/admin/appointments') }">
      <i class="pi pi-ticket"></i>
      <span>{{ t('Bookings') }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

const route = useRoute();
const { t } = useI18n();
</script>

<style scoped lang="scss">
.admin-bottom-nav {
  position: relative;
  flex-shrink: 0;
  width: 100%;
  height: 68px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: var(--unity-surface);
  border-top: 1px solid var(--unity-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-left: 12px;
  padding-right: 12px;
  z-index: 40;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);

  .admin-nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--unity-text-muted);
    text-decoration: none;
    font-size: 0.72rem;
    font-weight: 600;
    width: 64px;
    height: 52px;
    border-radius: 14px;
    transition: all 0.2s ease;

    i {
      font-size: 1.25rem;
      transition: transform 0.2s ease;
    }

    &:hover {
      color: var(--unity-primary);
    }

    &.active {
      color: var(--unity-primary-dark);
      background: var(--unity-primary-light);

      i {
        transform: scale(1.1);
        color: var(--unity-primary);
      }
    }
  }
}
</style>

