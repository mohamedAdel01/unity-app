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

    <!-- Left: Switch back to Patient Mode (Unified Pill with Text & Icon) -->
    <button 
      class="switch-patient-mode-btn" 
      :aria-label="t('Patient Mode')" 
      :title="t('Patient Mode')" 
      @click="router.push('/')"
    >
      <span class="btn-text">{{ t('Patient Mode') }}</span>
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
    height: 36px;
    padding: 0 12px;
    border-radius: 12px;
    background: #ecfdf5;
    border: 1.5px solid #a7f3d0;
    color: #047857;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
    flex-shrink: 0;
    font-size: 0.78rem;
    font-weight: 700;

    .btn-text {
      white-space: nowrap;
    }

    i {
      font-size: 0.95rem;
      color: #047857;
      transition: color 0.2s ease;
    }

    &:hover {
      background: #d1fae5;
      border-color: #6ee7b7;
      color: #065f46;

      i {
        color: #065f46;
      }
    }
  }
}
</style>

