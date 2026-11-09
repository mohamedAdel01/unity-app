<template>
  <nav class="bottom-nav-bar">
    <NuxtLink to="/" class="nav-btn" :class="{ 'active': route.path === '/' }">
      <i class="pi pi-home"></i>
      <span>{{ t('nav.home') }}</span>
    </NuxtLink>

    <NuxtLink to="/services" class="nav-btn" :class="{ 'active': route.path === '/services' }">
      <i class="pi pi-th-large"></i>
      <span>{{ t('nav.services') }}</span>
    </NuxtLink>

    <!-- Center Floating Plus (+) Button -->
    <div class="center-fab-wrapper">
      <button 
        class="center-fab-btn" 
        :aria-label="t('nav.quickBookAria')"
        @click="bookingModal.openQuickBook"
      >
        <i class="pi pi-plus"></i>
      </button>
    </div>

    <NuxtLink to="/appointments" class="nav-btn" :class="{ 'active': route.path === '/appointments' }">
      <i class="pi pi-calendar"></i>
      <span>{{ t('nav.appointments') }}</span>
    </NuxtLink>

    <NuxtLink to="/profile" class="nav-btn" :class="{ 'active': route.path === '/profile' }">
      <i class="pi pi-user"></i>
      <span>{{ t('nav.profile') }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';

const route = useRoute();
const { t } = useI18n();
const bookingModal = useBookingModal();
</script>

<style scoped lang="scss">
.bottom-nav-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: var(--unity-surface);
  border-top: 1px solid var(--unity-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 10px;
  z-index: 40;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);

  .nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--unity-text-muted);
    text-decoration: none;
    font-size: 0.72rem;
    font-weight: 600;
    width: 62px;
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

  // Center FAB Button (+)
  .center-fab-wrapper {
    position: relative;
    top: -18px;
    width: 60px;
    display: flex;
    justify-content: center;

    .center-fab-btn {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: var(--unity-primary-gradient);
      border: 3.5px solid var(--unity-surface);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      cursor: pointer;
      box-shadow: 0 8px 24px var(--unity-accent-glow), 0 4px 10px rgba(4, 120, 87, 0.3);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        transform: scale(1.08) rotate(90deg);
        box-shadow: 0 10px 28px rgba(4, 120, 87, 0.5);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}
</style>

