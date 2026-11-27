<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="close">
    <div class="modal-sheet" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-title">
          <i :class="props.patient?.id ? 'pi pi-user-edit' : 'pi pi-user-plus'"></i>
          <h4>{{ props.patient?.id ? t('Edit Patient') : t('Add New Patient') }}</h4>
        </div>
        <button class="btn-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Modal Body (Name & Phone Only) -->
      <form class="modal-form" @submit.prevent="handleSubmit">
        <div class="form-body">
          <!-- Patient Full Name -->
        <div class="form-group">
          <label>{{ t('Full Name') }} <span class="required">*</span></label>
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
          <label>{{ t('Phone Number') }} <span class="required">*</span></label>
          <AppPhoneInput 
            v-model="form.phone"
            :required="true"
            @valid="val => isPhoneValid = val"
          />
        </div>

        <!-- User Role (Admin only - assign to Receptionist or Patient only) -->
        <div v-if="isAdmin" class="form-group">
          <label>{{ t('User Role') }}</label>
          <div class="role-selector-pills">
            <button 
              type="button" 
              class="role-pill" 
              :class="{ active: form.role === 'patient' }"
              @click="form.role = 'patient'"
            >
              <i class="pi pi-user"></i>
              <span>{{ t('Patient') }}</span>
            </button>
            <button 
              type="button" 
              class="role-pill" 
              :class="{ active: form.role === 'receptionist' }"
              @click="form.role = 'receptionist'"
            >
              <i class="pi pi-id-card"></i>
              <span>{{ t('Receptionist') }}</span>
            </button>
          </div>
        </div>

        </div>

        <!-- Submit Button -->
        <div class="modal-actions">
          <button type="submit" class="btn-submit" :disabled="!isFormValid || loading">
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ props.patient?.id ? t('Save Changes') : t('Save Patient') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
  </Teleport>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch, onUnmounted } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';
import { useModalState } from '../../composables/useModalState';
import { useGlobalStore } from '../../stores/global';
import AppPhoneInput from '../common/AppPhoneInput.vue';
import { useAuthStore } from '../../stores/auth';

interface Patient {
  id?: string | number;
  name: string;
  phone: string;
  role?: string;
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
const globalStore = useGlobalStore();
const authStore = useAuthStore();
const { registerModalOpen, registerModalClose } = useModalState();

const isAdmin = computed(() => authStore.isAdmin);

// 2. Data (refs, reactive state)
const isPhoneValid = ref(false);

const form = ref({
  name: '',
  phone: '',
  role: 'patient' as 'patient' | 'receptionist',
});

// 3. Computed (computed properties)
const loading = computed(() => {
  return globalStore.loading.includes('ADMIN_CREATE_PATIENT') || globalStore.loading.includes('ADMIN_UPDATE_PATIENT');
});

const isFormValid = computed(() => {
  return form.value.name.trim().length >= 3 && isPhoneValid.value;
});

// 4. Methods (functions, handlers)
const close = () => {
  form.value.name = '';
  form.value.phone = '';
  form.value.role = 'patient';
  emit('close');
};

const handleSubmit = async () => {
  if (!isFormValid.value || loading.value) return;

  try {
    const payload: any = {
      name: form.value.name.trim(),
      phone: form.value.phone.trim(),
    };
    if (isAdmin.value) {
      payload.role = form.value.role;
    }

    const res = await api.apiRequest({
      service: props.patient?.id ? 'ADMIN_UPDATE_PATIENT' : 'ADMIN_CREATE_PATIENT',
      payload: props.patient?.id ? { id: props.patient.id, ...payload } : payload,
    });

    const resultPatient = res?.data || {
      ...(props.patient?.id ? props.patient : {
        id: `pt-${Date.now()}`,
        status: 'active',
        created_at: new Date().toISOString(),
      }),
      ...payload,
    };

    emit(props.patient?.id ? 'updated' : 'created', resultPatient);
    toast.success(props.patient?.id ? t('Patient updated successfully!') : t('Patient registered successfully!'));
    close();
  } catch (err: any) {
    toast.error(err?.message || (props.patient?.id ? t('Failed to update patient') : t('Failed to register patient')));
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
        role: val.role === 'receptionist' ? 'receptionist' : 'patient',
      };
      isPhoneValid.value = true;
    } else {
      form.value = {
        name: '',
        phone: '',
        role: 'patient',
      };
      isPhoneValid.value = false;
    }
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      registerModalOpen();
      if (!props.patient) {
        form.value = {
          name: '',
          phone: '',
        };
        isPhoneValid.value = false;
      }
    } else {
      registerModalClose();
    }
  },
  { immediate: true }
);

// 6. Hooks (onMounted, onUnmounted, etc.)
onUnmounted(() => {
  if (props.isOpen) {
    registerModalClose();
  }
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
  max-height: 88vh;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;

  .modal-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 14px;
    border-bottom: 1px solid var(--unity-border-light);
    background: var(--unity-surface);
    margin-bottom: 0;

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;

      i {
        font-size: 1.25rem;
        color: var(--unity-primary);
        background: #f2f6ee;
        border: 1px solid #c5d6b8;
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
    flex: 1;
    min-height: 0;
    overflow: hidden;

    .form-body {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      -webkit-overflow-scrolling: touch;

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        text-align: right;

        label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--unity-text-main);

          .required {
            color: #ef4444;
            margin-inline-start: 2px;
          }
        }

        .role-selector-pills {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          width: 100%;

          .role-pill {
            height: 46px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border-radius: 12px;
            border: 1.5px solid var(--unity-border, #e2e8f0);
            background: var(--unity-bg, #f8fafc);
            color: var(--unity-text-muted, #64748b);
            font-size: 0.86rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

            i {
              font-size: 1rem;
            }

            &:hover {
              border-color: #cbd5e1;
              color: var(--unity-text-main, #0f172a);
            }

            &.active {
              background: #f2f6ee;
              border-color: #415b2e;
              color: #415b2e;
              box-shadow: 0 0 0 3px rgba(65, 91, 46, 0.12);
            }
          }
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
    }

    .modal-actions {
      flex-shrink: 0;
      padding: 14px 20px 24px;
      border-top: 1px solid var(--unity-border-light);
      background: var(--unity-surface);
      display: flex;
      gap: 10px;
      margin-top: 0;

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

      .btn-submit {
        width: 100%;
        flex: 1;
        background: var(--unity-primary);
        color: #fff;
        box-shadow: 0 4px 14px rgba(65, 91, 46, 0.25);

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
