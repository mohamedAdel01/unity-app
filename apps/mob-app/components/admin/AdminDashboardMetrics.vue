<template>
  <div class="metrics-grid">
    <div class="metric-card primary">
      <div class="metric-icon">
        <i class="pi pi-users"></i>
      </div>
      <div class="metric-info">
        <span class="label">{{ t('Total Patients') }}</span>
        <strong class="value">{{ kpis.total_patients }}</strong>
      </div>
    </div>

    <div class="metric-card success">
      <div class="metric-icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4.5 3v5a6.5 6.5 0 0 0 13 0V3"/>
          <path d="M3 3h3"/>
          <path d="M16 3h3"/>
          <path d="M11 14.5V18a3 3 0 0 0 6 0v-2"/>
          <circle cx="17" cy="16" r="2"/>
        </svg>
      </div>
      <div class="metric-info">
        <span class="label">{{ t('Active Doctors') }}</span>
        <strong class="value">{{ kpis.total_doctors }}</strong>
      </div>
    </div>

    <div class="metric-card warning">
      <div class="metric-icon">
        <i class="pi pi-calendar"></i>
      </div>
      <div class="metric-info">
        <span class="label">{{ t('Today Appointments') }}</span>
        <strong class="value">{{ kpis.today_appointments }}</strong>
      </div>
    </div>

    <div class="metric-card info">
      <div class="metric-icon">
        <i class="pi pi-wallet"></i>
      </div>
      <div class="metric-info">
        <span class="label">{{ t('Revenue') }}</span>
        <strong class="value">{{ kpis.total_revenue }} {{ t('EGP') }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

interface KPIs {
  total_patients: number;
  total_doctors: number;
  total_clinics: number;
  total_services: number;
  today_appointments: number;
  pending_appointments: number;
  completed_appointments: number;
  total_revenue: number;
}

defineProps<{
  kpis: KPIs;
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
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  .metric-card {
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    border-radius: 18px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

    .metric-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      flex-shrink: 0;
    }

    .metric-info {
      display: flex;
      flex-direction: column;

      .label {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
        font-weight: 600;
      }

      .value {
        font-size: 1.15rem;
        font-weight: 900;
        color: var(--unity-text-main);
        margin-top: 2px;
      }
    }

    &.primary .metric-icon {
      background: #ecfdf5;
      color: #047857;
    }

    &.success .metric-icon {
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
    }

    &.warning .metric-icon {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
    }

    &.info .metric-icon {
      background: rgba(59, 130, 246, 0.12);
      color: #3b82f6;
    }
  }
}
</style>

