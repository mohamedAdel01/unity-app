<template>
  <div class="web-viewport-wrapper" :class="{ 'is-native': isNativePlatform }">
    <div class="desktop-screen-frame" :class="{ 'is-native': isNativePlatform }">
      <div class="mobile-device-shell" :class="{ 'is-native': isNativePlatform }">
        <!-- Global Mobile Floating Toast Notification Container -->
        <AppToastContainer />

        <!-- Main Page Scrollable Viewport -->
        <main class="mobile-content-viewport" :class="{ 'no-bottom-nav': hideBottomNav, 'is-onboarding': isOnboarding }">
          <slot />
          <!-- Global Bottom Spacing Sentinel to guarantee content clears the floating navbar -->
          <div v-if="!hideBottomNav" class="mobile-bottom-nav-spacer" aria-hidden="true" />
        </main>

        <!-- Bottom Navigation Bar (Admin vs Patient) - Automatically hidden when any modal is open -->
        <AdminBottomNavBar v-if="!hideBottomNav && showAdminNav" />
        <BottomNavBar v-else-if="!hideBottomNav" />

        <!-- Global Modals (Quick Book, Notifications, Booking Checkout) -->
        <AppGlobalModals v-if="!isOnboarding && !authStore.isReceptionist && !authStore.isAdmin" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { useTheme } from '../../composables/useTheme';
import { useI18n } from '../../composables/useI18n';
import { useAuthStore } from '../../stores/auth';
import { useBookingModal } from '../../composables/useBookingModal';
import { useModalState } from '../../composables/useModalState';
import { useAppBackButton } from '../../composables/useAppBackButton';
import BottomNavBar from './BottomNavBar.vue';
import AdminBottomNavBar from './AdminBottomNavBar.vue';
import AppGlobalModals from './AppGlobalModals.vue';
import AppToastContainer from '../common/AppToastContainer.vue';

const route = useRoute();

const theme = useTheme();

const authStore = useAuthStore();

const bookingModal = useBookingModal();

const { isAnyModalOpen, initModalObserver, destroyModalObserver } = useModalState();

const { initBackButtonHandler, destroyBackButtonHandler } = useAppBackButton();

const { initLocale } = useI18n();

// 2. Data (refs, reactive state)
const isNativePlatform = computed(() => {
  return Capacitor.isNativePlatform();
});

// 3. Computed (computed properties)
const isAuthRoute = computed(() => {
  return route.path.startsWith('/auth');
});

const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin');
});

const showAdminNav = computed(() => {
  if (authStore.isAdmin || authStore.isReceptionist) return true;
  return isAdminRoute.value;
});

const isOnboarding = computed(() => {
  return route.path === '/' && !authStore.isAuthenticated;
});

const hideBottomNav = computed(() => {
  return (
    isAuthRoute.value ||
    isOnboarding.value ||
    isAnyModalOpen.value ||
    bookingModal.isQuickBookOpen.value ||
    bookingModal.isBookingFlowOpen.value ||
    bookingModal.isNotificationOpen.value
  );
});

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  theme.initTheme();
  initLocale();
  authStore.initAuth();
  initModalObserver();
  initBackButtonHandler();
});

onUnmounted(() => {
  destroyModalObserver();
  destroyBackButtonHandler();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.web-viewport-wrapper {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  max-height: 100dvh;
  background-color: var(--unity-bg);
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0;
  overflow: hidden;

  &.is-native {
    padding: 0;
    height: 100dvh;
    max-height: 100dvh;
    background-color: var(--unity-bg);
  }
}

.desktop-screen-frame {
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;

  &.is-native {
    max-width: 100%;
    max-height: 100%;
  }
}

.mobile-device-shell {
  width: 100%;
  height: 100%;
  background: var(--unity-bg);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0;
  border: none;
  box-shadow: none;

  &.is-native {
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
}

.mobile-content-viewport {
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--unity-bg);
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding-top: max(20px, env(safe-area-inset-top, 20px));
  padding-bottom: 0;

  // On tablets & wide viewports, provide balanced horizontal padding
  @media (min-width: 600px) {
    padding-left: max(24px, env(safe-area-inset-left, 24px));
    padding-right: max(24px, env(safe-area-inset-right, 24px));
  }

  // Tablet & Desktop layout: Content is nicely centered and proportioned
  & > * {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;

    @media (min-width: 600px) {
      max-width: 860px;
      margin-left: auto;
      margin-right: auto;
    }

    @media (min-width: 1024px) {
      max-width: 960px;
    }
  }

  &.is-onboarding {
    padding-top: 0;
    padding-bottom: 0;
  }

  &.no-bottom-nav {
    padding-bottom: 24px;
  }
}

.mobile-bottom-nav-spacer {
  width: 100%;
  height: calc(110px + max(14px, env(safe-area-inset-bottom, 14px)));
  min-height: calc(110px + max(14px, env(safe-area-inset-bottom, 14px)));
  flex-shrink: 0;
  pointer-events: none;
}

// Automatically collapse outer shell spacer if a page already contains an explicit bottom spacer
.mobile-content-viewport:has(.page-bottom-spacer) .mobile-bottom-nav-spacer,
.mobile-content-viewport:has(.terms-bottom-spacer) .mobile-bottom-nav-spacer,
.mobile-content-viewport:has(.delete-bottom-spacer) .mobile-bottom-nav-spacer {
  display: none !important;
  height: 0 !important;
  min-height: 0 !important;
}

// ─── Force-hide bottom navigation whenever any modal backdrop is present ───
.mobile-device-shell:has([class*="backdrop"]) .admin-bottom-nav,
.mobile-device-shell:has([class*="backdrop"]) .bottom-nav-bar,
.mobile-device-shell:has(.modal-backdrop) .admin-bottom-nav,
.mobile-device-shell:has(.modal-backdrop) .bottom-nav-bar {
  display: none !important;
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
}
</style>
