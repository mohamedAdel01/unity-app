<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="emit('close')">
      <div class="modal-sheet" @click.stop>
        <div class="modal-head">
          <h4>{{ props.clinic?.id ? t('Edit Clinic') : t('New Clinic') }}</h4>
          <button class="btn-close" :aria-label="t('Close')" @click="emit('close')">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="field-label">{{ t('Clinic Name (Arabic)') }} <span class="required">*</span></label>
            <input v-model="form.name_ar" type="text" class="input-field" :placeholder="t('e.g. Cardiology Clinic')"
              dir="rtl" autofocus @keyup.enter="saveClinic" />
          </div>

          <div class="form-group">
            <label class="field-label">{{ t('Clinic Name (English)') }} <span class="required">*</span></label>
            <input v-model="form.name_en" type="text" class="input-field" placeholder="e.g. Cardiology Clinic" dir="ltr"
              @keyup.enter="saveClinic" />
          </div>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn-confirm" :disabled="!isFormValid || submitting" @click="saveClinic">
            <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ props.clinic?.id ? t('Save Changes') : t('Add Clinic') }}</span>
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
import { useGlobalStore } from '../../stores/global';

interface Clinic {
  id?: string | number;
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
const globalStore = useGlobalStore();

// 2. Data (refs, reactive state)
const form = ref({
  name_ar: '',
  name_en: '',
});

// 3. Computed (computed properties)
const isFormValid = computed(() => {
  return form.value.name_ar.trim().length > 0 || form.value.name_en.trim().length > 0;
});

const submitting = computed(() =>
  globalStore.loading.includes('ADMIN_CREATE_CLINIC') || globalStore.loading.includes('ADMIN_UPDATE_CLINIC')
);

// 4. Methods (functions, handlers)
const saveClinic = async () => {
  if (!isFormValid.value || submitting.value) return;
  try {
    let service = props.clinic?.id ? 'ADMIN_UPDATE_CLINIC' : 'ADMIN_CREATE_CLINIC';
    let filter = props.clinic?.id ?? null;

    const payload = {
      name_ar: form.value.name_ar.trim(),
      name_en: form.value.name_en.trim() || null,
    };

    const res = await api.apiRequest({
      service,
      payload,
      filter
    });

    if (res?.status || res?.data) {
      const resultData = res?.data || {};
      const item = {
        ...(props.clinic?.id ? props.clinic : { doctors_count: 0, is_active: true }),
        ...resultData,
        name_ar: resultData.name_ar || payload.name_ar,
        name_en: resultData.name_en || payload.name_en,
      };

      emit(props.clinic?.id ? 'updated' : 'created', item);
      emit('close');
      toast.success(props.clinic?.id ? t('Clinic updated successfully!') : t('New clinic added successfully!'));

      if (!props.clinic?.id) {
        form.value = { name_ar: '', name_en: '' };
      }
    }
  } catch (err: any) {
    toast.error(err.message || (props.clinic?.id ? t('Failed to update clinic') : t('Failed to create clinic')));
  }
};

  // 5. Watches (watch, watchEffect)
  watch(
    () => props.clinic,
    (val) => {
      form.value = {
        name_ar: val?.name_ar || '',
        name_en: val?.name_en || '',
      };
    },
    { immediate: true }
  );

  watch(
    () => props.isOpen,
    (open) => {
      if (open) {
        registerModalOpen();
        if (!props.clinic?.id) {
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

  .modal-head {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 14px;
    border-bottom: 1px solid var(--unity-border-light);
    background: var(--unity-surface);

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
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: right;
    -webkit-overflow-scrolling: touch;

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
    flex-shrink: 0;
    padding: 14px 20px max(24px, env(safe-area-inset-bottom, 24px));
    border-top: 1px solid var(--unity-border-light);
    background: var(--unity-surface);
    display: flex;

    .btn-confirm {
      width: 100%;
      flex: 1;
      height: 48px;
      padding: 12px;
      border-radius: 14px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
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

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}
</style>
