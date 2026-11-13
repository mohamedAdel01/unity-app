<template>
  <div class="admin-booking-card" :class="{ 'is-expanded': isExpanded }">
    <!-- ============================================== -->
    <!-- Card Header Row (Click to toggle accordion)   -->
    <!-- ============================================== -->
    <div class="booking-header-row" @click="toggleExpand">
      <!-- Right Side: Patient Avatar & Details -->
      <div class="patient-cell">
        <div class="avatar-wrap">
          <img v-if="booking.avatar" :src="resolveAvatar(booking.avatar)" :alt="booking.patient_name" class="avatar-img" />
          <div v-else class="initial-avatar">
            <span>{{ patientInitial }}</span>
          </div>
        </div>

        <div class="patient-info">
          <div class="patient-name-row">
            <h5 class="patient-name">{{ booking.patient_name || t('Patient') }}</h5>
          </div>
          <div class="service-subline">
            <i :class="isExamination ? 'pi pi-compass' : 'pi pi-building'" class="clinic-sub-icon"></i>
            <span class="service-name">{{ serviceTitle }}</span>
          </div>
        </div>
      </div>

      <!-- Left Side: Status Chip on Top Left & Expand Arrow -->
      <div class="meta-cell">
        <span class="type-badge" :class="isExamination ? 'badge-exam' : 'badge-consult'">
          {{ bookingTypeLabel }}
        </span>
        <span class="status-badge" :class="getStatusClass(booking.status)">
          <span class="dot"></span>
          <span>{{ getStatusLabel(booking.status) }}</span>
        </span>
        <button type="button" class="expand-btn" :aria-label="isExpanded ? 'Collapse' : 'Expand'">
          <i :class="isExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
        </button>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- Expanded Body (Visible when isExpanded is true)-->
    <!-- ============================================== -->
    <div v-if="isExpanded" class="booking-expanded-body">
      <!-- Doctor / Examination & Schedule Banner -->
      <div class="details-info-box">
        <div class="info-item" v-if="booking.doctor_name">
          <div class="info-icon"><i class="pi pi-user"></i></div>
          <div class="info-content">
            <strong class="info-val">{{ doctorTitle }}</strong>
            <span v-if="booking.clinic_name" class="info-subval">{{ booking.clinic_name }}</span>
          </div>
        </div>
        <div class="info-item" v-else>
          <div class="info-icon"><AppExamIcon :size="18" /></div>
          <div class="info-content">
            <strong class="info-val">{{ serviceTitle }}</strong>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon"><i class="pi pi-clock"></i></div>
          <div class="info-content">
            <span class="info-label">{{ t('Time') }}</span>
            <strong class="info-val">{{ formatTime(booking.time || booking.time_badge) }}</strong>
          </div>
        </div>
      </div>

      <!-- Finance & Payment Bar -->
      <div class="finance-bar">
        <div class="payment-method-badge">
          <i :class="booking.payment_method === 'paymob' ? 'pi pi-credit-card' : 'pi pi-wallet'"></i>
          <span>{{ getPaymentMethodLabel(booking.payment_method) }}</span>
          <span class="payment-pill" :class="paymentStatusClass">
            {{ paymentStatusLabel }}
          </span>
        </div>
        <div class="price-badge">
          <span class="price-val">{{ booking.price || 0 }}</span>
          <span class="currency">{{ t('EGP') }}</span>
        </div>
      </div>

      <!-- Action Buttons Grid -->
      <div class="actions-grid">
        <!-- Approve Booking (Prominent when pending) -->
        <button 
          v-if="booking.status === 'pending'" 
          type="button" 
          class="act-btn btn-approve" 
          @click.stop="emit('approve', booking)"
        >
          <i class="pi pi-check-circle"></i>
          <span>{{ t('Approve Booking') }}</span>
        </button>

        <!-- Reschedule Slot -->
        <button 
          type="button" 
          class="act-btn btn-reschedule" 
          @click.stop="emit('reschedule', booking)"
        >
          <i class="pi pi-calendar"></i>
          <span>{{ t('Reschedule Slot') }}</span>
        </button>

        <!-- Invoice Button -->
        <button 
          type="button" 
          class="act-btn btn-invoice" 
          @click.stop="emit('download-invoice', booking)"
        >
          <i class="pi pi-download"></i>
          <span>{{ t('Invoice') }}</span>
        </button>

        <!-- Cancel Booking (Only allowed for pending bookings before confirmation) -->
        <button 
          v-if="booking.status === 'pending'" 
          type="button" 
          class="act-btn btn-cancel" 
          @click.stop="emit('cancel', booking)"
        >
          <i class="pi pi-times"></i>
          <span>{{ t('Cancel Booking') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import AppExamIcon from '../common/AppExamIcon.vue';

const props = withDefaults(
  defineProps<{
    booking: any;
    initiallyExpanded?: boolean;
  }>(),
  {
    initiallyExpanded: false,
  }
);

const emit = defineEmits<{
  (e: 'reschedule', booking: any): void;
  (e: 'download-invoice', booking: any): void;
  (e: 'approve', booking: any): void;
  (e: 'cancel', booking: any): void;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)
const isExpanded = ref(props.initiallyExpanded);

// 3. Computed (computed properties)
const patientInitial = computed(() => {
  const name = props.booking?.patient_name || '';
  return name.trim().charAt(0) || 'م';
});

const isExamination = computed(() => {
  return Boolean(
    props.booking?.is_examination || 
    props.booking?.examination_id || 
    (!props.booking?.doctor_name && props.booking?.clinic_name)
  );
});

const bookingTypeLabel = computed(() => {
  return isExamination.value ? t('Medical Exam') : t('Consultation');
});

const isPaid = computed(() => {
  return Boolean(
    props.booking?.is_paid === true || 
    props.booking?.payment_status === 'paid' || 
    props.booking?.invoice?.status === 'paid'
  );
});

const paymentStatus = computed(() => {
  if (isPaid.value) return 'paid';
  const raw = String(props.booking?.payment_status || props.booking?.invoice?.status || '').toLowerCase();
  if (raw === 'refunded') return 'refunded';
  if (raw === 'failed') return 'failed';
  return 'pending';
});

const paymentStatusLabel = computed(() => {
  switch (paymentStatus.value) {
    case 'paid':
      return t('Paid Status');
    case 'refunded':
      return t('Refunded');
    case 'failed':
      return t('Failed');
    default:
      return t('Unpaid Status');
  }
});

const paymentStatusClass = computed(() => {
  return paymentStatus.value;
});

const serviceTitle = computed(() => {
  return props.booking?.examination_name || props.booking?.clinic_name || props.booking?.doctor_name || t('General Clinic');
});

const doctorTitle = computed(() => {
  const name = props.booking?.doctor_name || '';
  if (!name) return '';
  return name.startsWith('د.') ? name : `د. ${name}`;
});

// 4. Methods (functions, handlers)
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const formatSingleTime = (timeStr?: string) => {
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

const formatTime = (timeStr?: string) => {
  if (!timeStr) return '';
  const str = String(timeStr).trim();
  if (str.includes('-')) {
    const [start, end] = str.split('-');
    return `${formatSingleTime(start)} - ${formatSingleTime(end)}`;
  }
  return formatSingleTime(str);
};

const getStatusLabel = (status?: string) => {
  if (status === 'confirmed') return t('Confirmed Status');
  if (status === 'cancelled') return t('Cancelled Status');
  if (status === 'completed') return t('Completed Status');
  return t('Pending Status');
};

const getStatusClass = (status?: string) => {
  if (status === 'confirmed') return 'status-confirmed';
  if (status === 'cancelled') return 'status-cancelled';
  if (status === 'completed') return 'status-completed';
  return 'status-pending';
};

const getPaymentMethodLabel = (method?: string) => {
  if (!method) return t('Cash on Arrival');
  const m = String(method).toLowerCase();
  if (m === 'cash') return t('Cash on Arrival');
  if (m === 'paymob' || m === 'online' || m === 'card') return t('Electronic Payment');
  return method;
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

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-booking-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 20px;
  padding: 14px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
  margin-bottom: 12px;

  &.is-expanded {
    border-color: #cbd5e1;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
  }

  // 1. Header Row
  .booking-header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    cursor: pointer;
    user-select: none;

    .patient-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      flex: 1;

      .avatar-wrap {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        flex-shrink: 0;
        overflow: hidden;

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .initial-avatar {
          width: 100%;
          height: 100%;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          font-weight: 800;
        }
      }

      .patient-info {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;

        .patient-name-row {
          display: flex;
          align-items: center;
          gap: 8px;

          .patient-name {
            font-size: 0.96rem;
            font-weight: 800;
            color: var(--unity-text-main);
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .service-subline {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          .clinic-sub-icon {
            font-size: 0.74rem;
            color: var(--unity-text-dim, #94a3b8);
            flex-shrink: 0;
          }

          .service-name {
            font-size: 0.78rem;
            font-weight: 700;
            color: var(--unity-text-muted, #64748b);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }

    .meta-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;

      .type-badge {
        font-size: 0.67rem;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 6px;
        line-height: 1.3;
        white-space: nowrap;

        &.badge-consult {
          background: rgba(4, 120, 87, 0.1);
          color: #047857;
          border: 1px solid rgba(4, 120, 87, 0.2);
        }

        &.badge-exam {
          background: rgba(37, 99, 235, 0.1);
          color: #2563eb;
          border: 1px solid rgba(37, 99, 235, 0.2);
        }
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 7px;
        border-radius: 6px;
        font-size: 0.67rem;
        font-weight: 800;
        line-height: 1.3;
        white-space: nowrap;

        .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        &.status-pending {
          background: #f5f3ff;
          color: #7c3aed;
          border: 1px solid #ddd6fe;

          .dot {
            background: #7c3aed;
          }
        }

        &.status-confirmed {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;

          .dot {
            background: #10b981;
          }
        }

        &.status-cancelled {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;

          .dot {
            background: #ef4444;
          }
        }

        &.status-completed {
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;

          .dot {
            background: #22c55e;
          }
        }
      }

      .expand-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 0.85rem;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;

        &:hover {
          color: var(--unity-text-main);
        }
      }
    }
  }

  // 2. Expanded Body
  .booking-expanded-body {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px dashed var(--unity-border);
    display: flex;
    flex-direction: column;
    gap: 12px;

    .details-info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 10px 14px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;

      .info-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .info-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #e2e8f0;
          color: #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .info-content {
          display: flex;
          flex-direction: column;
          min-width: 0;

          .info-label {
            font-size: 0.68rem;
            color: #64748b;
            font-weight: 600;
          }

          .info-val {
            font-size: 0.84rem;
            color: #0f172a;
            font-weight: 800;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .info-subval {
            font-size: 0.70rem;
            color: #64748b;
            font-weight: 600;
          }
        }
      }
    }

    .finance-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      border-radius: 12px;

      .payment-method-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        font-weight: 700;
        color: #0f172a;

        i {
          color: #10b981;
          font-size: 0.9rem;
        }

        .payment-pill {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 5px;
          margin-inline-start: 4px;

          &.paid {
            background: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
          }

          &.pending {
            background: #fff7ed;
            color: #c2410c;
            border: 1px solid #fed7aa;
          }

          &.refunded {
            background: #eff6ff;
            color: #1d4ed8;
            border: 1px solid #bfdbfe;
          }

          &.failed {
            background: #fef2f2;
            color: #b91c1c;
            border: 1px solid #fecaca;
          }
        }
      }

      .price-badge {
        display: inline-flex;
        align-items: baseline;
        gap: 4px;

        .price-val {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--unity-primary);
        }

        .currency {
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
        }
      }
    }

    // Actions Grid
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 8px;
      margin-top: 4px;

      .act-btn {
        height: 40px;
        border-radius: 12px;
        font-size: 0.78rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0 10px;
        white-space: nowrap;

        i {
          font-size: 0.85rem;
        }

        &.btn-approve {
          grid-column: 1 / -1;
          background: var(--unity-primary);
          color: #fff;
          border: none;
          box-shadow: 0 2px 6px rgba(18, 93, 73, 0.25);

          &:hover {
            background: var(--unity-primary-dark);
            transform: translateY(-1px);
          }
        }

        &.btn-reschedule {
          background: #f1f5f9;
          color: #1e293b;
          border: 1px solid #cbd5e1;

          &:hover {
            background: #e2e8f0;
          }
        }

        &.btn-invoice {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;

          &:hover {
            background: #d1fae5;
          }
        }

        &.btn-cancel {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;

          &:hover {
            background: #fee2e2;
          }
        }
      }
    }
  }
}
</style>
