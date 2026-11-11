<template>
  <div v-if="isOpen" class="modal-backdrop" @click="close">
    <div class="modal-sheet" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-title">
          <i :class="isEdit ? 'pi pi-user-edit' : 'pi pi-user-plus'"></i>
          <h4>{{ isEdit ? t('Edit Patient') : t('Add New Patient') }}</h4>
        </div>
        <button class="btn-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Modal Body (Name & Phone Only) -->
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

        <!-- Submit Button -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="close">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="btn-submit" :disabled="!isFormValid || loading">
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ isEdit ? t('Save Changes') : t('Save Patient') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';
import AppPhoneInput from '../common/AppPhoneInput.vue';

interface Patient {
  id?: string | number;
  name: string;
  phone: string;
  mrn?: string;
  gender?: string | null;
  status?: string;
}

const props = defineProps<{
  isOpen: boolean;
  patient?: Patient | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', patient: any): void;
  (e: 'updated', patient: any): void;
}>();

const api = useUnityApi();
const { t } = useI18n();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const loading = ref(false);
const isPhoneValid = ref(false);

const form = ref({
  name: '',
  phone: '',
});

// 3. Computed (computed properties)
const isEdit = computed(() => !!props.patient?.id);

const isFormValid = computed(() => {
  return form.value.name.trim().length >= 3 && isPhoneValid.value;
});

// 4. Methods (functions, handlers)
const close = () => {
  form.value.name = '';
  form.value.phone = '';
  emit('close');
};

const handleSubmit = async () => {
  if (!isFormValid.value || loading.value) return;

  loading.value = true;
  try {
    if (isEdit.value && props.patient?.id) {
      await api.apiRequest({
        service: 'ADMIN_UPDATE_PATIENT',
        payload: {
          id: props.patient.id,
          name: form.value.name.trim(),
          phone: form.value.phone.trim(),
        },
      });

      const updatedPatient = {
        ...props.patient,
        name: form.value.name.trim(),
        phone: form.value.phone.trim(),
      };

      emit('updated', updatedPatient);
      toast.success(t('Patient updated successfully!'));
      close();
    } else {
      const res = await api.apiRequest({
        service: 'ADMIN_CREATE_PATIENT',
        payload: {
          name: form.value.name.trim(),
          phone: form.value.phone.trim(),
        },
      });

      const createdPatient = res?.data || {
        id: `pt-${Date.now()}`,
        name: form.value.name.trim(),
        phone: form.value.phone.trim(),
        mrn: String(Math.floor(1000000 + Math.random() * 9000000)),
        status: 'active',
        created_at: new Date().toISOString(),
      };

      emit('created', createdPatient);
      toast.success(t('Patient registered successfully!'));
      close();
    }
  } catch (err: any) {
    toast.error(err?.message || (isEdit.value ? t('Failed to update patient') : t('Failed to register patient')));
  } finally {
    loading.value = false;
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.patient,
  (val) => {
    if (val) {
      form.value = {
        name: val.name || '',
        phone: val.phone || '',
      };
      isPhoneValid.value = true;
    } else {
      form.value = {
        name: '',
        phone: '',
      };
      isPhoneValid.value = false;
    }
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (open) => {
    if (open && !props.patient) {
      form.value = {
        name: '',
        phone: '',
      };
      isPhoneValid.value = false;
    }
  }
);

// 6. Hooks (onMounted, onUnmounted, etc.)

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
  padding: 24px 20px 32px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;

      i {
        font-size: 1.25rem;
        color: var(--unity-primary);
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        padding: 8px;
        border-radius: 12px;
      }

      h4 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }
    }

    .btn-close {
      width: 32px;
      height: 32px;
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
    gap: 16px;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: right;

      label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      .input-shell {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        border-radius: 14px;
        padding: 0 14px;
        height: 48px;
        transition: border-color 0.2s;

        i {
          color: var(--unity-text-dim);
          font-size: 1rem;
        }

        input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 0.88rem;
          color: var(--unity-text-main);
          font-family: inherit;
        }
      }
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 8px;

      button {
        flex: 1;
        height: 46px;
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
