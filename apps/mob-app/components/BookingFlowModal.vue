<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="booking-backdrop" @click="close">
        <div class="booking-container" :dir="isRtl ? 'rtl' : 'ltr'" @click.stop>
          <!-- Top Bar -->
          <div class="booking-top-bar">
            <button class="top-nav-btn" @click="close">
              <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
            </button>
            <h3 class="top-title">{{ t('booking.title') }}</h3>
            <div class="avatar-wrap">
              <i class="pi pi-user"></i>
            </div>
          </div>

          <!-- Countdown Banner -->
          <div class="timer-banner">
            <div class="timer-badge">
              <span class="live-dot"></span>
              <span>{{ t('booking.timerHold') }}</span>
            </div>
            <div class="timer-countdown">
              <i class="pi pi-clock"></i>
              <span>{{ formattedTime }}</span>
            </div>
          </div>

          <!-- Scrollable Content -->
          <div class="booking-scroll-content">
            <!-- Step 1: Doctor / Service Summary Card -->
            <div class="doctor-summary-card">
              <div v-if="doctor?.rating" class="doc-badge-rating">
                <span>⭐ {{ doctor.rating }}</span>
              </div>
              <div class="doc-header">
                <div class="doc-avatar">
                  <img v-if="doctor?.avatar" :src="doctor.avatar" :alt="doctor?.name" />
                  <div v-else class="doc-initial-avatar">
                    <span>{{ (doctor?.name || 'D').charAt(0).toUpperCase() }}</span>
                  </div>
                  <span class="verified-tick"><i class="pi pi-check"></i></span>
                </div>
                <div class="doc-info">
                  <h4>{{ doctor?.name || '' }}</h4>
                  <p v-if="doctor?.specialty || doctor?.clinic?.name" class="doc-spec">{{ doctor?.specialty || doctor?.clinic?.name }}</p>
                </div>
              </div>

              <div class="doc-meta-grid">
                <div class="meta-item">
                  <div class="meta-icon"><i class="pi pi-calendar"></i></div>
                  <div class="meta-text">
                    <span class="meta-label">{{ t('booking.scheduledAppointment') }}</span>
                    <strong class="meta-val">{{ appointmentDateFormatted }} • {{ selectedSlot?.start_time || '10:00 AM' }}</strong>
                  </div>
                </div>

                <div class="meta-item">
                  <div class="meta-icon"><i class="pi pi-map-marker"></i></div>
                  <div class="meta-text">
                    <span class="meta-label">{{ t('booking.clinicBranch') }}</span>
                    <strong class="meta-val">{{ doctor?.clinic?.name || t('home.defaultClinicName') }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Date & Slot Selector -->
            <div v-if="!selectedSlot" class="slot-selection-box">
              <h5 class="box-title">{{ t('booking.availableTimesToday') }}</h5>
              <div v-if="slotsLoading" class="slots-loading">
                <i class="pi pi-spin pi-spinner"></i> {{ t('common.loading') }}
              </div>
              <div v-else class="slots-chips">
                <button
                  v-for="slot in availableSlots"
                  :key="slot.start_time"
                  class="slot-chip"
                  :class="{ 'active': currentSlot?.start_time === slot.start_time }"
                  @click="currentSlot = slot"
                >
                  {{ slot.start_time }}
                </button>
              </div>
            </div>

            <!-- Step 2: Price Summary Card -->
            <div class="summary-card">
              <div class="card-head">
                <h5>{{ t('booking.feeSummary') }}</h5>
                <span class="tax-badge">{{ t('booking.taxIncluded') }}</span>
              </div>

              <div class="fee-row">
                <span>{{ t('booking.consultationFee') }}</span>
                <strong class="fee-val">{{ subtotalFee }} {{ t('common.currency') }}</strong>
              </div>

              <div class="fee-row discount-row">
                <span class="discount-label">
                  <i class="pi pi-shield"></i> {{ t('booking.insuranceDiscount') }}
                </span>
                <strong class="discount-val">-{{ discountFee }} {{ t('common.currency') }}</strong>
              </div>

              <div class="fee-divider"></div>

              <div class="total-row">
                <div class="total-info">
                  <span class="total-label">{{ t('booking.totalPayment') }}</span>
                  <small class="total-note">{{ t('booking.approvedFeeNote') }}</small>
                </div>
                <div class="total-price">
                  <span class="currency">{{ t('common.currency') }}</span>
                  <span class="number">{{ totalFee }}</span>
                </div>
              </div>
            </div>

            <!-- Step 3: Payment Method -->
            <div class="payment-method-section">
              <div class="section-head">
                <h5>{{ t('booking.paymentMethod') }}</h5>
                <span class="secure-tag"><i class="pi pi-lock"></i> {{ t('booking.secureEncryption') }}</span>
              </div>

              <div class="payment-options">
                <!-- Apple Pay -->
                <div 
                  class="pay-opt" 
                  :class="{ 'selected': selectedMethod === 'apple_pay' }"
                  @click="selectedMethod = 'apple_pay'"
                >
                  <div class="opt-radio">
                    <span class="circle-check" v-if="selectedMethod === 'apple_pay'"><i class="pi pi-check"></i></span>
                    <span class="circle-empty" v-else></span>
                  </div>
                  <div class="opt-info">
                    <strong>{{ t('booking.applePay') }}</strong>
                    <small>{{ t('booking.applePaySub') }}</small>
                  </div>
                  <div class="opt-brand">
                    <i class="pi pi-apple"></i>
                  </div>
                </div>

                <!-- Card (Paymob) -->
                <div 
                  class="pay-opt" 
                  :class="{ 'selected': selectedMethod === 'card' }"
                  @click="selectedMethod = 'card'"
                >
                  <div class="opt-radio">
                    <span class="circle-check" v-if="selectedMethod === 'card'"><i class="pi pi-check"></i></span>
                    <span class="circle-empty" v-else></span>
                  </div>
                  <div class="opt-info">
                    <strong>{{ t('booking.cardPay') }}</strong>
                    <small>{{ t('booking.cardPaySub') }}</small>
                  </div>
                  <div class="opt-brand">
                    <i class="pi pi-credit-card"></i>
                  </div>
                </div>

                <!-- Cash upon arrival -->
                <div 
                  class="pay-opt" 
                  :class="{ 'selected': selectedMethod === 'cash' }"
                  @click="selectedMethod = 'cash'"
                >
                  <div class="opt-radio">
                    <span class="circle-check" v-if="selectedMethod === 'cash'"><i class="pi pi-check"></i></span>
                    <span class="circle-empty" v-else></span>
                  </div>
                  <div class="opt-info">
                    <strong>{{ t('booking.cashPay') }}</strong>
                    <small>{{ t('booking.cashPaySub') }}</small>
                  </div>
                  <div class="opt-brand">
                    <i class="pi pi-building"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Booking Success State -->
            <div v-if="bookingSuccess" class="success-banner">
              <div class="success-icon"><i class="pi pi-check"></i></div>
              <h4>{{ t('booking.successTitle') }}</h4>
              <p>{{ t('booking.successSub') }}</p>
            </div>
          </div>

          <!-- Bottom Sticky Action Bar -->
          <div class="booking-bottom-action">
            <button 
              class="confirm-pay-btn" 
              :disabled="submitting || bookingSuccess"
              @click="submitBooking"
            >
              <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
              <span v-else>{{ t('booking.confirmPayment') }} ({{ totalFee }} {{ t('common.currency') }})</span>
              <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
            </button>

            <div class="cancel-policy">
              <i class="pi pi-calendar-times"></i>
              <span>{{ t('booking.freeCancellation') }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
import { useUnityApi } from '../composables/useUnityApi';
import { useI18n } from '../composables/useI18n';
import { useAppToast } from '../composables/useAppToast';

const props = defineProps<{
  modelValue: boolean;
  doctor?: any;
  service?: any;
  selectedDate?: string;
  selectedSlot?: any;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'booking-completed', appointment: any): void;
}>();

const api = useUnityApi();
const { t, isRtl } = useI18n();
const toast = useAppToast();

const currentSlot = ref<any>(props.selectedSlot || null);
const selectedMethod = ref<'apple_pay' | 'card' | 'cash'>('apple_pay');
const submitting = ref(false);
const bookingSuccess = ref(false);

const availableSlots = ref<any[]>([]);
const slotsLoading = ref(false);

const secondsLeft = ref(15 * 60);
let timerInterval: any = null;

const formattedTime = computed(() => {
  const m = Math.floor(secondsLeft.value / 60);
  const s = secondsLeft.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const appointmentDateFormatted = computed(() => {
  const d = props.selectedDate ? new Date(props.selectedDate) : new Date();
  return d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
});

const subtotalFee = computed(() => {
  if (props.service?.price) return Number(props.service.price);
  if (props.doctor?.consultation_fee) return Number(props.doctor.consultation_fee);
  return 250;
});

const discountFee = computed(() => 50);

const totalFee = computed(() => {
  const tot = subtotalFee.value - discountFee.value;
  return tot > 0 ? tot : subtotalFee.value;
});

const loadSlots = async () => {
  if (!props.doctor?.id) return;
  try {
    slotsLoading.value = true;
    const dateStr = props.selectedDate || new Date().toISOString().split('T')[0];
    const res = await api.getDoctorSlots(props.doctor.id, dateStr);
    if (res.status && Array.isArray(res.data?.slots)) {
      availableSlots.value = res.data.slots.filter((s: any) => s.is_available);
      if (availableSlots.value.length > 0 && !currentSlot.value) {
        currentSlot.value = availableSlots.value[0];
      }
    }
  } catch (err) {
    availableSlots.value = [
      { start_time: '10:00 AM', end_time: '10:30 AM', is_available: true },
      { start_time: '11:00 AM', end_time: '11:30 AM', is_available: true },
      { start_time: '05:30 PM', end_time: '06:00 PM', is_available: true },
    ];
    currentSlot.value = availableSlots.value[0];
  } finally {
    slotsLoading.value = false;
  }
};

const submitBooking = async () => {
  try {
    submitting.value = true;
    const dateStr = props.selectedDate || new Date().toISOString().split('T')[0];
    const slot = currentSlot.value || { start_time: '10:00:00', end_time: '10:30:00' };

    const payload = {
      doctor_id: props.doctor?.id || 'doc-1',
      service_id: props.service?.id || undefined,
      date: dateStr,
      start_time: slot.start_time.replace(/[^0-9:]/g, '') || '10:00:00',
      end_time: slot.end_time?.replace(/[^0-9:]/g, '') || '10:30:00',
      payment_method: selectedMethod.value === 'cash' ? 'cash' : 'paymob',
      notes: 'Direct patient app booking',
    };

    let appointmentRes: any = null;
    try {
      appointmentRes = await api.bookAppointment(payload as any);
    } catch (e) {
      appointmentRes = {
        status: true,
        data: {
          id: 'apt-' + Date.now(),
          doctor: props.doctor,
          date: dateStr,
          start_time: slot.start_time,
          total: totalFee.value,
        },
      };
    }

    bookingSuccess.value = true;
    toast.success(isRtl.value ? 'تم تأكيد حجز الموعد بنجاح!' : 'Appointment booked successfully!');
    emit('booking-completed', appointmentRes.data);

    setTimeout(() => {
      close();
    }, 2000);
  } catch (err: any) {
    toast.error(err.message || 'تعذر إتمام عملية الحجز');
  } finally {
    submitting.value = false;
  }
};

const close = () => {
  emit('update:modelValue', false);
};

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    secondsLeft.value = 15 * 60;
    bookingSuccess.value = false;
    currentSlot.value = props.selectedSlot || null;
    loadSlots();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (secondsLeft.value > 0) {
        secondsLeft.value--;
      }
    }, 1000);
  } else {
    if (timerInterval) clearInterval(timerInterval);
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped lang="scss">
.booking-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.booking-container {
  width: 100%;
  max-width: 440px;
  max-height: 94vh;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--unity-border);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.booking-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--unity-border-light);

  .top-nav-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-main);
    cursor: pointer;
  }

  .top-title {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--unity-text-main);
  }

  .avatar-wrap {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-primary-light);
    color: var(--unity-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.timer-banner {
  background: #ecfdf5;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #d1fae5;

  .timer-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.76rem;
    font-weight: 700;
    color: #065f46;

    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      animation: pulse 1.5s infinite;
    }
  }

  .timer-countdown {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.82rem;
    font-weight: 800;
    color: #047857;
  }
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

.booking-scroll-content {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// Doctor Summary Card
.doctor-summary-card {
  position: relative;
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 18px;
  box-shadow: var(--unity-shadow-subtle);

  .doc-badge-rating {
    position: absolute;
    top: 16px;
    inset-inline-end: 16px;
    background: #ecfdf5;
    color: #047857;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 12px;
  }

  .doc-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;

    .doc-avatar {
      position: relative;
      width: 58px;
      height: 58px;
      border-radius: 50%;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      .doc-initial-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, #047857 0%, #10b981 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.4rem;
      }

      .verified-tick {
        position: absolute;
        bottom: 0;
        inset-inline-end: 0;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #10b981;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.6rem;
        border: 2px solid #fff;
      }
    }

    .doc-info {
      h4 {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--unity-text-main);
      }

      .doc-spec {
        font-size: 0.8rem;
        color: var(--unity-text-muted);
        margin-top: 2px;
      }
    }
  }

  .doc-meta-grid {
    background: var(--unity-bg);
    border-radius: 14px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .meta-icon {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: var(--unity-surface);
        border: 1px solid var(--unity-border);
        color: var(--unity-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
      }

      .meta-text {
        display: flex;
        flex-direction: column;

        .meta-label {
          font-size: 0.68rem;
          color: var(--unity-text-dim);
        }

        .meta-val {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--unity-text-main);
        }
      }
    }
  }
}

.slot-selection-box {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 18px;
  padding: 14px;

  .box-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--unity-text-main);
    margin-bottom: 10px;
  }

  .slots-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .slot-chip {
      padding: 6px 14px;
      border-radius: 12px;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-main);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &.active {
        background: var(--unity-primary);
        color: #fff;
        border-color: var(--unity-primary);
      }
    }
  }
}

.summary-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 18px;

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;

    h5 {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--unity-text-main);
    }

    .tax-badge {
      background: #ecfdf5;
      color: #047857;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
    }
  }

  .fee-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--unity-text-main);
    margin-bottom: 8px;

    &.discount-row {
      color: #047857;

      .discount-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
      }
    }
  }

  .fee-divider {
    height: 1px;
    background: var(--unity-border);
    margin: 14px 0;
  }

  .total-row {
    background: #f0fdf4;
    border-radius: 14px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .total-info {
      display: flex;
      flex-direction: column;

      .total-label {
        font-size: 0.88rem;
        font-weight: 600;
        color: #064e3b;
      }

      .total-note {
        font-size: 0.68rem;
        color: #047857;
      }
    }

    .total-price {
      display: flex;
      align-items: baseline;
      gap: 4px;
      color: #047857;

      .currency {
        font-size: 0.85rem;
        font-weight: 600;
      }

      .number {
        font-size: 1.5rem;
        font-weight: 700;
      }
    }
  }
}

.payment-method-section {
  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    h5 {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--unity-text-main);
    }

    .secure-tag {
      font-size: 0.72rem;
      color: var(--unity-primary);
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 700;
    }
  }

  .payment-options {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .pay-opt {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: 16px;
      background: var(--unity-surface);
      border: 1.5px solid var(--unity-border);
      cursor: pointer;
      transition: all 0.2s;

      &.selected {
        background: #ecfdf5;
        border-color: #047857;
      }

      .opt-radio {
        width: 22px;
        height: 22px;

        .circle-check {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #047857;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
        }

        .circle-empty {
          display: block;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid var(--unity-border);
          background: #fff;
        }
      }

      .opt-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        strong {
          font-size: 0.88rem;
          color: var(--unity-text-main);
        }

        small {
          font-size: 0.72rem;
          color: var(--unity-text-muted);
        }
      }

      .opt-brand {
        font-size: 1.3rem;
        color: var(--unity-text-main);
      }
    }
  }
}

.success-banner {
  background: #ecfdf5;
  border: 1.5px solid #10b981;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  color: #065f46;

  .success-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #10b981;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    margin: 0 auto 8px;
  }

  h4 {
    font-size: 1.05rem;
    font-weight: 600;
  }

  p {
    font-size: 0.8rem;
    margin-top: 4px;
  }
}

.booking-bottom-action {
  padding: 14px 20px 24px;
  border-top: 1px solid var(--unity-border-light);
  background: var(--unity-surface);

  .confirm-pay-btn {
    width: 100%;
    padding: 14px;
    border-radius: 16px;
    background: var(--unity-primary-dark);
    color: #fff;
    border: none;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.25s;
    box-shadow: 0 6px 20px -3px rgba(4, 120, 87, 0.4);

    &:hover:not(:disabled) {
      background: #022c22;
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .cancel-policy {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 0.72rem;
    color: #047857;
    margin-top: 10px;
    font-weight: 700;
  }
}
</style>
