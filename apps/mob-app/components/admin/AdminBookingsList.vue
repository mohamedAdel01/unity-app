<template>
  <div class="admin-bookings-list">
    <!-- Bookings Mode -->
    <AppVirtualList
      v-if="activeTab === 'bookings'"
      :items="bookings"
      :has-more="hasMore"
      :loading="loading"
      :page-size="10"
      @load-more="emit('load-more')"
    >
      <template #item="{ item, index }">
        <AdminBookingCard 
          :booking="item"
          :initially-expanded="index === 0"
          @reschedule="emit('reschedule', $event)"
          @download-invoice="emit('download-invoice', $event)"
        />
      </template>

      <template #empty>
        <div class="empty-bookings-state">
          <i class="pi pi-calendar-times"></i>
          <h5>{{ t('No bookings in this period') }}</h5>
          <p>{{ t('Try selecting another time range or clear filters.') }}</p>
        </div>
      </template>
    </AppVirtualList>

    <!-- Invoices Mode -->
    <AppVirtualList
      v-else
      :items="invoices"
      :has-more="hasMore"
      :loading="loading"
      :page-size="10"
      @load-more="emit('load-more')"
    >
      <template #item="{ item: inv }">
        <div class="invoice-summary-card">
          <div class="inv-top">
            <div class="inv-id-name">
              <strong>#{{ inv.invoice_number }}</strong>
              <span>{{ inv.patient_name }}</span>
            </div>
            <span class="inv-badge" :class="inv.status === 'paid' ? 'paid' : 'pending'">
              {{ inv.status === 'paid' ? t('Paid') : t('Pending') }}
            </span>
          </div>
          <div class="inv-meta">
            <small>{{ inv.service_name }}</small>
            <strong class="inv-amount">{{ inv.amount }} {{ t('EGP') }}</strong>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="empty-bookings-state">
          <i class="pi pi-wallet"></i>
          <h5>{{ t('No invoices found') }}</h5>
          <p>{{ t('No billing records found for this period.') }}</p>
        </div>
      </template>
    </AppVirtualList>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';
import AdminBookingCard from './AdminBookingCard.vue';
import AppVirtualList from '../common/AppVirtualList.vue';

const props = withDefaults(
  defineProps<{
    activeTab?: 'bookings' | 'invoices';
    bookings?: any[];
    invoices?: any[];
    hasMore?: boolean;
    loading?: boolean;
  }>(),
  {
    activeTab: 'bookings',
    bookings: () => [],
    invoices: () => [],
    hasMore: false,
    loading: false,
  }
);

const emit = defineEmits<{
  (e: 'reschedule', booking: any): void;
  (e: 'download-invoice', booking: any): void;
  (e: 'load-more'): void;
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
.admin-bookings-list {
  display: flex;
  flex-direction: column;
  width: 100%;

  .empty-bookings-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 48px 24px;
    background: var(--unity-surface);
    border: 1px dashed var(--unity-border);
    border-radius: 20px;
    gap: 10px;

    i {
      font-size: 2.2rem;
      color: var(--unity-text-muted);
      opacity: 0.6;
    }

    h5 {
      font-size: 1rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin: 0;
    }

    p {
      font-size: 0.8rem;
      color: var(--unity-text-muted);
      margin: 0;
      max-width: 280px;
      line-height: 1.4;
    }
  }

  .invoice-summary-card {
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    border-radius: 16px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

    .inv-top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .inv-id-name {
        display: flex;
        flex-direction: column;
        gap: 2px;

        strong {
          font-size: 0.88rem;
          color: var(--unity-text-main);
        }

        span {
          font-size: 0.75rem;
          color: var(--unity-text-muted);
        }
      }

      .inv-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 20px;

        &.paid {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        &.pending {
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fde68a;
        }
      }
    }

    .inv-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px dashed var(--unity-border);

      small {
        font-size: 0.75rem;
        color: var(--unity-text-muted);
      }

      .inv-amount {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--unity-primary);
      }
    }
  }
}
</style>

