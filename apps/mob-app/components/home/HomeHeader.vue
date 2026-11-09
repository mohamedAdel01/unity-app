<template>
  <header class="app-header">
    <div class="user-greeting-box">
      <div class="user-avatar-wrap">
        <img 
          :src="resolveAvatar(currentUser?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'" 
          alt="User Avatar"
        />
        <span class="online-indicator"></span>
      </div>
      <div class="user-details">
        <div class="location-tag">
          <i class="pi pi-map-marker"></i>
          <span>{{ t('home.location') }}</span>
        </div>
        <h2 class="greeting-name">
          {{ t('home.welcomePrefix') }} {{ currentUser?.name || t('profile.defaultUserName') }}
        </h2>
      </div>
    </div>

    <div class="header-action-buttons">
      <!-- Language Switcher (AR / EN) -->
      <button 
        class="icon-action-btn lang-toggle-btn" 
        :aria-label="isRtl ? 'Switch to English' : 'التبديل إلى العربية'"
        @click="toggleLanguage"
      >
        <span class="lang-text">{{ isRtl ? 'EN' : 'ع' }}</span>
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
import { ref, computed } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useTheme } from '../../composables/useTheme';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';

const api = useUnityApi();
const theme = useTheme();
const { t, locale, setLocale, isRtl } = useI18n();
const bookingModal = useBookingModal();

const currentUser = ref<any>(api.currentUser.value);
const unreadCount = ref(2);

const resolveAvatar = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
    return url;
  }
  const config = useRuntimeConfig();
  const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
  return `${baseUrl}${url}`;
};

const themeIcon = computed(() => {
  if (theme.currentTheme.value === 'dark') return 'pi pi-sun';
  if (theme.currentTheme.value === 'teal') return 'pi pi-palette';
  return 'pi pi-moon';
});

const toggleTheme = () => {
  if (theme.currentTheme.value === 'emerald') {
    theme.applyTheme('teal');
  } else if (theme.currentTheme.value === 'teal') {
    theme.applyTheme('dark');
  } else {
    theme.applyTheme('emerald');
  }
};

const toggleLanguage = () => {
  setLocale(locale.value === 'ar' ? 'en' : 'ar');
};
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

      .location-tag {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.72rem;
        color: var(--unity-text-muted);

        i {
          font-size: 0.72rem;
          color: var(--unity-primary);
        }
      }

      .greeting-name {
        font-size: 1rem;
        font-weight: 600;
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

