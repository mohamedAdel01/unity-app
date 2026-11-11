<template>
  <nav class="bottom-nav-bar">
    <!-- Tab 1: Home -->
    <NuxtLink to="/" class="nav-btn" :class="{ 'active': route.path === '/' }">
      <i class="pi pi-home"></i>
      <span>{{ t('Home') }}</span>
    </NuxtLink>

    <!-- Tab 2: Bookings (حجوزاتي) -->
    <NuxtLink to="/appointments" class="nav-btn" :class="{ 'active': route.path === '/appointments' }">
      <i class="pi pi-calendar"></i>
      <span>{{ t('My Bookings') }}</span>
    </NuxtLink>

    <!-- Tab 3: Center Floating Plus (+) Button -->
    <div class="center-fab-wrapper">
      <button 
        class="center-fab-btn" 
        :aria-label="t('What would you like to book today?')"
        @click="bookingModal.openQuickBook"
      >
        <i class="pi pi-plus"></i>
      </button>
      <span class="fab-label">{{ t('Book') }}</span>
    </div>

    <!-- Tab 4: Records -->
    <NuxtLink to="/records" class="nav-btn" :class="{ 'active': route.path === '/records' }">
      <i class="pi pi-file"></i>
      <span>{{ t('Records') }}</span>
    </NuxtLink>

    <!-- Tab 5: Profile -->
    <NuxtLink to="/profile" class="nav-btn" :class="{ 'active': route.path === '/profile' }">
      <i class="pi pi-user"></i>
      <span>{{ t('Profile') }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRoute } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';

const route = useRoute();

const { t } = useI18n();

const bookingModal = useBookingModal();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.bottom-nav-bar {
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

  .nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: var(--unity-text-muted);
    text-decoration: none;
    font-size: 0.72rem;
    font-weight: 700;
    width: 58px;
    height: 48px;
    border-radius: 24px;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    i {
      font-size: 1.2rem;
      transition: transform 0.2s ease;
    }

    &:hover {
      color: var(--unity-primary);
    }

    &.active {
      color: var(--unity-active-tab-text, var(--unity-primary-dark));
      background: var(--unity-primary-light);

      i {
        transform: scale(1.12);
        color: var(--unity-primary);
      }
    }
  }

  // Center FAB Button (+)
  .center-fab-wrapper {
    position: relative;
    top: -16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;

    .center-fab-btn {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--unity-primary);
      color: #ffffff;
      border: 4px solid var(--unity-navbar-fab-border, rgba(255, 255, 255, 0.85));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(4, 120, 87, 0.16);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:hover {
        transform: scale(1.08) rotate(90deg);
        background: var(--unity-primary-dark);
        box-shadow: 0 4px 14px rgba(4, 120, 87, 0.22);
      }

      &:active {
        transform: scale(0.95);
      }
    }

    .fab-label {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--unity-text-muted);
      margin-top: 1px;
    }
  }
}
</style>
