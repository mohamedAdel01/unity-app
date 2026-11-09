<template>
  <div class="web-viewport-wrapper">
    <div class="desktop-screen-frame">
      <div class="mobile-device-shell" :dir="isRtl ? 'rtl' : 'ltr'">
        <!-- Global Mobile Floating Toast Notification Container -->
        <AppToastContainer />

        <!-- Main Page Scrollable Viewport -->
        <main class="mobile-content-viewport" :class="{ 'no-bottom-nav': hideBottomNav, 'is-onboarding': isOnboarding }">
          <slot />
        </main>

        <!-- Bottom Navigation Bar (Admin vs Patient) -->
        <AdminBottomNavBar v-if="!hideBottomNav && isAdminRoute" />
        <BottomNavBar v-else-if="!hideBottomNav" />

        <!-- Global Modals (Quick Book, Notifications, Booking Checkout) -->
        <AppGlobalModals v-if="!isOnboarding" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTheme } from '../../composables/useTheme';
import { useI18n } from '../../composables/useI18n';
import { useAuthStore } from '../../stores/auth';
import BottomNavBar from './BottomNavBar.vue';
import AdminBottomNavBar from './AdminBottomNavBar.vue';
import AppGlobalModals from './AppGlobalModals.vue';
import AppToastContainer from '../common/AppToastContainer.vue';

const route = useRoute();
const theme = useTheme();
const authStore = useAuthStore();
const { isRtl, initLocale } = useI18n();

const isAuthRoute = computed(() => {
  return route.path.startsWith('/auth');
});

const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin');
});

const isOnboarding = computed(() => {
  return route.path === '/' && !authStore.isAuthenticated;
});

const hideBottomNav = computed(() => {
  return isAuthRoute.value || isOnboarding.value;
});

onMounted(() => {
  theme.initTheme();
  initLocale();
  authStore.initAuth();
});
</script>

<style scoped lang="scss">
.web-viewport-wrapper {
  height: 100vh;
  max-height: 100vh;
  background-color: var(--web-outer-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  overflow: hidden;

  @media (max-width: 480px) {
    padding: 0;
    height: 100dvh;
    max-height: 100dvh;
    background-color: var(--unity-bg);
  }
}

.desktop-screen-frame {
  width: 100%;
  max-width: 430px;
  height: 100%;
  max-height: 900px;
  display: flex;
  justify-content: center;

  @media (max-width: 480px) {
    max-width: 100%;
    max-height: 100%;
  }
}

.mobile-device-shell {
  width: 100%;
  background: var(--unity-bg);
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
  border-radius: 40px;
  border: 4px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 480px) {
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
}

.mobile-content-viewport {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: max(32px, env(safe-area-inset-top, 32px));
  padding-bottom: 96px;
  background: var(--unity-bg);
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  &.is-onboarding {
    padding-top: 0;
    padding-bottom: 0;
  }

  &.no-bottom-nav {
    padding-bottom: 24px;
  }
}
</style>

