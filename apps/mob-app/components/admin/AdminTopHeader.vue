<template>
  <div class="admin-unified-top-bar">
    <!-- Right: Identity with Avatar, Title, Badge, Subtitle -->
    <div class="admin-identity">
      <div class="admin-avatar-ring">
        <i :class="icon || 'pi pi-shield'"></i>
      </div>
      <div class="admin-meta">
        <div class="name-badge-row">
          <h4 class="role-title">{{ title }}</h4>
          <span class="supervisor-badge">{{ t('Admin') }}</span>
        </div>
        <small class="facility-subline">{{ subtitle || t('Unity Clinics • Admin Portal') }}</small>
      </div>
    </div>

    <!-- Left: Switch back to Patient Mode (Icon only, Red) -->
    <button 
      class="switch-patient-mode-btn" 
      :aria-label="t('Patient Mode')" 
      :title="t('Patient Mode')" 
      @click="router.push('/')"
    >
      <i class="pi pi-sign-out"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    icon?: string;
  }>(),
  {
    subtitle: '',
    icon: 'pi pi-shield',
  }
);

const router = useRouter();
const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-unified-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 0 16px;
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .admin-identity .admin-meta {
      text-align: left;
    }
  }

  .admin-identity {
    display: flex;
    align-items: center;
    gap: 10px;

    .admin-avatar-ring {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      background: #ecfdf5;
      border: 1.5px solid #a7f3d0;
      color: #047857;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      flex-shrink: 0;
    }

    .admin-meta {
      display: flex;
      flex-direction: column;
      text-align: right;
      gap: 2px;

      .name-badge-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .role-title {
          font-size: 0.98rem;
          font-weight: 800;
          color: var(--unity-text-main);
          margin: 0;
          line-height: 1.2;
        }

        .supervisor-badge {
          background: #d1fae5;
          color: #065f46;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          line-height: 1.3;
        }
      }

      .facility-subline {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
        line-height: 1.2;
      }
    }
  }

  .switch-patient-mode-btn {
    width: 38px;
    height: 38px;
    padding: 0;
    border-radius: 12px;
    background: #fef2f2;
    border: 1.5px solid #fecaca;
    color: #ef4444;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 3px rgba(239, 68, 68, 0.08);
    transition: all 0.2s ease;
    flex-shrink: 0;

    i {
      font-size: 1.05rem;
      color: #ef4444;
      transition: all 0.2s ease;
    }

    &:hover {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #dc2626;

      i {
        color: #dc2626;
        transform: scale(1.08);
      }
    }

    &:active {
      transform: scale(0.95);
    }
  }
}
</style>

