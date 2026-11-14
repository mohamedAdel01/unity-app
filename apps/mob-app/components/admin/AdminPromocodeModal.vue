<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="close">
    <div class="modal-sheet" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-icon">
          <i class="pi pi-percentage"></i>
        </div>
        <div class="header-titles">
          <h4>{{ isEdit ? t('Edit Promocode') : t('Add New Promocode') }}</h4>
          <p>{{ t('Define discount coupons for patient bookings') }}</p>
        </div>
        <button type="button" class="close-btn" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Form Body -->
      <form class="modal-form-body" @submit.prevent="handleSubmit">
        <!-- 1. Code String -->
        <div class="form-group">
          <label class="form-label">
            <span>{{ t('Promocode Code') }}</span>
            <span class="req">*</span>
          </label>
          <input 
            v-model="form.code" 
            type="text" 
            class="form-input code-input" 
            dir="ltr"
            :placeholder="t('e.g. UNITY15')" 
            required 
            @input="form.code = form.code.toUpperCase().replace(/\s+/g, '')"
          />
        </div>

        <!-- 2. Discount Type & Value -->
        <div class="form-row-grid">
          <div class="form-group">
            <label class="form-label">
              <span>{{ t('Discount Type') }}</span>
              <span class="req">*</span>
            </label>
            <div class="select-wrapper">
              <select v-model="form.discount_type" class="form-select">
                <option value="percentage">{{ t('Percentage') }}</option>
                <option value="fixed">{{ t('Fixed Amount') }}</option>
              </select>
              <i class="pi pi-chevron-down select-arrow"></i>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span>{{ t('Discount Value') }}</span>
              <span class="type-hint">({{ form.discount_type === 'percentage' ? '%' : t('EGP') }})</span>
              <span class="req">*</span>
            </label>
            <input 
              v-model.number="form.discount_value" 
              type="number" 
              min="1" 
              :max="form.discount_type === 'percentage' ? 100 : 10000"
              class="form-input" 
              placeholder="15" 
              required 
            />
          </div>
        </div>

        <!-- 3. Constraints (Min Spend & Max Discount) -->
        <div class="form-row-grid">
          <div class="form-group">
            <label class="form-label">
              <span>{{ t('Min Spend') }}</span>
              <span class="currency-tag">({{ t('EGP') }})</span>
              <span class="optional-tag">{{ t('(Optional)') }}</span>
            </label>
            <input 
              v-model.number="form.min_spend" 
              type="number" 
              min="0" 
              class="form-input" 
              placeholder="200" 
            />
          </div>

          <div class="form-group" v-if="form.discount_type === 'percentage'">
            <label class="form-label">
              <span>{{ t('Max Discount') }}</span>
              <span class="currency-tag">({{ t('EGP') }})</span>
              <span class="optional-tag">{{ t('(Optional)') }}</span>
            </label>
            <input 
              v-model.number="form.max_discount" 
              type="number" 
              min="0" 
              class="form-input" 
              placeholder="100" 
            />
          </div>

          <div class="form-group" v-else>
            <label class="form-label">
              <span>{{ t('Usage Limit') }}</span>
              <span class="optional-tag">{{ t('(Optional)') }}</span>
            </label>
            <input 
              v-model.number="form.usage_limit" 
              type="number" 
              min="1" 
              class="form-input" 
              placeholder="100" 
            />
          </div>
        </div>

        <div class="form-group" v-if="form.discount_type === 'percentage'">
          <label class="form-label">
            <span>{{ t('Usage Limit') }}</span>
            <span class="optional-tag">{{ t('(Optional)') }}</span>
          </label>
          <input 
            v-model.number="form.usage_limit" 
            type="number" 
            min="1" 
            class="form-input" 
            placeholder="100" 
          />
        </div>

        <!-- 4. Active Toggle -->
        <label class="toggle-checkbox-row">
          <input v-model="form.is_active" type="checkbox" class="toggle-checkbox" />
          <span class="toggle-text">{{ t('Activate this promocode immediately') }}</span>
        </label>

        <!-- Submit Button -->
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="close">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="btn-submit" :disabled="loading">
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ isEdit ? t('Save Changes') : t('Create Promocode') }}</span>
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

const props = defineProps<{
  isOpen: boolean;
  promocode?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();
const { registerModalOpen, registerModalClose } = useModalState();

// 2. Data (refs, reactive state)
const loading = ref(false);

const form = ref({
  code: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: 10,
  min_spend: null as number | null,
  max_discount: null as number | null,
  usage_limit: null as number | null,
  is_active: true,
});

// 3. Computed (computed properties)
const isEdit = computed(() => Boolean(props.promocode?.id));

// 4. Methods (functions, handlers)
const close = () => {
  emit('close');
};

const handleSubmit = async () => {
  if (!form.value.code.trim()) {
    toast.error(t('Please enter a valid promocode string'));
    return;
  }
  if (!form.value.discount_value || form.value.discount_value <= 0) {
    toast.error(t('Please enter a valid discount value'));
    return;
  }

  try {
    loading.value = true;
    const payload = {
      code: form.value.code.trim().toUpperCase(),
      discount_type: form.value.discount_type,
      discount_value: Number(form.value.discount_value),
      min_spend: form.value.min_spend ? Number(form.value.min_spend) : null,
      max_discount: form.value.max_discount ? Number(form.value.max_discount) : null,
      usage_limit: form.value.usage_limit ? Number(form.value.usage_limit) : null,
      is_active: form.value.is_active,
    };

    if (isEdit.value && props.promocode?.id) {
      await api.apiRequest({
        service: 'ADMIN_UPDATE_PROMOCODE',
        payload: {
          id: props.promocode.id,
          ...payload,
        },
      });
      toast.success(t('Promocode updated successfully!'));
    } else {
      await api.apiRequest({
        service: 'ADMIN_CREATE_PROMOCODE',
        payload,
      });
      toast.success(t('Promocode created successfully!'));
    }

    emit('saved');
    close();
  } catch (err: any) {
    toast.error(err?.message || t('Failed to save promocode'));
  } finally {
    loading.value = false;
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.promocode,
  (val) => {
    if (val) {
      form.value = {
        code: val.code || '',
        discount_type: val.discount_type || 'percentage',
        discount_value: Number(val.discount_value) || 10,
        min_spend: val.min_spend ? Number(val.min_spend) : null,
        max_discount: val.max_discount ? Number(val.max_discount) : null,
        usage_limit: val.usage_limit ? Number(val.usage_limit) : null,
        is_active: val.is_active !== undefined ? val.is_active : true,
      };
    } else {
      form.value = {
        code: '',
        discount_type: 'percentage',
        discount_value: 10,
        min_spend: null,
        max_discount: null,
        usage_limit: null,
        is_active: true,
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-sheet {
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--unity-surface);
  border-radius: 24px 24px 0 0;
  padding: 16px 16px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.18);
  animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .modal-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--unity-border);

    .header-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: rgba(4, 120, 87, 0.1);
      color: var(--unity-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      flex-shrink: 0;
    }

    .header-titles {
      flex: 1;
      min-width: 0;

      h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      p {
        margin: 2px 0 0;
        font-size: 0.72rem;
        color: var(--unity-text-muted);
        line-height: 1.3;
      }
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--unity-surface-muted, #f1f5f9);
        color: var(--unity-text-main);
      }
    }
  }

  .modal-form-body {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .form-label {
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--unity-text-main);
        display: flex;
        align-items: center;
        gap: 5px;

        .req {
          color: #ef4444;
          font-weight: 800;
        }

        .type-hint, .currency-tag {
          font-size: 0.68rem;
          color: var(--unity-primary);
          font-weight: 600;
        }

        .optional-tag {
          font-size: 0.66rem;
          color: var(--unity-text-dim);
          font-weight: 500;
        }
      }

      .form-input {
        width: 100%;
        height: 44px;
        background: var(--unity-surface);
        border: 1.5px solid var(--unity-border);
        border-radius: 12px;
        padding: 0 12px;
        font-size: 0.86rem;
        color: var(--unity-text-main);
        font-family: inherit;
        outline: none;
        transition: all 0.2s ease;
        box-sizing: border-box;

        &:focus {
          border-color: var(--unity-primary);
          background: var(--unity-surface);
          box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
        }

        &::placeholder {
          color: var(--unity-text-dim);
          font-size: 0.82rem;
        }

        &.code-input {
          font-family: monospace;
          font-weight: 800;
          font-size: 0.95rem;
          letter-spacing: 1px;
          color: #047857;
          text-transform: uppercase;
        }
      }

      .select-wrapper {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;

        .form-select {
          width: 100%;
          height: 44px;
          background: var(--unity-surface);
          border: 1.5px solid var(--unity-border);
          border-radius: 12px;
          padding: 0 32px 0 12px;
          font-size: 0.86rem;
          color: var(--unity-text-main);
          font-family: inherit;
          outline: none;
          cursor: pointer;
          appearance: none;
          box-sizing: border-box;
          transition: all 0.2s ease;

          &:focus {
            border-color: var(--unity-primary);
            background: var(--unity-surface);
            box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
          }
        }

        .select-arrow {
          position: absolute;
          inset-inline-end: 12px;
          color: var(--unity-text-dim);
          font-size: 0.75rem;
          pointer-events: none;
        }
      }
    }

    .form-row-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .toggle-checkbox-row {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 2px;
      user-select: none;

      .toggle-checkbox {
        width: 16px;
        height: 16px;
        accent-color: var(--unity-primary);
        cursor: pointer;
      }

      .toggle-text {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }
    }

    .modal-footer {
      display: flex;
      gap: 10px;
      margin-top: 4px;

      button {
        flex: 1;
        height: 44px;
        border-radius: 12px;
        font-size: 0.84rem;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;
      }

      .btn-cancel {
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        color: var(--unity-text-muted);

        &:hover {
          background: var(--unity-surface-muted, #f1f5f9);
          color: var(--unity-text-main);
        }
      }

      .btn-submit {
        background: var(--unity-primary);
        color: #fff;
        border: none;
        box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);

        &:hover:not(:disabled) {
          background: var(--unity-primary-dark, #065f46);
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
</style>

