<template>
  <section class="web-hero-section">
    <div class="hero-container">
      <!-- Accreditation Pill -->
      <div class="hero-badge">
        <i class="pi pi-verified"></i>
        <span>{{ t('Unity Specialized Clinics • Officially Certified') }}</span>
      </div>

      <!-- Main Headline -->
      <h1 class="hero-title">
        {{ t('World-Class Specialized Healthcare') }}
      </h1>

      <!-- Short Punchy Subtitle -->
      <p class="hero-subtitle">
        {{ t('Top certified medical consultants, advanced diagnostic technology, and immediate confirmed appointments.') }}
      </p>

      <!-- Quick Interactive Booking Bar -->
      <div class="quick-booking-bar">
        <div class="field-item">
          <label><i class="pi pi-building"></i> {{ t('Specialized Clinic') }}</label>
          <select v-model="selectedClinicId" class="booking-select" @change="onClinicChange">
            <option value="">{{ t('All Clinics') }}</option>
            <option v-for="c in clinics" :key="c.id" :value="c.id">
              {{ getLocalizedName(c) }}
            </option>
          </select>
        </div>

        <div class="field-item">
          <label><i class="pi pi-user-plus"></i> {{ t('Doctor or Examination') }}</label>
          <select v-model="selectedDoctorId" class="booking-select">
            <option value="">{{ t('Select Specialist...') }}</option>
            <option v-for="doc in availableDoctors" :key="doc.id" :value="doc.id">
              {{ doc.name }} ({{ doc.consultation_fee ? `${doc.consultation_fee} ${t('EGP')}` : '' }})
            </option>
          </select>
        </div>

        <div class="field-btn">
          <button type="button" class="hero-book-btn" @click="handleHeroBook">
            <i class="pi pi-calendar-plus"></i>
            <span>{{ t('Book Appointment') }}</span>
          </button>
        </div>
      </div>

      <!-- Trust Credibility Micro-Pills -->
      <div class="hero-trust-row">
        <div class="trust-item">
          <i class="pi pi-check-circle"></i>
          <span>{{ t('Instant Confirmed Booking') }}</span>
        </div>
        <div class="trust-divider" />
        <div class="trust-item">
          <i class="pi pi-shield"></i>
          <span>{{ t('Certified Senior Consultants') }}</span>
        </div>
        <div class="trust-divider" />
        <div class="trust-item">
          <i class="pi pi-file"></i>
          <span>{{ t('Encrypted Digital Health Records') }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useI18n, resolveI18nText } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';
import { useUnityApi } from '../../composables/useUnityApi';

const { t } = useI18n();
const bookingModal = useBookingModal();
const api = useUnityApi();

// 2. Data (refs, reactive state)
const clinics = ref<any[]>([]);
const doctors = ref<any[]>([]);
const selectedClinicId = ref<string>('');
const selectedDoctorId = ref<string>('');

// 3. Computed (computed properties)
const availableDoctors = computed(() => {
  if (!selectedClinicId.value) return doctors.value;
  return doctors.value.filter(d => String(d.clinic_id) === String(selectedClinicId.value));
});

const getLocalizedName = (item: any) => {
  if (!item) return '';
  return resolveI18nText(item);
};

// 4. Methods (functions, handlers)
const CLINICS = async () => {
  try {
    const res = await api.apiRequest({ service: 'CLINICS' });
    if (res?.data) {
      clinics.value = Array.isArray(res.data) ? res.data : (res.data.clinics || []);
    }
  } catch (_) {}
};

const DOCTORS = async () => {
  try {
    const res = await api.apiRequest({ service: 'DOCTORS', filter: { limit: 50 } });
    if (res?.data) {
      doctors.value = Array.isArray(res.data) ? res.data : (res.data.doctors || []);
    }
  } catch (_) {}
};

const onClinicChange = () => {
  selectedDoctorId.value = '';
};

const handleHeroBook = () => {
  let doc = null;
  if (selectedDoctorId.value) {
    doc = doctors.value.find(d => String(d.id) === String(selectedDoctorId.value));
  } else if (availableDoctors.value.length > 0) {
    doc = availableDoctors.value[0];
  }
  bookingModal.openBookingFlow({
    doctor: doc || undefined,
  });
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  CLINICS();
  DOCTORS();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.web-hero-section {
  position: relative;
  padding: 56px 20px 48px;
  background: radial-gradient(circle at 50% 20%, rgba(4, 120, 87, 0.08) 0%, rgba(0, 0, 0, 0) 70%),
              linear-gradient(180deg, var(--unity-surface) 0%, var(--unity-bg) 100%);
  display: flex;
  justify-content: center;
  text-align: center;
  border-bottom: 1px solid var(--unity-border);
}

.hero-container {
  max-width: 980px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(4, 120, 87, 0.1);
  border: 1px solid rgba(4, 120, 87, 0.25);
  color: var(--unity-primary);
  font-size: 0.82rem;
  font-weight: 700;
}

.hero-title {
  font-size: 2.35rem;
  font-weight: 800;
  color: var(--unity-text-main);
  line-height: 1.25;
  margin: 0;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
}

.hero-subtitle {
  font-size: 1.05rem;
  color: var(--unity-text-muted);
  line-height: 1.6;
  margin: 0;
  max-width: 700px;

  @media (max-width: 768px) {
    font-size: 0.92rem;
  }
}

// Quick Interactive Booking Bar
.quick-booking-bar {
  width: 100%;
  max-width: 860px;
  margin-top: 14px;
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 18px;
  padding: 12px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: end;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    padding: 14px;
    gap: 10px;
  }

  .field-item {
    display: flex;
    flex-direction: column;
    text-align: start;
    gap: 4px;

    label {
      font-size: 0.80rem;
      font-weight: 700;
      color: var(--unity-text-main);
      display: flex;
      align-items: center;
      gap: 6px;

      i {
        color: var(--unity-primary);
        font-size: 0.84rem;
      }
    }

    .booking-select {
      height: 44px;
      padding: 0 12px;
      border-radius: 12px;
      border: 1.5px solid var(--unity-border);
      background: var(--unity-bg);
      color: var(--unity-text-main);
      font-size: 0.86rem;
      font-weight: 600;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;

      &:focus {
        border-color: var(--unity-primary);
        background: var(--unity-surface);
        box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
      }
    }
  }

  .field-btn {
    .hero-book-btn {
      height: 44px;
      padding: 0 24px;
      border-radius: 12px;
      background: var(--unity-primary);
      color: #fff;
      font-size: 0.90rem;
      font-weight: 700;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        background: var(--unity-primary-dark, #065f46);
        transform: translateY(-1px);
      }

      @media (max-width: 720px) {
        width: 100%;
      }
    }
  }
}

// Trust Row
.hero-trust-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 8px;

  .trust-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--unity-text-muted);

    i {
      color: var(--unity-primary);
      font-size: 0.9rem;
    }
  }

  .trust-divider {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--unity-border);

    @media (max-width: 600px) {
      display: none;
    }
  }
}
</style>