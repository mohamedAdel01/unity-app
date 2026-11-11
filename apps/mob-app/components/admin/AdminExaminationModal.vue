<template>
  <div v-if="isOpen" class="modal-backdrop" @click="emit('close')">
    <div class="modal-sheet" @click.stop>
      <div class="modal-head">
        <h4>{{ isEdit ? t('Edit Examination') : t('Add New Examination') }}</h4>
        <button class="btn-close" :aria-label="t('Close')" @click="emit('close')">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="saveExamination">
        <div class="form-group">
          <label class="field-label">{{ t('Examination Name') }}</label>
          <input 
            v-model="form.name" 
            type="text" 
            class="input-field" 
            :placeholder="t('e.g. Complete Blood Count (CBC)')"
            required 
            autofocus
          />
        </div>

        <div class="two-col-grid">
          <div class="form-group">
            <label class="field-label">{{ t('Price') }} ({{ t('EGP') }})</label>
            <input 
              v-model.number="form.price" 
              type="number" 
              min="0" 
              step="1" 
              class="input-field" 
              placeholder="250"
              required
            />
          </div>
          <div class="form-group">
            <label class="field-label">{{ t('Duration') }}</label>
            <input 
              v-model.number="form.duration" 
              type="number" 
              min="5" 
              max="180" 
              step="5" 
              class="input-field" 
              placeholder="15"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="field-label">{{ t('Description (Optional)') }}</label>
          <textarea 
            v-model="form.description" 
            rows="2" 
            class="input-field textarea" 
            :placeholder="t('e.g. Diagnostic scan including detailed medical report')"
          ></textarea>
        </div>

        <div class="modal-foot">
          <button type="button" class="btn-cancel" @click="emit('close')">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="btn-confirm" :disabled="!isFormValid || submitting">
            <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ isEdit ? t('Save Changes') : t('Add Examination') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';

interface Examination {
  id?: string | number;
  name: string;
  price: number;
  duration?: number;
  description?: string | null;
  is_active?: boolean;
}

const props = defineProps<{
  isOpen: boolean;
  examination?: Examination | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', examination: any): void;
  (e: 'updated', examination: any): void;
}>();

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const form = ref({
  name: '',
  price: 200,
  duration: 15,
  description: '',
});
const submitting = ref(false);

// 3. Computed (computed properties)
const isEdit = computed(() => !!props.examination?.id);

const isFormValid = computed(() => {
  return form.value.name.trim().length >= 2 && form.value.price >= 0;
});

// 4. Methods (functions, handlers)
const saveExamination = async () => {
  if (!isFormValid.value || submitting.value) return;
  submitting.value = true;
  try {
    if (isEdit.value && props.examination?.id) {
      const res = await api.apiRequest({
        service: 'ADMIN_UPDATE_EXAMINATION',
        payload: {
          id: props.examination.id,
          name: form.value.name.trim(),
          price: Number(form.value.price),
          duration: Number(form.value.duration),
          description: form.value.description?.trim() || null,
        },
      });
      const updated = {
        ...props.examination,
        name: form.value.name.trim(),
        price: Number(form.value.price),
        duration: Number(form.value.duration),
        description: form.value.description?.trim() || null,
      };
      emit('updated', updated);
      emit('close');
      toast.success(t('Examination updated successfully!'));
    } else {
      const res = await api.apiRequest({
        service: 'ADMIN_CREATE_EXAMINATION',
        payload: {
          name: form.value.name.trim(),
          price: Number(form.value.price),
          duration: Number(form.value.duration),
          description: form.value.description?.trim() || null,
        },
      });

      if (res?.status && res?.data) {
        const created = {
          id: res.data.id,
          name: res.data.name,
          price: res.data.price,
          duration: res.data.duration,
          description: res.data.description,
          is_active: true,
        };
        form.value = {
          name: '',
          price: 200,
          duration: 15,
          description: '',
        };
        emit('created', created);
        emit('close');
        toast.success(t('New examination added successfully!'));
      }
    }
  } catch (err: any) {
    toast.error(err.message || (isEdit.value ? t('Failed to update examination') : t('Failed to create examination')));
  } finally {
    submitting.value = false;
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.examination,
  (val) => {
    if (val) {
      form.value = {
        name: val.name || '',
        price: Number(val.price) || 0,
        duration: Number(val.duration) || 15,
        description: val.description || '',
      };
    } else {
      form.value = {
        name: '',
        price: 200,
        duration: 15,
        description: '',
      };
    }
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (open) => {
    if (open && !props.examination) {
      form.value = {
        name: '',
        price: 200,
        duration: 15,
        description: '',
      };
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

    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .field-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--unity-text-main);
    }

    .input-field {
      width: 100%;
      height: 46px;
      background: var(--unity-bg);
      border: 1.5px solid var(--unity-border);
      border-radius: 12px;
      padding: 0 14px;
      font-size: 0.85rem;
      color: var(--unity-text-main);
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;

      &:focus {
        border-color: var(--unity-primary);
      }

      &.textarea {
        height: auto;
        padding: 10px 14px;
        resize: none;
      }
    }
  }

  .modal-foot {
    display: flex;
    gap: 10px;
    margin-top: 6px;

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
