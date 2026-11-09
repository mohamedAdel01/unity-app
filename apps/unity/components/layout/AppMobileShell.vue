<template>
  <div class="web-viewport-wrapper">
    <div class="desktop-screen-frame">
      <div class="mobile-device-shell" :dir="isRtl ? 'rtl' : 'ltr'">
        <!-- Native Phone Status Bar -->
        <MobileStatusBar />

        <!-- Main Page Scrollable Viewport -->
        <main class="mobile-content-viewport" :class="{ 'no-bottom-nav': isAuthRoute }">
          <slot />
        </main>

        <!-- Bottom Navigation Bar with Center Floating Plus Action -->
        <BottomNavBar v-if="!isAuthRoute" />

        <!-- Global Modals (Quick Book, Notifications, Booking Checkout) -->
        <AppGlobalModals />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTheme } from '../../composables/useTheme';
import { useI18n } from '../../composables/useI18n';
import MobileStatusBar from './MobileStatusBar.vue';
import BottomNavBar from './BottomNavBar.vue';
import AppGlobalModals from './AppGlobalModals.vue';

const route = useRoute();
const theme = useTheme();
const { isRtl, initLocale } = useI18n();

const isAuthRoute = computed(() => {
  return route.path.startsWith('/auth');
});

onMounted(() => {
  theme.initTheme();
  initLocale();
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
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 96px;
  background: var(--unity-bg);
  scroll-behavior: smooth;

  &.no-bottom-nav {
    padding-bottom: 24px;
  }
}
</style>

