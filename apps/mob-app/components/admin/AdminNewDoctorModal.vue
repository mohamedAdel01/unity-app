<template>
  <div v-if="isOpen" class="modal-backdrop" @click="close">
    <div class="modal-sheet" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-title">
          <i class="pi pi-user-plus"></i>
          <h4>{{ t('Add New Doctor') }}</h4>
        </div>
        <button class="btn-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Modal Body (Name, Phone & Clinic Only) -->
      <form class="doctor-form" @submit.prevent="handleSubmit">
        <!-- Doctor Full Name -->
        <div class="form-group">
          <label>{{ t('Doctor Name') }}</label>
          <div class="input-shell">
            <i class="pi pi-user"></i>
            <input 
              v-model="form.name" 
              type="text" 
              :placeholder="t('e.g. Dr. Ahmed Al-Mansoury')" 
              required 
              autofocus
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

        <!-- Clinic -->
        <div class="form-group">
          <label>{{ t('Clinic') }}</label>
          <div class="input-shell">
            <i class="pi pi-building"></i>
            <select v-model="form.clinic_id" required>
              <option value="" disabled>{{ t('Select Clinic...') }}</option>
              <option v-for="clinic in clinics" :key="clinic.id" :value="clinic.id">
                {{ clinic.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="close">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="btn-submit" :disabled="!isFormValid || loading">
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ t('Register Doctor') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AppPhoneInput from '../common/AppPhoneInput.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', doc: any): void;
}>();

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const loading = ref(false);
const isPhoneValid = ref(false);
const clinics = ref<any[]>([]);

const form = ref({
  name: '',
  phone: '',
  clinic_id: '',
});

// 3. Computed (computed properties)
const isFormValid = computed(() => {
  return form.value.name.trim().length >= 3 && isPhoneValid.value && !!form.value.clinic_id;
});

// 4. Methods (functions, handlers)
const close = () => {
  form.value.name = '';
  form.value.phone = '';
  form.value.clinic_id = '';
  emit('close');
};

const loadClinics = async () => {
  try {
    const res = await api.apiRequest({ service: 'ADMIN_CLINICS' });
    if (res?.status && Array.isArray(res?.data)) {
      clinics.value = res.data;
      if (clinics.value.length > 0 && !form.value.clinic_id) {
        form.value.clinic_id = clinics.value[0].id;
      }
    }
  } catch (err) {
    clinics.value = [];
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  try {
    const res = await api.apiRequest({
      service: 'ADMIN_CREATE_DOCTOR',
      payload: {
        name: form.value.name.trim(),
        phone: form.value.phone.trim(),
        clinic_id: form.value.clinic_id,
      },
    });

    const createdDoctor = res?.data || {
      id: `doc-${Date.now()}`,
      name: form.value.name.trim(),
      phone: form.value.phone.trim(),
      clinic: clinics.value.find(c => c.id === form.value.clinic_id) || null,
      specialty: clinics.value.find(c => c.id === form.value.clinic_id)?.name || '',
      status: 'active',
      is_active: true,
    };

    emit('created', createdDoctor);
    toast.success(t('Doctor registered successfully!'), t('Doctors'));
    close();
  } catch (err: any) {
    toast.error(err?.message || t('Failed to register doctor'), t('Doctors'));
  } finally {
    loading.value = false;
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (clinics.value.length === 0) {
        loadClinics();
      }
    }
  }
);

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  loadClinics();
});

// 7. Meta (useHead, useSeoMeta)
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
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 20px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;

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

  .doctor-form {
    display: flex;
    flex-direction: column;
    gap: 14px;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: right;

      label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      .input-shell {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 48px;
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        border-radius: 14px;
        padding: 0 14px;
        transition: border-color 0.2s;

        i {
          font-size: 0.95rem;
          color: var(--unity-text-muted);
        }

        input, select {
          flex: 1;
          height: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-size: 0.85rem;
          color: var(--unity-text-main);
          font-family: inherit;

          &::placeholder {
            color: var(--unity-text-dim);
          }
        }

        &:focus-within {
          border-color: var(--unity-primary);
        }
      }
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 8px;

      button {
        flex: 1;
        padding: 13px;
        border-radius: 14px;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;
      }

      .btn-cancel {
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-muted);

        &:hover {
          background: var(--unity-border);
          color: var(--unity-text-main);
        }
      }

      .btn-submit {
        background: var(--unity-primary);
        color: #fff;
        box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);

        &:hover:not(:disabled) {
          background: var(--unity-primary-dark);
        }

        &:disabled {
          opacity: 0.55;
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
