<template>
  <div class="admin-bookings-header">
    <!-- 1. Top Supervisor Identity Bar (Unified) -->
    <AdminTopHeader 
      :title="t('Bookings')"
      icon="pi pi-calendar"
      :action-text="t('New Booking')"
      action-icon="pi pi-plus"
      @action="emit('new-booking')"
    />

    <!-- 2. Dual Metrics Summary Cards: Total Bookings & Total Paid -->
    <div class="metrics-summary-row">
      <!-- Card 1: Total Bookings (إجمالي الحجوزات) -->
      <div class="metric-summary-card">
        <div class="card-inner-top">
          <span class="card-label">{{ t('Total Bookings') }}</span>
          <div class="icon-bubble primary">
            <i class="pi pi-calendar"></i>
          </div>
        </div>
        <div class="card-value-line">
          <strong class="value-digits">{{ totalCount || 0 }}</strong>
          <span class="value-unit">{{ t('Booking') }}</span>
        </div>
        <div class="card-footer-info">
          <span>{{ t('Today') }}: <strong>{{ stats.today_appointments ?? todayCount ?? 0 }}</strong></span>
        </div>
      </div>

      <!-- Card 2: Total Paid (إجمالي المدفوع) -->
      <div class="metric-summary-card">
        <div class="card-inner-top">
          <span class="card-label">{{ t('Total Paid') }}</span>
          <div class="icon-bubble success">
            <i class="pi pi-wallet"></i>
          </div>
        </div>
        <div class="card-value-line">
          <strong class="value-digits">{{ formatNumber(totalPaidAmount || stats.total_revenue || 0) }}</strong>
          <span class="value-unit">{{ t('EGP') }}</span>
        </div>
        <div class="card-footer-info">
          <span>{{ t('Today') }}: <strong>{{ formatNumber(stats.today_revenue || 0) }} {{ t('EGP') }}</strong></span>
        </div>
      </div>
    </div>

    <!-- 3. Quick Time Filters -->
    <div class="quick-filters-row">
      <button 
        type="button" 
        class="time-filter-pill" 
        :class="{ 'active': activePeriod === 'all' }"
        @click="selectPeriod('all')"
      >
        <span>{{ t('All') }} ({{ totalCount || 0 }})</span>
      </button>

      <button 
        type="button" 
        class="time-filter-pill" 
        :class="{ 'active': activePeriod === 'today' }"
        @click="selectPeriod('today')"
      >
        <i class="pi pi-clock"></i>
        <span>{{ t('Today') }} ({{ stats.today_appointments ?? todayCount ?? 0 }})</span>
      </button>

      <button 
        type="button" 
        class="time-filter-pill" 
        :class="{ 'active': activePeriod === 'week' }"
        @click="selectPeriod('week')"
      >
        <span>{{ t('This Week') }}</span>
      </button>

      <button 
        type="button" 
        class="time-filter-pill with-red-dot" 
        :class="{ 'active': activePeriod === 'pending' }"
        @click="selectPeriod('pending')"
      >
        <span v-if="(pendingCount || 0) > 0" class="red-alert-dot"></span>
        <span>{{ t('Awaiting Confirmation') }} ({{ pendingCount || 0 }})</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';
import AdminTopHeader from './AdminTopHeader.vue';

const props = withDefaults(
  defineProps<{
    stats?: {
      today_revenue?: number;
      today_paid_invoices?: number;
      pending_invoices?: number;
      today_appointments?: number;
      total_revenue?: number;
    };
    totalCount?: number;
    todayCount?: number;
    pendingCount?: number;
    totalPaidAmount?: number;
    activePeriod?: 'all' | 'today' | 'week' | 'pending';
  }>(),
  {
    stats: () => ({
      today_revenue: 0,
      today_paid_invoices: 0,
      pending_invoices: 0,
      today_appointments: 0,
      total_revenue: 0,
    }),
    totalCount: 0,
    todayCount: 0,
    pendingCount: 0,
    totalPaidAmount: 0,
    activePeriod: 'all',
  }
);

const emit = defineEmits<{
  (e: 'period-change', period: 'all' | 'today' | 'week' | 'pending'): void;
  (e: 'new-booking'): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)
const activePeriod = ref<'all' | 'today' | 'week' | 'pending'>(props.activePeriod || 'all');

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const formatNumber = (val?: number) => {
  if (val === undefined || val === null) return '0';
  return Number(val).toLocaleString('ar-EG-u-nu-latn');
};

const selectPeriod = (period: 'all' | 'today' | 'week' | 'pending') => {
  activePeriod.value = period;
  emit('period-change', period);
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.activePeriod,
  (newVal) => {
    if (newVal) {
      activePeriod.value = newVal;
    }
  }
);

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-bookings-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .metric-summary-card {
      text-align: left;
    }
  }

  // 2. Dual Metrics Summary Cards
  .metrics-summary-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 100%;

    .metric-summary-card {
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      border-radius: 16px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        border-color: var(--unity-primary-light, #a7f3d0);
        transform: translateY(-1px);
      }

      .card-inner-top {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .card-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--unity-text-muted);
        }

        .icon-bubble {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;

          &.primary {
            background: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
          }

          &.success {
            background: #f0fdf4;
            color: #16a34a;
            border: 1px solid #bbf7d0;
          }
        }
      }

      .card-value-line {
        display: flex;
        align-items: baseline;
        gap: 4px;

        .value-digits {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--unity-text-main);
          letter-spacing: -0.3px;
        }

        .value-unit {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--unity-primary);
        }
      }

      .card-footer-info {
        font-size: 0.72rem;
        color: var(--unity-text-dim);
        display: flex;
        align-items: center;
        gap: 4px;
        border-top: 1px dashed var(--unity-border-light, #f1f5f9);
        padding-top: 4px;

        strong {
          color: var(--unity-text-main);
          font-weight: 700;
        }
      }
    }
  }

  // 3. Quick Filters
  .quick-filters-row {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 2px;

    &::-webkit-scrollbar {
      display: none;
    }

    .time-filter-pill {
      flex-shrink: 0;
      white-space: nowrap;
      height: 34px;
      padding: 0 14px;
      border-radius: 9999px;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      font-size: 0.80rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      i {
        font-size: 0.8rem;
      }

      &.with-red-dot {
        .red-alert-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4444;
        }
      }

      &:hover {
        border-color: var(--unity-primary-light, #a7f3d0);
      }

      &.active {
        background: var(--unity-primary-light, #ecfdf5);
        color: var(--unity-primary);
        border: 1.5px solid var(--unity-primary);
        font-weight: 700;
        box-shadow: 0 1px 4px rgba(4, 120, 87, 0.08);

        i {
          color: var(--unity-primary);
        }
      }
    }
  }
}
</style>
