<template>
  <div v-if="isOpen" class="modal-backdrop" @click="close">
    <div class="modal-sheet" :dir="isRtl ? 'rtl' : 'ltr'" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-title">
          <i class="pi pi-user-plus"></i>
          <h4>{{ t('Add New Patient') }}</h4>
        </div>
        <button class="btn-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <form class="modal-form" @submit.prevent="handleSubmit">
        <!-- Patient Full Name -->
        <div class="form-group">
          <label>{{ t('Full Name') }}</label>
          <div class="input-shell">
            <i class="pi pi-user"></i>
            <input 
              v-model="form.name" 
              type="text" 
              :placeholder="t('e.g. Ahmed Al-Salama')"
              required 
            />
          </div>
        </div>

        <!-- Phone Number -->
        <div class="form-group">
          <label>{{ t('Phone Number') }}</label>
          <AppPhoneInput 
            v-model="form.phone"
            :required="true"
            @valid="val => isPhoneValid = val"
          />
        </div>

        <!-- National ID (10 digits) -->
        <div class="form-group">
          <label>{{ t('National ID / Iqama') }}</label>
          <div class="input-shell">
            <i class="pi pi-id-card"></i>
            <input 
              v-model="form.national_id" 
              type="text" 
              placeholder="10XXXXXXXX" 
              dir="ltr"
              maxlength="10"
              required
            />
          </div>
        </div>

        <!-- Gender & Clinic Row -->
        <div class="two-col-row">
          <div class="form-group">
            <label>{{ t('Gender') }}</label>
            <select v-model="form.gender">
              <option value="male">{{ t('Male') }}</option>
              <option value="female">{{ t('Female') }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ t('Clinic') }}</label>
            <select v-model="form.clinic">
              <option value="عيادة الباطنية">{{ t('Internal Medicine') }}</option>
              <option value="عيادة الأطفال">{{ t('Pediatrics') }}</option>
              <option value="عيادة العيون">{{ t('Ophthalmology') }}</option>
              <option value="عيادة القلب">{{ t('Cardiology') }}</option>
              <option value="عيادة الجلدية">{{ t('Dermatology') }}</option>
            </select>
          </div>
        </div>

        <!-- Insurance Provider -->
        <div class="form-group">
          <label>{{ t('Insurance Provider') }}</label>
          <select v-model="form.insurance">
            <option value="بوبا ذهبية">{{ t('Bupa Gold') }}</option>
            <option value="التعاونية للتأمين">{{ t('Tawuniya') }}</option>
            <option value="ميدغلف">{{ t('Medgulf') }}</option>
            <option value="تكافل الراجحي">{{ t('Al Rajhi Takaful') }}</option>
            <option value="بوبا فضية">{{ t('Bupa Silver') }}</option>
            <option value="نقدي / غير مؤمن">{{ t('Cash / Uninsured') }}</option>
          </select>
        </div>

        <!-- Initial Diagnosis / Notes -->
        <div class="form-group">
          <label>{{ t('Initial Diagnosis / Notes') }}</label>
          <input 
            v-model="form.diagnosis" 
            type="text" 
            :placeholder="t('e.g. General checkup, blood pressure')"
          />
        </div>

        <!-- Submit Button -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="close">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="btn-submit" :disabled="!isFormValid || loading">
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ t('Save Patient') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import AppPhoneInput from '../common/AppPhoneInput.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', patient: any): void;
}>();

const { t, isRtl } = useI18n();
const loading = ref(false);
const isPhoneValid = ref(false);

const form = ref({
  name: '',
  phone: '',
  national_id: '',
  gender: 'male',
  clinic: 'عيادة الباطنية',
  insurance: 'بوبا ذهبية',
  diagnosis: 'فحص سريري عام ومتابعة دورية',
});

const isFormValid = computed(() => {
  return (
    form.value.name.trim().length >= 3 &&
    isPhoneValid.value &&
    form.value.national_id.trim().length >= 8
  );
});

const close = () => {
  emit('close');
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  try {
    const newPatient = {
      id: `pt-${Date.now()}`,
      name: form.value.name.trim(),
      phone: form.value.phone.trim(),
      national_id: form.value.national_id.trim(),
      gender: form.value.gender,
      clinic: form.value.clinic,
      insurance: form.value.insurance,
      diagnosis: form.value.diagnosis.trim(),
      mrn: String(Math.floor(1000000 + Math.random() * 9000000)),
      last_visit: isRtl.value ? 'اليوم • زيارة أولى' : 'Today • Initial Visit',
      next_appointment: isRtl.value ? 'مجدول للمتابعة' : 'Scheduled for Follow-up',
      avatar: '',
      created_at: new Date().toISOString(),
    };

    emit('created', newPatient);
    close();

    // Reset Form
    form.value = {
      name: '',
      phone: '',
      national_id: '',
      gender: 'male',
      clinic: 'عيادة الباطنية',
      insurance: 'بوبا ذهبية',
      diagnosis: 'فحص سريري عام ومتابعة دورية',
    };
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-sheet {
  width: 100%;
  max-width: 430px;
  max-height: 90vh;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 20px 20px 32px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .modal-header .header-title,
    .form-group label {
      text-align: left;
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--unity-primary-dark);

      i {
        font-size: 1.25rem;
        color: var(--unity-primary);
      }

      h4 {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }
    }

    .btn-close {
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

  .modal-form {
    display: flex;
    flex-direction: column;
    gap: 14px;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
      text-align: right;

      label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      .input-shell {
        position: relative;
        display: flex;
        align-items: center;

        i {
          position: absolute;
          inset-inline-start: 14px;
          color: var(--unity-text-dim);
          font-size: 0.95rem;
          pointer-events: none;
        }

        input {
          width: 100%;
          height: 44px;
          background: var(--unity-bg);
          border: 1.5px solid var(--unity-border);
          border-radius: 14px;
          padding-inline-start: 40px;
          padding-inline-end: 14px;
          font-size: 0.85rem;
          color: var(--unity-text-main);
          transition: all 0.2s;

          &:focus {
            outline: none;
            border-color: var(--unity-primary);
            background: #fff;
          }
        }

        .valid-check {
          position: absolute;
          inset-inline-end: 14px;
          color: #10b981;
          font-size: 0.85rem;
        }

        &.is-invalid input {
          border-color: #ef4444;
        }
      }

      select,
      input[type='text'] {
        width: 100%;
        height: 44px;
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        border-radius: 14px;
        padding: 0 14px;
        font-size: 0.85rem;
        color: var(--unity-text-main);
        transition: all 0.2s;

        &:focus {
          outline: none;
          border-color: var(--unity-primary);
          background: #fff;
        }
      }

      .input-hint.error {
        font-size: 0.7rem;
        color: #ef4444;
        margin-top: 2px;
      }
    }

    .two-col-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 8px;

      button {
        flex: 1;
        padding: 12px;
        border-radius: 14px;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
      }

      .btn-cancel {
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-muted);

        &:hover {
          background: var(--unity-border);
        }
      }

      .btn-submit {
        background: var(--unity-primary);
        color: #fff;
        box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);

        &:hover {
          background: var(--unity-primary-dark);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
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

