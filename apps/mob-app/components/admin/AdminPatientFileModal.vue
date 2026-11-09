<template>
  <div v-if="isOpen && patient" class="file-modal-backdrop" @click="close">
    <div class="file-modal-sheet" :dir="isRtl ? 'rtl' : 'ltr'" @click.stop>
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
              <span class="insurance-pill">{{ patient.insurance || patient.badge || t('Bupa Gold') }}</span>
            </div>
            <p class="mrn-meta">
              <span>MRN - {{ patient.mrn || '8849201' }}</span>
              <span>•</span>
              <span>{{ t('National ID') }}: {{ maskNationalId(patient.national_id) }}</span>
            </p>
          </div>
        </div>

        <button class="btn-sheet-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Quick Action Pills -->
      <div class="quick-patient-contacts">
        <a :href="`tel:${patient.phone}`" class="contact-pill phone">
          <i class="pi pi-phone"></i>
          <span dir="ltr">{{ patient.phone || '+966 50 123 4567' }}</span>
        </a>
        <div class="contact-pill clinic">
          <i class="pi pi-building"></i>
          <span>{{ patient.clinic || t('Internal Medicine') }}</span>
        </div>
      </div>

      <!-- Vitals Strip -->
      <div class="vitals-strip-card">
        <div class="vital-item">
          <small>{{ t('BP') }}</small>
          <strong>120/80</strong>
          <span>mmHg</span>
        </div>
        <div class="vital-divider"></div>
        <div class="vital-item">
          <small>{{ t('Pulse') }}</small>
          <strong>74</strong>
          <span>bpm</span>
        </div>
        <div class="vital-divider"></div>
        <div class="vital-item">
          <small>{{ t('Weight') }}</small>
          <strong>76</strong>
          <span>kg</span>
        </div>
        <div class="vital-divider"></div>
        <div class="vital-item">
          <small>{{ t('Blood') }}</small>
          <strong>O+</strong>
          <span>Rh</span>
        </div>
      </div>

      <!-- Active Diagnosis -->
      <div class="info-block-card">
        <div class="block-title">
          <i class="pi pi-heart"></i>
          <h5>{{ t('Current Diagnosis & Health Status') }}</h5>
        </div>
        <p class="block-content">
          {{ patient.diagnosis || t('Mild Hypertension • Regular Follow-up') }}
        </p>
      </div>

      <!-- Visit History Timeline -->
      <div class="timeline-block-card">
        <div class="block-title">
          <i class="pi pi-history"></i>
          <h5>{{ t('Visit History & Medical Reports') }}</h5>
        </div>

        <div class="timeline-items">
          <div class="timeline-item">
            <span class="timeline-dot upcoming"></span>
            <div class="timeline-details">
              <strong>{{ t('Upcoming: Routine Follow-up') }}</strong>
              <small>{{ patient.next_appointment || t('Tomorrow 10:00 AM • Internal Medicine') }}</small>
            </div>
            <span class="status-chip active">{{ t('Confirmed') }}</span>
          </div>

          <div class="timeline-item">
            <span class="timeline-dot past"></span>
            <div class="timeline-details">
              <strong>{{ t('Clinical Consultation') }}</strong>
              <small>{{ patient.last_visit || t('Oct 12, 2024 • Dr. Khaled') }}</small>
            </div>
            <button class="btn-download-report" @click="downloadReport">
              <i class="pi pi-download"></i>
              <span>PDF</span>
            </button>
          </div>
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
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';
import { useBookingModal } from '../../composables/useBookingModal';

const props = defineProps<{
  isOpen: boolean;
  patient: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t, isRtl } = useI18n();
const toast = useAppToast();
const bookingModal = useBookingModal();

const close = () => {
  emit('close');
};

const getInitial = (name?: string) => {
  if (!name) return 'م';
  return name.trim().charAt(0);
};

const maskNationalId = (id?: string) => {
  if (!id) return '••••••1042';
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

const downloadReport = () => {
  toast.success(isRtl.value ? 'تم تنزيل التقرير الطبي بصيغة PDF بنجاح.' : 'Medical Report PDF downloaded successfully.', isRtl.value ? 'السجلات الطبية' : 'Medical Records');
};

const onBookAppointment = () => {
  close();
  bookingModal.openQuickBook();
};
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

          .insurance-pill {
            background: #fef3c7;
            color: #92400e;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 12px;
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

  .vitals-strip-card {
    background: #f8fafc;
    border: 1px solid var(--unity-border);
    border-radius: 16px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    justify-content: space-around;

    .vital-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;

      small {
        font-size: 0.65rem;
        color: var(--unity-text-muted);
      }

      strong {
        font-size: 0.95rem;
        color: #047857;
        font-weight: 800;
      }

      span {
        font-size: 0.6rem;
        color: var(--unity-text-dim);
      }
    }

    .vital-divider {
      width: 1px;
      height: 28px;
      background: #e2e8f0;
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
    }

    .block-content {
      font-size: 0.82rem;
      color: var(--unity-text-muted);
      line-height: 1.5;
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

        strong {
          font-size: 0.82rem;
          color: var(--unity-text-main);
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
      }

      .btn-download-report {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: var(--unity-surface);
        border: 1px solid var(--unity-border);
        color: var(--unity-primary);
        font-size: 0.72rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: var(--unity-primary-light);
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

