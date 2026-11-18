<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="emit('close')">
    <div class="modal-sheet" @click.stop>
      <div class="modal-head">
        <div class="title-with-icon">
          <i class="pi pi-folder-open head-icon"></i>
          <h4>{{ props.category?.id ? t('Edit Examination Category') : t('New Examination Category') }}</h4>
        </div>
        <button class="btn-close" :aria-label="t('Close')" @click="emit('close')">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="saveCategory">
        <div class="form-body">
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
        </div>

        <div class="modal-actions">
          <button 
            v-if="props.category?.id" 
            type="button" 
            class="btn-delete"
            :title="t('Delete Category')"
            :disabled="submitting || deleting"
            @click="deleteCategory"
          >
            <i v-if="deleting" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-trash"></i>
          </button>
          <button type="button" class="btn-cancel" @click="emit('close')">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="btn-submit" :disabled="!isFormValid || submitting || deleting">
            <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ props.category?.id ? t('Save Changes') : t('Create Category') }}</span>
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
import { useGlobalStore } from '../../stores/global';

interface Category {
  id?: string | number;
  name_ar?: string;
  name_en?: string;
  sort_order?: number;
  is_active?: boolean;
}

const props = defineProps<{
  isOpen: boolean;
  category?: Category | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', category: any): void;
  (e: 'deleted', id: string | number): void;
}>();

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();
const globalStore = useGlobalStore();
const { registerModalOpen, registerModalClose } = useModalState();

// 2. Data (refs, reactive state)
const deleting = ref(false);
const form = ref<{
  name_ar: string;
  name_en: string;
  sort_order: number | string;
}>({
  name_ar: '',
  name_en: '',
  sort_order: 0,
});

// 3. Computed (computed properties)
const submitting = computed(() => {
  return (
    globalStore.loading.includes('ADMIN_CREATE_EXAMINATION_CATEGORY') ||
    globalStore.loading.includes('ADMIN_UPDATE_EXAMINATION_CATEGORY')
  );
});

const isFormValid = computed(() => {
  return (
    form.value.name_ar.trim().length >= 2 ||
    form.value.name_en.trim().length >= 2
  );
});

// 4. Methods (functions, handlers)
const saveCategory = async () => {
  if (!isFormValid.value || submitting.value) return;
  try {
    const payload = {
      name_ar: form.value.name_ar.trim(),
      name_en: form.value.name_en.trim() || null,
      sort_order: Number(form.value.sort_order) || 0,
    };

    const res = await api.apiRequest({
      service: props.category?.id ? 'ADMIN_UPDATE_EXAMINATION_CATEGORY' : 'ADMIN_CREATE_EXAMINATION_CATEGORY',
      payload: props.category?.id ? { id: props.category.id, ...payload } : payload,
    });

    emit('saved', res?.data || { ...(props.category?.id ? props.category : {}), ...payload });
    emit('close');
    toast.show({
      title: props.category?.id ? t('Category updated successfully!') : t('Category created successfully!'),
      type: 'success',
    });
  } catch (err: any) {
    toast.show({
      title: err?.message || (props.category?.id ? t('Failed to update category') : t('Failed to save category')),
      type: 'error',
    });
  }
};

const deleteCategory = async () => {
  if (!props.category?.id || deleting.value) return;
  try {
    deleting.value = true;
    await api.apiRequest({
      service: 'ADMIN_DELETE_EXAMINATION_CATEGORY',
      payload: { id: props.category.id },
    });
    emit('deleted', props.category.id);
    emit('close');
    toast.show({
      title: t('Category deleted successfully!'),
      type: 'success',
    });
  } catch (err: any) {
    toast.show({
      title: err?.message || t('Failed to delete category'),
      type: 'error',
    });
  } finally {
    deleting.value = false;
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.category,
  (val) => {
    if (val) {
      form.value = {
        name_ar: val.name_ar || '',
        name_en: val.name_en || '',
        sort_order: val.sort_order || 0,
      };
    } else {
      form.value = {
        name_ar: '',
        name_en: '',
        sort_order: 0,
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
  max-height: 88vh;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;
  overflow: hidden;

  @media (min-width: 640px) {
    border-radius: 28px;
    padding: 0;
  }

  .modal-head {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 14px;
    border-bottom: 1px solid var(--unity-border-light);
    background: var(--unity-surface);

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
    flex: 1;
    min-height: 0;
    overflow: hidden;
    text-align: right;

    .form-body {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      -webkit-overflow-scrolling: touch;

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

    }

    .modal-actions {
      flex: 0 0 auto;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      gap: 12px;
      padding: 14px 20px max(20px, env(safe-area-inset-bottom, 20px));
      border-top: 1px solid var(--unity-border);
      background: var(--unity-surface);
      margin-top: auto;
      z-index: 10;

      button {
        height: 48px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.90rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
      }

      .btn-delete {
        width: 48px;
        flex: 0 0 48px;
        background: #fee2e2;
        border: 1.5px solid #fecaca;
        color: #ef4444;
        border-radius: 12px;

        &:hover:not(:disabled) {
          background: #fecaca;
        }

        &:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      }

      .btn-cancel {
        flex: 1;
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        color: var(--unity-text-muted);

        &:hover {
          background: var(--unity-border);
          color: var(--unity-text-main);
        }
      }

      .btn-submit {
        flex: 2;
        background: var(--unity-primary);
        border: none;
        color: #ffffff;
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
</style>
