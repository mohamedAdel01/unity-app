<template>
  <Teleport to="body">
    <div v-if="isOpen && patient" class="file-modal-backdrop" @click="close">
    <div class="file-modal-sheet" @click.stop>
      <!-- Header -->
      <div class="sheet-header">
        <div class="header-user-info">
          <div class="avatar-ring">
            <img 
              v-if="patient.avatar" 
              :src="resolveAvatar(patient.avatar)" 
              :alt="patient.name" 
            />
            <span v-else class="avatar-letter">{{ getInitial(patient.name) }}</span>
          </div>
          <div class="user-titles">
            <div class="name-badge-row">
              <h3>{{ patient.name }}</h3>
            </div>
            <p v-if="patient.mrn || patient.national_id" class="mrn-meta">
              <span v-if="patient.mrn">MRN - {{ patient.mrn }}</span>
              <span v-if="patient.mrn && patient.national_id">•</span>
              <span v-if="patient.national_id">{{ t('National ID') }}: {{ maskNationalId(patient.national_id) }}</span>
            </p>
          </div>
        </div>

        <button class="btn-sheet-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Quick Action Pills -->
      <div v-if="patient.phone || patient.clinic" class="quick-patient-contacts">
        <a v-if="patient.phone" :href="`tel:${patient.phone}`" class="contact-pill phone">
          <i class="pi pi-phone"></i>
          <span dir="ltr">{{ patient.phone }}</span>
        </a>
        <div v-if="patient.clinic" class="contact-pill clinic">
          <i class="pi pi-building"></i>
          <span>{{ patient.clinic }}</span>
        </div>
      </div>

      <!-- Active Diagnosis (Dynamic - only if present) -->
      <div v-if="patient.diagnosis" class="info-block-card">
        <div class="block-title">
          <i class="pi pi-heart"></i>
          <h5>{{ t('Current Diagnosis & Health Status') }}</h5>
        </div>
        <p class="block-content">
          {{ patient.diagnosis }}
        </p>
      </div>

      <!-- Visit History Timeline (Dynamic) -->
      <div class="timeline-block-card">
        <div class="block-title">
          <i class="pi pi-calendar"></i>
          <h5>{{ t('Patient Appointments & Medical Visits') }}</h5>
          <span v-if="appointmentsList.length > 0" class="count-pill">({{ appointmentsList.length }})</span>
        </div>

        <!-- Loading State -->
        <div v-if="loadingDetails" class="timeline-loading">
          <i class="pi pi-spin pi-spinner"></i>
          <span>{{ t('Loading...') }}</span>
        </div>

        <!-- Real Dynamic Appointments -->
        <div v-else-if="appointmentsList.length > 0" class="timeline-items">
          <div v-for="apt in appointmentsList" :key="apt.id" class="timeline-item">
            <span class="timeline-dot" :class="isUpcoming(apt.status) ? 'upcoming' : 'past'"></span>
            <div class="timeline-details">
              <div class="timeline-title-row">
                <span class="timeline-type-pill" :class="apt.examination ? 'pill-exam' : 'pill-consult'">
                  {{ apt.examination ? t('Medical Exam') : t('Consultation') }}
                </span>
                <strong>{{ apt.examination?.name || apt.doctor?.name || apt.service?.name || (apt.type === 'examination' ? t('Medical Exam') : t('Consultation')) }}</strong>
              </div>
              <small>{{ formatAptMeta(apt) }}</small>
            </div>
            <span class="status-chip" :class="apt.status">{{ formatStatus(apt.status) }}</span>
          </div>
        </div>

        <!-- Empty State (No Dummy Data) -->
        <div v-else class="empty-timeline-state">
          <i class="pi pi-calendar-times"></i>
          <p>{{ t('No previous medical visits recorded') }}</p>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="sheet-footer-actions">
        <button class="btn-book-more" @click="onBookAppointment">
          <i class="pi pi-calendar-plus"></i>
          <span>{{ t('Book New Appointment') }}</span>
        </button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useBookingModal } from '../../composables/useBookingModal';
import { useModalState } from '../../composables/useModalState';

const props = defineProps<{
  isOpen: boolean;
  patient: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t, isRtl } = useI18n();
const api = useUnityApi();
const bookingModal = useBookingModal();
const { registerModalOpen, registerModalClose } = useModalState();

// 2. Data (refs, reactive state)
const detailedAppointments = ref<any[]>([]);
const loadingDetails = ref(false);

// 3. Computed (computed properties)
const appointmentsList = computed(() => {
  if (detailedAppointments.value.length > 0) {
    return detailedAppointments.value;
  }
  if (Array.isArray(props.patient?.patient_appointments) && props.patient.patient_appointments.length > 0) {
    return props.patient.patient_appointments;
  }
  return [];
});

// 4. Methods (functions, handlers)
const close = () => {
  emit('close');
};

const getInitial = (name?: string) => {
  if (!name) return 'م';
  return name.trim().charAt(0);
};

const maskNationalId = (id?: string) => {
  if (!id) return '';
  if (id.length <= 4) return `••••••${id}`;
  return `••••••${id.slice(-4)}`;
};

const resolveAvatar = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
    return url;
  }
  const config = useRuntimeConfig();
  const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
  return `${baseUrl}${url}`;
};

const formatTime12h = (timeStr?: string) => {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;
  let h = parseInt(parts[0], 10);
  const m = parts[1].slice(0, 2);
  if (isNaN(h)) return trimmed;
  const period = h >= 12 ? (isRtl.value ? 'م' : 'PM') : (isRtl.value ? 'ص' : 'AM');
  h = h % 12;
  if (h === 0) h = 12;
  const hPadded = h.toString().padStart(2, '0');
  return `${hPadded}:${m} ${period}`;
};

const formatTimeRange = (timeStr?: string) => {
  if (!timeStr) return '';
  const str = String(timeStr).trim();
  if (str.includes('-')) {
    const [start, end] = str.split('-');
    return `${formatTime12h(start)} - ${formatTime12h(end)}`;
  }
  return formatTime12h(str);
};

const formatAptMeta = (apt: any) => {
  const parts: string[] = [];
  if (apt.date) {
    const d = new Date(apt.date);
    parts.push(d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  }
  const timeVal = apt.start_time || apt.time;
  if (timeVal) {
    parts.push(formatTimeRange(timeVal));
  }
  if (apt.doctor?.name && apt.examination) {
    parts.push(apt.doctor.name);
  } else if (apt.doctor?.doctor?.clinic?.name) {
    parts.push(apt.doctor.doctor.clinic.name);
  } else if (apt.clinic?.name) {
    parts.push(apt.clinic.name);
  }
  return parts.join(' • ');
};

const formatStatus = (status?: string) => {
  if (!status) return t('Confirmed');
  if (status === 'scheduled') return t('Scheduled');
  if (status === 'confirmed') return t('Confirmed');
  if (status === 'completed') return t('Completed');
  if (status === 'cancelled') return t('Cancelled');
  return status;
};

const isUpcoming = (status?: string) => {
  return status === 'scheduled' || status === 'confirmed';
};

const ADMIN_PATIENT_BY_ID = async () => {
  if (!props.patient?.id) return;
  loadingDetails.value = true;
  try {
    const res = await api.apiRequest({
      service: 'ADMIN_PATIENT_BY_ID',
      filter: { id: props.patient.id },
    });
    if (res?.status && res?.data?.patient_appointments) {
      detailedAppointments.value = res.data.patient_appointments;
    } else {
      detailedAppointments.value = [];
    }
  } catch (err) {
    detailedAppointments.value = [];
  } finally {
    loadingDetails.value = false;
  }
};

const onBookAppointment = () => {
  close();
  bookingModal.openQuickBook();
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      registerModalOpen();
      if (props.patient?.id) {
        ADMIN_PATIENT_BY_ID();
      }
    } else {
      registerModalClose();
      detailedAppointments.value = [];
    }
  },
  { immediate: true }
);

// 6. Hooks (onMounted, onUnmounted, etc.)
onUnmounted(() => {
  if (props.isOpen) {
    registerModalClose();
  }
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.file-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.file-modal-sheet {
  width: 100%;
  max-width: 430px;
  max-height: 92vh;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 20px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .sheet-header .header-user-info .user-titles,
    .info-block-card,
    .timeline-block-card {
      text-align: left;
    }
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .avatar-ring {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #ecfdf5;
        border: 2px solid #a7f3d0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-letter {
          font-size: 1.25rem;
          font-weight: 800;
          color: #047857;
        }
      }

      .user-titles {
        display: flex;
        flex-direction: column;
        text-align: right;

        .name-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;

          h3 {
            font-size: 1.1rem;
            font-weight: 800;
            color: var(--unity-text-main);
          }
        }

        .mrn-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--unity-text-muted);
          margin-top: 2px;
        }
      }
    }

    .btn-sheet-close {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: var(--unity-border);
        color: var(--unity-text-main);
      }
    }
  }

  .quick-patient-contacts {
    display: flex;
    align-items: center;
    gap: 8px;

    .contact-pill {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 12px;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--unity-text-main);
      text-decoration: none;

      i {
        font-size: 0.85rem;
        color: var(--unity-primary);
      }
    }
  }

  .info-block-card,
  .timeline-block-card {
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    border-radius: 18px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-align: right;

    .block-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--unity-primary-dark);

      i {
        font-size: 1rem;
        color: var(--unity-primary);
      }

      h5 {
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      .count-pill {
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--unity-primary);
        background: #ecfdf5;
        padding: 1px 6px;
        border-radius: 6px;
      }
    }

    .block-content {
      font-size: 0.82rem;
      color: var(--unity-text-muted);
      line-height: 1.5;
    }
  }

  .timeline-loading,
  .empty-timeline-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 16px;
    background: var(--unity-bg);
    border-radius: 12px;
    color: var(--unity-text-muted);
    font-size: 0.8rem;
    text-align: center;

    i {
      font-size: 1.5rem;
      color: var(--unity-text-dim);
    }

    p {
      margin: 0;
    }
  }

  .timeline-items {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .timeline-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px;
      background: var(--unity-bg);
      border-radius: 12px;

      .timeline-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;

        &.upcoming {
          background: #10b981;
        }

        &.past {
          background: #94a3b8;
        }
      }

      .timeline-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;

        .timeline-title-row {
          display: flex;
          align-items: center;
          gap: 6px;

          .timeline-type-pill {
            font-size: 0.65rem;
            font-weight: 800;
            padding: 1px 6px;
            border-radius: 6px;

            &.pill-consult {
              background: #ecfdf5;
              color: #047857;
            }

            &.pill-exam {
              background: #f0f9ff;
              color: #0284c7;
            }
          }

          strong {
            font-size: 0.82rem;
            color: var(--unity-text-main);
          }
        }

        small {
          font-size: 0.72rem;
          color: var(--unity-text-muted);
        }
      }

      .status-chip {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 10px;
        background: #d1fae5;
        color: #065f46;

        &.completed {
          background: #e0f2fe;
          color: #0369a1;
        }

        &.cancelled {
          background: #fee2e2;
          color: #b91c1c;
        }

        &.scheduled {
          background: #fef3c7;
          color: #92400e;
        }
      }
    }
  }

  .sheet-footer-actions {
    margin-top: 4px;

    .btn-book-more {
      width: 100%;
      padding: 12px;
      border-radius: 14px;
      background: var(--unity-primary);
      color: #fff;
      border: none;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);
      transition: all 0.2s;

      &:hover {
        background: var(--unity-primary-dark);
      }
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
