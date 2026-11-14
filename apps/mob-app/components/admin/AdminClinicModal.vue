<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="emit('close')">
      <div class="modal-sheet" @click.stop>
        <div class="modal-head">
          <h4>{{ isEdit ? t('Edit Clinic') : t('New Clinic') }}</h4>
          <button class="btn-close" :aria-label="t('Close')" @click="emit('close')">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="field-label">{{ t('Clinic Name (Arabic)') }} <span class="required">*</span></label>
            <input 
              v-model="form.name_ar" 
              type="text" 
              class="input-field" 
              :placeholder="t('e.g. Cardiology Clinic')"
              dir="rtl"
              autofocus
              @keyup.enter="saveClinic"
            />
          </div>

          <div class="form-group">
            <label class="field-label">{{ t('Clinic Name (English)') }} <span class="required">*</span></label>
            <input 
              v-model="form.name_en" 
              type="text" 
              class="input-field" 
              placeholder="e.g. Cardiology Clinic"
              dir="ltr"
              @keyup.enter="saveClinic"
            />
          </div>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn-cancel" @click="emit('close')">{{ t('Cancel') }}</button>
          <button 
            type="button" 
            class="btn-confirm" 
            :disabled="!isFormValid || submitting" 
            @click="saveClinic"
          >
            <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ isEdit ? t('Save Changes') : t('Add Clinic') }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import { useModalState } from '../../composables/useModalState';

interface Clinic {
  id?: string | number;
  name: string;
  name_ar?: string;
  name_en?: string;
  doctors_count?: number;
  is_active?: boolean;
}

const props = defineProps<{
  isOpen: boolean;
  clinic?: Clinic | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', clinic: any): void;
  (e: 'updated', clinic: any): void;
}>();

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();
const { registerModalOpen, registerModalClose } = useModalState();

// 2. Data (refs, reactive state)
const form = ref({
  name_ar: '',
  name_en: '',
});
const submitting = ref(false);

// 3. Computed (computed properties)
const isEdit = computed(() => !!props.clinic?.id);

const isFormValid = computed(() => {
  return form.value.name_ar.trim().length > 0 || form.value.name_en.trim().length > 0;
});

// 4. Methods (functions, handlers)
const parseClinicName = (c: any) => {
  if (!c) return { ar: '', en: '' };
  if (c.name_ar || c.name_en) return { ar: c.name_ar || '', en: c.name_en || '' };
  try {
    const p = JSON.parse(c.name);
    if (p && typeof p === 'object') return { ar: p.ar || '', en: p.en || '' };
  } catch (_) {}
  return { ar: c.name || '', en: c.name || '' };
};

const saveClinic = async () => {
  if (!isFormValid.value || submitting.value) return;
  submitting.value = true;
  try {
    const payload = {
      name_ar: form.value.name_ar.trim(),
      name_en: form.value.name_en.trim(),
      name: form.value.name_ar.trim() || form.value.name_en.trim(),
    };

    if (isEdit.value && props.clinic?.id) {
      const res = await api.apiRequest({
        service: 'ADMIN_UPDATE_CLINIC',
        payload: { id: props.clinic.id, ...payload },
      });
      const updated = {
        ...props.clinic,
        ...payload,
        name: res?.data?.name || payload.name,
        name_ar: res?.data?.name_ar || payload.name_ar,
        name_en: res?.data?.name_en || payload.name_en,
      };
      emit('updated', updated);
      emit('close');
      toast.success(t('Clinic updated successfully!'));
    } else {
      const res = await api.apiRequest({
        service: 'ADMIN_CREATE_CLINIC',
        payload,
      });
      if (res?.status && res?.data) {
        const created = {
          id: res.data.id,
          name: res.data.name,
          name_ar: res.data.name_ar,
          name_en: res.data.name_en,
          doctors_count: 0,
          is_active: true,
        };
        form.value = { name_ar: '', name_en: '' };
        emit('created', created);
        emit('close');
        toast.success(t('New clinic added successfully!'));
      }
    }
  } catch (err: any) {
    toast.error(err.message || (isEdit.value ? t('Failed to update clinic') : t('Failed to create clinic')));
  } finally {
    submitting.value = false;
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.clinic,
  (val) => {
    const loc = parseClinicName(val);
    form.value = {
      name_ar: loc.ar,
      name_en: loc.en,
    };
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      registerModalOpen();
      if (!props.clinic) {
        form.value = { name_ar: '', name_en: '' };
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
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 20px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;

  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h4 {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin: 0;
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

  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: right;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--unity-text-main);

      .required {
        color: #ef4444;
      }
    }

    .input-field {
      width: 100%;
      height: 48px;
      background: var(--unity-bg);
      border: 1.5px solid var(--unity-border);
      border-radius: 14px;
      padding: 0 14px;
      font-size: 0.88rem;
      color: var(--unity-text-main);
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;

      &:focus {
        border-color: var(--unity-primary);
      }
    }
  }

  .modal-foot {
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

    .btn-confirm {
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

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
