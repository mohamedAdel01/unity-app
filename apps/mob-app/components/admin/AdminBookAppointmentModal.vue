<template>
  <div v-if="isOpen" class="admin-booking-modal-backdrop" @click="close">
    <div class="admin-booking-modal-sheet" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-left-actions">
          <button 
            v-if="effectivePatient && currentStep > 1" 
            type="button" 
            class="btn-step-back" 
            :title="t('Previous')"
            @click="prevStep"
          >
            <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
          </button>
          <div class="header-title-block">
            <h3>{{ t('Book Patient Appointment') }}</h3>
            <span v-if="effectivePatient" class="step-indicator-text">
              {{ t('Step') }} {{ currentStep }} / 4
            </span>
          </div>
        </div>

        <button type="button" class="btn-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- STEP 0: Search & Select Patient (Shown when no patient is preselected) -->
      <div v-if="!effectivePatient" class="patient-search-step">
        <div class="search-step-header">
          <div class="icon-wrap">
            <i class="pi pi-user-plus"></i>
          </div>
          <h4>{{ t('Search & Select Patient') }}</h4>
          <p>{{ t('Type patient name to find their file') }}</p>
        </div>

        <div class="patient-search-input-wrap">
          <i class="pi pi-search search-lens"></i>
          <input 
            v-model="patientSearchQuery"
            type="text"
            :placeholder="t('Search patient by name, phone or MRN...')"
            @input="onSearchPatientInput"
          />
          <i v-if="searchingPatients" class="pi pi-spin pi-spinner search-spinner"></i>
        </div>

        <!-- Search Results List -->
        <div v-if="patientSearchResults.length > 0" class="patient-search-results">
          <div 
            v-for="p in patientSearchResults" 
            :key="p.id"
            class="patient-search-card"
            @click="selectPatient(p)"
          >
            <div class="p-avatar">
              <img v-if="p.avatar" :src="resolveAvatar(p.avatar)" :alt="p.name" />
              <span v-else>{{ getInitial(p.name) }}</span>
            </div>
            <div class="p-info">
              <h5>{{ p.name }}</h5>
              <small>
                <span v-if="p.mrn">MRN: {{ p.mrn }}</span>
                <span v-if="p.mrn && p.phone"> • </span>
                <span v-if="p.phone" class="ltr-text">{{ p.phone }}</span>
              </small>
            </div>
            <button type="button" class="btn-pick-patient">
              <span>{{ t('Select Patient') }}</span>
              <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
            </button>
          </div>
        </div>
        <div v-else-if="patientSearchQuery.trim() && !searchingPatients" class="patient-search-empty">
          <i class="pi pi-user-times"></i>
          <p>{{ t('No patients found') }}</p>
        </div>
      </div>

      <template v-else>
        <!-- Patient Quick Info Bar -->
        <div class="patient-banner">
          <div class="patient-avatar-mini">
            <img 
              v-if="effectivePatient.avatar" 
              :src="resolveAvatar(effectivePatient.avatar)" 
              :alt="effectivePatient.name" 
              class="avatar-img"
            />
            <div v-else class="avatar-placeholder">
              <span>{{ getInitial(effectivePatient.name) }}</span>
            </div>
          </div>
          <div class="patient-meta">
            <span class="patient-name">{{ effectivePatient.name }}</span>
            <span class="patient-sub">
              <span v-if="effectivePatient.mrn">MRN - {{ effectivePatient.mrn }}</span>
              <span v-if="effectivePatient.mrn && effectivePatient.phone" class="sep">•</span>
              <span v-if="effectivePatient.phone" class="ltr-text">{{ effectivePatient.phone }}</span>
            </span>
          </div>
          <button 
            v-if="!props.patient" 
            type="button" 
            class="btn-change-patient"
            @click="selectedPatient = null"
          >
            <i class="pi pi-pencil"></i>
            <span>{{ t('Change Patient') }}</span>
          </button>
        </div>

      <!-- Step Progress Bar -->
      <div class="steps-progress-bar">
        <div 
          v-for="step in 4" 
          :key="step" 
          class="step-dot-item"
          :class="{ active: currentStep === step, completed: currentStep > step }"
        >
          <div class="step-bubble">
            <i v-if="currentStep > step" class="pi pi-check"></i>
            <span v-else>{{ step }}</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Select Booking Type (Doctor vs Examination) -->
      <div v-if="currentStep === 1" class="step-container step-type">
        <h4 class="step-title">{{ t('Select Booking Type') }}</h4>

        <div class="type-cards-grid">
          <!-- Doctor Consultation Option -->
          <button 
            type="button" 
            class="type-card" 
            :class="{ active: bookingType === 'doctor' }"
            @click="selectType('doctor')"
          >
            <div class="card-icon doctor-icon">
              <i class="pi pi-user-plus"></i>
            </div>
            <div class="card-info">
              <h5>{{ t('Doctor or Clinic') }}</h5>
              <p>{{ t('Book consultation with clinic doctors') }}</p>
            </div>
            <div class="radio-indicator">
              <i :class="bookingType === 'doctor' ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
            </div>
          </button>

          <!-- Medical Examination Option -->
          <button 
            type="button" 
            class="type-card" 
            :class="{ active: bookingType === 'examination' }"
            @click="selectType('examination')"
          >
            <div class="card-icon exam-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 2v7.31L4.35 18.5A2 2 0 0 0 6.07 22h11.86a2 2 0 0 0 1.72-3.5L14 9.31V2"/>
                <path d="M8.5 2h7"/>
                <path d="M7 16h10"/>
              </svg>
            </div>
            <div class="card-info">
              <h5>{{ t('Medical Examination') }}</h5>
              <p>{{ t('Diagnostic scans, lab tests, and checkups') }}</p>
            </div>
            <div class="radio-indicator">
              <i :class="bookingType === 'examination' ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
            </div>
          </button>
        </div>

        <div class="step-footer-actions">
          <button 
            type="button" 
            class="btn-primary-step" 
            :disabled="!bookingType"
            @click="goToStep(2)"
          >
            <span>{{ t('Next') }}</span>
            <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
          </button>
        </div>
      </div>

      <!-- Step 2: Choose Doctor OR Examination -->
      <div v-if="currentStep === 2" class="step-container step-selection">
        <!-- DOCTOR BRANCH -->
        <template v-if="bookingType === 'doctor'">
          <h4 class="step-title">{{ t('Select Doctor') }}</h4>

          <!-- Doctor Search Input -->
          <div class="search-input-shell">
            <i class="pi pi-search"></i>
            <input 
              v-model="doctorSearch" 
              type="text" 
              :placeholder="t('Search doctor by name...')"
              @input="onDoctorSearchInput"
            />
            <button v-if="doctorSearch" type="button" class="btn-clear-search" @click="doctorSearch = ''">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Specialty / Clinic Filter Pills -->
          <div class="clinic-filter-pills">
            <button 
              type="button" 
              class="clinic-pill" 
              :class="{ active: selectedClinicId === '' }"
              @click="setClinicFilter('')"
            >
              {{ t('All Specialties') }}
            </button>
            <button 
              v-for="clinic in clinicsList" 
              :key="clinic.id" 
              type="button" 
              class="clinic-pill" 
              :class="{ active: selectedClinicId === clinic.id }"
              @click="setClinicFilter(clinic.id)"
            >
              {{ clinic.name }}
            </button>
          </div>

          <!-- Doctor Cards List -->
          <div class="selection-items-list">
            <div v-if="loadingItems" class="loading-state">
              <i class="pi pi-spin pi-spinner"></i>
            </div>

            <template v-else-if="filteredDoctors.length > 0">
              <button 
                v-for="doc in filteredDoctors" 
                :key="doc.id" 
                type="button" 
                class="selection-item-card doctor-item"
                :class="{ active: selectedDoctor?.id === doc.id }"
                @click="selectedDoctor = doc"
              >
                <div class="item-avatar">
                  <img 
                    v-if="doc.user?.avatar || doc.avatar" 
                    :src="resolveAvatar(doc.user?.avatar || doc.avatar)" 
                    :alt="doc.user?.name || doc.name"
                  />
                  <div v-else class="avatar-placeholder">
                    <i class="pi pi-user"></i>
                  </div>
                </div>

                <div class="item-details">
                  <div class="item-name-row">
                    <h6>{{ doc.user?.name || doc.name }}</h6>
                  </div>
                  <span class="item-sub">{{ doc.clinic?.name || t('Specialist') }}</span>
                  <div class="item-pricing">
                    <span class="price-value">{{ getDoctorFee(doc) }} {{ t('EGP') }}</span>
                    <span class="duration-tag">
                      <i class="pi pi-clock"></i>
                      <span>{{ doc.examination_duration || 20 }} {{ t('minutes') }}</span>
                    </span>
                  </div>
                </div>

                <div class="item-radio">
                  <i :class="selectedDoctor?.id === doc.id ? 'pi pi-check-circle selected' : 'pi pi-circle'"></i>
                </div>
              </button>
            </template>

            <div v-else class="empty-selection-state">
              <i class="pi pi-user-times"></i>
              <p>{{ t('No doctors match your search') }}</p>
            </div>
          </div>
        </template>

        <!-- EXAMINATION BRANCH -->
        <template v-else-if="bookingType === 'examination'">
          <h4 class="step-title">{{ t('Select Examination') }}</h4>

          <!-- Examination Search Input -->
          <div class="search-input-shell">
            <i class="pi pi-search"></i>
            <input 
              v-model="examSearch" 
              type="text" 
              :placeholder="t('Search examination or test...')"
            />
            <button v-if="examSearch" type="button" class="btn-clear-search" @click="examSearch = ''">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Examination Cards List -->
          <div class="selection-items-list">
            <div v-if="loadingItems" class="loading-state">
              <i class="pi pi-spin pi-spinner"></i>
            </div>

            <template v-else-if="filteredExaminations.length > 0">
              <button 
                v-for="exam in filteredExaminations" 
                :key="exam.id" 
                type="button" 
                class="selection-item-card exam-item"
                :class="{ active: selectedExam?.id === exam.id }"
                @click="selectedExam = exam"
              >
                <div class="exam-icon-cell">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 2v7.31L4.35 18.5A2 2 0 0 0 6.07 22h11.86a2 2 0 0 0 1.72-3.5L14 9.31V2"/>
                    <path d="M8.5 2h7"/>
                    <path d="M7 16h10"/>
                  </svg>
                </div>

                <div class="item-details">
                  <h6>{{ exam.name }}</h6>
                  <p v-if="exam.description" class="exam-desc">{{ exam.description }}</p>
                  <div class="item-pricing">
                    <span class="price-value">{{ exam.price }} {{ t('EGP') }}</span>
                    <span class="duration-tag">
                      <i class="pi pi-clock"></i>
                      <span>{{ exam.duration || 15 }} {{ t('minutes') }}</span>
                    </span>
                  </div>
                </div>

                <div class="item-radio">
                  <i :class="selectedExam?.id === exam.id ? 'pi pi-check-circle selected' : 'pi pi-circle'"></i>
                </div>
              </button>
            </template>

            <div v-else class="empty-selection-state">
              <i class="pi pi-search"></i>
              <p>{{ t('No examinations match your search') }}</p>
            </div>
          </div>
        </template>

        <!-- Navigation Buttons -->
        <div class="step-footer-actions">
          <button type="button" class="btn-step-outline" @click="goToStep(1)">
            {{ t('Previous') }}
          </button>
          <button 
            type="button" 
            class="btn-primary-step" 
            :disabled="(bookingType === 'doctor' && !selectedDoctor) || (bookingType === 'examination' && !selectedExam)"
            @click="goToStep(3)"
          >
            <span>{{ t('Next') }}</span>
            <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
          </button>
        </div>
      </div>

      <!-- Step 3: Date & Time Selection -->
      <div v-if="currentStep === 3" class="step-container step-datetime">
        <h4 class="step-title">{{ t('Select Date & Time') }}</h4>

        <!-- Date Presets -->
        <div class="date-presets-row">
          <button 
            type="button" 
            class="preset-btn" 
            :class="{ active: datePreset === 'today' }"
            @click="setDatePreset('today')"
          >
            <i class="pi pi-calendar"></i>
            <span>{{ t('Today') }}</span>
          </button>

          <button 
            type="button" 
            class="preset-btn" 
            :class="{ active: datePreset === 'tomorrow' }"
            @click="setDatePreset('tomorrow')"
          >
            <span>{{ t('Tomorrow') }}</span>
          </button>

          <button 
            type="button" 
            class="preset-btn custom-date-btn" 
            :class="{ active: datePreset === 'custom' }"
            @click="openDatePicker"
          >
            <i class="pi pi-calendar-plus"></i>
            <span>{{ selectedDate ? formatShortDate(selectedDate) : t('Pick Date') }}</span>
          </button>

          <input 
            ref="nativeDateInputRef"
            type="date" 
            class="hidden-native-date" 
            :min="todayDateString"
            :value="selectedDate"
            @change="onCustomDateSelected(($event.target as HTMLInputElement).value)"
          />
        </div>

        <!-- Formatted Active Date Banner -->
        <div class="active-date-display">
          <i class="pi pi-clock"></i>
          <span>{{ formatHumanDate(selectedDate) }}</span>
        </div>

        <!-- Available Slots Grid -->
        <div class="time-slots-section">
          <label class="section-label">{{ t('Available Time Slots') }}</label>
          <div v-if="slotsLoading" class="loading-state">
            <i class="pi pi-spin pi-spinner"></i>
          </div>
          <div v-else-if="timeSlots.length > 0" class="slots-grid">
            <button 
              v-for="slot in timeSlots" 
              :key="slot.start_time"
              type="button" 
              class="slot-btn"
              :class="{ active: selectedSlot?.start_time === slot.start_time }"
              @click="selectedSlot = slot"
            >
              <i class="pi pi-clock"></i>
              <span>{{ formatSlotTime(slot.start_time) }}</span>
            </button>
          </div>
          <div v-else class="empty-selection-state">
            <i class="pi pi-calendar-times"></i>
            <p>{{ t('No slots available for this date') }}</p>
          </div>
        </div>

        <!-- Booking Notes (Optional) -->
        <div class="form-group notes-group">
          <label>{{ t('Booking Notes (Optional)') }}</label>
          <div class="input-shell textarea-shell">
            <textarea 
              v-model="bookingNotes" 
              rows="2" 
              :placeholder="t('Please provide as much detail as possible to help us assist you quickly...')"
            ></textarea>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="step-footer-actions">
          <button type="button" class="btn-step-outline" @click="goToStep(2)">
            {{ t('Previous') }}
          </button>
          <button 
            type="button" 
            class="btn-primary-step" 
            :disabled="!selectedSlot"
            @click="goToStep(4)"
          >
            <span>{{ t('Next') }}</span>
            <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
          </button>
        </div>
      </div>

      <!-- Step 4: Summary & Pay on Arrival (Only Method Displayed) -->
      <div v-if="currentStep === 4" class="step-container step-summary">
        <h4 class="step-title">{{ t('Payment & Confirmation') }}</h4>

        <!-- Booking Summary Card -->
        <div class="summary-card">
          <div class="summary-row">
            <span class="summary-label">{{ t('Patient') }}:</span>
            <span class="summary-value font-bold">{{ patient.name }}</span>
          </div>

          <div v-if="bookingType === 'doctor'" class="summary-row">
            <span class="summary-label">{{ t('Doctor') }}:</span>
            <span class="summary-value font-bold">{{ selectedDoctor?.user?.name || selectedDoctor?.name }} ({{ selectedDoctor?.clinic?.name }})</span>
          </div>

          <div v-else-if="bookingType === 'examination'" class="summary-row">
            <span class="summary-label">{{ t('Medical Examination') }}:</span>
            <span class="summary-value font-bold">{{ selectedExam?.name }}</span>
          </div>

          <div class="summary-row">
            <span class="summary-label">{{ t('Date & Time') }}:</span>
            <span class="summary-value">
              {{ formatHumanDate(selectedDate) }} - {{ formatSlotTime(selectedSlot?.start_time) }}
            </span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-row total-row">
            <span class="summary-label">{{ t('Consultation Fee') }}:</span>
            <span class="total-amount">{{ totalFee }} {{ t('EGP') }}</span>
          </div>
        </div>

        <!-- Payment Method (Exclusively: Pay on Arrival) -->
        <div class="payment-method-box">
          <label class="section-label">{{ t('Payment Method') }}</label>
          <div class="cash-arrival-card active">
            <div class="method-icon-cell">
              <i class="pi pi-building"></i>
            </div>
            <div class="method-meta">
              <span class="method-title">{{ t('Pay on Arrival') }}</span>
              <p class="method-desc">
                {{ t('Fee will be collected at reception desk upon patient arrival') }}
              </p>
            </div>
            <div class="fixed-check-badge">
              <i class="pi pi-check-circle"></i>
            </div>
          </div>
        </div>

        <!-- Confirmation Actions -->
        <div class="step-footer-actions">
          <button type="button" class="btn-step-outline" @click="goToStep(3)">
            {{ t('Previous') }}
          </button>
          <button 
            type="button" 
            class="btn-primary-step btn-confirm" 
            :disabled="submitting"
            @click="submitBooking"
          >
            <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
            <template v-else>
              <i class="pi pi-check"></i>
              <span>{{ t('Confirm & Complete Booking') }}</span>
            </template>
          </button>
        </div>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';

const props = defineProps<{
  isOpen: boolean;
  patient?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'booked', result: any): void;
}>();

const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const currentStep = ref(1);
const bookingType = ref<'doctor' | 'examination' | null>(null);

// Patient Search State (for Receptionist / Direct booking)
const selectedPatient = ref<any>(null);
const patientSearchQuery = ref('');
const patientSearchResults = ref<any[]>([]);
const searchingPatients = ref(false);
let patientSearchDebounce: any = null;

// Doctors & Clinics State
const doctorsList = ref<any[]>([]);
const clinicsList = ref<any[]>([]);
const selectedClinicId = ref('');
const doctorSearch = ref('');
const selectedDoctor = ref<any>(null);

// Examinations State
const examinationsList = ref<any[]>([]);
const examSearch = ref('');
const selectedExam = ref<any>(null);

// Loading states
const loadingItems = ref(false);
const slotsLoading = ref(false);
const submitting = ref(false);

// Date & Time State
const datePreset = ref<'today' | 'tomorrow' | 'custom'>('today');
const selectedDate = ref('');
const nativeDateInputRef = ref<HTMLInputElement | null>(null);
const timeSlots = ref<any[]>([]);
const selectedSlot = ref<any>(null);
const bookingNotes = ref('');

// 3. Computed (computed properties)
const effectivePatient = computed(() => props.patient || selectedPatient.value);
const todayDateString = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const filteredDoctors = computed(() => {
  let list = doctorsList.value;
  if (selectedClinicId.value) {
    list = list.filter((d: any) => d.clinic_id === selectedClinicId.value || d.clinic?.id === selectedClinicId.value);
  }
  if (doctorSearch.value.trim()) {
    const q = doctorSearch.value.trim().toLowerCase();
    list = list.filter((d: any) => {
      const name = (d.user?.name || d.name || '').toLowerCase();
      const clinicName = (d.clinic?.name || '').toLowerCase();
      return name.includes(q) || clinicName.includes(q);
    });
  }
  return list;
});

const filteredExaminations = computed(() => {
  let list = examinationsList.value;
  if (examSearch.value.trim()) {
    const q = examSearch.value.trim().toLowerCase();
    list = list.filter((e: any) => {
      const name = (e.name || '').toLowerCase();
      const desc = (e.description || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }
  return list;
});

const totalFee = computed(() => {
  if (bookingType.value === 'doctor' && selectedDoctor.value) {
    return getDoctorFee(selectedDoctor.value);
  }
  if (bookingType.value === 'examination' && selectedExam.value) {
    return Number(selectedExam.value.price || 0);
  }
  return 0;
});

// 4. Methods (functions, handlers)
const getInitial = (name?: string) => {
  if (!name) return 'م';
  return name.trim().charAt(0);
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

const getDoctorFee = (doc: any) => {
  return Number(doc.consultation_fee || doc.fee || 200);
};

const formatShortDate = (isoDate: string) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatHumanDate = (isoDate: string) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatSlotTime = (timeStr?: string) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const period = hours >= 12 ? (isRtl.value ? 'م' : 'PM') : (isRtl.value ? 'ص' : 'AM');
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  }
  return timeStr;
};

const close = () => {
  emit('close');
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const goToStep = (step: number) => {
  currentStep.value = step;
  if (step === 3 && !selectedDate.value) {
    setDatePreset('today');
  }
};

const selectType = (type: 'doctor' | 'examination') => {
  bookingType.value = type;
  if (type === 'doctor') {
    ADMIN_DOCTORS();
    ADMIN_CLINICS();
  } else {
    ADMIN_EXAMINATIONS();
  }
  goToStep(2);
};

const setClinicFilter = (clinicId: string) => {
  selectedClinicId.value = clinicId;
};

const onDoctorSearchInput = () => {
  // Client-side filtering via computed property
};

const openDatePicker = () => {
  if (nativeDateInputRef.value) {
    if (typeof nativeDateInputRef.value.showPicker === 'function') {
      nativeDateInputRef.value.showPicker();
    } else {
      nativeDateInputRef.value.click();
    }
  }
};

const onCustomDateSelected = (dateStr: string) => {
  if (!dateStr) return;
  datePreset.value = 'custom';
  selectedDate.value = dateStr;
  generateSlots();
};

const setDatePreset = (preset: 'today' | 'tomorrow' | 'custom') => {
  datePreset.value = preset;
  const d = new Date();
  if (preset === 'tomorrow') {
    d.setDate(d.getDate() + 1);
  }
  selectedDate.value = d.toISOString().split('T')[0];
  generateSlots();
};

const generateSlots = async () => {
  slotsLoading.value = true;
  selectedSlot.value = null;

  try {
    // If doctor is selected, try calling DOCTOR_SLOTS endpoint
    if (bookingType.value === 'doctor' && selectedDoctor.value) {
      const docId = selectedDoctor.value.user_id || selectedDoctor.value.user?.id || selectedDoctor.value.id;
      const res = await api.apiRequest({
        service: 'DOCTOR_SLOTS',
        filter: { id: docId, date: selectedDate.value },
      });

      if (res?.data?.slots && Array.isArray(res.data.slots) && res.data.slots.length > 0) {
        timeSlots.value = res.data.slots.map((s: any) => ({
          start_time: s.start_time,
          end_time: s.end_time || calculateEndTime(s.start_time, selectedDoctor.value?.examination_duration || 20),
          is_available: s.is_available ?? true,
        }));
        selectedSlot.value = timeSlots.value.find((s: any) => s.is_available) || timeSlots.value[0];
        return;
      }
    }

    // If examination is selected, check its examination_schedule via EXAMINATION_SLOTS endpoint
    if (bookingType.value === 'examination' && selectedExam.value) {
      const res = await api.apiRequest({
        service: 'EXAMINATION_SLOTS',
        filter: { id: selectedExam.value.id, date: selectedDate.value },
      });

      if (res?.data) {
        if (!res.data.is_working_day) {
          timeSlots.value = [];
          selectedSlot.value = null;
          return;
        }

        if (Array.isArray(res.data.slots)) {
          timeSlots.value = res.data.slots;
          selectedSlot.value = timeSlots.value.find((s: any) => s.is_available) || timeSlots.value[0];
          return;
        }
      }
    }

    // Default slot generator for clinics/examinations
    const duration = bookingType.value === 'doctor' 
      ? (selectedDoctor.value?.examination_duration || 20)
      : (selectedExam.value?.duration || 15);

    const generated: any[] = [];
    // Morning shifts (09:00 to 13:00)
    for (let h = 9; h < 13; h++) {
      for (let m = 0; m < 60; m += duration) {
        if (m + duration > 60 && m !== 0) continue;
        const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const end = calculateEndTime(start, duration);
        generated.push({ start_time: start, end_time: end, is_available: true });
      }
    }
    // Evening shifts (16:00 to 21:00)
    for (let h = 16; h < 21; h++) {
      for (let m = 0; m < 60; m += duration) {
        if (m + duration > 60 && m !== 0) continue;
        const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const end = calculateEndTime(start, duration);
        generated.push({ start_time: start, end_time: end, is_available: true });
      }
    }

    timeSlots.value = generated;
    if (generated.length > 0) {
      selectedSlot.value = generated[0];
    }
  } catch (err) {
    timeSlots.value = [
      { start_time: '10:00', end_time: '10:30', is_available: true },
      { start_time: '10:30', end_time: '11:00', is_available: true },
      { start_time: '11:00', end_time: '11:30', is_available: true },
      { start_time: '18:00', end_time: '18:30', is_available: true },
      { start_time: '18:30', end_time: '19:00', is_available: true },
    ];
    selectedSlot.value = timeSlots.value[0];
  } finally {
    slotsLoading.value = false;
  }
};

const calculateEndTime = (start: string, durationMinutes: number) => {
  const [hStr, mStr] = start.split(':');
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10) + durationMinutes;
  while (m >= 60) {
    h += 1;
    m -= 60;
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Data Fetching: ADMIN_DOCTORS
const ADMIN_DOCTORS = async () => {
  try {
    loadingItems.value = true;
    const res = await api.apiRequest({
      service: 'ADMIN_DOCTORS',
      filter: { limit: 50 },
    });
    doctorsList.value = res?.data || [];
  } catch (err) {
    doctorsList.value = [];
  } finally {
    loadingItems.value = false;
  }
};

// Data Fetching: ADMIN_CLINICS
const ADMIN_CLINICS = async () => {
  try {
    const res = await api.apiRequest({
      service: 'ADMIN_CLINICS',
      filter: { limit: 50 },
    });
    clinicsList.value = res?.data || [];
  } catch (err) {
    clinicsList.value = [];
  }
};

// Data Fetching: ADMIN_EXAMINATIONS
const ADMIN_EXAMINATIONS = async () => {
  try {
    loadingItems.value = true;
    const res = await api.apiRequest({
      service: 'ADMIN_EXAMINATIONS',
      filter: { limit: 50 },
    });
    examinationsList.value = res?.data || [];
  } catch (err) {
    examinationsList.value = [];
  } finally {
    loadingItems.value = false;
  }
};

// Patient Search Methods
const selectPatient = (p: any) => {
  selectedPatient.value = p;
  goToStep(1);
};

const onSearchPatientInput = () => {
  clearTimeout(patientSearchDebounce);
  const q = patientSearchQuery.value.trim();
  if (!q) {
    patientSearchResults.value = [];
    return;
  }
  patientSearchDebounce = setTimeout(async () => {
    try {
      searchingPatients.value = true;
      const res = await api.apiRequest({
        service: 'ADMIN_PATIENTS',
        filter: { search: q, limit: 10 },
      });
      patientSearchResults.value = Array.isArray(res?.data) ? res.data : [];
    } catch (e) {
      patientSearchResults.value = [];
    } finally {
      searchingPatients.value = false;
    }
  }, 300);
};

// Submit Booking
const submitBooking = async () => {
  const targetPatientId = effectivePatient.value?.id;
  if (!targetPatientId) {
    toast.show({ title: t('Please select a patient first'), type: 'error' });
    return;
  }
  if (!selectedDate.value || !selectedSlot.value) {
    toast.show({ title: t('Please select a time slot'), type: 'error' });
    return;
  }

  const doctorUserId = bookingType.value === 'doctor'
    ? (selectedDoctor.value?.user_id || selectedDoctor.value?.user?.id || selectedDoctor.value?.id)
    : null;

  const examinationId = bookingType.value === 'examination'
    ? selectedExam.value?.id
    : null;

  const payload: any = {
    patient_id: targetPatientId,
    doctor_id: doctorUserId,
    examination_id: examinationId,
    date: selectedDate.value,
    start_time: selectedSlot.value.start_time,
    end_time: selectedSlot.value.end_time,
    type: 'consultation',
    notes: bookingNotes.value || null,
    status: 'confirmed',
  };

  try {
    submitting.value = true;
    const res = await api.apiRequest({
      service: 'ADMIN_BOOK_APPOINTMENT',
      payload,
    });

    toast.show({
      title: t('Appointment booked successfully!'),
      type: 'success',
    });

    emit('booked', res?.data);
    close();
  } catch (err: any) {
    toast.show({
      title: err?.message || t('Failed to register patient'),
      type: 'error',
    });
  } finally {
    submitting.value = false;
  }
};

// 5. Watches (watch, watchEffect)
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    currentStep.value = 1;
    bookingType.value = null;
    selectedDoctor.value = null;
    selectedExam.value = null;
    selectedClinicId.value = '';
    doctorSearch.value = '';
    examSearch.value = '';
    bookingNotes.value = '';
    if (!props.patient) {
      selectedPatient.value = null;
      patientSearchQuery.value = '';
      patientSearchResults.value = [];
    }
    setDatePreset('today');
  }
});

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  if (props.isOpen) {
    setDatePreset('today');
  }
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-booking-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1050;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 640px) {
    align-items: center;
    padding: 20px;
  }
}

.admin-booking-modal-sheet {
  background: var(--unity-surface);
  width: 100%;
  max-width: 520px;
  max-height: 92vh;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 640px) {
    border-radius: 24px;
    max-height: 85vh;
  }
}

.modal-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--unity-border);

  .header-left-actions {
    display: flex;
    align-items: center;
    gap: 12px;

    .btn-step-back {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--unity-primary-soft);
        color: var(--unity-primary);
      }
    }

    .header-title-block {
      display: flex;
      flex-direction: column;
      gap: 2px;

      h3 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      .step-indicator-text {
        font-size: 0.75rem;
        color: var(--unity-primary);
        font-weight: 700;
      }
    }
  }

  .btn-close {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-dim);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #fee2e2;
      color: #ef4444;
      border-color: #fca5a5;
    }
  }
}

.patient-search-step {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  max-height: 70vh;

  .search-step-header {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    .icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--unity-primary-soft);
      color: var(--unity-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      margin-bottom: 4px;
    }

    h4 {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--unity-text-main);
      margin: 0;
    }

    p {
      font-size: 0.8rem;
      color: var(--unity-text-dim);
      margin: 0;
    }
  }

  .patient-search-input-wrap {
    position: relative;
    width: 100%;

    .search-lens {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--unity-text-dim);
      font-size: 0.95rem;
    }

    input {
      width: 100%;
      height: 44px;
      padding: 0 40px 0 14px;
      border-radius: 14px;
      border: 1px solid var(--unity-border);
      background: var(--unity-bg);
      color: var(--unity-text-main);
      font-size: 0.88rem;
      transition: all 0.2s;

      &:focus {
        border-color: var(--unity-primary);
        outline: none;
        box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
      }
    }

    .search-spinner {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--unity-primary);
    }
  }

  .patient-search-results {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .patient-search-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--unity-primary);
        background: var(--unity-primary-soft);
      }

      .p-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--unity-surface);
        border: 1.5px solid var(--unity-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        font-weight: 700;
        color: var(--unity-primary);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .p-info {
        flex: 1;
        min-width: 0;

        h5 {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--unity-text-main);
          margin: 0 0 2px;
        }

        small {
          font-size: 0.75rem;
          color: var(--unity-text-dim);
        }
      }

      .btn-pick-patient {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: var(--unity-primary);
        color: #ffffff;
        border: none;
        border-radius: 10px;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
      }
    }
  }

  .patient-search-empty {
    text-align: center;
    padding: 30px 10px;
    color: var(--unity-text-dim);

    i {
      font-size: 2rem;
      margin-bottom: 8px;
    }

    p {
      margin: 0;
      font-size: 0.88rem;
    }
  }
}

.patient-banner {
  padding: 10px 20px;
  background: var(--unity-primary-soft);
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(4, 120, 87, 0.12);

  .btn-change-patient {
    margin-right: auto;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    background: var(--unity-surface);
    border: 1px solid var(--unity-primary);
    border-radius: 8px;
    color: var(--unity-primary);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
  }

  .patient-avatar-mini {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--unity-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid var(--unity-primary);

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--unity-primary);
    }
  }

  .patient-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .patient-name {
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    .patient-sub {
      font-size: 0.75rem;
      color: var(--unity-text-muted);
      display: flex;
      align-items: center;
      gap: 6px;

      .sep {
        opacity: 0.4;
      }
    }
  }
}

.steps-progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 20px 8px;

  .step-dot-item {
    display: flex;
    align-items: center;
    position: relative;

    .step-bubble {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--unity-bg);
      border: 1.5px solid var(--unity-border);
      color: var(--unity-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 800;
      transition: all 0.2s;
    }

    &.active .step-bubble {
      background: var(--unity-primary);
      border-color: var(--unity-primary);
      color: #fff;
      box-shadow: 0 2px 8px rgba(4, 120, 87, 0.35);
    }

    &.completed .step-bubble {
      background: #10b981;
      border-color: #10b981;
      color: #fff;
    }
  }
}

.step-container {
  padding: 14px 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;

  .step-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: var(--unity-text-main);
  }
}

/* Step 1: Type Selection */
.type-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .type-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    border-radius: 16px;
    background: var(--unity-surface);
    border: 1.5px solid var(--unity-border);
    cursor: pointer;
    text-align: right;
    transition: all 0.2s;

    &:hover {
      border-color: var(--unity-primary);
      background: var(--unity-primary-soft);
    }

    &.active {
      border-color: var(--unity-primary);
      background: var(--unity-primary-soft);
      box-shadow: 0 4px 14px rgba(4, 120, 87, 0.12);
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;

      &.doctor-icon {
        background: #e0f2fe;
        color: #0284c7;
      }

      &.exam-icon {
        background: #fef2f2;
        color: #ef4444;
      }
    }

    .card-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;

      h5 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      p {
        margin: 0;
        font-size: 0.78rem;
        color: var(--unity-text-muted);
      }
    }

    .radio-indicator {
      font-size: 1.25rem;
      color: var(--unity-primary);
    }
  }
}

/* Step 2: Selection & Filtering */
.search-input-shell {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--unity-bg);
  border: 1.5px solid var(--unity-border);
  border-radius: 14px;
  padding: 0 14px;
  height: 44px;

  i {
    color: var(--unity-text-dim);
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 0.85rem;
    color: var(--unity-text-main);
    font-family: inherit;
  }

  .btn-clear-search {
    background: none;
    border: none;
    color: var(--unity-text-dim);
    cursor: pointer;
  }
}

.clinic-filter-pills {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    display: none;
  }

  .clinic-pill {
    white-space: nowrap;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 700;
    border: 1px solid var(--unity-border);
    background: var(--unity-bg);
    color: var(--unity-text-muted);
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background: var(--unity-primary);
      border-color: var(--unity-primary);
      color: #fff;
    }
  }
}

.selection-items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 2px;

  .selection-item-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    background: var(--unity-bg);
    border: 1.5px solid var(--unity-border);
    cursor: pointer;
    text-align: right;
    transition: all 0.2s;

    &:hover {
      border-color: var(--unity-primary);
    }

    &.active {
      border-color: var(--unity-primary);
      background: var(--unity-primary-soft);
      box-shadow: 0 3px 10px rgba(4, 120, 87, 0.12);
    }

    .item-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      overflow: hidden;
      background: var(--unity-surface);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder {
        color: var(--unity-text-dim);
        font-size: 1.1rem;
      }
    }

    .exam-icon-cell {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #fef2f2;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;

      h6 {
        margin: 0;
        font-size: 0.88rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      .item-sub, .exam-desc {
        font-size: 0.74rem;
        color: var(--unity-text-muted);
        line-height: 1.2;
      }

      .item-pricing {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 2px;

        .price-value {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--unity-primary);
        }

        .duration-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: var(--unity-text-dim);
        }
      }
    }

    .item-radio {
      font-size: 1.2rem;
      color: var(--unity-border);

      .selected {
        color: var(--unity-primary);
      }
    }
  }
}

/* Step 3: Datetime */
.date-presets-row {
  display: flex;
  gap: 8px;

  .preset-btn {
    flex: 1;
    height: 40px;
    border-radius: 12px;
    border: 1px solid var(--unity-border);
    background: var(--unity-bg);
    color: var(--unity-text-muted);
    font-size: 0.8rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background: var(--unity-primary);
      border-color: var(--unity-primary);
      color: #fff;
    }
  }

  .hidden-native-date {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: 0;
    height: 0;
  }
}

.active-date-display {
  padding: 8px 12px;
  background: var(--unity-primary-soft);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--unity-primary);
}

.time-slots-section {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .section-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--unity-text-main);
  }

  .slots-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    max-height: 180px;
    overflow-y: auto;
    padding-right: 2px;

    .slot-btn {
      height: 38px;
      border-radius: 10px;
      border: 1px solid var(--unity-border);
      background: var(--unity-bg);
      color: var(--unity-text-main);
      font-size: 0.78rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      cursor: pointer;
      transition: all 0.2s;

      i {
        font-size: 0.75rem;
        color: var(--unity-text-dim);
      }

      &:hover {
        border-color: var(--unity-primary);
      }

      &.active {
        background: var(--unity-primary);
        border-color: var(--unity-primary);
        color: #fff;

        i {
          color: #fff;
        }
      }
    }
  }
}

.notes-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--unity-text-main);
  }

  .textarea-shell {
    background: var(--unity-bg);
    border: 1.5px solid var(--unity-border);
    border-radius: 12px;
    padding: 8px 12px;

    textarea {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-family: inherit;
      font-size: 0.82rem;
      color: var(--unity-text-main);
      resize: none;
    }
  }
}

/* Step 4: Summary & Payment on Arrival */
.summary-card {
  background: var(--unity-bg);
  border: 1px solid var(--unity-border);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.82rem;

    .summary-label {
      color: var(--unity-text-muted);
    }

    .summary-value {
      color: var(--unity-text-main);
    }

    &.total-row {
      font-size: 0.95rem;
      font-weight: 800;

      .total-amount {
        color: var(--unity-primary);
        font-size: 1.1rem;
      }
    }
  }

  .summary-divider {
    height: 1px;
    background: var(--unity-border);
    margin: 4px 0;
  }
}

.payment-method-box {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .section-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--unity-text-main);
  }

  .cash-arrival-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 16px;
    background: var(--unity-surface);
    border: 1.5px solid var(--unity-primary);
    box-shadow: 0 4px 14px rgba(4, 120, 87, 0.1);

    .method-icon-cell {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--unity-primary-soft);
      color: var(--unity-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
    }

    .method-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;

      .method-title {
        font-size: 0.9rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      .method-desc {
        margin: 0;
        font-size: 0.74rem;
        color: var(--unity-text-muted);
        line-height: 1.25;
      }
    }

    .fixed-check-badge {
      font-size: 1.35rem;
      color: var(--unity-primary);
    }
  }
}

/* Common Step Footer Buttons */
.step-footer-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 8px;

  button {
    height: 46px;
    border-radius: 14px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .btn-step-outline {
    flex: 1;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-muted);

    &:hover {
      background: var(--unity-border);
      color: var(--unity-text-main);
    }
  }

  .btn-primary-step {
    flex: 2;
    background: var(--unity-primary);
    color: #fff;
    border: none;
    box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);

    &:hover:not(:disabled) {
      background: var(--unity-primary-dark);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.btn-confirm {
      flex: 2;
      background: #059669;
    }
  }
}

.loading-state, .empty-selection-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 8px;
  color: var(--unity-text-dim);

  i {
    font-size: 1.5rem;
  }

  p {
    margin: 0;
    font-size: 0.8rem;
    color: var(--unity-text-muted);
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

