<template>
  <header class="web-header">
    <div class="header-container">
      <!-- Brand Logo & Name -->
      <NuxtLink to="/" class="brand-link">
        <img src="/logo.webp" alt="Unity Specialized Clinics" class="brand-logo" />
        <div class="brand-titles">
          <span class="brand-name">{{ t('Unity Specialized Clinics') }}</span>
          <span class="brand-subtitle">{{ t('Official Medical Portal') }}</span>
        </div>
      </NuxtLink>

      <!-- Desktop Navigation Links -->
      <nav class="nav-links">
        <NuxtLink to="/" class="nav-link" :class="{ active: route.path === '/' }">
          <i class="pi pi-home"></i>
          <span>{{ t('Home') }}</span>
        </NuxtLink>
        <NuxtLink to="/terms" class="nav-link" :class="{ active: route.path.startsWith('/terms') }">
          <i class="pi pi-shield"></i>
          <span>{{ t('Terms & Privacy Policy') }}</span>
        </NuxtLink>
        <NuxtLink to="/delete-account" class="nav-link" :class="{ active: route.path === '/delete-account' }">
          <i class="pi pi-user-minus"></i>
          <span>{{ t('Delete Account & Data') }}</span>
        </NuxtLink>
      </nav>

      <!-- Action Utilities (Theme Switcher & Mobile Menu Toggle) -->
      <div class="header-actions">
        <button class="theme-toggle-btn" @click="theme.toggleDark()" :aria-label="t('Toggle Theme')">
          <i :class="theme.currentTheme.value === 'dark' ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>

        <button class="mobile-menu-btn" @click="isMobileMenuOpen = !isMobileMenuOpen" :aria-label="t('Menu')">
          <i :class="isMobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <transition name="slide-fade">
      <div v-if="isMobileMenuOpen" class="mobile-drawer">
        <NuxtLink to="/" class="drawer-link" @click="isMobileMenuOpen = false">
          <i class="pi pi-home"></i>
          <span>{{ t('Home') }}</span>
        </NuxtLink>
        <NuxtLink to="/terms" class="drawer-link" @click="isMobileMenuOpen = false">
          <i class="pi pi-shield"></i>
          <span>{{ t('Terms & Privacy Policy') }}</span>
        </NuxtLink>
        <NuxtLink to="/delete-account" class="drawer-link" @click="isMobileMenuOpen = false">
          <i class="pi pi-user-minus"></i>
          <span>{{ t('Delete Account & Data') }}</span>
        </NuxtLink>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useTheme } from '../../composables/useTheme';

const route = useRoute();
const { t } = useI18n();
const theme = useTheme();

// 2. Data (refs, reactive state)
const isMobileMenuOpen = ref(false);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.web-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--unity-surface);
  border-bottom: 1px solid var(--unity-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background-color 0.25s ease, border-color 0.25s ease;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;

  .brand-logo {
    width: 44px;
    height: 44px;
    object-fit: contain;
    border-radius: 10px;
  }

  .brand-titles {
    display: flex;
    flex-direction: column;

    .brand-name {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--unity-primary);
      line-height: 1.25;
    }

    .brand-subtitle {
      font-size: 0.76rem;
      color: var(--unity-text-muted);
      font-weight: 500;
    }
  }
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    display: none;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--unity-text-muted);
    text-decoration: none;
    transition: all 0.2s ease;

    i {
      font-size: 1rem;
    }

    &:hover {
      color: var(--unity-primary);
      background: var(--unity-primary-light);
    }

    &.active {
      color: var(--unity-primary);
      background: var(--unity-primary-light);
      font-weight: 700;
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;

  .theme-toggle-btn,
  .mobile-menu-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-main);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.05rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--unity-primary);
      color: var(--unity-primary);
    }
  }

  .mobile-menu-btn {
    display: none;

    @media (max-width: 768px) {
      display: flex;
    }
  }
}

.mobile-drawer {
  padding: 16px 24px 20px;
  background: var(--unity-surface);
  border-top: 1px solid var(--unity-border);
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (min-width: 769px) {
    display: none;
  }

  .drawer-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--unity-text-main);
    text-decoration: none;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);

    i {
      font-size: 1.1rem;
      color: var(--unity-primary);
    }

    &:hover {
      background: var(--unity-primary-light);
      color: var(--unity-primary);
    }
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}
</style>
