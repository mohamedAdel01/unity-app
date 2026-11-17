<template>
  <div class="admin-booking-card-wrapper">
    <!-- ============================================== -->
    <!-- Main Card Body                                 -->
    <!-- ============================================== -->
    <div class="admin-booking-card" :class="{ 'is-expanded': isExpanded }">
      <!-- ============================================== -->
      <!-- Top Floating Badges Bar (Half in, half out)    -->
      <!-- ============================================== -->
      <div class="card-floating-badges-bar">
        <!-- 1. Booking Type Badge -->
        <span class="floating-badge badge-type" :class="isExamination ? 'type-exam' : 'type-consult'">
          {{ bookingTypeLabel }}
        </span>

        <!-- 2. Booking Status Badge (Clickable to change status directly) -->
        <span 
          class="floating-badge badge-status is-clickable" 
          :class="getStatusClass(booking.status)"
          :title="t('Change Status')"
          @click.stop="emit('change-status', booking)"
        >
          <span class="dot"></span>
          <span>{{ getStatusLabel(booking.status) }}</span>
          <i class="pi pi-chevron-down pill-chevron"></i>
        </span>

        <!-- 3. Payment Status Badge -->
        <span 
          class="floating-badge badge-payment is-clickable" 
          :class="paymentStatusClass"
          :title="t('Change Payment Status')"
          @click.stop="emit('change-payment-status', booking)"
        >
          <i :class="isPaid ? 'pi pi-check-circle' : 'pi pi-clock'"></i>
          <span>{{ paymentStatusLabel }}</span>
          <i class="pi pi-chevron-down pill-chevron"></i>
        </span>
      </div>

      <!-- Card Header Row (Click to toggle accordion)   -->
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
            <div class="phone-subline" @click.stop>
              <template v-if="displayPhone">
                <i class="pi pi-phone phone-sub-icon"></i>
                <span class="phone-number" dir="ltr">{{ displayPhone }}</span>
                <button 
                  type="button" 
                  class="phone-copy-btn" 
                  :class="{ copied: hasCopiedPhone }"
                  :title="t('Copy phone number')" 
                  :aria-label="t('Copy phone number')"
                  @click.stop="copyPhone(displayPhone)"
                >
                  <i class="pi" :class="hasCopiedPhone ? 'pi-check' : 'pi-copy'"></i>
                </button>
              </template>
              <template v-else>
                <i class="pi pi-phone phone-sub-icon"></i>
                <span class="phone-number-empty">{{ t('No phone number') }}</span>
              </template>
            </div>
          </div>
        </div>

        <!-- Left Side: Expand Chevron Button Only -->
        <div class="meta-cell">
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
        <div 
          class="payment-method-badge is-clickable"
          :title="t('Change Payment Status')"
          @click.stop="emit('change-payment-status', booking)"
        >
          <i :class="booking.payment_method === 'paymob' || booking.payment_method === 'card' ? 'pi pi-credit-card' : 'pi pi-wallet'"></i>
          <span>{{ getPaymentMethodLabel(booking.payment_method) }}</span>
          <i class="pi pi-pencil edit-icon-subtle"></i>
        </div>
        <div class="price-badge">
          <span class="price-val">{{ booking.price || 0 }}</span>
          <span class="currency">{{ t('EGP') }}</span>
        </div>
      </div>

      <!-- Action Bar: Large Action Buttons (Side by Side matching system standard) -->
      <div class="card-bottom-bar-large">
        <!-- 1. Pending: Confirm or Cancel -->
        <template v-if="booking.status === 'pending'">
          <button 
            type="button" 
            class="btn-bottom-action btn-confirm" 
            @click.stop="emit('approve', booking)"
          >
            <i class="pi pi-check"></i>
            <span>{{ t('Confirm Booking') }}</span>
          </button>

          <button 
            type="button" 
            class="btn-bottom-action btn-cancel" 
            @click.stop="emit('cancel', booking)"
          >
            <i class="pi pi-times"></i>
            <span>{{ t('Cancel') }}</span>
          </button>
        </template>

        <!-- 2. Confirmed: Mark Attended (Completed) OR Did Not Attend (Cancel) -->
        <template v-else-if="booking.status === 'confirmed'">
          <button 
            type="button" 
            class="btn-bottom-action btn-complete" 
            @click.stop="emit('complete', booking)"
          >
            <i class="pi pi-check-circle"></i>
            <span>{{ t('Attended') }}</span>
          </button>

          <button 
            type="button" 
            class="btn-bottom-action btn-no-show" 
            @click.stop="emit('cancel', booking)"
          >
            <i class="pi pi-times-circle"></i>
            <span>{{ t('Did Not Attend') }}</span>
          </button>
        </template>

        <!-- 3. Completed or Cancelled: Status Pill + Change Status button -->
        <template v-else>
          <div 
            class="status-summary-pill is-clickable" 
            :class="getStatusClass(booking.status)"
            :title="t('Change Status')"
            @click.stop="emit('change-status', booking)"
          >
            <span class="dot"></span>
            <span>{{ getStatusLabel(booking.status) }}</span>
            <i class="pi pi-chevron-down pill-chevron"></i>
          </div>

          <button 
            type="button" 
            class="btn-bottom-action btn-modify-status" 
            @click.stop="emit('change-status', booking)"
          >
            <i class="pi pi-sliders-h"></i>
            <span>{{ t('Change Status') }}</span>
          </button>
        </template>

        <!-- Edit / Reschedule slot unified button -->
        <button 
          v-if="booking.status !== 'completed' && booking.status !== 'cancelled'"
          type="button" 
          class="btn-card-edit" 
          :title="t('Reschedule Slot')" 
          :aria-label="t('Reschedule Slot')" 
          @click.stop="emit('reschedule', booking)"
        >
          <i class="pi pi-pencil"></i>
        </button>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';
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
  (e: 'complete', booking: any): void;
  (e: 'cancel', booking: any): void;
  (e: 'change-status', booking: any): void;
  (e: 'change-payment-status', booking: any): void;
  (e: 'change-status', booking: any): void;
  (e: 'change-payment-status', booking: any): void;
}>();

const { t, isRtl } = useI18n();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const isExpanded = ref(props.initiallyExpanded);
const hasCopiedPhone = ref(false);
let copyTimeout: any = null;

// 3. Computed (computed properties)
const displayPhone = computed(() => {
  return props.booking?.patient_phone || props.booking?.phone || props.booking?.patient?.phone || '';
});
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

const copyPhone = async (phone: string) => {
  if (!phone) return;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(phone);
    } else {
      const input = document.createElement('input');
      input.value = phone;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    hasCopiedPhone.value = true;
    toast.success(t('Phone copied to clipboard!'));
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      hasCopiedPhone.value = false;
    }, 2000);
  } catch (err) {
    // silently fail
  }
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
  const baseUrl = config.public?.API_URL || config.public?.apiUrl || 'http://localhost:4000';
  return `${baseUrl}${url}`;
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onUnmounted(() => {
  if (copyTimeout) clearTimeout(copyTimeout);
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-booking-card-wrapper {
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

  .admin-booking-card {
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    border-radius: 20px;
    padding: 18px 16px 14px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.25s ease;
    margin-bottom: 0;

    &.is-expanded {
      border-color: #cbd5e1;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
    }

    // Top Floating Badges Bar (Half in, half out: top border overlap)
    // On the LEFT in Arabic (RTL), on the RIGHT in English (LTR)
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

        // 1. Type Badges
        &.badge-type {
          &.type-consult {
            background: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
          }

          &.type-exam {
            background: #f0f9ff;
            color: #0284c7;
            border: 1px solid #bae6fd;
          }
        }

        // 2. Booking Status Badges
        &.badge-status {
          &.is-clickable {
            cursor: pointer;
            &:hover {
              filter: brightness(0.96);
              transform: translateY(-1px);
            }
          }

          .pill-chevron {
            font-size: 0.60rem;
            margin-inline-start: 1px;
            opacity: 0.7;
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

          &.status-completed {
            background: #f0fdf4;
            color: #15803d;
            border: 1px solid #bbf7d0;

            .dot {
              background: #22c55e;
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
        }

        // 3. Payment Status Badges
        &.badge-payment {
          &.is-clickable {
            cursor: pointer;
            &:hover {
              filter: brightness(0.96);
              transform: translateY(-1px);
            }
          }

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
    }

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

          .phone-subline {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 3px;
            cursor: default;

            .phone-sub-icon {
              font-size: 0.72rem;
              color: var(--unity-primary, #047857);
              flex-shrink: 0;
            }

            .phone-number {
              font-size: 0.78rem;
              font-weight: 700;
              color: var(--unity-text-muted, #475569);
              letter-spacing: 0.3px;
            }

            .phone-number-empty {
              font-size: 0.74rem;
              color: var(--unity-text-dim, #94a3b8);
            }

            .phone-copy-btn {
              width: 22px;
              height: 22px;
              border-radius: 6px;
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              color: #64748b;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              padding: 0;
              transition: all 0.2s ease;
              font-size: 0.70rem;

              &:hover {
                background: #e2e8f0;
                color: #0f172a;
              }

              &.copied {
                background: #ecfdf5;
                color: #047857;
                border-color: #a7f3d0;
              }
            }
          }
        }
      }

      .meta-cell {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;

        .expand-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.95rem;
          cursor: pointer;
          padding: 6px;
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

        &.is-clickable {
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 8px;
          transition: all 0.15s ease;

          &:hover {
            background: var(--unity-bg, #f1f5f9);
            color: var(--unity-primary, #047857);

            .edit-icon-subtle {
              opacity: 1;
              color: var(--unity-primary, #047857);
            }
          }
        }

        .edit-icon-subtle {
          font-size: 0.72rem;
          color: var(--unity-text-dim, #94a3b8);
          opacity: 0.65;
          margin-inline-start: 2px;
          transition: all 0.15s ease;
        }

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

    // Action Bar: Large Action Buttons (Side by Side matching system standard)
    .card-bottom-bar-large {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      margin-top: 4px;
      padding-top: 4px;

      .btn-bottom-action {
        flex: 1;
        height: 44px;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        border: none;

        i {
          font-size: 1.05rem;
        }

        &.btn-confirm {
          background: var(--unity-primary, #047857);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(4, 120, 87, 0.22);

          &:hover {
            background: var(--unity-primary-dark, #065f46);
            transform: translateY(-1px);
          }
        }

        &.btn-complete {
          background: var(--unity-primary, #047857);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(4, 120, 87, 0.22);

          &:hover {
            background: var(--unity-primary-dark, #065f46);
            transform: translateY(-1px);
          }
        }

        &.btn-cancel,
        &.btn-no-show {
          background: #fef2f2;
          color: #ef4444;
          border: 1.5px solid #fecaca;

          &:hover {
            background: #fee2e2;
            border-color: #fca5a5;
            transform: translateY(-1px);
          }
        }

        &.btn-modify-status {
          background: var(--unity-surface, #ffffff);
          color: var(--unity-text-main, #1e293b);
          border: 1.5px solid var(--unity-border, #e2e8f0);

          &:hover {
            background: var(--unity-bg, #f8fafc);
            border-color: var(--unity-primary, #047857);
            color: var(--unity-primary, #047857);
            transform: translateY(-1px);
          }
        }

        &:active {
          transform: scale(0.98);
        }
      }

      .status-summary-pill {
        flex: 1;
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border-radius: 14px;
        font-size: 0.84rem;
        font-weight: 700;

        &.is-clickable {
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            opacity: 0.92;
            transform: translateY(-1px);
          }
        }

        .pill-chevron {
          font-size: 0.65rem;
          margin-inline-start: 2px;
          opacity: 0.75;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        &.status-confirmed {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          .dot { background: #10b981; }
        }

        &.status-cancelled {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          .dot { background: #ef4444; }
        }

        &.status-completed {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          .dot { background: #3b82f6; }
        }
      }

      .btn-card-edit {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: #ecfdf5;
        border: 1.5px solid #a7f3d0;
        color: #047857;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 0;
        flex-shrink: 0;

        i {
          font-size: 1.15rem;
          color: #047857;
        }

        &:hover {
          background: #d1fae5;
          border-color: #6ee7b7;
          color: #065f46;
          transform: translateY(-1px);
        }

        &:active {
          transform: scale(0.96);
        }
      }
    }
  }
}
</style>
