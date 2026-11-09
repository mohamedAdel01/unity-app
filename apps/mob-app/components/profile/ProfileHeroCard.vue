<template>
  <div class="profile-hero-card">
    <!-- Left Edit Button -->
    <button class="edit-profile-btn" aria-label="Edit Profile" @click="emit('edit')">
      <i class="pi pi-pencil"></i>
    </button>

    <!-- Center/Right User Info & Avatar -->
    <div class="user-info-row">
      <div class="text-block">
        <h3 class="user-name">{{ user?.name || t('Ahmed Al-Salama') }}</h3>
        <div class="mrn-tag">
          <i class="pi pi-id-card"></i>
          <span>{{ t('File No:') }} {{ user?.mrn || user?.patient?.mrn || 'MRN-8849201' }}</span>
        </div>
      </div>

      <div class="avatar-wrapper">
        <img 
          :src="user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80'" 
          alt="Profile photo" 
        />
        <span class="active-status-dot"></span>
      </div>
    </div>
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

const { t } = useI18n();
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
    transition: all 0.2s;

    &:hover {
      background: var(--unity-border);
      color: var(--unity-text-main);
    }
  }

  .user-info-row {
    display: flex;
    align-items: center;
    gap: 14px;

    .text-block {
      text-align: end;

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

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #fff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      }

      .active-status-dot {
        position: absolute;
        bottom: 2px;
        inset-inline-start: 2px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #10b981;
        border: 2.5px solid #fff;
      }
    }
  }
}
</style>

