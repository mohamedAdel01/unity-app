<template>
  <div class="admin-bookings-page" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- 1. Header with Mode Tabs & Metrics Cards -->
    <AdminBookingsHeader 
      @tab-change="onTabChange"
      @period-change="onPeriodChange"
      @toggle-sort="toggleSortOrder"
    />

    <!-- 2. Bookings List (Direct Bookings Mode) -->
    <div v-if="activeTab === 'bookings'" class="bookings-cards-list">
      <AdminBookingCard 
        v-for="(bk, index) in filteredBookings"
        :key="bk.id || index"
        :booking="bk"
        :initially-expanded="index === 0"
        @reschedule="openReschedule"
        @download-invoice="downloadInvoice"
      />
    </div>

    <!-- 3. Invoices List (Invoices & Billing Mode) -->
    <div v-else class="invoices-mode-list">
      <div v-for="inv in invoicesList" :key="inv.id" class="invoice-summary-card">
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
          <strong class="inv-amount">{{ inv.amount }} {{ t('SAR') }}</strong>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredBookings.length === 0" class="empty-bookings-state">
      <i class="pi pi-calendar-times"></i>
      <h5>{{ t('No bookings in this period') }}</h5>
      <p>{{ t('Try selecting another time range or clear filters.') }}</p>
    </div>

    <!-- Modal: Reschedule Booking -->
    <AdminRescheduleModal 
      :is-open="isRescheduleModalOpen"
      :booking="selectedBookingForReschedule"
      @close="isRescheduleModalOpen = false"
      @rescheduled="onBookingRescheduled"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AdminBookingsHeader from '../../components/admin/AdminBookingsHeader.vue';
import AdminBookingCard from '../../components/admin/AdminBookingCard.vue';
import AdminRescheduleModal from '../../components/admin/AdminRescheduleModal.vue';

definePageMeta({
  title: 'إدارة الحجوزات والفوترة — لوحة المشرف',
});

const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

const activeTab = ref<'bookings' | 'invoices'>('bookings');
const activePeriod = ref<'today' | 'week' | 'pending'>('today');
const isRescheduleModalOpen = ref(false);
const selectedBookingForReschedule = ref<any>(null);

// Initial Bookings Dataset matching Image 2
const defaultBookings = ref<any[]>([
  {
    id: 'bk-1',
    booking_number: 'BK-7821',
    patient_name: 'محمد السعيد',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    clinic_name: 'عيادة القلب والأوعية الدموية',
    doctor_name: 'د. فهد السالم',
    time: '١٠:٣٠ ص',
    status: 'confirmed',
    payment_method: 'مدى (INV-902#)',
    price: 250,
    period: 'today',
  },
  {
    id: 'bk-2',
    booking_number: 'BK-7822',
    patient_name: 'سارة العتيبي',
    time_badge: '١١:١٥ صباحاً',
    clinic_name: 'مختبر التحاليل السريرية',
    doctor_name: 'أخصائي المختبر',
    time: '١١:١٥ ص',
    status: 'pending',
    payment_method: 'بانتظار السداد',
    price: 320,
    period: 'pending',
  },
  {
    id: 'bk-3',
    booking_number: 'BK-7823',
    patient_name: 'عبدالله القحطاني',
    time_badge: '١١:٤٥ صباحاً',
    clinic_name: 'عيادة الأسنان وجراحة الفم',
    doctor_name: 'د. سارة المنصور',
    time: '١١:٤٥ ص',
    status: 'confirmed',
    payment_method: 'فيزا (INV-905#)',
    price: 180,
    period: 'today',
  },
  {
    id: 'bk-4',
    booking_number: 'BK-7824',
    patient_name: 'نورة الشمري',
    time_badge: '١٢:٣٠ ظهراً',
    clinic_name: 'عيادة الأطفال وحديثي الولادة',
    doctor_name: 'د. سارة العتيبي',
    time: '١٢:٣٠ م',
    status: 'confirmed',
    payment_method: 'تأمين التعاونية',
    price: 50,
    period: 'today',
  },
]);

const bookings = ref<any[]>([...defaultBookings.value]);

// Invoices dataset for the dual tab view
const invoicesList = ref<any[]>([
  { id: 'inv-1', invoice_number: 'INV-902', patient_name: 'محمد السعيد', service_name: 'استشارة قلب وأوعية دموية', amount: 250, status: 'paid' },
  { id: 'inv-2', invoice_number: 'INV-903', patient_name: 'سارة العتيبي', service_name: 'باقة فحص دم شامل', amount: 320, status: 'pending' },
  { id: 'inv-3', invoice_number: 'INV-905', patient_name: 'عبدالله القحطاني', service_name: 'فحص أسنان سريري', amount: 180, status: 'paid' },
  { id: 'inv-4', invoice_number: 'INV-908', patient_name: 'نورة الشمري', service_name: 'متابعة نمو أطفال', amount: 50, status: 'paid' },
]);

// Load backend appointments if available
const loadBackendAppointments = async () => {
  try {
    const config = useRuntimeConfig();
    const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
    const res: any = await $fetch(`${baseUrl}/api/v1/admin/appointments`, {
      headers: api.token.value ? { Authorization: `Bearer ${api.token.value}` } : {},
    });

    if (res?.status && res?.data?.appointments?.length) {
      const mapped = res.data.appointments.map((a: any, idx: number) => ({
        id: a.id,
        booking_number: `BK-${7830 + idx}`,
        patient_name: a.patient?.name || 'مريض مجهول',
        avatar: a.patient?.avatar,
        time_badge: a.start_time || '01:00 م',
        clinic_name: a.service?.name || a.doctor?.specialty || 'عيادة عامة',
        doctor_name: a.doctor?.name || 'طبيب استشاري',
        time: a.start_time || '01:00 م',
        status: a.status === 'confirmed' ? 'confirmed' : 'pending',
        payment_method: 'مدى (INV-910#)',
        price: a.service?.price || 200,
        period: 'today',
      }));

      bookings.value = [...defaultBookings.value, ...mapped];
    }
  } catch (err) {
    bookings.value = [...defaultBookings.value];
  }
};

onMounted(() => {
  loadBackendAppointments();
});

const filteredBookings = computed(() => {
  let list = bookings.value;

  if (activePeriod.value === 'pending') {
    list = list.filter(b => b.status === 'pending');
  } else if (activePeriod.value === 'today') {
    list = list.filter(b => b.period === 'today' || b.status === 'confirmed');
  }

  return list;
});

const onTabChange = (tab: 'bookings' | 'invoices') => {
  activeTab.value = tab;
};

const onPeriodChange = (period: 'today' | 'week' | 'pending') => {
  activePeriod.value = period;
};

const toggleSortOrder = () => {
  bookings.value.reverse();
  toast.info(isRtl.value ? 'تم تغيير ترتيب الحجوزات' : 'Sort order toggled');
};

const openReschedule = (booking: any) => {
  selectedBookingForReschedule.value = booking;
  isRescheduleModalOpen.value = true;
};

const onBookingRescheduled = (payload: any) => {
  const target = bookings.value.find(b => b.id === payload.bookingId);
  if (target) {
    target.doctor_name = payload.doctor_name;
    target.time = `${payload.time} ص`;
  }
  toast.success(isRtl.value ? 'تم إعادة جدولة الموعد وتحديث الحجز بنجاح!' : 'Booking rescheduled successfully!');
};

const downloadInvoice = (booking: any) => {
  toast.success(
    isRtl.value ? `تم تحميل الفاتورة الضريبية الإلكترونية للحجز #${booking.booking_number}` : `Invoice downloaded for #${booking.booking_number}`,
    isRtl.value ? 'الفوترة والمدفوعات' : 'Billing'
  );
};
</script>

<style scoped lang="scss">
.admin-bookings-page {
  padding: 14px 18px 40px;
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

