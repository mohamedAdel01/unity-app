<template>
  <div class="appointments-list-container">
    <!-- Filter Tabs (القادمة / المكتملة / الملغية) -->
    <div class="status-tabs-nav">
      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'upcoming' }"
        @click="activeTab = 'upcoming'"
      >
        <span>{{ t('Upcoming') }}</span>
        <span class="count-pill">{{ upcomingAppointments.length }}</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'completed' }"
        @click="activeTab = 'completed'"
      >
        <span>{{ t('Completed') }}</span>
        <span class="count-pill">{{ completedAppointments.length }}</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'cancelled' }"
        @click="activeTab = 'cancelled'"
      >
        <span>{{ t('Cancelled') }}</span>
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
        <div class="appointment-item-card">
        <!-- Card Header: All Booking Metadata Side by Side -->
        <div class="card-head">
          <div class="head-meta-group">
            <span class="type-pill" :class="isExaminationAppointment(apt) ? 'pill-exam' : 'pill-consult'">
              {{ isExaminationAppointment(apt) ? t('Medical Exam') : t('Consultation') }}
            </span>
            <div class="status-badge" :class="getStatusClass(apt.status)">
              <span class="dot"></span>
              <span>{{ getStatusLabel(apt.status) }}</span>
            </div>
            <span v-if="apt.booking_number || apt.id" class="booking-tag">
              #{{ (apt.booking_number || apt.id?.slice(-6))?.toUpperCase() }}
            </span>
          </div>
        </div>

        <!-- Doctor & Clinic / Examination Info -->
        <div class="doctor-row">
          <img 
            v-if="apt.doctor?.avatar || apt.doctor?.user?.avatar"
            :src="apt.doctor?.avatar || apt.doctor?.user?.avatar" 
            alt="Doctor" 
          />
          <div v-else class="doc-avatar-initial" :class="{ 'is-exam': isExaminationAppointment(apt) }">
            <AppExamIcon v-if="isExaminationAppointment(apt)" :size="20" />
            <span v-else>{{ getAppointmentInitial(apt) }}</span>
          </div>
          <div class="doc-text">
            <h5>{{ getAppointmentTitle(apt) }}</h5>
            <div v-if="getAppointmentClinic(apt)" class="clinic-sub">
              <i class="pi pi-building"></i>
              <span>{{ getAppointmentClinic(apt) }}</span>
            </div>
            <p v-else-if="apt.examination?.description" class="exam-sub">
              {{ apt.examination.description }}
            </p>
          </div>
        </div>

        <!-- Date, Time & Payment Status Banner -->
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
          <div class="dt-divider"></div>
          <div class="dt-item dt-payment" :class="apt.invoice?.status === 'paid' ? 'paid' : 'pending'">
            <i :class="apt.invoice?.status === 'paid' ? 'pi pi-check-circle' : 'pi pi-wallet'"></i>
            <span>{{ apt.invoice?.status === 'paid' ? t('Fully Paid') : t('Pay at Reception') }}</span>
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
            v-if="selectedAptToCancel.doctor?.avatar || selectedAptToCancel.doctor?.user?.avatar"
            :src="selectedAptToCancel.doctor?.avatar || selectedAptToCancel.doctor?.user?.avatar" 
            alt="Doctor" 
            class="summary-doc-img"
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

const { t, isRtl } = useI18n();

const bookingModal = useBookingModal();

const globalStore = useGlobalStore();

const toast = useAppToast();

// 2. Data (refs, reactive state)
const activeTab = ref<'upcoming' | 'completed' | 'cancelled'>('upcoming');

const appointments = ref<any[]>([]);
const appointmentsPage = ref(1);
const appointmentsHasMore = ref(false);
const appointmentsLoading = ref(false);

const cancellingId = ref<string | null>(null);

const showCancelModal = ref(false);

const selectedAptToCancel = ref<any | null>(null);

// 3. Computed (computed properties)
const upcomingAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'confirmed' || a.status === 'pending');
});

const completedAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'completed');
});

const cancelledAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'cancelled');
});

const currentList = computed(() => {
  if (activeTab.value === 'upcoming') return upcomingAppointments.value;
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
    case 'pending': return t('Pending Review');
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

const isExaminationAppointment = (apt: any) => {
  return Boolean(apt.examination || apt.examination_id || apt.notes?.includes('فحص'));
};

const getAppointmentTitle = (apt: any) => {
  if (apt.examination?.name) return apt.examination.name;
  if (apt.offer?.title) return apt.offer.title;
  if (apt.service?.name) return apt.service.name;
  if (apt.doctor?.name) return apt.doctor.name;
  if (apt.doctor?.user?.name) return apt.doctor.user.name;
  if (apt.notes && apt.notes.includes(':')) {
    const after = apt.notes.split(':')[1]?.trim();
    if (after) return after;
  }
  return isExaminationAppointment(apt) ? t('Hospital Examination') : t('Doctor Consultation');
};

const getAppointmentSubtitle = (apt: any) => {
  if (apt.examination) return t('Hospital Medical Examination');
  if (apt.offer) return t('Medical Offer');
  return apt.doctor?.specialty || t('Consultation');
};

const getAppointmentClinic = (apt: any) => {
  return (
    apt.clinic?.name ||
    apt.doctor?.clinic?.name ||
    apt.doctor?.doctor?.clinic?.name ||
    (isExaminationAppointment(apt) ? t('Medical Examinations & Labs') : '')
  );
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
    toast.error(err.message || (t('Failed to cancel appointment')));
  } finally {
    cancellingId.value = null;
  }
};

const rebook = (apt: any) => {
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
    type: apt.type || (isExaminationAppointment(apt) ? 'examination' : 'consultation'),
  });
};

const bookFollowUp = (apt: any) => {
  bookingModal.openBookingFlow({ doctor: apt.doctor, type: 'follow_up' });
};

const viewReport = (apt: any) => {
  toast.info(t('Medical Report: Health vitals optimal. Follow-up in 2 weeks.'), 'الملف الطبي');
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
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 16px;
  padding: 4px;
  gap: 6px;
  margin-bottom: 16px;

  .tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: var(--unity-text-muted);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    .count-pill {
      background: var(--unity-border);
      color: var(--unity-text-main);
      font-size: 0.65rem;
      padding: 1px 6px;
      border-radius: 8px;
    }

    &.active {
      background: var(--unity-primary-dark);
      color: #fff;

      .count-pill {
        background: rgba(255, 255, 255, 0.25);
        color: #fff;
      }
    }
  }
}

.cards-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.appointment-item-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--unity-shadow-subtle);

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .head-meta-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;

      .type-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        border-radius: 8px;
        font-size: 0.72rem;
        font-weight: 800;

        &.pill-consult {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid rgba(4, 120, 87, 0.2);
        }

        &.pill-exam {
          background: #f0f9ff;
          color: #0284c7;
          border: 1px solid rgba(2, 132, 199, 0.2);
        }
      }

      .status-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 3px 10px;
        border-radius: 8px;
        font-size: 0.72rem;
        font-weight: 800;

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        &.status-confirmed {
          background: #ecfdf5;
          color: #047857;
          .dot { background: #10b981; }
        }

        &.status-completed {
          background: #e0f2fe;
          color: #0369a1;
          .dot { background: #0284c7; }
        }

        &.status-cancelled {
          background: #fef2f2;
          color: #dc2626;
          .dot { background: #ef4444; }
        }

        &.status-pending {
          background: #fffbeb;
          color: #b45309;
          .dot { background: #f59e0b; }
        }
      }

      .booking-tag {
        font-size: 0.70rem;
        font-weight: 700;
        color: var(--unity-text-dim);
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        padding: 2px 7px;
        border-radius: 8px;
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
      }
    }
  }

  .datetime-banner {
    background: var(--unity-bg);
    border-radius: 12px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-bottom: 14px;
    border: 1px solid var(--unity-border-light, #f1f5f9);

    .dt-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.73rem;
      font-weight: 700;
      color: var(--unity-text-main);
      white-space: nowrap;

      i {
        color: var(--unity-primary);
        font-size: 0.8rem;
      }

      &.dt-payment {
        &.paid {
          color: #059669;
          i { color: #059669; }
        }
        &.pending {
          color: #d97706;
          i { color: #d97706; }
        }
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
