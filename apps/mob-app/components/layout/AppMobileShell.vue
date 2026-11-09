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

        <!-- Bottom Navigation Bar with Center Floating Plus Action -->
        <BottomNavBar v-if="!hideBottomNav" />

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
import AppGlobalModals from './AppGlobalModals.vue';
import AppToastContainer from '../common/AppToastContainer.vue';

const route = useRoute();
const theme = useTheme();
const authStore = useAuthStore();
const { isRtl, initLocale } = useI18n();

const isAuthRoute = computed(() => {
  return route.path.startsWith('/auth');
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
  min-height: 100vh;
  background-color: var(--web-outer-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;

  @media (max-width: 480px) {
    padding: 0;
    background-color: var(--unity-bg);
  }
}

.desktop-screen-frame {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  display: flex;
  justify-content: center;

  @media (max-width: 480px) {
    max-width: 100%;
  }
}

.mobile-device-shell {
  width: 100%;
  background: var(--unity-bg);
  min-height: 100vh;
  max-height: 96vh;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
  border-radius: 44px;
  border: 4px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 480px) {
    max-height: 100vh;
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
  padding-top: max(38px, env(safe-area-inset-top, 38px));
  padding-bottom: 24px;
  background: var(--unity-bg);
  scroll-behavior: smooth;

  &.is-onboarding {
    padding-top: 0;
    padding-bottom: 0;
  }

  &.no-bottom-nav {
    padding-bottom: 24px;
  }
}
</style>

