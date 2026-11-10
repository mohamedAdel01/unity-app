<template>
  <Teleport to="body">
    <Transition name="confirm-pop">
      <div v-if="modelValue" class="confirm-modal-backdrop" @click="handleBackdropClick">
        <div 
          class="confirm-modal-sheet" 
          :class="`type-${type}`" 
          @click.stop
        >
          <!-- Top drag/handle pill -->
          <div class="sheet-pill"></div>

          <!-- Alert / Action Icon Header -->
          <div class="confirm-icon-ring" :class="type">
            <i :class="iconName"></i>
          </div>

          <!-- Title & Description -->
          <div class="confirm-text-block">
            <h4 class="confirm-title">{{ title }}</h4>
            <p v-if="message" class="confirm-message">{{ message }}</p>
          </div>

          <!-- Custom Content Slot (e.g. Appointment Preview Summary) -->
          <div v-if="$slots.default" class="confirm-slot-content">
            <slot />
          </div>

          <!-- Action Buttons -->
          <div class="confirm-actions-row">
            <button 
              type="button" 
              class="btn-confirm-action" 
              :class="type" 
              :disabled="loading" 
              @click="handleConfirm"
            >
              <i v-if="loading" class="pi pi-spin pi-spinner"></i>
              <span v-else>{{ confirmText || defaultConfirmText }}</span>
            </button>

            <button 
              type="button" 
              class="btn-cancel-action" 
              :disabled="loading" 
              @click="handleCancel"
            >
              <span>{{ cancelText || defaultCancelText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: string;
  loading?: boolean;
}>(), {
  type: 'danger',
  loading: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const iconName = computed(() => {
  if (props.icon) return props.icon;
  if (props.type === 'danger') return 'pi pi-exclamation-triangle';
  if (props.type === 'warning') return 'pi pi-exclamation-circle';
  return 'pi pi-info-circle';
});

const defaultConfirmText = computed(() => {
  if (props.type === 'danger') {
    return t('Yes, Confirm Cancel');
  }
  return t('Confirm');
});

const defaultCancelText = computed(() => {
  return t('Cancel');
});

// 4. Methods (functions, handlers)
const handleConfirm = () => {
  if (props.loading) return;
  emit('confirm');
};

const handleCancel = () => {
  if (props.loading) return;
  emit('update:modelValue', false);
  emit('cancel');
};

const handleBackdropClick = () => {
  handleCancel();
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.modelValue) {
    handleCancel();
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown);
  }
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.confirm-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 99999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;

  @media (min-width: 640px) {
    align-items: center;
    padding: 20px;
  }
}

.confirm-modal-sheet {
  width: 100%;
  max-width: 440px;
  background: var(--unity-surface, #ffffff);
  border-radius: 28px 28px 0 0;
  padding: 14px 22px 30px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;

  @media (min-width: 640px) {
    border-radius: 24px;
    padding: 24px 24px 26px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  }

  .sheet-pill {
    width: 38px;
    height: 4px;
    border-radius: 10px;
    background: var(--unity-border, #e2e8f0);
    margin-bottom: 16px;

    @media (min-width: 640px) {
      display: none;
    }
  }

  .confirm-icon-ring {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    margin-bottom: 14px;
    transition: transform 0.2s ease;

    &.danger {
      background: #fef2f2;
      color: #ef4444;
      border: 2px solid #fee2e2;
      box-shadow: 0 6px 18px rgba(239, 68, 68, 0.15);
    }

    &.warning {
      background: #fffbeb;
      color: #f59e0b;
      border: 2px solid #fef3c7;
      box-shadow: 0 6px 18px rgba(245, 158, 11, 0.15);
    }

    &.info {
      background: #f0fdfa;
      color: #0d9488;
      border: 2px solid #ccfbf1;
      box-shadow: 0 6px 18px rgba(13, 148, 136, 0.15);
    }
  }

  .confirm-text-block {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
    width: 100%;

    .confirm-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--unity-text, #0f172a);
      letter-spacing: -0.2px;
    }

    .confirm-message {
      margin: 0;
      font-size: 0.88rem;
      color: var(--unity-text-muted, #64748b);
      line-height: 1.45;
    }
  }

  .confirm-slot-content {
    width: 100%;
    margin-bottom: 18px;
  }

  .confirm-actions-row {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;

    button {
      width: 100%;
      height: 48px;
      border-radius: 14px;
      font-size: 0.94rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-confirm-action {
      &.danger {
        background: #ef4444;
        color: #ffffff;
        box-shadow: 0 6px 18px rgba(239, 68, 68, 0.28);

        &:hover:not(:disabled) {
          background: #dc2626;
          box-shadow: 0 8px 22px rgba(220, 38, 38, 0.35);
        }
      }

      &.warning {
        background: #f59e0b;
        color: #ffffff;
        box-shadow: 0 6px 18px rgba(245, 158, 11, 0.28);

        &:hover:not(:disabled) {
          background: #d97706;
        }
      }

      &.info {
        background: var(--unity-primary, #0d9488);
        color: #ffffff;
        box-shadow: 0 6px 18px rgba(13, 148, 136, 0.28);

        &:hover:not(:disabled) {
          background: var(--unity-primary-dark, #0f766e);
        }
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-cancel-action {
      background: var(--unity-surface-muted, #f1f5f9);
      border: 1px solid var(--unity-border, #e2e8f0);
      color: var(--unity-text, #334155);

      &:hover:not(:disabled) {
        background: #e2e8f0;
      }
    }
  }
}

// Transition Animations
.confirm-pop-enter-active,
.confirm-pop-leave-active {
  transition: opacity 0.22s ease;

  .confirm-modal-sheet {
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
  }
}

.confirm-pop-enter-from,
.confirm-pop-leave-to {
  opacity: 0;

  .confirm-modal-sheet {
    transform: translateY(60px);
    opacity: 0;
  }
}
</style>
