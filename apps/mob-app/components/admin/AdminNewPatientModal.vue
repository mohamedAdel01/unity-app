<template>
  <div v-if="isOpen" class="modal-backdrop" @click="close">
    <div class="modal-sheet" @click.stop>
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
            <span v-else>{{ t('Save Patient') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';
import AppPhoneInput from '../common/AppPhoneInput.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', patient: any): void;
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
  if (!isFormValid.value) return;

  loading.value = true;
  try {
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
    close();
  } catch (err: any) {
    toast.error(err?.message || t('Failed to register patient'), t('Patients'));
  } finally {
    loading.value = false;
  }
};

// 5. Watches (watch, watchEffect)

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

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

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
    gap: 16px;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 0.82rem;
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
          height: 48px;
          background: var(--unity-bg);
          border: 1.5px solid var(--unity-border);
          border-radius: 14px;
          padding-inline-start: 40px;
          padding-inline-end: 14px;
          font-size: 0.88rem;
          color: var(--unity-text-main);
          transition: all 0.2s;

          &:focus {
            outline: none;
            border-color: var(--unity-primary);
            background: #fff;
          }
        }
      }
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;

      button {
        flex: 1;
        height: 48px;
        border-radius: 14px;
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
      }

      .btn-cancel {
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        color: var(--unity-text-main);

        &:hover {
          background: var(--unity-border);
        }
      }

      .btn-submit {
        background: var(--unity-primary);
        color: #fff;
        border: none;
        box-shadow: 0 4px 14px rgba(0, 118, 99, 0.25);

        &:hover:not(:disabled) {
          background: var(--unity-primary-dark);
          transform: translateY(-1px);
        }

        &:disabled {
          opacity: 0.6;
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
