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
          <span class="greeting-prefix">{{ t('Welcome,') }}</span>
          <span class="greeting-user">{{ currentUser?.name || '' }}</span>
        </h2>
      </div>
    </div>

    <div class="header-action-buttons">
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
import { computed, onMounted } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';
import { useNotifications } from '../../composables/useNotifications';
import { isUserUploadedPhoto, resolveAvatarUrl, getUserInitial } from '../../composables/useUserAvatar';

const api = useUnityApi();
const { t } = useI18n();
const bookingModal = useBookingModal();
const { unreadCount, NOTIFICATIONS } = useNotifications();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const currentUser = computed(() => api.currentUser.value);

const hasUserPhoto = computed(() => isUserUploadedPhoto(currentUser.value?.avatar));

const resolvedPhotoUrl = computed(() => resolveAvatarUrl(currentUser.value?.avatar));

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  NOTIFICATIONS();
});

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
    gap: 10px;

    .user-avatar-wrap {
      position: relative;
      width: 42px;
      height: 42px;

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
        background: linear-gradient(135deg, var(--unity-primary) 0%, var(--unity-accent) 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.05rem;
      }

      .online-indicator {
        position: absolute;
        bottom: 1px;
        inset-inline-start: 1px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--unity-accent);
        border: 2px solid var(--unity-surface);
      }
    }

    .user-details {
      display: flex;
      flex-direction: column;
      justify-content: center;

      .greeting-name {
        font-size: 0.94rem;
        margin: 0;
        line-height: 1.3;
        display: inline-flex;
        align-items: center;
        gap: 5px;

        .greeting-prefix {
          font-weight: 500;
          color: var(--unity-text-muted);
        }

        .greeting-user {
          font-weight: 700;
          color: var(--unity-text-main);
        }
      }
    }
  }

  .header-action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;

    .icon-action-btn {
      position: relative;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.05rem;
      cursor: pointer;
      box-shadow: var(--unity-shadow-subtle);
      transition: all 0.2s;

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
