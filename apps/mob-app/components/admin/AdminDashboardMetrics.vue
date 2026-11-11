<template>
  <section class="admin-metrics-section">
    <!-- Today Date & KPI Context Banner -->
    <div class="metrics-date-header">
      <div class="date-badge">
        <i class="pi pi-calendar"></i>
        <span class="date-text">{{ formattedDate }}</span>
      </div>
      <span class="metrics-context-label">{{ t("Today's Key Metrics") }}</span>
    </div>

    <!-- 4 KPI Metrics Grid -->
    <div class="metrics-grid">
      <!-- Total Patients -->
      <div class="metric-card primary">
        <div class="metric-icon">
          <i class="pi pi-users"></i>
        </div>
        <div class="metric-info">
          <span class="label">{{ t('Total Patients') }}</span>
          <strong class="value">{{ kpis.total_patients }}</strong>
        </div>
      </div>

      <!-- Active Doctors -->
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

      <!-- Today Appointments -->
      <div class="metric-card warning">
        <div class="metric-icon">
          <i class="pi pi-calendar"></i>
        </div>
        <div class="metric-info">
          <span class="label">{{ t('Today Appointments') }}</span>
          <strong class="value">{{ kpis.today_appointments }}</strong>
        </div>
      </div>

      <!-- Today's Revenue -->
      <div class="metric-card info">
        <div class="metric-icon">
          <i class="pi pi-wallet"></i>
        </div>
        <div class="metric-info">
          <span class="label">{{ t("Today's Revenue") }}</span>
          <strong class="value">{{ currentRevenue }} {{ t('EGP') }}</strong>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed } from 'vue';
import { useI18n } from '../../composables/useI18n';

interface KPIs {
  total_patients: number;
  total_doctors: number;
  total_clinics: number;
  total_services: number;
  today_appointments: number;
  pending_appointments: number;
  completed_appointments: number;
  today_revenue?: number;
  total_revenue: number;
  date?: string;
}

const props = defineProps<{
  kpis: KPIs;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const formattedDate = computed(() => {
  const d = props.kpis.date ? new Date(props.kpis.date) : new Date();
  const loc = isRtl.value ? 'ar-EG-u-nu-latn' : 'en-US';
  return new Intl.DateTimeFormat(loc, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
});

const currentRevenue = computed(() => {
  return props.kpis.today_revenue !== undefined ? props.kpis.today_revenue : props.kpis.total_revenue;
});

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-metrics-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  .metrics-date-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;

    .date-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--unity-surface, #ffffff);
      border: 1px solid var(--unity-border, #e2e8f0);
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--unity-primary, #059669);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

      i {
        font-size: 0.82rem;
      }

      .date-text {
        letter-spacing: -0.2px;
      }
    }

    .metrics-context-label {
      font-size: 0.74rem;
      color: var(--unity-text-muted, #64748b);
      font-weight: 600;
    }
  }

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
}
</style>
