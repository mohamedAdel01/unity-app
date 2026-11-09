<template>
  <div class="profile-hero-card" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- User Info & Avatar (Positioned on the right in RTL) -->
    <div class="user-info-row">
      <div class="avatar-wrapper">
        <img 
          v-if="resolveAvatar(user?.avatar)"
          :src="resolveAvatar(user?.avatar)" 
          alt="Profile photo" 
        />
        <div v-else class="letter-avatar-initial">
          <span>{{ (user?.name || 'U').charAt(0).toUpperCase() }}</span>
        </div>
        <span class="active-status-dot"></span>
      </div>

      <div class="text-block">
        <h3 class="user-name">{{ user?.name || '' }}</h3>
        <div v-if="user?.mrn || user?.patient?.mrn" class="mrn-tag">
          <i class="pi pi-id-card"></i>
          <span>{{ t('File No:') }} {{ user?.mrn || user?.patient?.mrn }}</span>
        </div>
        <div v-else-if="user?.phone" class="phone-sub-tag" dir="ltr">
          <span>{{ user.phone }}</span>
        </div>
      </div>
    </div>

    <!-- Edit Profile Button (Positioned on the left in RTL) -->
    <button class="edit-profile-btn" aria-label="Edit Profile" @click="emit('edit')">
      <i class="pi pi-pencil"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';

defineProps<{
  user?: any;
}>();

const emit = defineEmits<{
  (e: 'edit'): void;
}>();

const { t, isRtl } = useI18n();

const resolveAvatar = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
    return url;
  }
  const config = useRuntimeConfig();
  const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
  return `${baseUrl}${url}`;
};
</script>

<style scoped lang="scss">
.profile-hero-card {
  position: relative;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 24px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--unity-shadow-subtle);
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .user-info-row .text-block {
      text-align: left;
    }
  }

  .user-info-row {
    display: flex;
    align-items: center;
    gap: 14px;

    .text-block {
      text-align: right;

      .user-name {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      .mrn-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--unity-primary);
        font-size: 0.78rem;
        font-weight: 600;
        margin-top: 4px;

        i {
          font-size: 0.8rem;
        }
      }
    }

    .avatar-wrapper {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      flex-shrink: 0;

      img, .letter-avatar-initial {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #fff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      }

      .letter-avatar-initial {
        background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.6rem;
        font-weight: 800;
        user-select: none;
      }

      .active-status-dot {
        position: absolute;
        bottom: 2px;
        inset-inline-end: 2px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #10b981;
        border: 2.5px solid #fff;
      }
    }
  }

  .edit-profile-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.85rem;
    flex-shrink: 0;
    transition: all 0.2s;

    &:hover {
      background: var(--unity-border);
      color: var(--unity-text-main);
    }
  }
}
</style>

