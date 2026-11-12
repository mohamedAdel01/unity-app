<template>
  <div class="admin-booking-card" :class="{ 'is-expanded': isExpanded }">
    <!-- ============================================== -->
    <!-- Card Header Row (Click to toggle accordion)   -->
    <!-- ============================================== -->
    <div class="booking-header-row" @click="toggleExpand">
      <!-- Right Side: Avatar / Time Pill + Patient Info -->
      <div class="patient-main-cell">
        <!-- Avatar Photo (if available) or Time Pill Badge -->
        <div v-if="booking.avatar" class="avatar-holder">
          <img :src="resolveAvatar(booking.avatar)" :alt="booking.patient_name" class="avatar-img" />
          <span class="online-dot"></span>
        </div>
        <div v-else-if="booking.time_badge" class="time-badge-pill">
          <span>{{ booking.time_badge }}</span>
        </div>

        <!-- Patient Name & Clinic -->
        <div class="patient-details">
          <div class="name-id-line">
            <h5 class="patient-name">{{ booking.patient_name }}</h5>
            <span class="booking-number">#{{ booking.booking_number }}</span>
          </div>
          <span class="clinic-subline">{{ booking.clinic_name }}</span>
        </div>
      </div>

      <!-- Left Side: Status Chip & Chevron -->
      <div class="status-chevron-cell">
        <!-- Quick Approve Button for Pending Bookings -->
        <button 
          v-if="booking.status === 'pending'" 
          type="button" 
          class="quick-approve-pill" 
          @click.stop="emit('approve', booking)"
        >
          <i class="pi pi-check"></i>
          <span>{{ t('Approve') }}</span>
        </button>

        <span class="status-chip" :class="getStatusClass(booking.status)">
          <span v-if="booking.status === 'pending'" class="status-red-dot"></span>
          <span v-else-if="booking.status === 'confirmed'" class="status-green-dot"></span>
          <span>{{ getStatusLabel(booking.status) }}</span>
        </span>

        <button class="expand-btn" :aria-label="isExpanded ? 'Collapse' : 'Expand'">
          <i :class="isExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
        </button>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- Expanded Body (Visible when isExpanded is true)-->
    <!-- ============================================== -->
    <div v-if="isExpanded" class="booking-expanded-body">
      <!-- Doctor & Time Banner (Light blue pill container) -->
      <div v-if="booking.doctor_name || booking.time" class="doctor-time-banner">
        <div v-if="booking.doctor_name" class="doc-cell">
          <i class="pi pi-user"></i>
          <span>{{ booking.doctor_name }}</span>
        </div>
        <div v-if="booking.time" class="time-cell">
          <i class="pi pi-clock"></i>
          <span dir="ltr">{{ booking.time }}</span>
        </div>
      </div>

      <!-- Payment Method & Price Row -->
      <div v-if="booking.payment_method || booking.price" class="payment-price-row">
        <!-- Right: Payment Method & Invoice ID -->
        <div v-if="booking.payment_method" class="payment-method-cell">
          <i class="pi pi-check-circle green-check"></i>
          <span>{{ booking.payment_method }}</span>
        </div>

        <!-- Left: Price -->
        <div v-if="booking.price" class="price-cell">
          <strong>{{ booking.price }}</strong>
          <small>{{ t('EGP') }}</small>
        </div>
      </div>

      <!-- Action Buttons Row -->
      <div class="actions-buttons-row">
        <!-- Approve Booking (for pending bookings) -->
        <button 
          v-if="booking.status === 'pending'" 
          type="button" 
          class="btn-approve" 
          @click.stop="emit('approve', booking)"
        >
          <i class="pi pi-check-circle"></i>
          <span>{{ t('Approve Booking') }}</span>
        </button>

        <!-- Cancel Booking (if not already cancelled) -->
        <button 
          v-if="booking.status !== 'cancelled'" 
          type="button" 
          class="btn-cancel-booking" 
          @click.stop="emit('cancel', booking)"
        >
          <i class="pi pi-times"></i>
          <span>{{ t('Cancel Booking') }}</span>
        </button>

        <!-- Reschedule / Edit Appointment -->
        <button class="btn-reschedule" @click="emit('reschedule', booking)">
          <i class="pi pi-calendar"></i>
          <span>{{ t('Reschedule Slot') }}</span>
        </button>

        <!-- Download Invoice Button -->
        <button class="btn-invoice-download" @click="emit('download-invoice', booking)">
          <i class="pi pi-download"></i>
          <span>{{ t('Invoice') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';

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

const { t } = useI18n();

// 2. Data (refs, reactive state)
const isExpanded = ref(props.initiallyExpanded);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const getStatusLabel = (status?: string) => {
  if (status === 'pending') return t('Pending Payment');
  return t('Confirmed & Paid');
};

const getStatusClass = (status?: string) => {
  if (status === 'pending') return 'status-pending';
  return 'status-confirmed';
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
  border-radius: 22px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .booking-header-row .patient-main-cell .patient-details {
      text-align: left;
    }

    .booking-expanded-body .doctor-time-banner,
    .booking-expanded-body .payment-price-row {
      direction: ltr;
    }
  }

  &.is-expanded {
    border-color: #cbd5e1;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }

  // 1. Header Row
  .booking-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;

    .patient-main-cell {
      display: flex;
      align-items: center;
      gap: 12px;

      .avatar-holder {
        position: relative;
        width: 44px;
        height: 44px;
        flex-shrink: 0;

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--unity-border);
        }

        .online-dot {
          position: absolute;
          bottom: 1px;
          inset-inline-end: 1px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid #ffffff;
        }
      }

      .time-badge-pill {
        background: #eef2ff;
        color: #3730a3;
        font-size: 0.74rem;
        font-weight: 700;
        padding: 6px 12px;
        border-radius: 14px;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .patient-details {
        display: flex;
        flex-direction: column;
        text-align: right;

        .name-id-line {
          display: flex;
          align-items: center;
          gap: 6px;

          .patient-name {
            font-size: 0.95rem;
            font-weight: 800;
            color: var(--unity-text-main);
          }

          .booking-number {
            font-size: 0.72rem;
            font-weight: 700;
            color: var(--unity-text-muted);
            direction: ltr;
          }
        }

        .clinic-subline {
          font-size: 0.74rem;
          color: var(--unity-text-muted);
          margin-top: 1px;
        }
      }
    }

    .status-chevron-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .quick-approve-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: var(--unity-primary);
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 4px 10px;
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(18, 93, 73, 0.2);
        transition: all 0.2s;

        &:hover {
          background: var(--unity-primary-dark);
          transform: scale(1.04);
        }
      }

      .status-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.68rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 12px;
        white-space: nowrap;

        .status-green-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #059669;
        }

        .status-red-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
        }

        &.status-confirmed {
          background: #d1fae5;
          color: #065f46;
        }

        &.status-pending {
          background: #ede9fe;
          color: #6b21a8;
        }
      }

      .expand-btn {
        background: transparent;
        border: none;
        color: var(--unity-text-muted);
        cursor: pointer;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  // 2. Expanded Body
  .booking-expanded-body {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--unity-border-light);
    display: flex;
    flex-direction: column;
    gap: 12px;

    .doctor-time-banner {
      background: #f0f7ff;
      border: 1px solid #e0f2fe;
      border-radius: 14px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--unity-text-main);

      .doc-cell, .time-cell {
        display: flex;
        align-items: center;
        gap: 6px;

        i {
          color: #0284c7;
          font-size: 0.9rem;
        }
      }
    }

    .payment-price-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 4px;

      .payment-method-cell {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--unity-text-main);

        .green-check {
          color: #10b981;
          font-size: 0.95rem;
        }
      }

      .price-cell {
        display: flex;
        align-items: baseline;
        gap: 4px;

        strong {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--unity-text-main);
        }

        small {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--unity-text-muted);
        }
      }
    }

    .actions-buttons-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 2px;

      .btn-approve {
        flex: 1;
        height: 42px;
        background: var(--unity-primary);
        border: none;
        border-radius: 12px;
        color: #fff;
        font-size: 0.82rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: var(--unity-primary-dark);
          transform: translateY(-1px);
        }
      }

      .btn-cancel-booking {
        height: 42px;
        padding: 0 14px;
        background: #fef2f2;
        border: 1px solid #fee2e2;
        border-radius: 12px;
        color: #ef4444;
        font-size: 0.8rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #fee2e2;
        }
      }

      .btn-reschedule {
        flex: 1;
        height: 42px;
        background: #eef2ff;
        border: none;
        border-radius: 12px;
        color: #3730a3;
        font-size: 0.82rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #e0e7ff;
        }
      }

      .btn-invoice-download {
        height: 42px;
        padding: 0 18px;
        background: #34d399;
        border: none;
        border-radius: 12px;
        color: #022c22;
        font-size: 0.82rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        transition: all 0.2s;

        i {
          font-size: 0.9rem;
        }

        &:hover {
          background: #10b981;
        }
      }
    }
  }
}
</style>
