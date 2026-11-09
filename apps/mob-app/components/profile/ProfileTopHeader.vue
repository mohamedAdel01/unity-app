<template>
  <header class="profile-top-header">
    <div class="user-avatar-btn" @click="router.push('/profile')">
      <img 
        :src="user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'" 
        alt="Avatar" 
      />
    </div>

    <div class="title-with-badge">
      <span class="care-badge">
        <i class="pi pi-plus"></i>
        <span>{{ t('Sehaty Care') }}</span>
      </span>
      <h3 class="page-title">{{ t('Profile & Settings') }}</h3>
    </div>

    <button class="notif-btn" aria-label="Notifications" @click="bookingModal.openNotifications">
      <i class="pi pi-bell"></i>
      <span class="notif-dot"></span>
    </button>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';

defineProps<{
  user?: any;
}>();

const router = useRouter();
const { t } = useI18n();
const bookingModal = useBookingModal();
</script>

<style scoped lang="scss">
.profile-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 12px;

  .user-avatar-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--unity-border);
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .title-with-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;

    .care-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      background: #ecfdf5;
      color: #047857;
      font-size: 0.68rem;
      font-weight: 600;

      i {
        font-size: 0.65rem;
      }
    }

    .page-title {
      font-size: 1.08rem;
      font-weight: 700;
      color: var(--unity-text-main);
    }
  }

  .notif-btn {
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
    cursor: pointer;
    font-size: 1rem;
    box-shadow: var(--unity-shadow-subtle);

    .notif-dot {
      position: absolute;
      top: 9px;
      inset-inline-end: 9px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ef4444;
      border: 1.5px solid #fff;
    }
  }
}
</style>

