<template>
  <header class="app-header">
    <div class="user-greeting-box">
      <div class="user-avatar-wrap">
        <img 
          v-if="hasUserPhoto"
          :src="resolvedPhotoUrl" 
          alt="User Avatar"
        />
        <div v-else class="user-avatar-initial">
          <span>{{ getUserInitial(currentUser?.name) }}</span>
        </div>
        <span class="online-indicator"></span>
      </div>
      <div class="user-details">
        <h2 class="greeting-name">
          {{ t('Welcome,') }} {{ currentUser?.name || '' }}
        </h2>
      </div>
    </div>

    <div class="header-action-buttons">
      <!-- Language Switcher (AR / EN) -->
      <button 
        class="icon-action-btn lang-toggle-btn" 
        :aria-label="t('Switch to English')"
        @click="toggleLanguage"
      >
        <span class="lang-text">{{ t('EN') }}</span>
      </button>

      <!-- Theme Switcher -->
      <button 
        class="icon-action-btn theme-toggle-btn" 
        aria-label="Theme Toggle"
        @click="toggleTheme"
      >
        <i :class="themeIcon"></i>
      </button>

      <!-- Notification Bell -->
      <button 
        class="icon-action-btn notif-bell-btn" 
        aria-label="Notifications"
        @click="bookingModal.openNotifications"
      >
        <i class="pi pi-bell"></i>
        <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useTheme } from '../../composables/useTheme';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';
import { isUserUploadedPhoto, resolveAvatarUrl, getUserInitial } from '../../composables/useUserAvatar';

const api = useUnityApi();

const theme = useTheme();

const { t, locale, setLocale } = useI18n();

const bookingModal = useBookingModal();

// 2. Data (refs, reactive state)
const unreadCount = ref(0);

// 3. Computed (computed properties)
const currentUser = computed(() => api.currentUser.value);

const hasUserPhoto = computed(() => isUserUploadedPhoto(currentUser.value?.avatar));

const resolvedPhotoUrl = computed(() => resolveAvatarUrl(currentUser.value?.avatar));

const themeIcon = computed(() => {
  return theme.currentTheme.value === 'dark' ? 'pi pi-sun' : 'pi pi-moon';
});

// 4. Methods (functions, handlers)
const toggleTheme = () => {
  theme.toggleDark();
};

const toggleLanguage = () => {
  setLocale(locale.value === 'ar' ? 'en' : 'ar');
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .user-greeting-box {
    display: flex;
    align-items: center;
    gap: 12px;

    .user-avatar-wrap {
      position: relative;
      width: 46px;
      height: 46px;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      .user-avatar-initial {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, #047857 0%, #10b981 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.15rem;
      }

      .online-indicator {
        position: absolute;
        bottom: 2px;
        inset-inline-start: 2px;
        width: 11px;
        height: 11px;
        border-radius: 50%;
        background: #10b981;
        border: 2px solid #fff;
      }
    }

    .user-details {
      display: flex;
      flex-direction: column;
      justify-content: center;

      .greeting-name {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }
    }
  }

  .header-action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;

    .icon-action-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: var(--unity-shadow-subtle);
      transition: all 0.2s;

      .lang-text {
        font-size: 0.85rem;
        font-weight: 800;
        color: var(--unity-primary);
      }

      &:hover {
        background: var(--unity-primary-light);
        color: var(--unity-primary);
      }

      .notif-badge {
        position: absolute;
        top: 2px;
        inset-inline-end: 2px;
        background: #ef4444;
        color: #fff;
        font-size: 0.65rem;
        font-weight: 800;
        width: 17px;
        height: 17px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--unity-surface);
      }
    }
  }
}
</style>
