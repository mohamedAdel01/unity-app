<template>
  <header class="web-header">
    <div class="header-container">
      <!-- Brand Logo & Name -->
      <NuxtLink to="/" class="brand-link">
        <img src="/logo.webp" alt="Unity Specialized Clinics" class="brand-logo" />
        <div class="brand-titles">
          <span class="brand-name">{{ t('Unity Specialized Clinics') }}</span>
          <span class="brand-subtitle">{{ t('Official Medical Services & Patient Information Portal') }}</span>
        </div>
      </NuxtLink>

      <!-- Desktop Navigation Links -->
      <nav class="nav-links">
        <NuxtLink to="/" class="nav-link" :class="{ active: route.path === '/' }">
          <i class="pi pi-home"></i>
          <span>{{ t('Home') }}</span>
        </NuxtLink>
        <NuxtLink to="/services" class="nav-link" :class="{ active: route.path.startsWith('/services') }">
          <i class="pi pi-th-large"></i>
          <span>{{ t('Services & Labs') }}</span>
        </NuxtLink>
        <NuxtLink to="/offers" class="nav-link" :class="{ active: route.path.startsWith('/offers') }">
          <i class="pi pi-tag"></i>
          <span>{{ t('Medical Offers') }}</span>
        </NuxtLink>
        <NuxtLink 
          v-if="authStore.isAuthenticated && !authStore.isAdmin" 
          to="/appointments" 
          class="nav-link" 
          :class="{ active: route.path.startsWith('/appointments') }"
        >
          <i class="pi pi-calendar"></i>
          <span>{{ t('Appointments') }}</span>
        </NuxtLink>
        <NuxtLink 
          v-if="authStore.isAuthenticated && !authStore.isAdmin" 
          to="/records" 
          class="nav-link" 
          :class="{ active: route.path.startsWith('/records') }"
        >
          <i class="pi pi-file"></i>
          <span>{{ t('Medical Records') }}</span>
        </NuxtLink>
        <NuxtLink 
          v-if="authStore.isAdmin" 
          to="/admin" 
          class="nav-link admin-pill" 
          :class="{ active: route.path.startsWith('/admin') }"
        >
          <i class="pi pi-shield"></i>
          <span>{{ t('Control Panel') }}</span>
        </NuxtLink>
      </nav>

      <!-- Action Utilities -->
      <div class="header-actions">
        <!-- Book Now Primary Action -->
        <button 
          v-if="!authStore.isAdmin" 
          type="button" 
          class="book-cta-btn" 
          @click="bookingModal.openBookingFlow()"
        >
          <i class="pi pi-calendar-plus"></i>
          <span>{{ t('Book Appointment') }}</span>
        </button>

        <!-- User Authentication Pill -->
        <template v-if="authStore.isAuthenticated">
          <NuxtLink to="/profile" class="user-profile-pill" :title="t('My Account')">
            <span class="user-initial">{{ userInitial }}</span>
            <span class="user-name">{{ userName }}</span>
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/auth/login" class="login-action-btn">
            <i class="pi pi-user"></i>
            <span>{{ t('Login') }}</span>
          </NuxtLink>
        </template>

        <!-- Language Switcher -->
        <button 
          type="button" 
          class="tool-btn" 
          :title="locale === 'ar' ? 'Switch to English' : 'التحويل للعربية'" 
          @click="toggleLang"
        >
          <span class="lang-text">{{ locale === 'ar' ? 'EN' : 'عربي' }}</span>
        </button>

        <!-- Theme Switcher -->
        <button 
          type="button" 
          class="tool-btn" 
          :aria-label="t('Toggle Theme')" 
          @click="theme.toggleDark()"
        >
          <i :class="theme.currentTheme.value === 'dark' ? 'pi pi-sun' : 'pi pi-moon'"></i>
        </button>

        <!-- Mobile Menu Toggle Button -->
        <button 
          type="button" 
          class="mobile-menu-btn" 
          :aria-label="t('Menu')" 
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
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
        <NuxtLink to="/services" class="drawer-link" @click="isMobileMenuOpen = false">
          <i class="pi pi-th-large"></i>
          <span>{{ t('Services & Labs') }}</span>
        </NuxtLink>
        <NuxtLink to="/offers" class="drawer-link" @click="isMobileMenuOpen = false">
          <i class="pi pi-tag"></i>
          <span>{{ t('Medical Offers') }}</span>
        </NuxtLink>
        <NuxtLink 
          v-if="authStore.isAuthenticated && !authStore.isAdmin" 
          to="/appointments" 
          class="drawer-link" 
          @click="isMobileMenuOpen = false"
        >
          <i class="pi pi-calendar"></i>
          <span>{{ t('Appointments') }}</span>
        </NuxtLink>
        <NuxtLink 
          v-if="authStore.isAuthenticated && !authStore.isAdmin" 
          to="/records" 
          class="drawer-link" 
          @click="isMobileMenuOpen = false"
        >
          <i class="pi pi-file"></i>
          <span>{{ t('Medical Records') }}</span>
        </NuxtLink>
        <NuxtLink 
          v-if="authStore.isAdmin" 
          to="/admin" 
          class="drawer-link admin" 
          @click="isMobileMenuOpen = false"
        >
          <i class="pi pi-shield"></i>
          <span>{{ t('Control Panel') }}</span>
        </NuxtLink>

        <!-- Drawer Book Button -->
        <button 
          v-if="!authStore.isAdmin" 
          type="button" 
          class="drawer-book-btn" 
          @click="openModalFromDrawer"
        >
          <i class="pi pi-calendar-plus"></i>
          <span>{{ t('Book Appointment') }}</span>
        </button>

        <div class="drawer-footer-actions">
          <NuxtLink 
            v-if="!authStore.isAuthenticated" 
            to="/auth/login" 
            class="drawer-link" 
            @click="isMobileMenuOpen = false"
          >
            <i class="pi pi-user"></i>
            <span>{{ t('Login') }} / {{ t('Register New Account') }}</span>
          </NuxtLink>
          <NuxtLink 
            v-else 
            to="/profile" 
            class="drawer-link" 
            @click="isMobileMenuOpen = false"
          >
            <i class="pi pi-user-edit"></i>
            <span>{{ t('My Account') }} ({{ userName }})</span>
          </NuxtLink>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useTheme } from '../../composables/useTheme';
import { useAuthStore } from '../../stores/auth';
import { useBookingModal } from '../../composables/useBookingModal';

const route = useRoute();
const { t, locale, setLocale } = useI18n();
const theme = useTheme();
const authStore = useAuthStore();
const bookingModal = useBookingModal();

// 2. Data (refs, reactive state)
const isMobileMenuOpen = ref(false);

// 3. Computed (computed properties)
const userName = computed(() => {
  return authStore.user?.name || authStore.user?.full_name || t('Guest');
});

const userInitial = computed(() => {
  const name = userName.value.trim();
  return name.charAt(0).toUpperCase() || 'U';
});

// 4. Methods (functions, handlers)
const toggleLang = () => {
  setLocale(locale.value === 'ar' ? 'en' : 'ar');
};

const openModalFromDrawer = () => {
  isMobileMenuOpen.value = false;
  bookingModal.openBookingFlow();
};

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
  max-width: 1280px;
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;

  .brand-logo {
    width: 42px;
    height: 42px;
    object-fit: contain;
    border-radius: 12px;
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
      font-size: 0.72rem;
      color: var(--unity-text-muted);
      font-weight: 500;
      max-width: 220px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 900px) {
    display: none;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 12px;
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--unity-text-muted);
    text-decoration: none;
    transition: all 0.2s ease;

    i {
      font-size: 0.95rem;
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

    &.admin-pill {
      color: #b45309;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.25);
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;

  .book-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: 12px;
    background: var(--unity-primary);
    color: #fff;
    font-size: 0.86rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);
    transition: all 0.2s ease;

    &:hover {
      background: var(--unity-primary-dark, #065f46);
      transform: translateY(-1px);
    }

    @media (max-width: 640px) {
      display: none;
    }
  }

  .user-profile-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px 6px 6px;
    border-radius: 9999px;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    text-decoration: none;
    color: var(--unity-text-main);
    font-size: 0.84rem;
    font-weight: 700;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--unity-primary);
    }

    .user-initial {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--unity-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.76rem;
    }

    .user-name {
      max-width: 90px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .login-action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 12px;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-main);
    font-size: 0.85rem;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--unity-primary);
      color: var(--unity-primary);
    }
  }

  .tool-btn,
  .mobile-menu-btn {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-main);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    .lang-text {
      font-size: 0.78rem;
      font-weight: 800;
    }

    &:hover {
      border-color: var(--unity-primary);
      color: var(--unity-primary);
    }
  }

  .mobile-menu-btn {
    display: none;

    @media (max-width: 900px) {
      display: flex;
    }
  }
}

.mobile-drawer {
  padding: 16px 20px 24px;
  background: var(--unity-surface);
  border-top: 1px solid var(--unity-border);
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (min-width: 901px) {
    display: none;
  }

  .drawer-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--unity-text-main);
    text-decoration: none;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);

    i {
      font-size: 1.05rem;
      color: var(--unity-primary);
    }

    &:hover {
      background: var(--unity-primary-light);
      color: var(--unity-primary);
    }

    &.admin {
      color: #b45309;
      border-color: rgba(245, 158, 11, 0.3);
    }
  }

  .drawer-book-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: 12px;
    background: var(--unity-primary);
    color: #fff;
    font-size: 0.92rem;
    font-weight: 700;
    border: none;
    margin-top: 4px;
    cursor: pointer;
  }

  .drawer-footer-actions {
    margin-top: 8px;
    border-top: 1px solid var(--unity-border);
    padding-top: 8px;
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