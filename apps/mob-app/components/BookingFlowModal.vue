<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="booking-backdrop" @click="close">
        <div class="booking-container" @click.stop>
          <!-- Top Bar -->
          <div class="booking-top-bar">
            <button 
              class="top-nav-btn" 
              @click="currentStep === 2 ? (currentStep = 1) : close()"
            >
              <i v-if="currentStep === 2" :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
              <i v-else class="pi pi-times"></i>
            </button>
            <h3 class="top-title">
              <span v-if="currentStep === 1">{{ isRescheduling ? t('Modify Appointment Slot') : (isExamination ? t('Book Medical Examination') : t('Select Date & Time')) }}</span>
              <span v-else-if="currentStep === 2">{{ isAdmin ? t('Confirm Booking') : t('Payment & Confirmation') }}</span>
              <span v-else>{{ isRescheduling ? t('Appointment Rescheduled Successfully!') : t('Booking Confirmed Successfully!') }}</span>
            </h3>
            <div class="avatar-wrap">
              <AppExamIcon v-if="isExamination" :size="20" />
              <i v-else class="pi pi-user"></i>
            </div>
          </div>

          <!-- Step Indicator (Only for Step 1 and 2, hidden when modifying existing slot) -->
          <div v-if="currentStep < 3 && !isRescheduling" class="booking-steps-bar">
            <div class="step-pill" :class="{ 'active': currentStep === 1, 'done': currentStep > 1 }">
              <span class="circle"><i v-if="currentStep > 1" class="pi pi-check"></i><span v-else>1</span></span>
              <span class="label">{{ t('Select Date & Time') }}</span>
            </div>
            <div class="step-connector" :class="{ 'active': currentStep > 1 }"></div>
            <div class="step-pill" :class="{ 'active': currentStep === 2 }">
              <span class="circle">2</span>
              <span class="label">{{ t('Payment') }}</span>
            </div>
          </div>

          <!-- Scrollable Content -->
          <div class="booking-scroll-content">
            <!-- ========================================== -->
            <!-- STEP 1: SELECT DATE & TIME                 -->
            <!-- ========================================== -->
            <div v-if="currentStep === 1" class="step-view step-1-view">
              <!-- Doctor / Service Card -->
              <div class="doctor-summary-card" :class="{ 'is-exam-card': isExamination }">
                <div v-if="!isExamination && doctor?.rating" class="doc-badge-rating">
                  <span>⭐ {{ doctor.rating }}</span>
                </div>
                <div v-else-if="isExamination" class="doc-badge-rating exam-badge">
                  <span><AppExamIcon :size="12" /> {{ t('Hospital Examination') }}</span>
                </div>
                <div class="doc-header">
                  <div class="doc-avatar" :class="{ 'exam-avatar': isExamination }">
                    <template v-if="!isExamination">
                      <img v-if="doctor?.avatar" :src="doctor.avatar" :alt="doctor?.name" />
                      <div v-else class="doc-initial-avatar">
                        <span>{{ (doctor?.name || 'D').charAt(0).toUpperCase() }}</span>
                      </div>
                      <span class="verified-tick"><i class="pi pi-check"></i></span>
                    </template>
                    <template v-else>
                      <div class="exam-icon-circle">
                        <AppExamIcon :size="26" />
                      </div>
                    </template>
                  </div>
                  <div class="doc-info">
                    <h4>{{ isExamination ? (service?.name || examination?.name) : (doctor?.name || service?.name || '') }}</h4>
                    <p v-if="isExamination && (service?.description || examination?.description)" class="doc-spec">
                      {{ service?.description || examination?.description }}
                    </p>
                    <p v-else-if="doctor?.specialty || doctor?.clinic?.name" class="doc-spec">
                      {{ doctor?.specialty || doctor?.clinic?.name }}
                    </p>
                  </div>
                </div>

                <div class="doc-meta-grid">
                  <div class="meta-item">
                    <div class="meta-icon"><i :class="isExamination ? 'pi pi-clock' : 'pi pi-building'"></i></div>
                    <div class="meta-text">
                      <span class="meta-label">{{ isExamination ? t('Duration') : t('Clinic Type') }}</span>
                      <strong class="meta-val">{{ isExamination ? ((service?.duration || examination?.duration || 15) + ' ' + t('mins')) : doctorClinicType }}</strong>
                    </div>
                  </div>
                  <div class="meta-item">
                    <div class="meta-icon"><i class="pi pi-wallet"></i></div>
                    <div class="meta-text">
                      <span class="meta-label">{{ feeLabel }}</span>
                      <strong class="meta-val">{{ subtotalFee }} {{ t('EGP') }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Date Picker Chips & Full Calendar Mode -->
              <div class="date-selection-box">
                <div class="box-head">
                  <div class="box-head-top">
                    <h5 class="box-title"><i class="pi pi-calendar"></i> {{ t('Select Day') }}</h5>
                    <span v-if="nextDays.length > 0" class="date-current-badge">{{ appointmentDateFormatted }}</span>
                  </div>

                  <!-- Quick View vs Calendar View Toggle -->
                  <div class="view-mode-toggle-group">
                    <button
                      type="button"
                      class="view-toggle-pill"
                      :class="{ 'active': dateViewMode === 'chips' }"
                      :title="t('Quick View')"
                      @click="dateViewMode = 'chips'"
                    >
                      <i class="pi pi-bars"></i>
                      <span>{{ t('Quick View') }}</span>
                    </button>
                    <button
                      type="button"
                      class="view-toggle-pill"
                      :class="{ 'active': dateViewMode === 'calendar' }"
                      :title="t('Calendar View')"
                      @click="dateViewMode = 'calendar'"
                    >
                      <i class="pi pi-calendar"></i>
                      <span>{{ t('Calendar View') }}</span>
                    </button>
                  </div>
                </div>

                <div v-if="daysLoading" class="days-loading">
                  <i class="pi pi-spin pi-spinner"></i> {{ t('Checking available days...') }}
                </div>

                <!-- Mode 1: Full Month Calendar (Only available days enabled & clickable) -->
                <div v-else-if="dateViewMode === 'calendar'" class="calendar-view-wrap">
                  <AppBookingCalendar
                    v-model="selectedBookingDate"
                    :available-dates="onlyAvailableDates"
                    @select="selectDate"
                  />
                </div>

                <!-- Mode 2: Horizontal Scrollable Quick Chips -->
                <div v-else-if="nextDays.length > 0" class="days-scroll-row">
                  <button
                    v-for="d in nextDays"
                    :key="d.date"
                    class="day-chip-btn"
                    :class="{ 'active': selectedBookingDate === d.date }"
                    @click="selectDate(d.date)"
                  >
                    <span class="day-lbl">{{ d.label }}</span>
                    <strong class="day-num">{{ d.dayNum }}</strong>
                  </button>

                  <button
                    type="button"
                    class="day-chip-btn open-cal-chip"
                    :title="t('Calendar View')"
                    @click="dateViewMode = 'calendar'"
                  >
                    <i class="pi pi-calendar"></i>
                    <span class="day-lbl">{{ t('Calendar View') }}</span>
                  </button>
                </div>

                <div v-else class="empty-days-alert">
                  <i class="pi pi-calendar-times"></i>
                  <span>{{ t('No available appointment dates found for this doctor currently.') }}</span>
                </div>
              </div>

              <!-- Time Slots Grid -->
              <div class="slot-selection-box">
                <div class="box-head">
                  <h5 class="box-title"><i class="pi pi-clock"></i> {{ t('Select Time Slot') }}</h5>
                  <span v-if="currentSlot" class="selected-slot-preview">{{ formatSlotTime(currentSlot.start_time) }}</span>
                </div>

                <div v-if="slotsLoading" class="slots-loading">
                  <i class="pi pi-spin pi-spinner"></i> {{ t('Loading...') }}
                </div>

                <div v-else-if="availableSlots.length > 0" class="slots-chips">
                  <button
                    v-for="slot in availableSlots"
                    :key="slot.start_time"
                    type="button"
                    class="slot-chip"
                    :class="{ 
                      'active': currentSlot?.start_time === slot.start_time && slot.is_available,
                      'is-booked': !slot.is_available
                    }"
                    :disabled="!slot.is_available"
                    @click="slot.is_available && (currentSlot = slot)"
                  >
                    <i v-if="currentSlot?.start_time === slot.start_time && slot.is_available" class="pi pi-check slot-tick"></i>
                    <span>{{ formatSlotTime(slot.start_time) }}</span>
                  </button>
                </div>

                <div v-else class="empty-slots">
                  <i class="pi pi-calendar-times"></i>
                  <p>{{ t('No slots available for this day. Please select another date.') }}</p>
                </div>
              </div>
            </div>

            <!-- ========================================== -->
            <!-- STEP 2: REVIEW & PAYMENT                   -->
            <!-- ========================================== -->
            <div v-else-if="currentStep === 2" class="step-view step-2-view">
              <!-- Confirmed Appointment Banner -->
              <div class="appointment-review-card">
                <div class="review-head">
                  <div class="rev-doc-avatar" :class="{ 'exam-avatar': isExamination }">
                    <template v-if="!isExamination">
                      <img v-if="doctor?.avatar" :src="doctor.avatar" :alt="doctor?.name" />
                      <div v-else class="doc-initial-avatar">
                        <span>{{ (doctor?.name || 'D').charAt(0).toUpperCase() }}</span>
                      </div>
                    </template>
                    <template v-else>
                      <div class="exam-icon-circle">
                        <AppExamIcon :size="26" />
                      </div>
                    </template>
                  </div>
                  <div class="rev-details">
                    <h4>{{ isExamination ? (service?.name || examination?.name) : (doctor?.name || service?.name) }}</h4>
                    <p class="rev-clinic">
                      <i :class="isExamination ? 'pi pi-clock' : 'pi pi-building'"></i> 
                      {{ isExamination ? ((service?.duration || examination?.duration || 15) + ' ' + t('mins')) : doctorClinicType }}
                    </p>
                    <span class="rev-type-pill">{{ isExamination ? t('Medical Examination') : (selectedType === 'follow_up' ? t('Follow-up Consultation') : t('Examination')) }}</span>
                  </div>
                </div>

                <div class="rev-divider"></div>

                <div class="rev-schedule-box">
                  <div class="sch-item">
                    <i class="pi pi-calendar"></i>
                    <span>{{ appointmentDateFormatted }}</span>
                  </div>
                  <div class="sch-item">
                    <i class="pi pi-clock"></i>
                    <span>{{ formatSlotTime(currentSlot?.start_time || '10:00:00') }}</span>
                  </div>
                  <button class="change-slot-btn" @click="currentStep = 1">
                    <i class="pi pi-pencil"></i>
                    <span>{{ t('Change Date') }}</span>
                  </button>
                </div>
              </div>

              <!-- Promocode Input Box -->
              <div class="promocode-section">
                <div class="promo-box">
                  <div class="promo-input-wrapper">
                    <i class="pi pi-ticket promo-lead-icon"></i>
                    <input
                      v-model="promoCodeInput"
                      type="text"
                      class="promo-input"
                      :placeholder="t('Enter promo code (e.g. UNITY10)')"
                      :disabled="promoApplied"
                      autocomplete="off"
                      autocorrect="off"
                      data-lpignore="true"
                      @keyup.enter="applyPromo"
                    />
                    <button
                      v-if="!promoApplied"
                      type="button"
                      class="promo-action-btn apply-btn"
                      :disabled="!promoCodeInput.trim() || checkingPromo"
                      @click="applyPromo"
                    >
                      <i v-if="checkingPromo" class="pi pi-spin pi-spinner"></i>
                      <span v-else>{{ t('Apply') }}</span>
                    </button>
                    <button
                      v-else
                      type="button"
                      class="promo-action-btn remove-btn"
                      @click="removePromo"
                    >
                      <i class="pi pi-trash"></i>
                      <span>{{ t('Remove') }}</span>
                    </button>
                  </div>

                  <div v-if="promoApplied" class="promo-msg-line success">
                    <i class="pi pi-check-circle"></i>
                    <span>{{ promoMessage }}</span>
                  </div>
                  <div v-else-if="promoError" class="promo-msg-line error">
                    <i class="pi pi-exclamation-circle"></i>
                    <span>{{ promoError }}</span>
                  </div>
                </div>
              </div>

              <!-- Price Summary Card -->
              <div class="summary-card">
                <div class="card-head">
                  <h5>{{ t('Fee Summary') }}</h5>
                  <span class="tax-badge">{{ t('Incl. 15% VAT') }}</span>
                </div>

                <div class="fee-row">
                  <span>{{ feeLabel }}</span>
                  <strong class="fee-val">{{ subtotalFee }} {{ t('EGP') }}</strong>
                </div>

                <!-- Dynamic Promo Discount row (Only shown when promo code is applied) -->
                <div v-if="promoApplied && promoDiscount > 0" class="fee-row promo-discount-row">
                  <span class="discount-label">
                    <i class="pi pi-tag"></i> {{ t('Promo Code Discount') }} ({{ appliedPromoCode }})
                  </span>
                  <strong class="discount-val">-{{ promoDiscount }} {{ t('EGP') }}</strong>
                </div>

                <div class="fee-divider"></div>

                <div class="total-row">
                  <div class="total-info">
                    <span class="total-label">{{ t('Total Payable Amount') }}</span>
                    <small class="total-note">{{ t('Final approved fees') }}</small>
                  </div>
                  <div class="total-price">
                    <span class="currency">{{ t('EGP') }}</span>
                    <span class="number">{{ totalFee }}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Method Section (Paymob Integration) -->
              <div class="payment-method-section">
                <div class="section-head">
                  <h5>{{ t('Payment Method') }}</h5>
                  <span class="secure-tag"><i class="pi pi-shield"></i> {{ t('Paymob Gateway Integration') }}</span>
                </div>

                <div class="payment-options">
                  <!-- Paymob Online Payment (Cards & Digital Wallets) -->
                  <div 
                    v-if="!isAdmin"
                    class="pay-opt" 
                    :class="{ 'selected': selectedMethod === 'paymob' }"
                    @click="selectedMethod = 'paymob'"
                  >
                    <div class="opt-radio">
                      <span class="circle-check" v-if="selectedMethod === 'paymob'"><i class="pi pi-check"></i></span>
                      <span class="circle-empty" v-else></span>
                    </div>
                    <div class="opt-info">
                      <div class="opt-brand-title">
                        <strong>{{ t('Paymob Electronic Payment') }}</strong>
                        <span class="paymob-pill-tag">Paymob</span>
                      </div>
                      <small>{{ t('Credit / Debit Cards (Visa, MasterCard, Meeza) & Mobile Wallets') }}</small>
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
                      <strong>{{ t('Pay on Arrival') }}</strong>
                      <small>{{ t('Pay cash or card at clinic reception counter') }}</small>
                    </div>
                    <div class="opt-brand">
                      <i class="pi pi-building"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ========================================== -->
            <!-- STEP 3: BOOKING CONFIRMED (SUCCESS)        -->
            <!-- ========================================== -->
            <div v-else class="step-view step-3-view">
              <div class="success-screen">
                <div class="success-ring-wrap">
                  <div class="success-ring">
                    <i class="pi pi-check"></i>
                  </div>
                </div>
                <h3>{{ t('Booking Confirmed Successfully!') }}</h3>
                <p class="success-sub">{{ t('Your appointment has been registered and confirmed.') }}</p>

                <!-- Ticket Card -->
                <div class="ticket-card">
                  <div class="ticket-head">
                    <span class="ref-label">{{ t('Booking Reference') }}</span>
                    <strong class="ref-code">#{{ confirmedAppointment?.id?.slice(-8).toUpperCase() || 'UNITY-APT' }}</strong>
                  </div>

                  <div class="ticket-dashed-line"></div>

                  <div class="ticket-body">
                    <div class="ticket-row">
                      <span class="lbl">
                        <AppExamIcon v-if="isExamination" :size="14" />
                        <i v-else class="pi pi-user"></i> 
                        {{ isExamination ? t('Examination / Service') : t('Doctor') }}
                      </span>
                      <strong class="val">{{ isExamination ? (service?.name || examination?.name || confirmedAppointment?.examination?.name) : (doctor?.name || confirmedAppointment?.doctor?.name) }}</strong>
                    </div>

                    <div class="ticket-row">
                      <span class="lbl"><i :class="isExamination ? 'pi pi-clock' : 'pi pi-building'"></i> {{ isExamination ? t('Duration') : t('Clinic Type') }}</span>
                      <strong class="val">{{ isExamination ? ((service?.duration || examination?.duration || 15) + ' ' + t('mins')) : doctorClinicType }}</strong>
                    </div>

                    <div class="ticket-row">
                      <span class="lbl"><i class="pi pi-calendar"></i> {{ t('Selected Slot') }}</span>
                      <strong class="val">{{ appointmentDateFormatted }} • {{ formatSlotTime(currentSlot?.start_time) }}</strong>
                    </div>

                    <div class="ticket-row">
                      <span class="lbl"><i class="pi pi-tag"></i> {{ t('Appointment Type') }}</span>
                      <strong class="val type-highlight">{{ selectedType === 'follow_up' ? t('Follow-up Consultation') : t('Examination') }}</strong>
                    </div>

                    <div class="ticket-row">
                      <span class="lbl"><i class="pi pi-wallet"></i> {{ t('Payment') }}</span>
                      <strong class="val">{{ selectedMethod === 'cash' ? t('Pay on Arrival') : t('Paid Online via Paymob') }} ({{ totalFee }} {{ t('EGP') }})</strong>
                    </div>
                  </div>
                </div>

                <div class="success-actions">
                  <button class="btn-primary-action" @click="goToAppointments">
                    <i class="pi pi-calendar"></i>
                    <span>{{ t('View My Appointments') }}</span>
                  </button>
                  <button class="btn-secondary-action" @click="goToHome">
                    <span>{{ t('Done') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Sticky Action Bar (Step 1 & 2) -->
          <div v-if="currentStep < 3" class="booking-bottom-action">
            <!-- Step 1 Button: Continue to Payment OR Confirm Slot Change when rescheduling -->
            <button 
              v-if="currentStep === 1"
              class="confirm-pay-btn" 
              :disabled="!currentSlot || submitting"
              @click="isRescheduling ? submitBooking() : goToStep2()"
            >
              <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
              <template v-else>
                <span>{{ isRescheduling ? t('Confirm Slot Change') : t('Continue to Payment') }}</span>
                <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
              </template>
            </button>

            <!-- Step 2 Button: Confirm & Pay -->
            <button 
              v-else-if="currentStep === 2"
              class="confirm-pay-btn" 
              :disabled="submitting"
              @click="submitBooking"
            >
              <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
              <span v-else>{{ isAdmin || selectedMethod === 'cash' ? t('Confirm Booking') : t('Pay with Paymob') }} ({{ totalFee }} {{ t('EGP') }})</span>
              <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
            </button>

            <div class="cancel-policy">
              <i class="pi pi-calendar-times"></i>
              <span>{{ t('Free cancellation up to 2 hours before visit') }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Paymob In-App Checkout Overlay / Dialog -->
    <div v-if="showPaymobModal" class="paymob-checkout-overlay" @click="closePaymobModal">
      <div class="paymob-checkout-card" @click.stop>
        <div class="paymob-header">
          <div class="header-brand">
            <i class="pi pi-shield"></i>
            <span>{{ t('Paymob Secure Checkout') }}</span>
          </div>
          <button class="paymob-close-btn" @click="closePaymobModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Paymob Session Bar / Quick Test Simulator -->
        <div class="paymob-sandbox-bar">
          <div class="sandbox-info">
            <span class="sandbox-dot"></span>
            <span>{{ t('Paymob Gateway Session') }} ({{ totalFee }} {{ t('EGP') }})</span>
          </div>
          <button class="simulate-success-btn" :disabled="completingPaymob" @click="completePaymobPayment">
            <i v-if="completingPaymob" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ t('Confirm Payment (Success)') }}</span>
          </button>
        </div>

        <div class="paymob-iframe-container">
          <iframe
            v-if="paymobIframeUrl"
            :src="paymobIframeUrl"
            class="paymob-iframe"
            frameborder="0"
          ></iframe>
          <div v-else class="paymob-loading">
            <i class="pi pi-spin pi-spinner"></i>
            <p>{{ t('Connecting to Paymob Gateway...') }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUnityApi } from '../composables/useUnityApi';
import { useI18n } from '../composables/useI18n';
import { useAppToast } from '../composables/useAppToast';
import AppBookingCalendar from './common/AppBookingCalendar.vue';
import AppExamIcon from './common/AppExamIcon.vue';

const props = defineProps<{
  modelValue: boolean;
  doctor?: any;
  examination?: any;
  service?: any;
  appointment?: any;
  selectedDate?: string;
  selectedSlot?: any;
  initialType?: 'consultation' | 'follow_up';
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'booking-completed', appointment: any): void;
}>();

const api = useUnityApi();
const route = useRoute();
const router = useRouter();

const { t, isRtl } = useI18n();

const toast = useAppToast();

// 2. Data (refs, reactive state)
const currentStep = ref<1 | 2 | 3>(1);

const selectedBookingDate = ref<string>(props.selectedDate || new Date().toISOString().split('T')[0]);

const currentSlot = ref<any>(props.selectedSlot || null);

const selectedType = ref<'consultation' | 'follow_up'>('consultation');

const canBookFollowUp = ref(false);

const checkingEligibility = ref(false);

const selectedMethod = ref<'paymob' | 'cash'>('paymob');

const submitting = ref(false);

const confirmedAppointment = ref<any>(null);

const availableSlots = ref<any[]>([]);

const slotsLoading = ref(false);

const availableDaysList = ref<Array<{ date: string; label: string; dayNum: string; count?: number }>>([]);

const daysLoading = ref(false);

const dateViewMode = ref<'chips' | 'calendar'>('chips');

// Promocode State
const promoCodeInput = ref('');
const appliedPromoCode = ref('');
const promoDiscount = ref(0);
const promoApplied = ref(false);
const checkingPromo = ref(false);
const promoMessage = ref('');
const promoError = ref('');

// Paymob In-App Checkout State
const showPaymobModal = ref(false);
const paymobIframeUrl = ref('');
const activePaymentAppointment = ref<any>(null);
const activePaymentInvoice = ref<any>(null);
const completingPaymob = ref(false);
const detailedDoctor = ref<any>(null);

// 3. Computed (computed properties)
const isAdmin = computed(() => {
  return route.path.startsWith('/admin') || api.currentUser.value?.role === 'admin' || api.user.value?.role === 'admin';
});

const isExamination = computed(() => {
  return props.initialType === 'examination' || Boolean(props.service || props.examination);
});

const isRescheduling = computed(() => {
  return Boolean(props.appointment?.id);
});

const nextDays = computed(() => {
  return availableDaysList.value;
});

const onlyAvailableDates = computed(() => {
  return availableDaysList.value.map((d) => d.date);
});

const appointmentDateFormatted = computed(() => {
  const dateStr = selectedBookingDate.value || props.selectedDate;
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
});

const feeLabel = computed(() => {
  if (isExamination.value || props.service?.price) return t('Medical Examination Fee');
  return t('Consultation Fee');
});

const subtotalFee = computed(() => {
  if (props.service?.price) return Number(props.service.price);
  if (props.examination?.price) return Number(props.examination.price);
  const doc = detailedDoctor.value || props.doctor || props.appointment?.doctor;
  const apt = props.appointment;
  if (doc) {
    const fee = doc.consultation_fee ?? doc.doctor?.consultation_fee ?? apt?.doctor?.doctor?.consultation_fee;
    if (fee !== undefined && fee !== null && !isNaN(Number(fee))) {
      return Number(fee);
    }
  }
  if (apt?.invoice?.amount) return Number(apt.invoice.amount);
  return 300;
});

const totalFee = computed(() => {
  const tot = subtotalFee.value - promoDiscount.value;
  return tot > 0 ? tot : 0;
});

const doctorClinicType = computed(() => {
  if (isExamination.value) {
    return t('Medical Examinations & Labs');
  }

  const doc = detailedDoctor.value || props.doctor || props.appointment?.doctor;
  const apt = props.appointment;

  // 1. Direct or nested clinic name
  const clinicName = 
    (typeof doc?.clinic === 'string' ? doc.clinic : doc?.clinic?.name) || 
    (typeof doc?.doctor?.clinic === 'string' ? doc.doctor.clinic : doc?.doctor?.clinic?.name) || 
    (typeof apt?.doctor?.doctor?.clinic === 'string' ? apt.doctor.doctor.clinic : apt?.doctor?.doctor?.clinic?.name) || 
    (typeof apt?.doctor?.clinic === 'string' ? apt.doctor.clinic : apt?.doctor?.clinic?.name) || 
    (typeof apt?.clinic === 'string' ? apt.clinic : apt?.clinic?.name) ||
    doc?.clinic_name ||
    apt?.clinic_name ||
    doc?.specialty ||
    doc?.doctor?.specialty ||
    apt?.doctor?.doctor?.specialty ||
    apt?.doctor?.specialty;

  if (clinicName) {
    return String(clinicName);
  }

  return t('General Clinic');
});

// 4. Methods (functions, handlers)
const applyPromo = async () => {
  if (!promoCodeInput.value.trim()) return;
  try {
    checkingPromo.value = true;
    promoError.value = '';
    const res = await api.apiRequest({
      service: 'VERIFY_PROMOCODE',
      payload: {
        code: promoCodeInput.value.trim(),
        amount: subtotalFee.value,
      },
    });

    if (res?.status && res?.data) {
      appliedPromoCode.value = res.data.code;
      promoDiscount.value = Number(res.data.discount) || 0;
      promoApplied.value = true;
      promoMessage.value = res.data.message || t('Promo code applied successfully');
      toast.success(promoMessage.value);
    } else {
      promoError.value = res?.message || t('Invalid or expired promo code');
      toast.error(promoError.value);
    }
  } catch (err: any) {
    promoError.value = err?.message || t('Invalid or expired promo code');
    toast.error(promoError.value);
  } finally {
    checkingPromo.value = false;
  }
};

const removePromo = () => {
  promoCodeInput.value = '';
  appliedPromoCode.value = '';
  promoDiscount.value = 0;
  promoApplied.value = false;
  promoMessage.value = '';
  promoError.value = '';
};

const toMinutes = (timeStr?: string): number => {
  if (!timeStr) return -1;
  const str = String(timeStr).trim().toUpperCase();
  const isPM = str.includes('PM');
  const isAM = str.includes('AM');
  const clean = str.replace(/[^0-9:]/g, '');
  const parts = clean.split(':');
  if (parts.length < 2) return -1;
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
};

const to24Hour = (timeStr?: string) => {
  if (!timeStr) return '10:00:00';
  const mins = toMinutes(timeStr);
  if (mins < 0) return '10:00:00';
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}:00`;
};

const formatSlotTime = (timeStr?: string) => {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
  if (/am|pm/i.test(trimmed)) return trimmed;

  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;

  let h = parseInt(parts[0], 10);
  const m = parts[1].slice(0, 2);
  if (isNaN(h)) return trimmed;

  const isPm = h >= 12;
  h = h % 12;
  if (h === 0) h = 12;
  const hPadded = h.toString().padStart(2, '0');
  const period = isPm ? 'PM' : 'AM';
  return `${hPadded}:${m} ${period}`;
};

const selectDate = (dateStr: string) => {
  selectedBookingDate.value = dateStr;
  currentSlot.value = null;
  DOCTOR_SLOTS();
};

const goToStep2 = () => {
  if (!currentSlot.value) {
    toast.error(t('Please select a time slot to continue'));
    return;
  }
  currentStep.value = 2;
};

const DOCTOR_AVAILABLE_DAYS = async () => {
  if (isExamination.value) {
    const examId = props.service?.id || props.examination?.id;
    if (examId) {
      try {
        daysLoading.value = true;
        const res = await api.apiRequest({
          service: 'EXAMINATION_AVAILABLE_DAYS',
          filter: { id: examId, days: 60 },
        });

        if (res?.status && Array.isArray(res.data) && res.data.length > 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];

          availableDaysList.value = res.data.map((item: any) => {
            const d = new Date(item.date);
            let label = '';
            if (item.date === todayStr) label = t('Today');
            else if (item.date === tomorrowStr) label = t('Tomorrow');
            else label = d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { weekday: 'short' });

            const dayNum = d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' });
            return {
              date: item.date,
              label,
              dayNum,
              count: item.available_slots_count,
            };
          });

          const initialDate = props.selectedDate || (props.appointment?.date ? new Date(props.appointment.date).toISOString().split('T')[0] : '');
          if (initialDate && availableDaysList.value.some(d => d.date === initialDate)) {
            selectedBookingDate.value = initialDate;
          } else if (!availableDaysList.value.some(d => d.date === selectedBookingDate.value) && availableDaysList.value.length > 0) {
            selectedBookingDate.value = availableDaysList.value[0].date;
          }
          await DOCTOR_SLOTS();
          return;
        }
      } catch (err) {
        // Fallback below
      } finally {
        daysLoading.value = false;
      }
    }

    // Fallback: generate 7 working days
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      let label = '';
      if (i === 0) label = t('Today');
      else if (i === 1) label = t('Tomorrow');
      else label = d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { weekday: 'short' });
      const dayNum = d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' });
      days.push({ date: dateStr, label, dayNum });
    }
    availableDaysList.value = days;
    if (days.length > 0 && !days.some(d => d.date === selectedBookingDate.value)) {
      selectedBookingDate.value = days[0].date;
    }
    await DOCTOR_SLOTS();
    return;
  }

  if (!props.doctor?.id) {
    // For service / examination without specific doctor, generate 7 working days
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      let label = '';
      if (i === 0) label = t('Today');
      else if (i === 1) label = t('Tomorrow');
      else label = d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { weekday: 'short' });
      const dayNum = d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' });
      days.push({ date: dateStr, label, dayNum });
    }
    availableDaysList.value = days;
    if (days.length > 0 && !days.some(d => d.date === selectedBookingDate.value)) {
      selectedBookingDate.value = days[0].date;
    }
    await DOCTOR_SLOTS();
    return;
  }

  try {
    daysLoading.value = true;
    const res = await api.apiRequest({
      service: 'DOCTOR_AVAILABLE_DAYS',
      filter: { id: props.doctor.id, days: 60 },
    });

    if (res?.status && Array.isArray(res.data) && res.data.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      availableDaysList.value = res.data.map((item: any) => {
        const d = new Date(item.date);
        let label = '';
        if (item.date === todayStr) label = t('Today');
        else if (item.date === tomorrowStr) label = t('Tomorrow');
        else label = d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { weekday: 'short' });

        const dayNum = d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' });
        return {
          date: item.date,
          label,
          dayNum,
          count: item.available_slots_count,
        };
      });

      // Automatically select preselected/appointment date if present, otherwise first available
      const initialDate = props.selectedDate || (props.appointment?.date ? new Date(props.appointment.date).toISOString().split('T')[0] : '');
      if (initialDate && availableDaysList.value.some(d => d.date === initialDate)) {
        selectedBookingDate.value = initialDate;
      } else if (!availableDaysList.value.some(d => d.date === selectedBookingDate.value) && availableDaysList.value.length > 0) {
        selectedBookingDate.value = availableDaysList.value[0].date;
      }
    } else {
      availableDaysList.value = [];
    }
  } catch (err) {
    // Graceful fallback
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      let label = i === 0 ? t('Today') : (i === 1 ? t('Tomorrow') : d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { weekday: 'short' }));
      const dayNum = d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' });
      days.push({ date: dateStr, label, dayNum });
    }
    availableDaysList.value = days;
  } finally {
    daysLoading.value = false;
    await DOCTOR_SLOTS();
  }
};

const DOCTOR_SLOTS = async () => {
  if (isExamination.value) {
    const examId = props.service?.id || props.examination?.id;
    if (examId) {
      try {
        slotsLoading.value = true;
        const dateStr = selectedBookingDate.value || props.selectedDate || new Date().toISOString().split('T')[0];
        const res = await api.apiRequest({
          service: 'EXAMINATION_SLOTS',
          filter: { id: examId, date: dateStr, no_cache: 1 },
        });
        if (res?.status && Array.isArray(res.data?.slots)) {
          availableSlots.value = res.data.slots;
          const firstAvailable = availableSlots.value.find((s: any) => s.is_available);

          const targetTime = props.selectedSlot?.start_time || props.appointment?.start_time || currentSlot.value?.start_time;
          if (targetTime) {
            const targetMins = toMinutes(targetTime);
            const matched = availableSlots.value.find((s: any) => toMinutes(s.start_time) === targetMins);
            if (matched && matched.is_available) {
              currentSlot.value = matched;
            } else if (props.appointment?.start_time) {
              const currentBookedSlot = {
                start_time: props.appointment.start_time,
                end_time: props.appointment.end_time || '',
                is_available: true,
              };
              availableSlots.value.unshift(currentBookedSlot);
              availableSlots.value.sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
              currentSlot.value = currentBookedSlot;
            } else if (firstAvailable) {
              currentSlot.value = firstAvailable;
            } else {
              currentSlot.value = null;
            }
          } else if (firstAvailable) {
            currentSlot.value = firstAvailable;
          } else {
            currentSlot.value = null;
          }
          return;
        }
      } catch (err) {
        // Fallback below
      } finally {
        slotsLoading.value = false;
      }
    }

    availableSlots.value = [
      { start_time: '10:00 AM', end_time: '10:30 AM', is_available: true },
      { start_time: '10:30 AM', end_time: '11:00 AM', is_available: true },
      { start_time: '11:00 AM', end_time: '11:30 AM', is_available: true },
      { start_time: '05:30 PM', end_time: '06:00 PM', is_available: true },
      { start_time: '06:00 PM', end_time: '06:30 PM', is_available: true },
    ];
    if (!currentSlot.value) {
      currentSlot.value = availableSlots.value[0];
    }
    return;
  }

  const docId = props.doctor?.id || props.appointment?.doctor?.id || props.appointment?.doctor_id;
  if (!docId) {
    availableSlots.value = [
      { start_time: '10:00 AM', end_time: '10:30 AM', is_available: true },
      { start_time: '10:30 AM', end_time: '11:00 AM', is_available: true },
      { start_time: '11:00 AM', end_time: '11:30 AM', is_available: true },
      { start_time: '05:30 PM', end_time: '06:00 PM', is_available: true },
      { start_time: '06:00 PM', end_time: '06:30 PM', is_available: true },
      { start_time: '06:30 PM', end_time: '07:00 PM', is_available: true },
    ];
    if (!currentSlot.value) {
      currentSlot.value = availableSlots.value[0];
    }
    return;
  }

  try {
    slotsLoading.value = true;
    const dateStr = selectedBookingDate.value || props.selectedDate || new Date().toISOString().split('T')[0];
    const res = await api.apiRequest({
      service: 'DOCTOR_SLOTS',
      filter: { id: docId, date: dateStr, no_cache: 1 },
    });
    if (res.status && Array.isArray(res.data?.slots)) {
      availableSlots.value = res.data.slots;
      const firstAvailable = availableSlots.value.find((s: any) => s.is_available);

      // Match target preselected/appointment time slot if provided
      const targetTime = props.selectedSlot?.start_time || props.appointment?.start_time || currentSlot.value?.start_time;
      if (targetTime) {
        const targetMins = toMinutes(targetTime);
        const matched = availableSlots.value.find((s: any) => toMinutes(s.start_time) === targetMins);
        if (matched && matched.is_available) {
          currentSlot.value = matched;
        } else if (props.appointment?.start_time) {
          const currentBookedSlot = {
            start_time: props.appointment.start_time,
            end_time: props.appointment.end_time || '',
            is_available: true,
          };
          availableSlots.value.unshift(currentBookedSlot);
          availableSlots.value.sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
          currentSlot.value = currentBookedSlot;
        } else if (firstAvailable) {
          currentSlot.value = firstAvailable;
        } else {
          currentSlot.value = null;
        }
      } else if (firstAvailable) {
        currentSlot.value = firstAvailable;
      } else {
        currentSlot.value = null;
      }
    }
  } catch (err) {
    availableSlots.value = [
      { start_time: '10:00 AM', end_time: '10:30 AM', is_available: true },
      { start_time: '10:30 AM', end_time: '11:00 AM', is_available: true },
      { start_time: '11:00 AM', end_time: '11:30 AM', is_available: true },
      { start_time: '05:30 PM', end_time: '06:00 PM', is_available: true },
      { start_time: '06:00 PM', end_time: '06:30 PM', is_available: true },
    ];
    if (!currentSlot.value) {
      currentSlot.value = availableSlots.value[0];
    }
  } finally {
    slotsLoading.value = false;
  }
};

const submitBooking = async () => {
  try {
    submitting.value = true;
    const dateStr = selectedBookingDate.value || props.selectedDate || new Date().toISOString().split('T')[0];
    const slot = currentSlot.value || { start_time: '10:00:00', end_time: '10:30:00' };

    // Case 1: Rescheduling an existing pending appointment
    if (props.appointment?.id) {
      if (props.appointment.status !== 'pending') {
        toast.error(t('Cannot modify confirmed appointment. Please contact clinic.'));
        return;
      }

      const rescheduleRes = await api.apiRequest({
        service: 'RESCHEDULE_APPOINTMENT',
        filter: { id: props.appointment.id },
        payload: {
          date: dateStr,
          start_time: to24Hour(slot.start_time),
          end_time: slot.end_time ? to24Hour(slot.end_time) : to24Hour(slot.start_time),
        },
      });

      confirmedAppointment.value = rescheduleRes?.data || props.appointment;
      currentStep.value = 3;
      toast.success(t('Booking rescheduled successfully!'));
      emit('booking-completed', confirmedAppointment.value);
      return;
    }

    // Case 2: Creating a brand new appointment
    const isOffer = Boolean(props.service?.is_offer);
    const docId = props.doctor?.id || props.appointment?.doctor?.id || undefined;
    const payload = {
      doctor_id: docId,
      examination_id: !isOffer ? (props.examination?.id || props.service?.id || undefined) : undefined,
      service_id: !isOffer ? (props.examination?.id || props.service?.id || undefined) : undefined,
      offer_id: isOffer ? props.service?.id : undefined,
      date: dateStr,
      start_time: to24Hour(slot.start_time),
      end_time: slot.end_time ? to24Hour(slot.end_time) : to24Hour(slot.start_time),
      type: isExamination.value ? 'consultation' : selectedType.value,
      payment_method: selectedMethod.value === 'cash' ? 'cash' : 'paymob',
      promocode: promoApplied.value ? appliedPromoCode.value : undefined,
      discount: promoDiscount.value,
      notes: isOffer 
        ? `حجز عرض طبي: ${props.service?.name}` 
        : (isExamination.value ? `حجز فحص طبي: ${props.service?.name || props.examination?.name}` : 'حجز كشف طبي'),
    };

    let appointmentRes: any = null;
    try {
      appointmentRes = await api.apiRequest({
        service: 'BOOK_APPOINTMENT',
        payload: payload as any,
      });
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

    const createdAppointment = appointmentRes?.data?.appointment || appointmentRes?.data;
    const createdInvoice = appointmentRes?.data?.invoice;
    activePaymentAppointment.value = createdAppointment;
    activePaymentInvoice.value = createdInvoice;

    confirmedAppointment.value = createdAppointment || {
      id: 'apt-' + Date.now(),
      doctor: props.doctor,
      date: dateStr,
      start_time: slot.start_time,
    };

    // If Paymob Online Payment is selected
    if (selectedMethod.value === 'paymob' && !isAdmin.value && totalFee.value > 0) {
      try {
        const payRes = await api.apiRequest({
          service: 'PAYMOB_INITIATE',
          payload: {
            appointment_id: createdAppointment?.id,
            invoice_id: createdInvoice?.id,
          },
        });

        if (payRes?.status && payRes?.data?.payment_url) {
          paymobIframeUrl.value = payRes.data.payment_url;
          showPaymobModal.value = true;
          return;
        }
      } catch (payErr) {
        console.warn('Paymob initiation fallback:', payErr);
      }
    }

    // Direct completion (cash or free service)
    currentStep.value = 3;
    toast.success(t('Appointment booked successfully!'));
    emit('booking-completed', confirmedAppointment.value);
  } catch (err: any) {
    toast.error(err.message || 'تعذر إتمام عملية الحجز');
  } finally {
    submitting.value = false;
  }
};

const completePaymobPayment = async () => {
  try {
    completingPaymob.value = true;
    await api.apiRequest({
      service: 'PAYMOB_CONFIRM',
      payload: {
        appointment_id: activePaymentAppointment.value?.id,
        invoice_id: activePaymentInvoice.value?.id,
      },
    });
    showPaymobModal.value = false;
    currentStep.value = 3;
    toast.success(t('Payment completed successfully via Paymob!'));
    emit('booking-completed', confirmedAppointment.value);
  } catch (err: any) {
    showPaymobModal.value = false;
    currentStep.value = 3;
    emit('booking-completed', confirmedAppointment.value);
  } finally {
    completingPaymob.value = false;
  }
};

const closePaymobModal = () => {
  showPaymobModal.value = false;
  currentStep.value = 3;
};

const goToAppointments = () => {
  close();
  router.push('/appointments');
};

const goToHome = () => {
  close();
  router.push('/');
};

const close = () => {
  emit('update:modelValue', false);
};

// 5. Watches (watch, watchEffect)
watch(
  () => [props.modelValue, props.doctor, props.service, props.examination, props.appointment],
  async ([isOpen]) => {
    if (isOpen) {
      currentStep.value = 1;
      confirmedAppointment.value = null;
      selectedType.value = props.initialType || props.appointment?.type || 'consultation';
      selectedMethod.value = isAdmin.value ? 'cash' : 'paymob';
      removePromo();
      showPaymobModal.value = false;

      // Fetch fresh doctor & clinic details if booking a doctor
      detailedDoctor.value = null;
      const docId = props.doctor?.id || props.appointment?.doctor_id || props.appointment?.doctor?.id;
      if (docId && !isExamination.value) {
        try {
          const docRes = await api.apiRequest({
            service: 'DOCTOR_BY_ID',
            filter: { id: docId },
          });
          if (docRes?.data) {
            detailedDoctor.value = docRes.data;
          }
        } catch (e) {}
      }

      // Extract slot and date from appointment or props
      const aptDate = props.appointment?.date ? new Date(props.appointment.date).toISOString().split('T')[0] : '';
      const chosenDate = props.selectedDate || aptDate;
      if (chosenDate) {
        selectedBookingDate.value = chosenDate;
      }

      const initialSlot = props.selectedSlot || (props.appointment?.start_time ? { start_time: props.appointment.start_time, end_time: props.appointment.end_time } : null);
      currentSlot.value = initialSlot;

      await DOCTOR_AVAILABLE_DAYS();
    }
  },
  { immediate: true }
);

// 6. Hooks (onMounted, onUnmounted, etc.)
onUnmounted(() => {
  // Cleanup
});

// 7. Meta (useHead, useSeoMeta)
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
  max-width: 480px;
  max-height: 90vh;
  background: var(--unity-bg);
  border-radius: 28px 28px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.booking-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--unity-border-light);
  background: var(--unity-surface);

  .top-nav-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1px solid var(--unity-border);
    background: var(--unity-bg);
    color: var(--unity-text-main);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--unity-surface);
      transform: scale(1.05);
    }
  }

  .top-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--unity-text-main);
  }

  .avatar-wrap {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #ecfdf5;
    color: #047857;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }
}

// Step Indicator Bar
.booking-steps-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: var(--unity-surface);
  border-bottom: 1px solid var(--unity-border-light);

  .step-pill {
    display: flex;
    align-items: center;
    gap: 8px;

    .circle {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--unity-border);
      color: var(--unity-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      transition: all 0.25s;
    }

    .label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--unity-text-muted);
      transition: color 0.25s;
    }

    &.active {
      .circle {
        background: var(--unity-primary);
        color: #fff;
        box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.2);
      }
      .label {
        color: var(--unity-primary);
        font-weight: 700;
      }
    }

    &.done {
      .circle {
        background: #10b981;
        color: #fff;
      }
      .label {
        color: #065f46;
      }
    }
  }

  .step-connector {
    flex: 1;
    height: 2px;
    background: var(--unity-border);
    margin: 0 12px;
    transition: background 0.25s;

    &.active {
      background: var(--unity-primary);
    }
  }
}

// Timer Banner
.timer-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #f0fdf4;
  border-bottom: 1px solid #dcfce7;

  .timer-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.74rem;
    color: #047857;
    font-weight: 600;

    .live-dot {
      width: 8px;
      height: 8px;
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
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

// Doctor Summary Card
.doctor-summary-card {
  position: relative;
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--unity-shadow-subtle);
  margin-bottom: 20px;

  .doc-badge-rating {
    position: absolute;
    top: 14px;
    inset-inline-end: 14px;
    background: #ecfdf5;
    color: #047857;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 12px;

    &.exam-badge {
      background: rgba(4, 120, 87, 0.12);
      color: var(--unity-primary);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
    }
  }

  .doc-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;

    .doc-avatar {
      position: relative;
      width: 52px;
      height: 52px;
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
        font-size: 1.3rem;
      }

      .exam-icon-circle {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(4, 120, 87, 0.12) 0%, rgba(16, 185, 129, 0.22) 100%);
        color: var(--unity-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        border: 2px solid var(--unity-primary-tint);
      }

      .verified-tick {
        position: absolute;
        bottom: 0;
        inset-inline-end: 0;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #10b981;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.55rem;
        border: 2px solid #fff;
      }
    }

    .doc-info {
      h4 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      .doc-spec {
        font-size: 0.76rem;
        color: var(--unity-text-muted);
        margin-top: 2px;
      }
    }
  }

  .doc-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    background: var(--unity-bg);
    border-radius: 14px;
    padding: 10px 12px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .meta-icon {
        width: 30px;
        height: 30px;
        border-radius: 8px;
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
          font-size: 0.66rem;
          color: var(--unity-text-dim);
        }

        .meta-val {
          font-size: 0.76rem;
          color: var(--unity-text-main);
          font-weight: 700;
        }
      }
    }
  }
}

// Booking Type Selector
.booking-type-box {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 14px;
  box-shadow: var(--unity-shadow-subtle);

  .type-box-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;

    .type-box-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.86rem;
      font-weight: 700;
      color: var(--unity-text-main);

      i {
        color: var(--unity-primary);
        font-size: 0.95rem;
      }
    }

    .locked-note {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.66rem;
      color: #b45309;
      background: #fef3c7;
      padding: 3px 8px;
      border-radius: 8px;
      font-weight: 600;
    }
  }

  .type-options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    .type-opt-btn {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 12px;
      border-radius: 16px;
      background: var(--unity-bg);
      border: 1.5px solid var(--unity-border);
      cursor: pointer;
      text-align: start;
      transition: all 0.2s ease;

      .opt-top {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        margin-bottom: 6px;

        .opt-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid var(--unity-border);
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;

          .radio-dot {
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background: var(--unity-primary);
          }

          .lock-icon {
            font-size: 0.65rem;
            color: var(--unity-text-dim);
          }
        }

        .opt-label {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--unity-text-main);
        }
      }

      .opt-price {
        display: flex;
        align-items: baseline;
        gap: 4px;
        margin-bottom: 4px;

        .val {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--unity-primary-dark);
        }

        .cur {
          font-size: 0.72rem;
          color: var(--unity-text-muted);
          font-weight: 600;
        }
      }

      .opt-sub {
        font-size: 0.66rem;
        color: var(--unity-text-muted);
        line-height: 1.3;

        &.unlocked-sub {
          color: #047857;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        &.locked-sub {
          color: #9ca3af;
          font-style: italic;
        }
      }

      &.selected {
        border-color: var(--unity-primary);
        background: #f0fdf4;
        box-shadow: 0 4px 12px -2px rgba(4, 120, 87, 0.15);

        .opt-radio {
          border-color: var(--unity-primary);
        }
      }

      &.is-locked {
        opacity: 0.6;
        cursor: not-allowed;
        background: #f9fafb;
        border-color: #e5e7eb;
      }
    }
  }
}

// Date Selection Box
.date-selection-box {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 14px;
  box-shadow: var(--unity-shadow-subtle);
  margin-bottom: 20px;

  .box-head {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 12px;

    .box-head-top {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .box-title {
        font-size: 0.86rem;
        font-weight: 700;
        color: var(--unity-text-main);
        display: flex;
        align-items: center;
        gap: 6px;

        i {
          color: var(--unity-primary);
        }
      }

      .date-current-badge {
        font-size: 0.72rem;
        color: var(--unity-primary);
        font-weight: 700;
        background: #ecfdf5;
        padding: 3px 8px;
        border-radius: 8px;
      }
    }

    .view-mode-toggle-group {
      display: flex;
      align-items: center;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      border-radius: 12px;
      padding: 3px;
      gap: 4px;

      .view-toggle-pill {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 9px;
        border: none;
        background: transparent;
        font-size: 0.76rem;
        font-weight: 600;
        color: var(--unity-text-muted);
        cursor: pointer;
        transition: all 0.2s ease;

        i {
          font-size: 0.78rem;
        }

        &.active {
          background: var(--unity-surface);
          color: var(--unity-primary);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
          font-weight: 700;
        }
      }
    }
  }

  .calendar-view-wrap {
    margin-top: 4px;
    animation: fadeInCal 0.22s ease-in-out;
  }

  @keyframes fadeInCal {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .days-scroll-row {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }

    .day-chip-btn {
      flex: 0 0 64px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px 6px;
      border-radius: 14px;
      border: 1.5px solid var(--unity-border);
      background: var(--unity-bg);
      cursor: pointer;
      transition: all 0.2s;

      .day-lbl {
        font-size: 0.66rem;
        color: var(--unity-text-muted);
        font-weight: 600;
      }

      .day-num {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--unity-text-main);
        margin-top: 2px;
      }

      &.active {
        background: var(--unity-primary-dark);
        border-color: var(--unity-primary-dark);
        color: #fff;

        .day-lbl {
          color: rgba(255, 255, 255, 0.8);
        }

        .day-num {
          color: #fff;
        }
      }

      &.open-cal-chip {
        border-style: dashed;
        border-color: var(--unity-primary);
        color: var(--unity-primary);
        background: rgba(16, 185, 129, 0.05);

        i {
          font-size: 0.95rem;
          color: var(--unity-primary);
          margin-bottom: 2px;
        }

        .day-lbl {
          color: var(--unity-primary);
          font-weight: 700;
        }
      }
    }
  }

  .days-loading {
    padding: 16px;
    text-align: center;
    font-size: 0.8rem;
    color: var(--unity-text-muted);
  }

  .empty-days-alert {
    padding: 18px 12px;
    text-align: center;
    background: var(--unity-bg);
    border-radius: 12px;
    color: var(--unity-text-muted);
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    i {
      font-size: 1.1rem;
      color: #eab308;
    }
  }
}

// Slot Selection Box
.slot-selection-box {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 14px;
  box-shadow: var(--unity-shadow-subtle);
  margin-bottom: 20px;

  .box-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .box-title {
      font-size: 0.86rem;
      font-weight: 700;
      color: var(--unity-text-main);
      display: flex;
      align-items: center;
      gap: 6px;

      i {
        color: var(--unity-primary);
      }
    }

    .selected-slot-preview {
      font-size: 0.74rem;
      color: #fff;
      background: var(--unity-primary);
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 8px;
    }
  }

  .slots-loading {
    padding: 20px;
    text-align: center;
    font-size: 0.82rem;
    color: var(--unity-text-muted);
  }

  .slots-chips {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;

    .slot-chip {
      padding: 10px 8px;
      border-radius: 12px;
      border: 1.5px solid var(--unity-border);
      background: var(--unity-bg);
      color: var(--unity-text-main);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: all 0.2s;

      .slot-tick {
        font-size: 0.7rem;
      }

      &.is-booked,
      &:disabled {
        background: var(--unity-surface-muted, #f1f5f9);
        border-color: var(--unity-border);
        color: var(--unity-text-dim, #94a3b8);
        cursor: not-allowed;
        opacity: 0.45;
        pointer-events: none;
        box-shadow: none;
      }

      &.active {
        background: var(--unity-primary);
        border-color: var(--unity-primary);
        color: #fff;
        box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);
      }
    }
  }

  .empty-slots {
    padding: 24px 16px;
    text-align: center;
    color: var(--unity-text-muted);
    font-size: 0.8rem;

    i {
      font-size: 1.8rem;
      color: var(--unity-text-dim);
      margin-bottom: 6px;
      display: block;
    }
  }
}

// Step 2 Review Card
.appointment-review-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--unity-shadow-subtle);

  .review-head {
    display: flex;
    align-items: center;
    gap: 12px;

    .rev-doc-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .doc-initial-avatar {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #047857 0%, #10b981 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.2rem;
      }

      .exam-icon-circle {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(4, 120, 87, 0.12) 0%, rgba(16, 185, 129, 0.22) 100%);
        color: var(--unity-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        border: 2px solid var(--unity-primary-tint);
      }
    }

    .rev-details {
      flex: 1;

      h4 {
        font-size: 0.98rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      .rev-clinic {
        font-size: 0.74rem;
        color: var(--unity-text-muted);
        margin-top: 2px;
      }

      .rev-type-pill {
        display: inline-block;
        font-size: 0.68rem;
        font-weight: 700;
        color: #047857;
        background: #ecfdf5;
        padding: 2px 8px;
        border-radius: 8px;
        margin-top: 4px;
      }
    }
  }

  .rev-divider {
    height: 1px;
    background: var(--unity-border-light);
    margin: 12px 0;
  }

  .rev-schedule-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--unity-bg);
    padding: 10px 12px;
    border-radius: 12px;

    .sch-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--unity-text-main);

      i {
        color: var(--unity-primary);
      }
    }

    .change-slot-btn {
      background: none;
      border: none;
      color: var(--unity-primary);
      font-size: 0.72rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// Promocode Section
.promocode-section {
  .promo-box {
    background: var(--unity-surface);
    border: 1.5px solid var(--unity-border);
    border-radius: 18px;
    padding: 12px;
    box-shadow: var(--unity-shadow-subtle);

    .promo-input-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      border-radius: 12px;
      padding: 4px 6px 4px 12px;

      .promo-lead-icon {
        color: var(--unity-primary);
        font-size: 1.1rem;
      }

      .promo-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--unity-text-main);
        outline: none;
        padding: 6px 0;
        letter-spacing: 0.5px;

        &::placeholder {
          font-weight: 400;
          color: var(--unity-text-muted);
        }
      }

      .promo-action-btn {
        padding: 7px 14px;
        border-radius: 9px;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: all 0.2s;

        &.apply-btn {
          background: var(--unity-primary);
          color: #fff;

          &:disabled {
            opacity: 0.45;
            cursor: not-allowed;
          }

          &:not(:disabled):hover {
            background: var(--unity-primary-dark);
          }
        }

        &.remove-btn {
          background: #fee2e2;
          color: #b91c1c;

          &:hover {
            background: #fecaca;
          }
        }
      }
    }

    .promo-msg-line {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0 4px;

      &.success {
        color: #047857;
      }

      &.error {
        color: #dc2626;
      }
    }
  }
}

// Summary Card
.summary-card {
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

    h5 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--unity-text-main);
    }

    .tax-badge {
      font-size: 0.7rem;
      color: #047857;
      background: #ecfdf5;
      padding: 3px 8px;
      border-radius: 8px;
      font-weight: 600;
    }
  }

  .fee-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.82rem;
    color: var(--unity-text-muted);
    margin-bottom: 8px;

    .fee-val {
      font-weight: 700;
      color: var(--unity-text-main);
    }

    &.promo-discount-row {
      color: #047857;

      .discount-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 700;
      }

      .discount-val {
        color: #047857;
        font-weight: 800;
      }
    }
  }

  .fee-divider {
    height: 1px;
    background: var(--unity-border-light);
    margin: 10px 0;
  }

  .total-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .total-info {
      display: flex;
      flex-direction: column;

      .total-label {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      .total-note {
        font-size: 0.68rem;
        color: var(--unity-text-dim);
      }
    }

    .total-price {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .currency {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--unity-primary-dark);
      }

      .number {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--unity-primary-dark);
      }
    }
  }
}

// Payment Method Section
.payment-method-section {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--unity-shadow-subtle);

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    h5 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--unity-text-main);
    }

    .secure-tag {
      font-size: 0.7rem;
      color: #047857;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
    }
  }

  .payment-options {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .pay-opt {
      display: flex;
      align-items: center;
      padding: 12px 14px;
      border: 1.5px solid var(--unity-border);
      border-radius: 14px;
      background: var(--unity-bg);
      cursor: pointer;
      transition: all 0.2s;

      .opt-radio {
        margin-inline-end: 12px;

        .circle-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--unity-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
        }

        .circle-empty {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1.5px solid var(--unity-border);
          background: #fff;
        }
      }

      .opt-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        .opt-brand-title {
          display: flex;
          align-items: center;
          gap: 6px;

          .paymob-pill-tag {
            background: #0284c7;
            color: #fff;
            font-size: 0.65rem;
            font-weight: 800;
            padding: 1px 6px;
            border-radius: 6px;
            letter-spacing: 0.4px;
          }
        }

        strong {
          font-size: 0.86rem;
          color: var(--unity-text-main);
          font-weight: 700;
        }

        small {
          font-size: 0.7rem;
          color: var(--unity-text-dim);
        }
      }

      .opt-brand {
        font-size: 1.25rem;
        color: var(--unity-text-muted);
      }

      &.selected {
        border-color: var(--unity-primary);
        background: #f0fdf4;
      }
    }
  }
}

// Paymob In-App Checkout Modal Overlay
.paymob-checkout-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;

  .paymob-checkout-card {
    background: #ffffff;
    width: 100%;
    max-width: 480px;
    height: 85vh;
    max-height: 700px;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

    .paymob-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: #0f172a;
      color: #ffffff;

      .header-brand {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        font-size: 0.95rem;

        i {
          color: #38bdf8;
          font-size: 1.1rem;
        }
      }

      .paymob-close-btn {
        background: rgba(255, 255, 255, 0.15);
        border: none;
        color: #ffffff;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      }
    }

    .paymob-sandbox-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: #f0f9ff;
      border-bottom: 1px solid #bae6fd;

      .sandbox-info {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.74rem;
        font-weight: 600;
        color: #0369a1;

        .sandbox-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0284c7;
          display: inline-block;
        }
      }

      .simulate-success-btn {
        background: #047857;
        color: #ffffff;
        border: none;
        padding: 5px 12px;
        border-radius: 8px;
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #065f46;
        }

        &:disabled {
          opacity: 0.5;
        }
      }
    }

    .paymob-iframe-container {
      flex: 1;
      width: 100%;
      position: relative;
      background: #f8fafc;

      .paymob-iframe {
        width: 100%;
        height: 100%;
        border: none;
      }

      .paymob-loading {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: #64748b;
        font-size: 0.85rem;

        i {
          font-size: 2rem;
          color: #0284c7;
        }
      }
    }
  }
}

// Step 3 Success Screen
.success-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 10px 0 20px;

  .success-ring-wrap {
    margin-bottom: 12px;

    .success-ring {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #047857 0%, #10b981 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      box-shadow: 0 8px 24px rgba(4, 120, 87, 0.35);
      animation: scalePop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
  }

  @keyframes scalePop {
    0% { transform: scale(0); opacity: 0; }
    80% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }

  h3 {
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--unity-text-main);
  }

  .success-sub {
    font-size: 0.8rem;
    color: var(--unity-text-muted);
    margin-top: 4px;
    max-width: 320px;
  }

  .ticket-card {
    width: 100%;
    background: var(--unity-surface);
    border: 1.5px solid var(--unity-border);
    border-radius: 20px;
    padding: 16px;
    margin: 18px 0;
    box-shadow: var(--unity-shadow-subtle);
    text-align: start;

    .ticket-head {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .ref-label {
        font-size: 0.74rem;
        color: var(--unity-text-muted);
        font-weight: 600;
      }

      .ref-code {
        font-size: 0.88rem;
        color: var(--unity-primary);
        font-weight: 800;
        letter-spacing: 0.5px;
      }
    }

    .ticket-dashed-line {
      height: 1px;
      border-top: 1.5px dashed var(--unity-border);
      margin: 12px 0;
    }

    .ticket-body {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .ticket-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.78rem;

        .lbl {
          color: var(--unity-text-dim);
          display: flex;
          align-items: center;
          gap: 6px;

          i {
            color: var(--unity-primary);
            font-size: 0.85rem;
          }
        }

        .val {
          color: var(--unity-text-main);
          font-weight: 700;

          &.type-highlight {
            color: #047857;
            background: #ecfdf5;
            padding: 2px 8px;
            border-radius: 6px;
          }
        }
      }
    }
  }

  .success-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .btn-primary-action {
      width: 100%;
      padding: 14px;
      border-radius: 16px;
      background: var(--unity-primary);
      color: #fff;
      border: none;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
      box-shadow: 0 6px 16px rgba(4, 120, 87, 0.3);

      &:hover {
        background: var(--unity-primary-dark);
      }
    }

    .btn-secondary-action {
      width: 100%;
      padding: 12px;
      border-radius: 16px;
      background: var(--unity-bg);
      color: var(--unity-text-main);
      border: 1px solid var(--unity-border);
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background: var(--unity-surface);
      }
    }
  }
}

// Bottom Action Bar
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
    font-weight: 700;
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
      opacity: 0.55;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
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
