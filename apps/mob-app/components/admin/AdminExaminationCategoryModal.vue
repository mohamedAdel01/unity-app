<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="emit('close')">
    <div class="modal-sheet" @click.stop>
      <div class="modal-head">
        <div class="title-with-icon">
          <i class="pi pi-folder-open head-icon"></i>
          <h4>{{ isEdit ? t('Edit Examination Category') : t('New Examination Category') }}</h4>
        </div>
        <button class="btn-close" :aria-label="t('Close')" @click="emit('close')">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="saveCategory">
        <!-- Category Name (Arabic) -->
        <div class="form-group">
          <label class="field-label">{{ t('Category Name (Arabic)') }} <span class="required">*</span></label>
          <input 
            v-model="form.name_ar" 
            type="text" 
            class="input-field" 
            :placeholder="t('e.g. Blood Tests & Labs')"
            dir="rtl"
            required 
            autofocus
          />
        </div>

        <!-- Category Name (English) -->
        <div class="form-group">
          <label class="field-label">{{ t('Category Name (English)') }} <span class="required">*</span></label>
          <input 
            v-model="form.name_en" 
            type="text" 
            class="input-field" 
            placeholder="e.g. Blood Tests & Labs"
            dir="ltr"
            required
          />
        </div>

        <div class="two-col-grid">
          <!-- Icon Picker -->
          <div class="form-group">
            <label class="field-label">{{ t('Icon') }}</label>
            <div class="icon-selector-shell">
              <i :class="form.icon"></i>
              <select v-model="form.icon" class="input-select">
                <option value="pi pi-folder">{{ t('Folder') }}</option>
                <option value="pi pi-heart">{{ t('Cardiology') }}</option>
                <option value="pi pi-eye">{{ t('Ophthalmology') }}</option>
                <option value="pi pi-filter">{{ t('Laboratory') }}</option>
                <option value="pi pi-shield">{{ t('Radiology') }}</option>
                <option value="pi pi-check-circle">{{ t('General Checkup') }}</option>
                <option value="pi pi-compass">{{ t('Specialized') }}</option>
              </select>
            </div>
          </div>

          <!-- Sort Order -->
          <div class="form-group">
            <label class="field-label">{{ t('Display Order') }}</label>
            <input 
              v-model="form.sort_order" 
              type="number" 
              min="0" 
              step="1" 
              class="input-field" 
              placeholder="0"
            />
          </div>
        </div>

        <!-- Description (Optional) -->
        <div class="form-group">
          <label class="field-label">{{ t('Description (Arabic)') }}</label>
          <textarea 
            v-model="form.description_ar" 
            rows="2" 
            class="input-field textarea" 
            :placeholder="t('Optional category description...')"
            dir="rtl"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="emit('close')">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="btn-submit" :disabled="!isFormValid || submitting">
            <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ isEdit ? t('Save Changes') : t('Create Category') }}</span>
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
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import { useModalState } from '../../composables/useModalState';

interface Category {
  id?: string | number;
  name?: string;
  name_ar?: string;
  name_en?: string;
  icon?: string;
  sort_order?: number;
  description_ar?: string;
  description_en?: string;
  is_active?: boolean;
}

const props = defineProps<{
  isOpen: boolean;
  category?: Category | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', category: any): void;
}>();

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();
const { registerModalOpen, registerModalClose } = useModalState();

// 2. Data (refs, reactive state)
const submitting = ref(false);

const form = ref<{
  name_ar: string;
  name_en: string;
  icon: string;
  sort_order: number | string;
  description_ar: string;
  description_en: string;
}>({
  name_ar: '',
  name_en: '',
  icon: 'pi pi-folder',
  sort_order: 0,
  description_ar: '',
  description_en: '',
});

// 3. Computed (computed properties)
const isEdit = computed(() => !!props.category?.id);

const isFormValid = computed(() => {
  return (
    form.value.name_ar.trim().length >= 2 ||
    form.value.name_en.trim().length >= 2
  );
});

// 4. Methods (functions, handlers)
const saveCategory = async () => {
  if (!isFormValid.value || submitting.value) return;
  submitting.value = true;
  try {
    const payload = {
      name_ar: form.value.name_ar.trim(),
      name_en: form.value.name_en.trim(),
      name: form.value.name_ar.trim() || form.value.name_en.trim(),
      icon: form.value.icon || 'pi pi-folder',
      sort_order: Number(form.value.sort_order) || 0,
      description_ar: form.value.description_ar.trim() || null,
      description_en: form.value.description_en.trim() || null,
    };

    if (isEdit.value && props.category?.id) {
      const res = await api.apiRequest({
        service: 'ADMIN_UPDATE_EXAMINATION_CATEGORY',
        payload: {
          id: props.category.id,
          ...payload,
        },
      });
      emit('saved', res?.data || payload);
      emit('close');
      toast.show({ title: t('Category updated successfully!'), type: 'success' });
    } else {
      const res = await api.apiRequest({
        service: 'ADMIN_CREATE_EXAMINATION_CATEGORY',
        payload,
      });
      emit('saved', res?.data || payload);
      emit('close');
      toast.show({ title: t('Category created successfully!'), type: 'success' });
    }
  } catch (err: any) {
    toast.show({
      title: err.message || t('Failed to save category'),
      type: 'error',
    });
  } finally {
    submitting.value = false;
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.category,
  (val) => {
    if (val) {
      form.value = {
        name_ar: val.name_ar || val.name || '',
        name_en: val.name_en || val.name || '',
        icon: val.icon || 'pi pi-folder',
        sort_order: val.sort_order || 0,
        description_ar: val.description_ar || '',
        description_en: val.description_en || '',
      };
    } else {
      form.value = {
        name_ar: '',
        name_en: '',
        icon: 'pi pi-folder',
        sort_order: 0,
        description_ar: '',
        description_en: '',
      };
    }
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      registerModalOpen();
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
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 640px) {
    align-items: center;
    padding: 20px;
  }
}

.modal-sheet {
  width: 100%;
  max-width: 440px;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 22px 20px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;
  overflow: hidden;

  @media (min-width: 640px) {
    border-radius: 28px;
  }

  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 10px;

      .head-icon {
        font-size: 1.2rem;
        color: var(--unity-primary);
        background: var(--unity-primary-light);
        padding: 8px;
        border-radius: 12px;
      }

      h4 {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--unity-text-main);
        margin: 0;
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

  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: right;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .field-label {
      font-size: 0.80rem;
      font-weight: 700;
      color: var(--unity-text-main);

      .required {
        color: #ef4444;
      }
    }

    .input-field {
      width: 100%;
      height: 44px;
      background: var(--unity-bg);
      border: 1.5px solid var(--unity-border);
      border-radius: 12px;
      padding: 0 14px;
      font-size: 0.86rem;
      color: var(--unity-text-main);
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;

      &:focus {
        border-color: var(--unity-primary);
      }

      &.textarea {
        height: auto;
        padding: 8px 12px;
        resize: none;
      }
    }

    .icon-selector-shell {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--unity-bg);
      border: 1.5px solid var(--unity-border);
      border-radius: 12px;
      padding: 0 12px;
      height: 44px;

      i {
        font-size: 1.05rem;
        color: var(--unity-primary);
        margin-left: 8px;
      }

      .input-select {
        flex: 1;
        height: 100%;
        background: transparent;
        border: none;
        outline: none;
        font-size: 0.86rem;
        color: var(--unity-text-main);
        font-family: inherit;
        cursor: pointer;
      }
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 14px;
      padding-bottom: max(10px, env(safe-area-inset-bottom, 10px));

      button {
        flex: 1;
        height: 46px;
        border-radius: 14px;
        font-weight: 700;
        font-size: 0.90rem;
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
        color: var(--unity-text-muted);

        &:hover {
          background: var(--unity-border);
          color: var(--unity-text-main);
        }
      }

      .btn-submit {
        background: var(--unity-primary);
        border: none;
        color: #ffffff;

        &:hover:not(:disabled) {
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
</style>
