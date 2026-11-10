<template>
  <div class="admin-clinic-card">
    <div class="card-top">
      <div class="icon-box clinic">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/>
          <path d="M9 21v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
          <path d="M10 8h4"/>
          <path d="M12 6v4"/>
        </svg>
      </div>

      <div class="entity-info">
        <h4>{{ clinic.name }}</h4>
        <span>{{ clinic.doctors_count }} {{ t('Certified Doctors') }} • {{ t('Active Clinic') }}</span>
      </div>

      <button 
        type="button"
        class="unity-switch-toggle" 
        :class="{ 'active': clinic.is_active }"
        :aria-checked="clinic.is_active"
        role="switch"
        :title="clinic.is_active ? t('Active') : t('Inactive')"
        @click.stop="emit('toggle-status', clinic)"
      >
        <span class="switch-slider"></span>
      </button>
    </div>

    <div class="card-footer">
      <span class="capacity-text">
        <i class="pi pi-users"></i>
        <span>{{ clinic.doctors_count }} {{ t('Doctors') }}</span>
      </span>

      <button 
        type="button" 
        class="btn-card-edit" 
        :title="t('Edit Clinic')"
        @click.stop="emit('edit', clinic)"
      >
        <i class="pi pi-pencil"></i>
        <span>{{ t('Edit') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

interface Clinic {
  id: string | number;
  name: string;
  doctors_count: number;
  is_active: boolean;
}

const props = defineProps<{
  clinic: Clinic;
}>();

const emit = defineEmits<{
  (e: 'toggle-status', clinic: Clinic): void;
  (e: 'edit', clinic: Clinic): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-clinic-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s;

  .card-top {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-box {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;

      svg {
        width: 22px;
        height: 22px;
      }

      &.clinic {
        background: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
      }
    }

    .entity-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      text-align: right;

      h4 {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--unity-text-main);
        margin: 0;
      }

      span {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
      }
    }

    .unity-switch-toggle {
      position: relative;
      width: 46px;
      height: 26px;
      border-radius: 9999px;
      background: #cbd5e1;
      border: none;
      padding: 2px;
      cursor: pointer;
      outline: none;
      display: inline-flex;
      align-items: center;
      transition: background-color 0.25s ease;
      flex-shrink: 0;
      direction: ltr;

      .switch-slider {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateX(0);
      }

      &.active {
        background: #059669;

        .switch-slider {
          transform: translateX(20px);
        }
      }

      &:focus-visible {
        box-shadow: 0 0 0 2px #fff, 0 0 0 4px #059669;
      }
    }
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--unity-border);
    padding-top: 10px;

    .capacity-text {
      font-size: 0.75rem;
      color: var(--unity-text-muted);
      display: inline-flex;
      align-items: center;
      gap: 6px;

      i {
        color: var(--unity-primary);
      }
    }

    .btn-card-edit {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 10px;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-main);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;

      i {
        font-size: 0.75rem;
        color: var(--unity-primary);
      }

      &:hover {
        background: var(--unity-primary-light);
        border-color: var(--unity-primary);
        color: var(--unity-primary);
      }
    }
  }
}
</style>
