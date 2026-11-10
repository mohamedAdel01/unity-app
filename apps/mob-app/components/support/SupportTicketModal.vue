<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-sheet" role="dialog" aria-modal="true">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-title-box">
          <div class="icon-avatar">
            <i class="pi pi-ticket"></i>
          </div>
          <div>
            <h4 class="modal-title">{{ t('Open Support Ticket') }}</h4>
            <p class="modal-subtitle">{{ t('Submit your issue or inquiry directly to our technical team') }}</p>
          </div>
        </div>
        <button type="button" class="close-modal-btn" @click="emit('close')" :aria-label="t('Close')">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Success Screen -->
      <div v-if="isSubmitted" class="modal-success-state">
        <div class="success-icon-shell">
          <i class="pi pi-check-circle"></i>
        </div>
        <h5 class="success-title">{{ t('Ticket Submitted Successfully!') }}</h5>
        <p class="success-desc">
          {{ t('Your ticket has been registered with reference ID:') }}
        </p>
        <div class="ticket-ref-box">
          <span class="ref-code">{{ ticketRef }}</span>
        </div>
        <p class="success-hint">
          {{ t('Our medical care and support agents will review your request and get in touch with you shortly.') }}
        </p>
        <button type="button" class="success-done-btn" @click="emit('close')">
          {{ t('Done') }}
        </button>
      </div>

      <!-- Form Body -->
      <form v-else class="modal-form" @submit.prevent="onSubmit">
        <!-- Patient Name -->
        <div class="form-group">
          <label class="form-label">{{ t('Full Name') }}</label>
          <div class="input-shell">
            <i class="pi pi-user input-icon"></i>
            <input 
              v-model="form.name"
              type="text" 
              required
              :placeholder="t('Enter your full name')"
              autocomplete="off"
            />
          </div>
        </div>

        <!-- Phone Number -->
        <div class="form-group">
          <label class="form-label">{{ t('Phone Number') }}</label>
          <div class="input-shell">
            <i class="pi pi-phone input-icon"></i>
            <input 
              v-model="form.phone"
              type="tel" 
              required
              :placeholder="t('01X XXXX XXXX')"
              autocomplete="off"
            />
          </div>
        </div>

        <!-- Issue Category -->
        <div class="form-group">
          <label class="form-label">{{ t('Inquiry or Issue Type') }}</label>
          <div class="select-shell">
            <select v-model="form.category" required>
              <option value="general">{{ t('General Inquiry') }}</option>
              <option value="booking">{{ t('Appointment or Booking Issue') }}</option>
              <option value="records">{{ t('Medical Records & Lab Reports') }}</option>
              <option value="payment">{{ t('Payments & Billing') }}</option>
              <option value="technical">{{ t('Technical Application Issue') }}</option>
            </select>
            <i class="pi pi-chevron-down select-chevron"></i>
          </div>
        </div>

        <!-- Subject -->
        <div class="form-group">
          <label class="form-label">{{ t('Subject') }}</label>
          <div class="input-shell">
            <i class="pi pi-tag input-icon"></i>
            <input 
              v-model="form.subject"
              type="text" 
              required
              :placeholder="t('Brief summary of the issue')"
              autocomplete="off"
            />
          </div>
        </div>

        <!-- Details -->
        <div class="form-group">
          <label class="form-label">{{ t('Details & Description') }}</label>
          <textarea 
            v-model="form.details"
            rows="3" 
            required
            :placeholder="t('Please provide as much detail as possible to help us assist you quickly...')"
            class="textarea-shell"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="emit('close')">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-send"></i>
            <span>{{ isSubmitting ? t('Submitting...') : t('Send Ticket') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useAuthStore } from '../../stores/auth';
import { useAppToast } from '../../composables/useAppToast';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n();
const authStore = useAuthStore();
const { show: showToast } = useAppToast();

// 2. Data (refs, reactive state)
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const ticketRef = ref('');

const form = reactive({
  name: '',
  phone: '',
  category: 'general',
  subject: '',
  details: '',
});

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const onSubmit = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    // Generate a unique ticket reference
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    ticketRef.value = `TIC-${randomDigits}`;

    // Simulate swift server ticket registration
    await new Promise((resolve) => setTimeout(resolve, 800));

    isSubmitted.value = true;
    showToast({
      type: 'success',
      title: t('Ticket Submitted'),
      message: `${t('Your ticket reference ID is:')} ${ticketRef.value}`,
    });
  } catch {
    showToast({
      type: 'error',
      title: t('Error'),
      message: t('Failed to submit support ticket. Please try again or contact via WhatsApp.'),
    });
  } finally {
    isSubmitting.value = false;
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  if (authStore.user) {
    form.name = authStore.user.name || '';
    form.phone = authStore.user.phone || '';
  }
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 640px) {
    align-items: center;
    padding: 20px;
  }
}

.modal-sheet {
  background: var(--unity-surface, #ffffff);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  border-radius: 24px 24px 0 0;
  padding: 20px 20px 28px;
  overflow-y: auto;
  box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.15);

  @media (min-width: 640px) {
    border-radius: 24px;
    padding: 24px;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--unity-border, #e2e8f0);

  .header-title-box {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-avatar {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .modal-title {
      font-size: 1rem;
      font-weight: 800;
      color: var(--unity-text-main, #0f172a);
      margin: 0;
    }

    .modal-subtitle {
      font-size: 0.74rem;
      color: var(--unity-text-secondary, #64748b);
      margin: 2px 0 0;
    }
  }

  .close-modal-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--unity-surface-muted, #f8fafc);
    border: 1px solid var(--unity-border, #e2e8f0);
    color: var(--unity-text-secondary, #64748b);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.15s ease;

    &:active {
      transform: scale(0.92);
    }
  }
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;

    .form-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--unity-text-main, #334155);
    }

    .input-shell {
      position: relative;
      display: flex;
      align-items: center;

      .input-icon {
        position: absolute;
        inset-inline-start: 12px;
        color: var(--unity-text-secondary, #94a3b8);
        font-size: 0.85rem;
        pointer-events: none;
      }

      input {
        width: 100%;
        height: 44px;
        padding-inline-start: 36px;
        padding-inline-end: 14px;
        border-radius: 12px;
        border: 1px solid var(--unity-border, #e2e8f0);
        background: var(--unity-surface-muted, #f8fafc);
        color: var(--unity-text-main, #0f172a);
        font-size: 0.85rem;
        outline: none;
        transition: border-color 0.15s ease;

        &:focus {
          border-color: var(--unity-primary, #059669);
          background: #ffffff;
        }
      }
    }

    .select-shell {
      position: relative;
      display: flex;
      align-items: center;

      select {
        width: 100%;
        height: 44px;
        padding-inline-start: 14px;
        padding-inline-end: 34px;
        border-radius: 12px;
        border: 1px solid var(--unity-border, #e2e8f0);
        background: var(--unity-surface-muted, #f8fafc);
        color: var(--unity-text-main, #0f172a);
        font-size: 0.85rem;
        outline: none;
        appearance: none;
        cursor: pointer;

        &:focus {
          border-color: var(--unity-primary, #059669);
          background: #ffffff;
        }
      }

      .select-chevron {
        position: absolute;
        inset-inline-end: 14px;
        color: var(--unity-text-secondary, #94a3b8);
        font-size: 0.78rem;
        pointer-events: none;
      }
    }

    .textarea-shell {
      width: 100%;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid var(--unity-border, #e2e8f0);
      background: var(--unity-surface-muted, #f8fafc);
      color: var(--unity-text-main, #0f172a);
      font-size: 0.85rem;
      outline: none;
      resize: vertical;
      font-family: inherit;

      &:focus {
        border-color: var(--unity-primary, #059669);
        background: #ffffff;
      }
    }
  }

  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 8px;

    .cancel-btn {
      flex: 1;
      height: 44px;
      border-radius: 12px;
      background: var(--unity-surface-muted, #f8fafc);
      border: 1px solid var(--unity-border, #e2e8f0);
      color: var(--unity-text-secondary, #64748b);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
    }

    .submit-btn {
      flex: 2;
      height: 44px;
      border-radius: 12px;
      background: var(--unity-primary, #059669);
      border: none;
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }
}

.modal-success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 10px 10px;

  .success-icon-shell {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.12);
    color: #10b981;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin-bottom: 14px;
  }

  .success-title {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--unity-text-main, #0f172a);
    margin: 0 0 6px;
  }

  .success-desc {
    font-size: 0.82rem;
    color: var(--unity-text-secondary, #64748b);
    margin: 0 0 10px;
  }

  .ticket-ref-box {
    background: var(--unity-surface-muted, #f8fafc);
    border: 1px dashed var(--unity-primary, #059669);
    padding: 8px 18px;
    border-radius: 10px;
    margin-bottom: 12px;

    .ref-code {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--unity-primary, #059669);
      letter-spacing: 1px;
    }
  }

  .success-hint {
    font-size: 0.76rem;
    color: var(--unity-text-secondary, #64748b);
    line-height: 1.5;
    margin: 0 0 18px;
    max-width: 320px;
  }

  .success-done-btn {
    width: 100%;
    height: 44px;
    border-radius: 12px;
    background: var(--unity-primary, #059669);
    border: none;
    color: #ffffff;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
  }
}
</style>

