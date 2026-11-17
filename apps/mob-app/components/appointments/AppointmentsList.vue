<template>
  <div class="appointments-list-container">
    <!-- Filter Tabs (القادمة وتحت المراجعة / المكتملة / الملغاة) - Horizontally Scrollable -->
    <div class="status-tabs-nav">
      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'upcoming' }"
        @click="activeTab = 'upcoming'"
      >
        <span>{{ t('Upcoming & In Review') }}</span>
        <span class="count-pill">({{ activeAppointments.length }})</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'completed' }"
        @click="activeTab = 'completed'"
      >
        <span>{{ t('Completed') }}</span>
        <span class="count-pill">({{ completedAppointments.length }})</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'cancelled' }"
        @click="activeTab = 'cancelled'"
      >
        <span>{{ t('Cancelled') }}</span>
        <span v-if="cancelledAppointments.length > 0" class="count-pill">({{ cancelledAppointments.length }})</span>
      </button>
    </div>

    <!-- Content Virtual List (10 by 10) -->
    <AppVirtualList
      :items="currentList"
      :has-more="appointmentsHasMore"
      :loading="appointmentsLoading || globalStore.loading.includes('appointments')"
      :page-size="10"
      @load-more="loadMoreAppointments"
    >
      <template #item="{ item: apt }">
        <div class="appointment-card-wrapper">
          <div class="appointment-item-card">
            <!-- Top Floating Badges Bar (Half in, half out of card) -->
            <div class="card-floating-badges-bar">
              <span v-if="isOfferAppointment(apt)" class="floating-badge pill-offer">
                <i class="pi pi-tag"></i>
                <span>{{ t('Special Offer') }}</span>
              </span>
              <span v-else-if="isExaminationAppointment(apt)" class="floating-badge pill-exam">
                {{ t('Medical Exam') }}
              </span>
              <span v-else class="floating-badge pill-consult">
                {{ t('Consultation') }}
              </span>
              <div class="floating-badge status-badge" :class="getStatusClass(apt.status)">
                <span class="dot"></span>
                <span>{{ getStatusLabel(apt.status) }}</span>
              </div>
              <span class="floating-badge payment-tag" :class="getPaymentClass(apt)">
                <i :class="getPaymentIcon(apt)"></i>
                <span>{{ getPaymentLabel(apt) }}</span>
              </span>
            </div>

        <!-- Doctor & Clinic / Examination / Offer Info -->
        <div class="doctor-row">
          <img 
            v-if="getDoctorAvatar(apt) && !failedDoctorAvatars.has(apt.id)"
            :src="getDoctorAvatar(apt)" 
            alt=""
            @error="failedDoctorAvatars.add(apt.id)" 
          />
          <div v-else class="doc-avatar-initial" :class="{ 'is-exam': isExaminationAppointment(apt), 'is-offer': isOfferAppointment(apt) }">
            <i v-if="isOfferAppointment(apt)" class="pi pi-percentage" style="font-size: 1.15rem; color: #ffffff;"></i>
            <AppExamIcon v-else-if="isExaminationAppointment(apt)" :size="20" />
            <span v-else>{{ getAppointmentInitial(apt) }}</span>
          </div>
          <div class="doc-text">
            <h5>{{ getAppointmentTitle(apt) }}</h5>
            <div v-if="getAppointmentClinic(apt)" class="clinic-sub" :class="{ 'is-offer-text': isOfferAppointment(apt) }">
              <i :class="isOfferAppointment(apt) ? 'pi pi-sparkles' : 'pi pi-building'"></i>
              <span>{{ getAppointmentClinic(apt) }}</span>
            </div>
            <p v-else-if="apt.examination?.description || apt.offer?.description" class="exam-sub">
              {{ resolveI18n(apt.examination?.description || apt.offer?.description) }}
            </p>
          </div>
        </div>

        <!-- Date & Time Banner -->
        <div class="datetime-banner">
          <div class="dt-item">
            <i class="pi pi-calendar"></i>
            <span>{{ formatDate(apt.date) }}</span>
          </div>
          <div class="dt-divider"></div>
          <div class="dt-item">
            <i class="pi pi-clock"></i>
            <span>{{ formatSlotRange(apt.start_time, apt.end_time) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions-row">
          <!-- Pending appointments: Patient can Cancel OR Modify Slot before clinic approval -->
          <template v-if="apt.status === 'pending'">
            <button 
              class="btn-cancel" 
              :disabled="cancellingId === apt.id"
              @click="promptCancelApt(apt)"
            >
              <i v-if="cancellingId === apt.id" class="pi pi-spin pi-spinner"></i>
              <span v-else>{{ t('Cancel Appointment') }}</span>
            </button>
            <button class="btn-reschedule" @click="rebook(apt)">
              {{ t('Modify Slot') }}
            </button>
          </template>

          <!-- Confirmed appointments: Already approved by clinic, cannot be cancelled directly -->
          <template v-else-if="apt.status === 'confirmed'">
            <div class="confirmed-status-pill full-width">
              <i class="pi pi-check-circle"></i>
              <span>{{ t('Appointment Confirmed & Ready') }}</span>
            </div>
          </template>

          <template v-else-if="apt.status === 'completed'">
            <button class="btn-report" @click="viewReport(apt)">
              <i class="pi pi-file"></i>
              <span>{{ t('View Medical Report') }}</span>
            </button>
            <button class="btn-followup" @click="bookFollowUp(apt)">
              <i class="pi pi-calendar-plus"></i>
              <span>{{ t('Book Follow-up') }}</span>
            </button>
          </template>

          <template v-else>
            <button class="btn-rebook full-width" @click="rebook(apt)">
              {{ t('Book Appointment Now') }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </template>

      <template #empty>
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <i class="pi pi-calendar-times"></i>
          </div>
          <h4>{{ t('No appointments in this section') }}</h4>
          <p>{{ t('You can book a new appointment anytime with our top specialists') }}</p>
          <button class="book-now-btn" @click="bookingModal.openQuickBook">
            {{ t('Book Appointment Now') }}
          </button>
        </div>
      </template>
    </AppVirtualList>

    <!-- Confirmation Popup for Cancelling Appointment -->
    <AppConfirmModal
      v-model="showCancelModal"
      type="danger"
      :title="t('Cancel Appointment')"
      :message="t('Are you sure you want to cancel this appointment? This action cannot be undone.')"
      :confirm-text="t('Yes, Confirm Cancel')"
      :cancel-text="t('Keep Appointment')"
      :loading="cancellingId !== null"
      @confirm="handleConfirmCancel"
    >
      <div v-if="selectedAptToCancel" class="cancel-summary-box">
        <div class="summary-doctor-row">
          <img 
            v-if="getDoctorAvatar(selectedAptToCancel) && !failedDoctorAvatars.has('c-' + selectedAptToCancel.id)"
            :src="getDoctorAvatar(selectedAptToCancel)" 
            alt="" 
            class="summary-doc-img"
            @error="failedDoctorAvatars.add('c-' + selectedAptToCancel.id)"
          />
          <div v-else class="doc-avatar-initial is-summary" :class="{ 'is-exam': isExaminationAppointment(selectedAptToCancel) }">
            <AppExamIcon v-if="isExaminationAppointment(selectedAptToCancel)" :size="20" />
            <span v-else>{{ getAppointmentInitial(selectedAptToCancel) }}</span>
          </div>
          <div class="summary-doc-info">
            <h6>{{ getAppointmentTitle(selectedAptToCancel) }}</h6>
            <small>{{ getAppointmentSubtitle(selectedAptToCancel) }}</small>
          </div>
        </div>

        <div class="summary-details-grid">
          <div class="summary-item">
            <i class="pi pi-calendar"></i>
            <span>{{ formatDate(selectedAptToCancel.date) }}</span>
          </div>
          <div v-if="selectedAptToCancel.start_time" class="summary-item">
            <i class="pi pi-clock"></i>
            <span>{{ selectedAptToCancel.start_time }} {{ selectedAptToCancel.end_time ? '- ' + selectedAptToCancel.end_time : '' }}</span>
          </div>
          <div v-if="selectedAptToCancel.clinic?.name || selectedAptToCancel.doctor?.clinic?.name" class="summary-item full">
            <i class="pi pi-building"></i>
            <span>{{ selectedAptToCancel.clinic?.name || selectedAptToCancel.doctor?.clinic?.name }}</span>
          </div>
        </div>
      </div>
    </AppConfirmModal>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';
import { useGlobalStore } from '../../stores/global';
import { useAppToast } from '../../composables/useAppToast';
import AppConfirmModal from '../common/AppConfirmModal.vue';
import AppVirtualList from '../common/AppVirtualList.vue';
import AppExamIcon from '../common/AppExamIcon.vue';

const api = useUnityApi();

const { t, isRtl, resolveI18n } = useI18n();

const bookingModal = useBookingModal();

const globalStore = useGlobalStore();

const toast = useAppToast();

// 2. Data (refs, reactive state)
const activeTab = ref<'upcoming' | 'completed' | 'cancelled'>('upcoming');
const failedDoctorAvatars = ref(new Set<string | number>());

const getDoctorAvatar = (apt: any) => {
  const av = apt?.offer?.image || apt?.doctor?.avatar || apt?.doctor?.user?.avatar;
  if (!av || typeof av !== 'string') return '';
  const trimmed = av.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  const config = useRuntimeConfig();
  const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
  return `${baseUrl}${trimmed}`;
};

const appointments = ref<any[]>([]);
const appointmentsPage = ref(1);
const appointmentsHasMore = ref(false);
const appointmentsLoading = ref(false);

const cancellingId = ref<string | null>(null);

const showCancelModal = ref(false);

const selectedAptToCancel = ref<any | null>(null);

// 3. Computed (computed properties)
const activeAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'confirmed' || a.status === 'pending');
});

const completedAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'completed');
});

const cancelledAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'cancelled');
});

const currentList = computed(() => {
  if (activeTab.value === 'upcoming') return activeAppointments.value;
  if (activeTab.value === 'completed') return completedAppointments.value;
  return cancelledAppointments.value;
});

// 4. Methods (functions, handlers)
const PATIENT_APPOINTMENTS = async (page = 1) => {
  try {
    appointmentsLoading.value = true;
    const res = await api.apiRequest({ 
      service: 'PATIENT_APPOINTMENTS',
      filter: { page, limit: 10 },
    });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    if (page === 1) {
      appointments.value = raw;
    } else {
      appointments.value.push(...raw);
    }
    appointmentsPage.value = page;
    appointmentsHasMore.value = res?.pagination?.hasMore ?? res?.hasMore ?? (raw.length >= 10);
  } catch (err) {
    if (page === 1) appointments.value = [];
  } finally {
    appointmentsLoading.value = false;
  }
};

const loadMoreAppointments = () => {
  if (appointmentsHasMore.value && !appointmentsLoading.value) {
    PATIENT_APPOINTMENTS(appointmentsPage.value + 1);
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'confirmed': return t('Confirmed');
    case 'pending': return t('Under Review');
    case 'completed': return t('Completed');
    case 'cancelled': return t('Cancelled');
    default: return status;
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'confirmed': return 'status-confirmed';
    case 'pending': return 'status-pending';
    case 'completed': return 'status-completed';
    case 'cancelled': return 'status-cancelled';
    default: return '';
  }
};

const isOfferAppointment = (apt: any) => {
  return Boolean(apt.offer || apt.offer_id || apt.notes?.includes('عرض'));
};

const isExaminationAppointment = (apt: any) => {
  if (isOfferAppointment(apt)) return false;
  return Boolean(apt.examination || apt.examination_id || apt.notes?.includes('فحص'));
};

const getAppointmentTitle = (apt: any) => {
  const offer = apt.offer;
  if (offer) {
    const title = !isRtl.value && offer.title_en ? offer.title_en : (offer.title_ar || offer.title);
    if (title) return resolveI18n(title);
  }
  const exam = apt.examination;
  if (exam) {
    const n = !isRtl.value && exam.name_en ? exam.name_en : (exam.name_ar || exam.name);
    if (n) return resolveI18n(n);
  }
  const serv = apt.service;
  if (serv) {
    const n = !isRtl.value && serv.name_en ? serv.name_en : (serv.name_ar || serv.name);
    if (n) return resolveI18n(n);
  }
  if (apt.doctor?.name) return resolveI18n(apt.doctor.name);
  if (apt.doctor?.user?.name) return resolveI18n(apt.doctor.user.name);
  if (apt.notes && apt.notes.includes(':')) {
    const after = apt.notes.split(':')[1]?.trim();
    if (after) return resolveI18n(after);
  }
  return isOfferAppointment(apt) ? t('Special Offer') : (isExaminationAppointment(apt) ? t('Hospital Examination') : t('Doctor Consultation'));
};

const getAppointmentSubtitle = (apt: any) => {
  if (isOfferAppointment(apt)) return t('Special Offer');
  if (apt.examination) return t('Hospital Medical Examination');
  return resolveI18n(apt.doctor?.specialty) || t('Consultation');
};

const getAppointmentClinic = (apt: any) => {
  if (isOfferAppointment(apt)) {
    return t('Unity Exclusive Offers');
  }
  const clinic = apt.clinic || apt.doctor?.clinic || apt.doctor?.doctor?.clinic;
  if (clinic) {
    const n = !isRtl.value && clinic.name_en ? clinic.name_en : (clinic.name_ar || clinic.name);
    if (n) return resolveI18n(n);
    if (typeof clinic === 'string') return resolveI18n(clinic);
  }
  return isExaminationAppointment(apt) ? t('Medical Examinations & Labs') : '';
};

const getAppointmentInitial = (apt: any) => {
  const title = getAppointmentTitle(apt);
  return title ? title.charAt(0).toUpperCase() : 'M';
};

const formatSlotTime = (timeStr?: string) => {
  if (!timeStr) return '';
  const clean = timeStr.trim();
  const parts = clean.split(':');
  if (parts.length < 2) return clean;
  let h = parseInt(parts[0], 10);
  const m = parts[1].slice(0, 2);
  const period = h >= 12 ? (isRtl.value ? 'م' : 'PM') : (isRtl.value ? 'ص' : 'AM');
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${period}`;
};

const formatSlotRange = (start?: string, end?: string) => {
  const startFmt = formatSlotTime(start);
  const endFmt = formatSlotTime(end);
  if (!startFmt) return '10:00 AM - 10:30 AM';
  if (!endFmt) return startFmt;
  return `${startFmt} - ${endFmt}`;
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch (e) {
    return dateStr;
  }
};

const promptCancelApt = (apt: any) => {
  selectedAptToCancel.value = apt;
  showCancelModal.value = true;
};

const handleConfirmCancel = async () => {
  if (!selectedAptToCancel.value) return;
  const apt = selectedAptToCancel.value;
  try {
    cancellingId.value = apt.id;
    if (!apt.id.startsWith('apt-')) {
      await api.apiRequest({ service: 'CANCEL_APPOINTMENT', payload: { id: apt.id } });
    }
    apt.status = 'cancelled';
    toast.success(t('Appointment cancelled successfully.'));
    showCancelModal.value = false;
    selectedAptToCancel.value = null;
  } catch (err: any) {
    toast.error(t(err?.data?.message || err?.message || 'Failed to cancel appointment'));
  } finally {
    cancellingId.value = null;
  }
};

const rebook = (apt: any) => {
  if (apt.status === 'completed') {
    toast.error(t('Cannot reschedule appointment after attendance and completion'), t('Appointments'));
    return;
  }
  if (apt.status === 'cancelled') {
    bookingModal.openBookingFlow({
      doctor: apt.doctor,
      service: apt.examination || apt.offer || null,
      examination: apt.examination || null,
      type: apt.type || (isOfferAppointment(apt) ? 'examination' : (isExaminationAppointment(apt) ? 'examination' : 'consultation')),
    });
    return;
  }
  if (apt.status !== 'pending') {
    toast.error(t('Cannot modify confirmed appointment. Please contact clinic.'), t('Appointments'));
    return;
  }
  bookingModal.openBookingFlow({
    appointment: apt,
    doctor: apt.doctor,
    service: apt.examination || apt.offer || null,
    examination: apt.examination || null,
    date: apt.date ? new Date(apt.date).toISOString().split('T')[0] : '',
    slot: apt.start_time ? { start_time: apt.start_time, end_time: apt.end_time } : null,
    type: apt.type || (isOfferAppointment(apt) ? 'examination' : (isExaminationAppointment(apt) ? 'examination' : 'consultation')),
  });
};

const bookFollowUp = (apt: any) => {
  bookingModal.openBookingFlow({ doctor: apt.doctor, type: 'follow_up' });
};

const isAptPaid = (apt: any) => {
  return apt?.invoice?.status === 'paid' || apt?.payment_status === 'paid' || apt?.is_paid === true;
};

const getPaymentLabel = (apt: any) => {
  if (isAptPaid(apt)) return t('Fully Paid');
  if (apt?.payment_status === 'refunded' || apt?.invoice?.status === 'refunded') return t('Refunded');
  if (apt?.payment_status === 'failed' || apt?.invoice?.status === 'failed') return t('Failed');
  return t('Pay at Reception');
};

const getPaymentClass = (apt: any) => {
  if (isAptPaid(apt)) return 'paid';
  if (apt?.payment_status === 'refunded' || apt?.invoice?.status === 'refunded') return 'refunded';
  if (apt?.payment_status === 'failed' || apt?.invoice?.status === 'failed') return 'failed';
  return 'pending';
};

const getPaymentIcon = (apt: any) => {
  if (isAptPaid(apt)) return 'pi pi-check-circle';
  if (apt?.payment_status === 'refunded' || apt?.invoice?.status === 'refunded') return 'pi pi-replay';
  if (apt?.payment_status === 'failed' || apt?.invoice?.status === 'failed') return 'pi pi-exclamation-circle';
  return 'pi pi-wallet';
};

const viewReport = (apt: any) => {
  toast.info(t('Medical Report: Health vitals optimal. Follow-up in 2 weeks.'), t('Medical File'));
};

defineExpose({
  PATIENT_APPOINTMENTS: (page = 1) => PATIENT_APPOINTMENTS(page),
  loadAppointments: (page = 1) => PATIENT_APPOINTMENTS(page),
});

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  PATIENT_APPOINTMENTS();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.status-tabs-nav {
  display: flex;
  align-items: center;
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 18px;
  padding: 5px;
  gap: 6px;
  margin-bottom: 16px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  .tab-btn {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 34px;
    padding: 0 14px;
    border-radius: 9999px;
    border: 1px solid var(--unity-border);
    background: var(--unity-surface);
    color: var(--unity-text-muted);
    font-size: 0.80rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    .count-pill {
      background: transparent;
      color: inherit;
      border: none;
      font-size: 0.76rem;
      font-weight: 500;
      opacity: 0.8;
      padding: 0;
    }

    &:hover:not(.active) {
      color: var(--unity-primary);
      border-color: var(--unity-primary);
    }

    &.active {
      background: var(--unity-primary-light, #ecfdf5);
      color: var(--unity-primary);
      border: 1.5px solid var(--unity-primary);
      box-shadow: 0 2px 6px rgba(4, 120, 87, 0.12);

      .count-pill {
        color: var(--unity-primary);
        opacity: 0.9;
      }
    }
  }
}

.cards-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.appointment-card-wrapper {
  display: flex;
  flex-direction: column;
  margin-top: 14px;
  margin-bottom: 14px;
  position: relative;
  direction: rtl;

  :global([dir='ltr']) &,
  :global(html:not([dir='rtl'])) & {
    direction: ltr;
  }
}

.appointment-item-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 18px 16px 16px;
  box-shadow: var(--unity-shadow-subtle);
  position: relative;

  .card-floating-badges-bar {
    position: absolute;
    top: 0;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    z-index: 5;
    left: 14px;
    right: auto;

    :global([dir='ltr']) &,
    :global(html[dir='ltr']) & {
      right: 14px;
      left: auto;
    }

    .floating-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 24px;
      padding: 0 10px;
      border-radius: 9999px;
      font-size: 0.70rem;
      font-weight: 800;
      line-height: 1;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease;

      i {
        font-size: 0.72rem;
      }

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      &.pill-consult {
        background: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
      }

      &.pill-exam {
        background: #f0f9ff;
        color: #0284c7;
        border: 1px solid #bae6fd;
      }

      &.pill-offer {
        background: #fff7ed;
        color: #ea580c;
        border: 1px solid #fed7aa;
      }

      &.status-badge {
        &.status-confirmed {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          .dot { background: #10b981; }
        }

        &.status-completed {
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
          .dot { background: #22c55e; }
        }

        &.status-cancelled {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          .dot { background: #ef4444; }
        }

        &.status-pending {
          background: #f5f3ff;
          color: #7c3aed;
          border: 1px solid #ddd6fe;
          .dot { background: #7c3aed; }
        }
      }

      &.payment-tag {
        &.is-paid {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        &.is-unpaid {
          background: #fff7ed;
          color: #c2410c;
          border: 1px solid #fed7aa;
        }
      }
    }
  }

  .doctor-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;

    img, .doc-avatar-initial {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .doc-avatar-initial {
      background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;

      &.is-exam {
        background: rgba(16, 185, 129, 0.12);
        color: var(--unity-primary);
        border: 1.5px solid rgba(16, 185, 129, 0.4);

        i {
          font-size: 1.3rem;
        }
      }

      &.is-offer {
        background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
        color: #ffffff;
        border: none;

        i {
          font-size: 1.15rem;
        }
      }

      &.is-summary {
        width: 44px;
        height: 44px;
        font-size: 1.05rem;
      }
    }

    .doc-text {
      h5 {
        font-size: 0.98rem;
        font-weight: 600;
        color: var(--unity-text-main);
      }

      p {
        font-size: 0.78rem;
        color: var(--unity-text-muted);
        margin-top: 2px;
      }

      .clinic-sub {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.68rem;
        color: var(--unity-text-dim);
        margin-top: 3px;

        &.is-offer-text {
          color: #d97706;
          font-weight: 600;

          i {
            color: #f59e0b;
          }
        }
      }
    }
  }

  .datetime-banner {
    background: var(--unity-bg);
    border-radius: 12px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    border: 1px solid var(--unity-border-light, #f1f5f9);

    .dt-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--unity-text-main);
      white-space: nowrap;

      i {
        color: var(--unity-primary);
        font-size: 0.8rem;
      }
    }

    .dt-divider {
      width: 1px;
      height: 14px;
      background: var(--unity-border);
      flex-shrink: 0;
    }
  }

  .card-actions-row {
    display: flex;
    gap: 10px;

    button {
      flex: 1;
      padding: 9px;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fee2e2;

      &:hover {
        background: #fee2e2;
      }
    }

    .btn-reschedule {
      background: var(--unity-primary-dark);
      color: #fff;
      border: none;

      &:hover {
        background: #022c22;
      }
    }

    .btn-report {
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-main);
    }

    .btn-followup,
    .btn-rebook {
      background: var(--unity-primary);
      color: #fff;
      border: none;

      &.full-width {
        width: 100%;
      }
    }

    .confirmed-status-pill {
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 12px;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      font-size: 0.8rem;
      font-weight: 700;

      i {
        font-size: 0.9rem;
        color: #10b981;
      }
    }
  }
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--unity-text-muted);

  .empty-icon-wrap {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    color: var(--unity-text-dim);
    margin-bottom: 14px;
  }

  h4 {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--unity-text-main);
    margin-bottom: 6px;
  }

  p {
    font-size: 0.8rem;
    max-width: 260px;
    line-height: 1.5;
    margin-bottom: 18px;
  }

  .book-now-btn {
    padding: 10px 24px;
    border-radius: 14px;
    background: var(--unity-primary-dark);
    color: #fff;
    border: none;
    font-size: 0.85rem;
    font-weight: 800;
    cursor: pointer;
  }
}

// Cancel Summary Box inside Confirm Modal
.cancel-summary-box {
  background: var(--unity-surface-muted, #f8fafc);
  border: 1px solid var(--unity-border, #e2e8f0);
  border-radius: 18px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: start;

  .summary-doctor-row {
    display: flex;
    align-items: center;
    gap: 10px;

    .summary-doc-img {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      border: 1.5px solid var(--unity-border);
    }

    .summary-doc-info {
      display: flex;
      flex-direction: column;

      h6 {
        margin: 0;
        font-size: 0.88rem;
        font-weight: 800;
        color: var(--unity-text, #0f172a);
      }

      small {
        font-size: 0.72rem;
        color: var(--unity-text-muted, #64748b);
      }
    }
  }

  .summary-details-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    padding-top: 8px;
    border-top: 1px dashed var(--unity-border, #e2e8f0);

    .summary-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.76rem;
      font-weight: 600;
      color: var(--unity-text, #334155);

      i {
        font-size: 0.8rem;
        color: var(--unity-primary, #0d9488);
      }

      &.full {
        width: 100%;
      }
    }
  }
}
</style>
