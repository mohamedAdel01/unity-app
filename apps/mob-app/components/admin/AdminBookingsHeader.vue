<template>
  <div class="admin-bookings-header">
    <!-- 1. Top Supervisor Identity Bar (Unified) -->
    <AdminTopHeader 
      :title="isReceptionist ? t('Reception Desk • Bookings') : t('Admin Bookings Billing')"
      :subtitle="isReceptionist ? t('Manage, approve, cancel and register patient bookings') : t('Unity Clinics • Bookings & Billing')"
      icon="pi pi-calendar"
    />

    <!-- Quick Action: Book Appointment for Patient -->
    <button type="button" class="btn-book-patient" @click="emit('new-booking')">
      <i class="pi pi-user-plus"></i>
      <span>{{ t('Book Appointment for Patient') }}</span>
    </button>

    <!-- 2. Dual Tab Selector (Direct Bookings vs Invoices & Billing) (Hidden for Receptionist) -->
    <div v-if="!isReceptionist" class="mode-tabs-container">
      <button 
        type="button" 
        class="mode-tab-btn" 
        :class="{ 'active': activeTab === 'bookings' }"
        @click="selectTab('bookings')"
      >
        <i class="pi pi-calendar"></i>
        <span>{{ t('Direct Bookings') }}</span>
      </button>

      <button 
        type="button" 
        class="mode-tab-btn" 
        :class="{ 'active': activeTab === 'invoices' }"
        @click="selectTab('invoices')"
      >
        <i class="pi pi-receipt"></i>
        <span>{{ t('Invoices & Billing') }}</span>
      </button>
    </div>

    <!-- 3. Metrics Cards (2 Column Grid) -->
    <div class="metrics-two-cards-grid">
      <!-- Card 1: Today's Appointments or Revenue -->
      <div class="metric-stat-card">
        <div class="card-icon-title">
          <i :class="isReceptionist ? 'pi pi-calendar' : 'pi pi-wallet'"></i>
          <span>{{ isReceptionist ? t("Today's Appointments") : t("Today's Revenue") }}</span>
        </div>
        <h3 :class="isReceptionist ? 'stat-amount-main' : 'stat-amount-green'">
          <span>{{ isReceptionist ? (stats.today_appointments ?? todayCount ?? 0) : formatNumber(stats.today_revenue || 0) }}</span>
          <small>{{ isReceptionist ? t('Bookings') : t('EGP') }}</small>
        </h3>
        <span class="stat-sub-caption">
          {{ isReceptionist ? t('Scheduled for Today') : `${stats.today_paid_invoices || 0} ${t('Paid Bookings')}` }}
        </span>
      </div>

      <!-- Card 2: Pending Bookings / Invoices -->
      <div class="metric-stat-card">
        <div class="card-icon-title">
          <i :class="isReceptionist ? 'pi pi-clock' : 'pi pi-receipt'"></i>
          <span>{{ isReceptionist ? t('Awaiting Confirmation') : t('Pending Invoices') }}</span>
        </div>
        <h3 class="stat-amount-main">
          <span>{{ stats.pending_invoices || pendingCount || 0 }}</span>
          <small>{{ isReceptionist ? t('Bookings') : t('Invoices') }}</small>
        </h3>
        <span class="stat-sub-link">{{ t('Under Review') }}</span>
      </div>
    </div>

    <!-- 4. Quick Time Filters -->
    <div class="quick-filters-row">
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
        <span v-if="(stats.pending_invoices || 0) > 0" class="red-alert-dot"></span>
        <span>{{ t('Pending Invoices') }} ({{ stats.pending_invoices || 0 }})</span>
      </button>
    </div>

    <!-- 5. Section Header with Sort Icon -->
    <div class="list-section-header">
      <div class="section-title-wrap">
        <h4>{{ activeTab === 'bookings' ? t('Bookings Log') : t('Invoices Log') }}</h4>
        <small v-if="activePeriod === 'today'">({{ stats.today_appointments ?? todayCount ?? 0 }} {{ t('Today') }})</small>
      </div>

      <button class="btn-sort-filter" :aria-label="t('Sort & Filter')" @click="emit('toggle-sort')">
        <i class="pi pi-sliders-h"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useAuthStore } from '../../stores/auth';
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
    todayCount?: number;
    pendingCount?: number;
  }>(),
  {
    stats: () => ({
      today_revenue: 0,
      today_paid_invoices: 0,
      pending_invoices: 0,
      today_appointments: 0,
      total_revenue: 0,
    }),
    todayCount: 0,
    pendingCount: 0,
  }
);

const emit = defineEmits<{
  (e: 'tab-change', tab: 'bookings' | 'invoices'): void;
  (e: 'period-change', period: 'today' | 'week' | 'pending'): void;
  (e: 'toggle-sort'): void;
  (e: 'new-booking'): void;
}>();

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

// 2. Data (refs, reactive state)
const activeTab = ref<'bookings' | 'invoices'>('bookings');
const activePeriod = ref<'today' | 'week' | 'pending'>('today');

// 3. Computed (computed properties)
const isReceptionist = computed(() => authStore.isReceptionist);

// 4. Methods (functions, handlers)
const formatNumber = (val?: number) => {
  if (val === undefined || val === null) return '0';
  return Number(val).toLocaleString('ar-EG-u-nu-latn');
};
const selectTab = (tab: 'bookings' | 'invoices') => {
  activeTab.value = tab;
  emit('tab-change', tab);
};

const selectPeriod = (period: 'today' | 'week' | 'pending') => {
  activePeriod.value = period;
  emit('period-change', period);
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-bookings-header {
  display: flex;
  flex-direction: column;
  gap: 14px;
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .supervisor-top-bar .admin-identity .admin-meta,
    .metric-stat-card,
    .list-section-header .section-title-wrap {
      text-align: left;
    }
  }

  // Book Patient Appointment Button
  .btn-book-patient {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 13px 18px;
    background: linear-gradient(135deg, #047857 0%, #065f46 100%);
    color: #ffffff;
    border: none;
    border-radius: 16px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(4, 120, 87, 0.28);
    transition: all 0.2s ease;

    i {
      font-size: 1.1rem;
    }

    &:active {
      transform: scale(0.98);
      box-shadow: 0 2px 8px rgba(4, 120, 87, 0.2);
    }
  }

  // 1. Top Supervisor Bar
  .supervisor-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .admin-identity {
      display: flex;
      align-items: center;
      gap: 10px;

      .admin-avatar-ring {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #047857;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
      }

      .admin-meta {
        display: flex;
        flex-direction: column;
        text-align: right;

        .name-badge-row {
          display: flex;
          align-items: center;
          gap: 6px;

          .role-title {
            font-size: 0.95rem;
            font-weight: 800;
            color: var(--unity-text-main);
          }

          .supervisor-badge {
            background: #d1fae5;
            color: #065f46;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 20px;
          }
        }

        .facility-subline {
          font-size: 0.72rem;
          color: var(--unity-text-muted);
          margin-top: 1px;
        }
      }
    }

    .switch-patient-mode-btn {
      width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: all 0.2s;

      i {
        font-size: 1rem;
        color: var(--unity-text-muted);
      }

      &:hover {
        background: var(--unity-primary-light);
        border-color: var(--unity-primary);
        color: var(--unity-primary);

        i {
          color: var(--unity-primary);
        }
      }
    }
  }

  // 2. Mode Tabs
  .mode-tabs-container {
    background: #eef2ff;
    padding: 4px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    gap: 4px;

    .mode-tab-btn {
      flex: 1;
      height: 44px;
      border-radius: 14px;
      border: none;
      background: transparent;
      color: var(--unity-text-muted);
      font-size: 0.85rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s;

      i {
        font-size: 0.95rem;
      }

      &.active {
        background: #ffffff;
        color: var(--unity-text-main);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
    }
  }

  // 3. Two Metrics Cards
  .metrics-two-cards-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    .metric-stat-card {
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      border-radius: 20px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: right;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

      .card-icon-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        color: var(--unity-text-muted);
        font-weight: 600;

        i {
          font-size: 0.9rem;
          color: #047857;
        }
      }

      .stat-amount-green,
      .stat-amount-main {
        font-size: 1.35rem;
        font-weight: 800;
        margin: 4px 0;
        display: flex;
        align-items: baseline;
        gap: 4px;

        span {
          font-size: 1.35rem;
          font-weight: 800;
          line-height: 1.2;
        }

        small {
          font-size: 0.8rem;
          font-weight: 700;
        }
      }

      .stat-amount-green {
        color: #047857;

        span {
          color: #047857;
        }

        small {
          color: #047857;
        }
      }

      .stat-amount-main {
        color: var(--unity-text-main);

        span {
          color: var(--unity-text-main);
        }

        small {
          color: var(--unity-text-muted);
        }
      }

      .stat-sub-caption {
        font-size: 0.78rem;
        color: var(--unity-text-muted);
        font-weight: 500;
      }

      .stat-sub-link {
        font-size: 0.78rem;
        color: #047857;
        font-weight: 700;
      }
    }
  }

  // 4. Quick Filters
  .quick-filters-row {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .time-filter-pill {
      white-space: nowrap;
      padding: 7px 16px;
      border-radius: 20px;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;

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

      &.active {
        background: var(--unity-primary-dark);
        color: #ffffff;
        border-color: var(--unity-primary-dark);
        box-shadow: 0 2px 8px rgba(6, 78, 59, 0.25);

        i {
          color: #ffffff;
        }
      }
    }
  }

  // 5. Section Header
  .list-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 4px;

    .section-title-wrap {
      display: flex;
      align-items: baseline;
      gap: 6px;

      h4 {
        font-size: 1.02rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      small {
        font-size: 0.82rem;
        color: var(--unity-text-muted);
        font-weight: 600;
      }
    }

    .btn-sort-filter {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--unity-primary);
        color: var(--unity-primary);
      }
    }
  }
}
</style>
