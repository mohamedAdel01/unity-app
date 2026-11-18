<template>
  <div class="admin-bookings-page">
    <!-- 1. Header with Metrics Cards (Total Bookings & Total Paid) & Quick Filters -->
    <AdminBookingsHeader 
      :stats="stats"
      :total-count="bookings.length"
      :today-count="todayBookingsCount"
      :pending-count="pendingCount"
      :total-paid-amount="totalPaidRevenue"
      :active-period="activePeriod"
      @period-change="onPeriodChange"
      @new-booking="isNewBookingModalOpen = true"
    />

    <!-- 2. Modular Bookings Virtual Windowed List (10 by 10 Standard) -->
    <AdminBookingsList
      :bookings="filteredBookings"
      :has-more="bookingsHasMore"
      :loading="bookingsLoading"
      @reschedule="openReschedule"
      @approve="onApproveBooking"
      @complete="onCompleteBooking"
      @cancel="onCancelBooking"
      @change-status="openChangeStatus"
      @change-payment-status="openChangePaymentStatus"
      @load-more="onLoadMore"
    />

    <!-- Modal: Reschedule Booking -->
    <AdminRescheduleModal 
      :is-open="isRescheduleModalOpen"
      :booking="selectedBookingForReschedule"
      @close="isRescheduleModalOpen = false"
      @rescheduled="onBookingRescheduled"
    />

    <!-- Modal: Change Status (Attended / Cancelled / Confirmed / Pending) -->
    <AdminChangeStatusModal
      :is-open="isChangeStatusModalOpen"
      :booking="selectedBookingForStatusChange"
      :loading="changeStatusLoading"
      @close="isChangeStatusModalOpen = false"
      @save="onSaveStatusChange"
    />

    <!-- Modal: Change Payment Status (Paid / Pending / Refunded / Cancelled) -->
    <AdminChangePaymentModal
      :is-open="isChangePaymentModalOpen"
      :booking="selectedBookingForPaymentChange"
      :loading="changePaymentLoading"
      @close="isChangePaymentModalOpen = false"
      @save="onSavePaymentStatusChange"
    />

    <!-- Modal: Confirm Action (Approve / Complete / Cancel) -->
    <AppConfirmModal
      v-model="isConfirmModalOpen"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      :type="confirmModalType"
      :confirm-text="confirmModalBtnText"
      :cancel-text="t('Cancel')"
      :loading="confirmActionLoading"
      @confirm="executeConfirmedAction"
    />

    <!-- Modal: New Booking (Receptionist & Admin) -->
    <AdminBookAppointmentModal
      :is-open="isNewBookingModalOpen"
      @close="isNewBookingModalOpen = false"
      @booked="ADMIN_APPOINTMENTS(1)"
    />

    <!-- Generous bottom clearance spacer ensuring content completely clears floating navbar -->
    <div class="page-bottom-spacer" aria-hidden="true" />
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
import AdminChangeStatusModal from '../../components/admin/AdminChangeStatusModal.vue';
import AdminChangePaymentModal from '../../components/admin/AdminChangePaymentModal.vue';
import AppConfirmModal from '../../components/common/AppConfirmModal.vue';

definePageMeta({
  layout: 'admin',
});

const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const activePeriod = ref<'all' | 'today' | 'week' | 'pending'>('all');
const isRescheduleModalOpen = ref(false);
const isNewBookingModalOpen = ref(false);
const selectedBookingForReschedule = ref<any>(null);

const isChangeStatusModalOpen = ref(false);
const selectedBookingForStatusChange = ref<any>(null);
const changeStatusLoading = ref(false);

const isChangePaymentModalOpen = ref(false);
const selectedBookingForPaymentChange = ref<any>(null);
const changePaymentLoading = ref(false);

const isConfirmModalOpen = ref(false);
const confirmActionType = ref<'approve' | 'complete' | 'cancel'>('approve');
const targetBooking = ref<any>(null);
const confirmActionLoading = ref(false);

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

// 3. Computed (computed properties)
const todayBookingsCount = computed(() => {
  return bookings.value.filter(b => b.is_today || b.period === 'today').length || Number(stats.value.today_appointments || 0);
});

const pendingCount = computed(() => {
  return bookings.value.filter(b => b.status === 'pending').length;
});

const totalPaidRevenue = computed(() => {
  if (stats.value?.total_revenue && Number(stats.value.total_revenue) > 0) {
    return Number(stats.value.total_revenue);
  }
  return bookings.value
    .filter((b: any) => b.is_paid)
    .reduce((acc: number, curr: any) => acc + (Number(curr.price) || 0), 0);
});

const filteredBookings = computed(() => {
  let list = bookings.value;

  if (activePeriod.value === 'pending') {
    list = list.filter(b => b.status === 'pending');
  } else if (activePeriod.value === 'today') {
    list = list.filter(b => b.is_today || b.period === 'today');
  } else if (activePeriod.value === 'week') {
    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    list = list.filter(b => {
      if (!b.date) return false;
      const d = new Date(b.date);
      return d >= now && d <= weekAhead;
    });
  }

  return list;
});

const confirmModalTitle = computed(() => {
  if (confirmActionType.value === 'complete') return t('Confirm Patient Attendance');
  if (confirmActionType.value === 'approve') return t('Confirm Booking');
  return t('Cancel Booking / Did Not Attend');
});

const confirmModalMessage = computed(() => {
  if (confirmActionType.value === 'complete') {
    return t('Are you sure you want to mark this patient as attended and consultation completed?');
  }
  if (confirmActionType.value === 'approve') {
    return t('Are you sure you want to confirm this booking?');
  }
  return t('Are you sure you want to mark this appointment as cancelled or patient did not attend?');
});

const confirmModalBtnText = computed(() => {
  if (confirmActionType.value === 'complete') return t('Yes, Attended');
  if (confirmActionType.value === 'approve') return t('Confirm Booking');
  return t('Yes, Mark Cancelled');
});

const confirmModalType = computed(() => {
  if (confirmActionType.value === 'complete') return 'success';
  if (confirmActionType.value === 'approve') return 'info';
  return 'danger';
});

// 4. Methods (functions, handlers)
// Load backend appointments (10 by 10 Standard)
const ADMIN_APPOINTMENTS = async (page = 1) => {
  try {
    bookingsLoading.value = true;
    const res = await api.apiRequest({ 
      service: 'ADMIN_APPOINTMENTS',
      filter: { page, limit: 10 },
    });

    const isAr = Boolean(isRtl.value);
    const raw = res?.data?.appointments || (Array.isArray(res?.data) ? res.data : []);
    const now = new Date();

    const items = raw.map((a: any, idx: number) => {
      let isToday = false;
      if (a.date) {
        const d = new Date(a.date);
        const matchLocal = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
        const matchUtc = d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth() && d.getUTCDate() === now.getUTCDate();
        isToday = matchLocal || matchUtc;
      }

      return {
        id: a.id,
        booking_number: a.id ? String(a.id).slice(-6).toUpperCase() : `BK-${7830 + idx + (page - 1) * 10}`,
        patient_name: a.patient?.name || a.patient?.user?.name || (isAr ? 'مريض' : 'Patient'),
        patient_phone: a.patient?.phone || a.patient?.user?.phone || a.phone || '',
        avatar: a.patient?.avatar || '',
        time_badge: a.start_time,
        date: a.date,
        is_today: isToday,
        clinic_name: isAr
          ? (a.examination?.name_ar || a.doctor?.clinic?.name_ar || a.doctor?.specialty || '')
          : (a.examination?.name_en || a.doctor?.clinic?.name_en || a.doctor?.specialty || ''),
        doctor_name: isAr ? (a.doctor?.name_ar || a.doctor?.name_en || '') : (a.doctor?.name_en || a.doctor?.name_ar || ''),
        examination_name: isAr ? (a.examination?.name_ar || a.examination?.name_en || '') : (a.examination?.name_en || a.examination?.name_ar || ''),
        is_examination: Boolean(a.examination_id || a.examination),
        time: a.start_time,
        status: a.status || 'pending',
        invoice_id: a.invoice?.id || null,
        payment_status: a.invoice?.status || a.payment_status || 'pending',
        is_paid: a.invoice?.status === 'paid' || a.payment_status === 'paid' || a.is_paid === true,
        payment_method: a.invoice?.payment_method || a.payment_method || 'cash',
        price: a.invoice?.total || a.examination?.price || a.doctor?.consultation_fee || a.total || 0,
        notes: a.notes || null,
        period: isToday ? 'today' : 'other',
        raw: a,
      };
    });

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

const onLoadMore = () => {
  if (bookingsHasMore.value && !bookingsLoading.value) {
    ADMIN_APPOINTMENTS(bookingsPage.value + 1);
  }
};

const onPeriodChange = (period: 'all' | 'today' | 'week' | 'pending') => {
  activePeriod.value = period;
};

const openReschedule = (booking: any) => {
  if (booking?.status === 'completed') {
    toast.error(t('Cannot reschedule appointment after attendance and completion'));
    return;
  }
  if (booking?.status === 'cancelled') {
    toast.error(t('Cannot reschedule a cancelled appointment'));
    return;
  }
  selectedBookingForReschedule.value = booking;
  isRescheduleModalOpen.value = true;
};

const onBookingRescheduled = async (payload: any) => {
  const target = bookings.value.find(b => b.id === payload.bookingId);
  if (target) {
    if (target.status === 'completed') {
      toast.error(t('Cannot reschedule appointment after attendance and completion'));
      return;
    }
    target.doctor_name = payload.doctor_name;
    target.time = `${payload.time}`;
  }

  try {
    await api.apiRequest({
      service: 'ADMIN_UPDATE_APPOINTMENT_STATUS',
      payload: {
        id: payload.bookingId,
        status: target?.status === 'pending' ? 'confirmed' : target?.status,
        date: payload.date,
        start_time: payload.time,
      },
    });
    ADMIN_BILLING_STATS();
  } catch (err) {}

  toast.success(t('Booking rescheduled successfully!'));
};

const onApproveBooking = (booking: any) => {
  targetBooking.value = booking;
  confirmActionType.value = 'approve';
  isConfirmModalOpen.value = true;
};

const onCompleteBooking = (booking: any) => {
  targetBooking.value = booking;
  confirmActionType.value = 'complete';
  isConfirmModalOpen.value = true;
};

const onCancelBooking = (booking: any) => {
  targetBooking.value = booking;
  confirmActionType.value = 'cancel';
  isConfirmModalOpen.value = true;
};

const openChangeStatus = (booking: any) => {
  selectedBookingForStatusChange.value = booking;
  isChangeStatusModalOpen.value = true;
};

const openChangePaymentStatus = (booking: any) => {
  selectedBookingForPaymentChange.value = booking;
  isChangePaymentModalOpen.value = true;
};

const onSaveStatusChange = async (payload: { bookingId: string | number; status: string; booking: any }) => {
  changeStatusLoading.value = true;
  try {
    await api.apiRequest({
      service: 'ADMIN_UPDATE_APPOINTMENT_STATUS',
      payload: { id: payload.bookingId, status: payload.status },
    });
    const target = bookings.value.find(b => b.id === payload.bookingId);
    if (target) {
      target.status = payload.status;
    }
    isChangeStatusModalOpen.value = false;
    toast.success(t('Appointment status updated successfully!'));
    ADMIN_BILLING_STATS();
  } catch (err: any) {
    toast.error(err?.data?.message || err?.message || t('Failed to update appointment'));
  } finally {
    changeStatusLoading.value = false;
  }
};

const onSavePaymentStatusChange = async (payload: { bookingId: string | number; invoiceId?: string; status: string; payment_method: string; booking: any }) => {
  changePaymentLoading.value = true;
  try {
    const invoiceTargetId = payload.invoiceId || payload.bookingId;
    await api.apiRequest({
      service: 'ADMIN_UPDATE_INVOICE_STATUS',
      payload: {
        id: invoiceTargetId,
        status: payload.status,
        payment_method: payload.payment_method,
      },
    });

    const target = bookings.value.find(b => b.id === payload.bookingId);
    if (target) {
      target.payment_status = payload.status;
      target.is_paid = payload.status === 'paid';
      target.payment_method = payload.payment_method;
      if (payload.status === 'paid' && target.status === 'pending') {
        target.status = 'confirmed';
      }
    }

    isChangePaymentModalOpen.value = false;
    toast.success(t('Payment status updated successfully!'));
    ADMIN_BILLING_STATS();
  } catch (err: any) {
    toast.error(err?.data?.message || err?.message || t('Failed to update payment status'));
  } finally {
    changePaymentLoading.value = false;
  }
};

const executeConfirmedAction = async () => {
  if (!targetBooking.value) return;
  const booking = targetBooking.value;
  confirmActionLoading.value = true;

  try {
    if (confirmActionType.value === 'complete') {
      await api.apiRequest({
        service: 'ADMIN_UPDATE_APPOINTMENT_STATUS',
        payload: { id: booking.id, status: 'completed' },
      });
      booking.status = 'completed';
      toast.success(t('Patient attendance registered and consultation completed!'));
      ADMIN_BILLING_STATS();
    } else if (confirmActionType.value === 'approve') {
      await api.apiRequest({
        service: 'ADMIN_UPDATE_APPOINTMENT_STATUS',
        payload: { id: booking.id, status: 'confirmed' },
      });
      booking.status = 'confirmed';
      toast.success(t('Appointment confirmed successfully!'));
      ADMIN_BILLING_STATS();
    } else {
      await api.apiRequest({
        service: 'ADMIN_UPDATE_APPOINTMENT_STATUS',
        payload: { id: booking.id, status: 'cancelled' },
      });
      booking.status = 'cancelled';
      toast.success(t('Appointment cancelled successfully!'));
      ADMIN_BILLING_STATS();
    }
    isConfirmModalOpen.value = false;
  } catch (err: any) {
    toast.error(err?.data?.message || err?.message || t('Failed to update appointment'));
  } finally {
    confirmActionLoading.value = false;
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

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  ADMIN_APPOINTMENTS();
  ADMIN_BILLING_STATS();
});

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: computed(() => t('Bookings Management — Admin Portal')),
});
</script>

<style scoped lang="scss">
.admin-bookings-page {
  padding: 14px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
