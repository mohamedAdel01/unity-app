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

        <!-- Left Side: Expand Chevron Button -->
        <div class="meta-cell" @click.stop>
          <button 
            type="button" 
            class="expand-btn" 
            :aria-label="isExpanded ? 'Collapse' : 'Expand'"
            @click.stop="toggleExpand"
          >
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

      <!-- Google Meet Consultation Link for Doctor & Admin -->
      <div v-if="booking.meeting_link" class="meet-admin-strip">
        <a 
          :href="booking.meeting_link" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-join-meet-admin"
        >
          <i class="pi pi-video"></i>
          <span>{{ t('Join Google Meet') }}</span>
        </a>
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
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
  (e: 'open-options', booking: any): void;
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
  padding-top: 14px;
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
    padding: 30px 16px 14px;
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
    // Centered horizontally across the top edge of the card
    .card-floating-badges-bar {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      z-index: 5;

      .floating-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 30px;
        padding: 0 12px;
        border-radius: 9999px;
        font-size: 0.76rem;
        font-weight: 800;
        line-height: 1;
        white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);

        i {
          font-size: 0.80rem;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .pill-chevron {
          font-size: 0.68rem;
          margin-inline-start: 2px;
          opacity: 0.75;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s;
        }

        // Clickable Button-Like States
        &.is-clickable {
          cursor: pointer;
          user-select: none;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
            filter: brightness(0.98);

            .pill-chevron {
              transform: translateY(1px);
              opacity: 1;
            }
          }

          &:active {
            transform: translateY(0) scale(0.97);
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
          }
        }

        // 1. Type Badges
        &.badge-type {
          &.type-consult {
            background: var(--unity-primary-light);
            color: var(--unity-primary);
            border: 1.5px solid var(--unity-primary-border);
          }

          &.type-exam {
            background: #f0f9ff;
            color: #0284c7;
            border: 1.5px solid #bae6fd;
          }

          :global([data-theme='dark']) &,
          :global(html.dark) & {
            &.type-consult {
              background: rgba(var(--unity-accent-rgb), 0.16);
              color: var(--unity-accent-light);
              border-color: rgba(var(--unity-accent-rgb), 0.35);
            }

            &.type-exam {
              background: rgba(2, 132, 199, 0.16);
              color: #38bdf8;
              border-color: rgba(2, 132, 199, 0.35);
            }
          }
        }

        // 2. Booking Status Badges
        &.badge-status {
          &.status-pending {
            background: #f5f3ff;
            color: #7c3aed;
            border: 1.5px solid #c4b5fd;

            .dot {
              background: #7c3aed;
              box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
            }
          }

          &.status-confirmed {
            background: var(--unity-primary-light);
            color: var(--unity-primary);
            border: 1.5px solid var(--unity-primary-muted);

            .dot {
              background: var(--unity-accent);
              box-shadow: 0 0 0 2px rgba(var(--unity-accent-rgb), 0.2);
            }
          }

          &.status-completed {
            background: #f0fdf4;
            color: #15803d;
            border: 1.5px solid #86efac;

            .dot {
              background: #22c55e;
              box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
            }
          }

          &.status-cancelled {
            background: #fef2f2;
            color: #dc2626;
            border: 1.5px solid #fca5a5;

            .dot {
              background: #ef4444;
              box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
            }
          }

          :global([data-theme='dark']) &,
          :global(html.dark) & {
            &.status-pending {
              background: rgba(124, 58, 237, 0.18);
              color: #a78bfa;
              border-color: rgba(124, 58, 237, 0.35);

              .dot {
                background: #a78bfa;
                box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.25);
              }
            }

            &.status-confirmed {
              background: rgba(var(--unity-accent-rgb), 0.16);
              color: var(--unity-accent-light);
              border-color: rgba(var(--unity-accent-rgb), 0.35);

              .dot {
                background: var(--unity-accent-light);
                box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.25);
              }
            }

            &.status-completed {
              background: rgba(34, 197, 94, 0.16);
              color: #4ade80;
              border-color: rgba(34, 197, 94, 0.35);

              .dot {
                background: #4ade80;
                box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.25);
              }
            }

            &.status-cancelled {
              background: rgba(239, 68, 68, 0.16);
              color: #f87171;
              border-color: rgba(239, 68, 68, 0.35);

              .dot {
                background: #f87171;
                box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.25);
              }
            }
          }
        }

        // 3. Payment Status Badges
        &.badge-payment {
          &.paid {
            background: var(--unity-primary-light);
            color: var(--unity-primary);
            border: 1.5px solid var(--unity-primary-muted);
          }

          &.pending {
            background: #fff7ed;
            color: #c2410c;
            border: 1.5px solid #fdba74;
          }

          &.refunded {
            background: #eff6ff;
            color: #1d4ed8;
            border: 1.5px solid #93c5fd;
          }

          &.failed {
            background: #fef2f2;
            color: #b91c1c;
            border: 1.5px solid #fca5a5;
          }

          :global([data-theme='dark']) &,
          :global(html.dark) & {
            &.paid {
              background: rgba(var(--unity-accent-rgb), 0.16);
              color: var(--unity-accent-light);
              border-color: rgba(var(--unity-accent-rgb), 0.35);
            }

            &.pending {
              background: rgba(245, 158, 11, 0.16);
              color: #fbbf24;
              border-color: rgba(245, 158, 11, 0.35);
            }

            &.refunded {
              background: rgba(59, 130, 246, 0.16);
              color: #60a5fa;
              border-color: rgba(59, 130, 246, 0.35);
            }

            &.failed {
              background: rgba(239, 68, 68, 0.16);
              color: #f87171;
              border-color: rgba(239, 68, 68, 0.35);
            }
          }
        }
      }
    }

    &.is-expanded {
      border-color: #cbd5e1;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);

      :global([data-theme='dark']) &,
      :global(html.dark) & {
        border-color: #374151;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4);
      }
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
            background: var(--unity-primary-light);
            color: var(--unity-primary);
            border: 1px solid var(--unity-primary-border);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.15rem;
            font-weight: 800;

            :global([data-theme='dark']) &,
            :global(html.dark) & {
              background: rgba(var(--unity-accent-rgb), 0.14);
              border-color: rgba(var(--unity-accent-rgb), 0.28);
              color: var(--unity-accent-light);
            }
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
              color: var(--unity-primary);
              flex-shrink: 0;
            }

            .phone-number {
              font-size: 0.78rem;
              font-weight: 700;
              color: var(--unity-text-muted);
              letter-spacing: 0.3px;

              :global([data-theme='dark']) &,
              :global(html.dark) & {
                color: #9ca3af;
              }
            }

            .phone-number-empty {
              font-size: 0.74rem;
              color: var(--unity-text-dim);
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
                background: var(--unity-primary-light);
                color: var(--unity-primary);
                border-color: var(--unity-primary-border);
              }

              :global([data-theme='dark']) &,
              :global(html.dark) & {
                background: #1f2937;
                border-color: #374151;
                color: #9ca3af;

                &:hover {
                  background: #374151;
                  color: #f9fafb;
                }

                &.copied {
                  background: rgba(var(--unity-accent-rgb), 0.16);
                  color: var(--unity-accent-light);
                  border-color: rgba(var(--unity-accent-rgb), 0.35);
                }
              }
            }
          }
        }
      }

      .meta-cell {
        display: flex;
        align-items: center;
        flex-shrink: 0;

        .expand-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid transparent;
          color: #94a3b8;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;

          &:hover {
            background: var(--unity-bg);
            border-color: var(--unity-border);
            color: var(--unity-text-main);
          }

          &:active {
            transform: scale(0.92);
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
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      border-radius: 14px;
      padding: 10px 14px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;

      :global([data-theme='dark']) &,
      :global(html.dark) & {
        background: #090d16;
        border-color: #1f2937;
      }

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

          :global([data-theme='dark']) &,
          :global(html.dark) & {
            background: #1f2937;
            color: #9ca3af;
          }
        }

        .info-content {
          display: flex;
          flex-direction: column;
          min-width: 0;

          .info-label {
            font-size: 0.68rem;
            color: var(--unity-text-dim);
            font-weight: 600;

            :global([data-theme='dark']) &,
            :global(html.dark) & {
              color: #9ca3af;
            }
          }

          .info-val {
            font-size: 0.84rem;
            color: var(--unity-text-main);
            font-weight: 800;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            :global([data-theme='dark']) &,
            :global(html.dark) & {
              color: #f9fafb;
            }
          }

          .info-subval {
            font-size: 0.70rem;
            color: var(--unity-text-dim);
            font-weight: 600;

            :global([data-theme='dark']) &,
            :global(html.dark) & {
              color: #9ca3af;
            }
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

      :global([data-theme='dark']) &,
      :global(html.dark) & {
        background: #111827;
        border-color: #1f2937;
      }

      .payment-method-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--unity-text-main);

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          color: #f9fafb;
        }

        &.is-clickable {
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 8px;
          transition: all 0.15s ease;

          &:hover {
            background: var(--unity-bg);
            color: var(--unity-primary);

            :global([data-theme='dark']) &,
            :global(html.dark) & {
              background: #1f2937;
              color: var(--unity-accent-light);
            }

            .edit-icon-subtle {
              opacity: 1;
              color: var(--unity-primary);

              :global([data-theme='dark']) &,
              :global(html.dark) & {
                color: var(--unity-accent-light);
              }
            }
          }
        }

        .edit-icon-subtle {
          font-size: 0.72rem;
          color: var(--unity-text-dim);
          opacity: 0.65;
          margin-inline-start: 2px;
          transition: all 0.15s ease;
        }

        i {
          color: var(--unity-accent);
          font-size: 0.9rem;
        }

        .payment-pill {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 5px;
          margin-inline-start: 4px;

          &.paid {
            background: var(--unity-primary-light);
            color: var(--unity-primary);
            border: 1px solid var(--unity-primary-border);
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

          :global([data-theme='dark']) &,
          :global(html.dark) & {
            &.paid { background: rgba(var(--unity-accent-rgb), 0.16); color: var(--unity-accent-light); border-color: rgba(var(--unity-accent-rgb), 0.35); }
            &.pending { background: rgba(245, 158, 11, 0.16); color: #fbbf24; border-color: rgba(245, 158, 11, 0.35); }
            &.refunded { background: rgba(59, 130, 246, 0.16); color: #60a5fa; border-color: rgba(59, 130, 246, 0.35); }
            &.failed { background: rgba(239, 68, 68, 0.16); color: #f87171; border-color: rgba(239, 68, 68, 0.35); }
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
          color: var(--unity-text-dim);
        }
      }
    }
  }

  .meet-admin-strip {
    margin-top: 10px;
    width: 100%;

    .btn-join-meet-admin {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 10px 14px;
      background: #0284c7;
      color: #ffffff;
      font-size: 0.88rem;
      font-weight: 700;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);

      &:hover {
        background: #0369a1;
        transform: translateY(-1px);
      }

      i {
        font-size: 1rem;
      }
    }
  }
}
</style>
