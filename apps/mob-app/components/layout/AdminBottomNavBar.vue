<template>
  <div v-show="!isAnyModalOpen" class="admin-nav-wrapper">
    <!-- Backdrop overlay for the Gear dropdown menu -->
    <div 
      v-if="isMoreMenuOpen" 
      class="more-menu-backdrop" 
      @click="isMoreMenuOpen = false" 
    />

    <!-- Gear Dropdown / Popup Menu (All remaining sections + Profile & Logout) -->
    <Transition name="menu-pop">
      <div v-if="isMoreMenuOpen" class="admin-more-dropdown-menu">
        <div class="dropdown-header">
          <div class="header-chip">
            <i class="pi pi-cog"></i>
            <span>{{ t('More Options') }}</span>
          </div>
          <button type="button" class="close-menu-btn" :aria-label="t('Close')" @click="isMoreMenuOpen = false">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="dropdown-links-list">
          <!-- 1. Patient Records / سجلات المرضى -->
          <NuxtLink 
            to="/admin/patients" 
            class="menu-link-item" 
            :class="{ 'is-active': route.path.startsWith('/admin/patients') }"
            @click="isMoreMenuOpen = false"
          >
            <div class="link-icon icon-patients">
              <i class="pi pi-users"></i>
            </div>
            <div class="link-info">
              <span class="link-title">{{ t('Patients Records') }}</span>
              <small class="link-sub">{{ t('Manage patient profiles and files') }}</small>
            </div>
            <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'link-arrow']"></i>
          </NuxtLink>

          <!-- 2. Offers & Promo Codes / العروض وأكواد الخصم -->
          <NuxtLink 
            to="/admin/promotions" 
            class="menu-link-item"
            :class="{ 'is-active': route.path.startsWith('/admin/promotions') }"
            @click="isMoreMenuOpen = false"
          >
            <div class="link-icon icon-promos">
              <i class="pi pi-tag"></i>
            </div>
            <div class="link-info">
              <span class="link-title">{{ t('Offers & Promo Codes') }}</span>
              <small class="link-sub">{{ t('Manage promotions and discounts') }}</small>
            </div>
            <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'link-arrow']"></i>
          </NuxtLink>

          <!-- 3. Profile / حسابي -->
          <NuxtLink 
            to="/profile" 
            class="menu-link-item"
            :class="{ 'is-active': route.path === '/profile' }"
            @click="isMoreMenuOpen = false"
          >
            <div class="link-icon icon-profile">
              <i class="pi pi-user"></i>
            </div>
            <div class="link-info">
              <span class="link-title">{{ t('My Profile') }}</span>
              <small class="link-sub">{{ t('Account and security settings') }}</small>
            </div>
            <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'link-arrow']"></i>
          </NuxtLink>

          <div class="menu-divider" />

          <!-- 4. Sign Out / تسجيل الخروج -->
          <button type="button" class="menu-link-item item-logout" @click="handleLogout">
            <div class="link-icon icon-logout">
              <i class="pi pi-sign-out"></i>
            </div>
            <div class="link-info">
              <span class="link-title">{{ t('Sign Out') }}</span>
            </div>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Bottom Nav Bar -->
    <nav class="admin-bottom-nav" :class="{ 'is-modal-hidden': isAnyModalOpen, 'reception-nav': authStore.isReceptionist }">
      <template v-if="authStore.isReceptionist">
        <!-- Reception Tab 1: Bookings / الحجوزات -->
        <NuxtLink to="/admin/appointments" class="admin-nav-btn" :class="{ 'active': route.path.startsWith('/admin/appointments') }">
          <i class="pi pi-calendar"></i>
          <span>{{ t('Bookings') }}</span>
        </NuxtLink>

        <!-- Reception Tab 2: Patients / المرضى -->
        <NuxtLink to="/admin/patients" class="admin-nav-btn" :class="{ 'active': route.path.startsWith('/admin/patients') }">
          <i class="pi pi-users"></i>
          <span>{{ t('Patients') }}</span>
        </NuxtLink>

        <!-- Reception Tab 3: Profile / حسابي -->
        <NuxtLink to="/profile" class="admin-nav-btn" :class="{ 'active': route.path === '/profile' }">
          <i class="pi pi-user"></i>
          <span>{{ t('Profile') }}</span>
        </NuxtLink>
      </template>

      <template v-else>
        <!-- Tab 1: Overview / نظرة عامة -->
        <NuxtLink to="/admin" class="admin-nav-btn" :class="{ 'active': route.path === '/admin' }">
          <i class="pi pi-th-large"></i>
          <span>{{ t('Overview') }}</span>
        </NuxtLink>

        <!-- Tab 2: Clinics / عيادات -->
        <NuxtLink to="/admin/doctors" class="admin-nav-btn" :class="{ 'active': route.path.startsWith('/admin/doctors') || route.path.startsWith('/admin/clinics') }">
          <i class="pi pi-building"></i>
          <span>{{ t('Clinics') }}</span>
        </NuxtLink>

        <!-- Tab 3: Services / الخدمات -->
        <NuxtLink to="/admin/services" class="admin-nav-btn" :class="{ 'active': route.path.startsWith('/admin/services') }">
          <svg viewBox="0 0 24 24" class="nav-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 18h8"/>
            <path d="M3 22h18"/>
            <path d="M14 22a7 7 0 1 0 0-14h-1"/>
            <path d="M9 14h2"/>
            <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/>
            <path d="M12 6V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/>
          </svg>
          <span>{{ t('Services') }}</span>
        </NuxtLink>

        <!-- Tab 4: Bookings / الحجوزات (Replaced Patients per user request) -->
        <NuxtLink to="/admin/appointments" class="admin-nav-btn" :class="{ 'active': route.path.startsWith('/admin/appointments') }">
          <i class="pi pi-calendar"></i>
          <span>{{ t('Bookings') }}</span>
        </NuxtLink>

        <!-- Tab 5: Gear Button / الترس (Opens dropdown with remaining items + Profile) -->
        <button 
          type="button" 
          class="admin-nav-btn gear-menu-btn" 
          :class="{ 'active': isMoreMenuActive || isMoreMenuOpen }"
          :aria-expanded="isMoreMenuOpen"
          :title="t('More')"
          @click="toggleMoreMenu"
        >
          <i class="pi pi-cog" :class="{ 'gear-rotate': isMoreMenuOpen }"></i>
          <span>{{ t('More') }}</span>
        </button>
      </template>
    </nav>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useAuthStore } from '../../stores/auth';
import { useModalState } from '../../composables/useModalState';

const route = useRoute();
const router = useRouter();
const { t, isRtl } = useI18n();
const authStore = useAuthStore();
const { isAnyModalOpen } = useModalState();

// 2. Data (refs, reactive state)
const isMoreMenuOpen = ref(false);

// 3. Computed (computed properties)
const isMoreMenuActive = computed(() => {
  return (
    route.path.startsWith('/admin/patients') || 
    route.path.startsWith('/admin/promotions') || 
    route.path === '/profile'
  );
});

// 4. Methods (functions, handlers)
const toggleMoreMenu = () => {
  isMoreMenuOpen.value = !isMoreMenuOpen.value;
};

const handleLogout = async () => {
  isMoreMenuOpen.value = false;
  authStore.logout();
  await router.push('/auth/login');
};

// 5. Watches (watch, watchEffect)
watch(() => route.path, () => {
  isMoreMenuOpen.value = false;
});

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-nav-wrapper {
  position: relative;
  z-index: 45;
}

// Backdrop overlay
.more-menu-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 46;
  animation: fadeIn 0.2s ease forwards;
}

// Dropdown / Popup Menu
.admin-more-dropdown-menu {
  position: absolute;
  bottom: calc(max(14px, env(safe-area-inset-bottom, 14px)) + 74px);
  left: 16px;
  right: 16px;
  background: var(--unity-surface, #ffffff);
  border: 1.5px solid var(--unity-border, #e2e8f0);
  border-radius: 24px;
  padding: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.14), 0 4px 12px rgba(0, 0, 0, 0.06);
  z-index: 47;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .dropdown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--unity-border, #e2e8f0);

    .header-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.84rem;
      font-weight: 800;
      color: var(--unity-primary);

      i {
        font-size: 0.95rem;
      }
    }

    .close-menu-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background: var(--unity-surface-muted, #f1f5f9);
      color: var(--unity-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.76rem;
      transition: all 0.2s ease;

      &:hover {
        background: #fee2e2;
        color: #ef4444;
      }
    }
  }

  .dropdown-links-list {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .menu-link-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 16px;
      text-decoration: none;
      color: var(--unity-text-main);
      background: transparent;
      border: none;
      width: 100%;
      cursor: pointer;
      text-align: start;
      transition: all 0.2s ease;

      .link-icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 1rem;

        &.icon-patients {
          background: #eff6ff;
          color: #2563eb;
        }

        &.icon-promos {
          background: #fff7ed;
          color: #ea580c;
        }

        &.icon-profile {
          background: #ecfdf5;
          color: #047857;
        }

        &.icon-logout {
          background: #fef2f2;
          color: #dc2626;
        }
      }

      .link-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;

        .link-title {
          font-size: 0.86rem;
          font-weight: 700;
          color: var(--unity-text-main);
        }

        .link-sub {
          font-size: 0.70rem;
          color: var(--unity-text-dim);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .link-arrow {
        font-size: 0.76rem;
        color: var(--unity-text-dim);
      }

      &:hover,
      &.is-active {
        background: var(--unity-surface-muted, #f8fafc);
        transform: translateX(-2px);

        .link-arrow {
          color: var(--unity-primary);
        }
      }

      &.item-logout {
        .link-title {
          color: #dc2626;
        }

        &:hover {
          background: #fef2f2;
        }
      }
    }

    .menu-divider {
      height: 1px;
      background: var(--unity-border, #e2e8f0);
      margin: 4px 6px;
    }
  }
}

// Nav bar
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

  &.is-modal-hidden {
    display: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
    transform: translateY(200%) !important;
  }

  &.reception-nav {
    justify-content: space-evenly;

    .admin-nav-btn {
      min-width: 80px;
      max-width: 100px;
      font-size: 0.68rem;
    }
  }

  .admin-nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: var(--unity-text-muted);
    text-decoration: none;
    font-size: 0.61rem;
    font-weight: 700;
    min-width: 58px;
    max-width: 70px;
    height: 48px;
    border-radius: 24px;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    span {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 100%;
      text-align: center;
      padding: 0 2px;
    }

    i, .nav-svg {
      font-size: 1.2rem;
      width: 20px;
      height: 20px;
      transition: transform 0.2s ease;
    }

    .gear-rotate {
      transform: rotate(45deg);
      color: var(--unity-primary);
    }

    &:hover {
      color: var(--unity-primary);
    }

    &.active {
      color: var(--unity-primary-dark);
      background: var(--unity-primary-light);
      font-weight: 700;

      i, .nav-svg {
        transform: scale(1.12);
        color: var(--unity-primary);
      }
    }
  }
}

// Transitions
.menu-pop-enter-active,
.menu-pop-leave-active {
  transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
