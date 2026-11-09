<template>
  <div class="user-card">
    <div class="avatar-holder">
      <img 
        v-if="user?.avatar"
        :src="user.avatar" 
        alt="Profile" 
      />
      <div v-else class="letter-avatar-initial">
        <span>{{ (user?.name || 'U').charAt(0).toUpperCase() }}</span>
      </div>
      <button class="edit-avatar-btn">
        <i class="pi pi-camera"></i>
      </button>
    </div>

    <div class="user-main-info">
      <h4>{{ user?.name || '' }}</h4>
      <p v-if="user?.phone" class="user-phone" dir="ltr">{{ user.phone }}</p>
      <span v-if="user?.mrn || user?.patient?.mrn" class="mrn-badge">
        <i class="pi pi-id-card"></i>
        <span>{{ t('profile.fileNumber') }} {{ user?.mrn || user?.patient?.mrn }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';

defineProps<{
  user?: any;
}>();

const { t } = useI18n();
</script>

<style scoped lang="scss">
.user-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 22px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--unity-shadow-subtle);

  .avatar-holder {
    position: relative;
    width: 68px;
    height: 68px;
    flex-shrink: 0;

    img, .letter-avatar-initial {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
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

    .edit-avatar-btn {
      position: absolute;
      bottom: 0;
      inset-inline-end: 0;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--unity-primary-dark);
      color: #fff;
      border: 2px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      cursor: pointer;
    }
  }

  .user-main-info {
    flex: 1;

    h4 {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    .user-phone {
      font-size: 0.8rem;
      color: var(--unity-text-muted);
      direction: ltr;
      text-align: right;
      margin: 2px 0 6px;
    }

    .mrn-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #ecfdf5;
      color: #047857;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 0.72rem;
      font-weight: 700;
    }
  }
}
</style>

