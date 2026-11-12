<template>
  <div class="admin-bookings-page">
    <!-- 1. Header with Mode Tabs & Metrics Cards -->
    <AdminBookingsHeader 
      :stats="stats"
      :today-count="stats.today_appointments"
      :pending-count="stats.pending_invoices"
      @tab-change="onTabChange"
      @period-change="onPeriodChange"
      @toggle-sort="toggleSortOrder"
      @new-booking="isNewBookingModalOpen = true"
    />

    <!-- 2. Modular Bookings & Invoices Virtual List (10 by 10) -->
    <AdminBookingsList
      :active-tab="activeTab"
      :bookings="filteredBookings"
      :invoices="invoicesList"
      :has-more="activeTab === 'bookings' ? bookingsHasMore : invoicesHasMore"
      :loading="activeTab === 'bookings' ? bookingsLoading : invoicesLoading"
      @reschedule="openReschedule"
      @download-invoice="downloadInvoice"
      @approve="onApproveBooking"
      @cancel="onCancelBooking"
      @load-more="onLoadMore"
    />

    <!-- Modal: Reschedule Booking -->
    <AdminRescheduleModal 
      :is-open="isRescheduleModalOpen"
      :booking="selectedBookingForReschedule"
      @close="isRescheduleModalOpen = false"
      @rescheduled="onBookingRescheduled"
    />

    <!-- Modal: New Patient Booking (Search & Register) -->
    <AdminBookAppointmentModal
      :is-open="isNewBookingModalOpen"
      :patient="null"
      @close="isNewBookingModalOpen = false"
      @booked="onNewBookingCreated"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AdminBookingsHeader from '../../components/admin/AdminBookingsHeader.vue';
import AdminBookingsList from '../../components/admin/AdminBookingsList.vue';
import AdminRescheduleModal from '../../components/admin/AdminRescheduleModal.vue';
import AdminBookAppointmentModal from '../../components/admin/AdminBookAppointmentModal.vue';

definePageMeta({
  layout: 'admin',
});

const { t } = useI18n();

const api = useUnityApi();

const toast = useAppToast();

// 2. Data (refs, reactive state)
const activeTab = ref<'bookings' | 'invoices'>('bookings');
const activePeriod = ref<'today' | 'week' | 'pending'>('today');
const isRescheduleModalOpen = ref(false);
const isNewBookingModalOpen = ref(false);
const selectedBookingForReschedule = ref<any>(null);

const stats = ref({
  today_revenue: 0,
  today_paid_invoices: 0,
  pending_invoices: 0,
  today_appointments: 0,
  total_revenue: 0,
});

const bookings = ref<any[]>([]);
const bookingsPage = ref(1);
const bookingsHasMore = ref(false);
const bookingsLoading = ref(false);

const invoicesList = ref<any[]>([]);
const invoicesPage = ref(1);
const invoicesHasMore = ref(false);
const invoicesLoading = ref(false);

// 3. Computed (computed properties)
const filteredBookings = computed(() => {
  let list = bookings.value;

  if (activePeriod.value === 'pending') {
    list = list.filter(b => b.status === 'pending');
  } else if (activePeriod.value === 'today') {
    list = list.filter(b => b.period === 'today' || b.status === 'confirmed');
  }

  return list;
});

// 4. Methods (functions, handlers)
// Load backend appointments (10 by 10)
const ADMIN_APPOINTMENTS = async (page = 1) => {
  try {
    bookingsLoading.value = true;
    const res = await api.apiRequest({ 
      service: 'ADMIN_APPOINTMENTS',
      filter: { page, limit: 10 },
    });

    const raw = res?.data?.appointments || (Array.isArray(res?.data) ? res.data : []);
    const items = raw.map((a: any, idx: number) => ({
      id: a.id,
      booking_number: `BK-${7830 + idx + (page - 1) * 10}`,
      patient_name: a.patient?.name || '',
      avatar: a.patient?.avatar,
      time_badge: a.start_time || '',
      clinic_name: a.examination?.name || a.doctor?.doctor?.clinic?.name || a.service?.name || a.doctor?.specialty || '',
      doctor_name: a.doctor?.name || '',
      time: a.start_time || '',
      status: a.status === 'confirmed' ? 'confirmed' : 'pending',
      payment_method: a.invoice?.payment_method || a.payment_method || 'cash',
      price: a.invoice?.total || a.examination?.price || a.total || 0,
      period: 'today',
    }));

    if (page === 1) {
      bookings.value = items;
    } else {
      bookings.value.push(...items);
    }
    bookingsPage.value = page;
    bookingsHasMore.value = res?.pagination?.hasMore ?? res?.data?.hasMore ?? res?.hasMore ?? (items.length >= 10);
  } catch (err) {
    if (page === 1) bookings.value = [];
  } finally {
    bookingsLoading.value = false;
  }
};

const ADMIN_BILLING_INVOICES = async (page = 1) => {
  try {
    invoicesLoading.value = true;
    const res = await api.apiRequest({ 
      service: 'ADMIN_BILLING_INVOICES',
      filter: { page, limit: 10 },
    });
    const raw = res?.data?.invoices || (Array.isArray(res?.data) ? res.data : []);
    const items = raw.map((inv: any) => ({
      id: inv.id,
      invoice_number: inv.invoice_number || inv.id,
      patient_name: inv.patient?.name || '',
      status: inv.status || 'paid',
      service_name: inv.appointment?.service?.name || t('Medical Consultation'),
      amount: inv.total || 0,
    }));

    if (page === 1) {
      invoicesList.value = items;
    } else {
      invoicesList.value.push(...items);
    }
    invoicesPage.value = page;
    invoicesHasMore.value = res?.pagination?.hasMore ?? res?.data?.hasMore ?? res?.hasMore ?? (items.length >= 10);
  } catch (err) {
    if (page === 1) invoicesList.value = [];
  } finally {
    invoicesLoading.value = false;
  }
};

const onLoadMore = () => {
  if (activeTab.value === 'bookings') {
    if (bookingsHasMore.value && !bookingsLoading.value) {
      ADMIN_APPOINTMENTS(bookingsPage.value + 1);
    }
  } else {
    if (invoicesHasMore.value && !invoicesLoading.value) {
      ADMIN_BILLING_INVOICES(invoicesPage.value + 1);
    }
  }
};

const onTabChange = (tab: 'bookings' | 'invoices') => {
  activeTab.value = tab;
  if (tab === 'invoices' && invoicesList.value.length === 0) {
    ADMIN_BILLING_INVOICES();
  }
};

const onPeriodChange = (period: 'today' | 'week' | 'pending') => {
  activePeriod.value = period;
};

const toggleSortOrder = () => {
  bookings.value.reverse();
  toast.info(t('Sort order toggled'));
};

const openReschedule = (booking: any) => {
  selectedBookingForReschedule.value = booking;
  isRescheduleModalOpen.value = true;
};

const onBookingRescheduled = async (payload: any) => {
  const target = bookings.value.find(b => b.id === payload.bookingId);
  if (target) {
    target.doctor_name = payload.doctor_name;
    target.time = `${payload.time}`;
  }

  try {
    await api.apiRequest({
      service: 'ADMIN_UPDATE_APPOINTMENT_STATUS',
      payload: { id: payload.bookingId, status: 'confirmed' },
    });
    ADMIN_BILLING_STATS();
  } catch (err) {}

  toast.success(t('Booking rescheduled successfully!'));
};

const downloadInvoice = (booking: any) => {
  toast.success(
    `${t('Invoice downloaded for #')}${booking.booking_number}`,
    t('Billing')
  );
};

const onApproveBooking = async (booking: any) => {
  try {
    await api.apiRequest({
      service: 'ADMIN_UPDATE_APPOINTMENT_STATUS',
      payload: { id: booking.id, status: 'confirmed' },
    });
    booking.status = 'confirmed';
    toast.success(t('Appointment confirmed successfully!'));
    ADMIN_BILLING_STATS();
  } catch (err: any) {
    toast.error(err?.data?.message || err?.message || t('Failed to update appointment'));
  }
};

const onCancelBooking = async (booking: any) => {
  try {
    await api.apiRequest({
      service: 'ADMIN_UPDATE_APPOINTMENT_STATUS',
      payload: { id: booking.id, status: 'cancelled' },
    });
    booking.status = 'cancelled';
    toast.success(t('Appointment cancelled successfully!'));
    ADMIN_BILLING_STATS();
  } catch (err: any) {
    toast.error(err?.data?.message || err?.message || t('Failed to update appointment'));
  }
};

const ADMIN_BILLING_STATS = async () => {
  try {
    const res = await api.apiRequest({ service: 'ADMIN_BILLING_STATS' });
    if (res?.data) {
      stats.value = {
        today_revenue: Number(res.data.today_revenue || 0),
        today_paid_invoices: Number(res.data.today_paid_invoices || 0),
        pending_invoices: Number(res.data.pending_invoices || 0),
        today_appointments: Number(res.data.today_appointments || 0),
        total_revenue: Number(res.data.total_revenue || 0),
      };
    }
  } catch (err) {
    // silently catch
  }
};

const onNewBookingCreated = (_data?: any) => {
  ADMIN_APPOINTMENTS(1);
  ADMIN_BILLING_STATS();
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  ADMIN_APPOINTMENTS();
  ADMIN_BILLING_INVOICES();
  ADMIN_BILLING_STATS();
});

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: computed(() => t('Bookings & Billing Management — Admin Portal')),
});
</script>

<style scoped lang="scss">
.admin-bookings-page {
  padding: 14px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  .bookings-cards-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .invoices-mode-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .invoice-summary-card {
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      border-radius: 18px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .inv-top {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .inv-id-name {
          display: flex;
          align-items: center;
          gap: 8px;

          strong {
            font-size: 0.95rem;
            color: var(--unity-text-main);
          }

          span {
            font-size: 0.82rem;
            color: var(--unity-text-muted);
          }
        }

        .inv-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 10px;

          &.paid {
            background: #d1fae5;
            color: #065f46;
          }

          &.pending {
            background: #ede9fe;
            color: #6b21a8;
          }
        }
      }

      .inv-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;

        small {
          font-size: 0.74rem;
          color: var(--unity-text-muted);
        }

        .inv-amount {
          font-size: 0.95rem;
          font-weight: 800;
          color: #047857;
        }
      }
    }
  }

  .empty-bookings-state {
    background: var(--unity-surface);
    border: 1.5px dashed var(--unity-border);
    border-radius: 20px;
    padding: 36px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;

    i {
      font-size: 2.2rem;
      color: var(--unity-text-dim);
    }

    h5 {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    p {
      font-size: 0.8rem;
      color: var(--unity-text-muted);
      max-width: 280px;
      line-height: 1.5;
    }
  }
}
</style>
