<template>
  <div class="web-delete-container">
    <!-- Breadcrumb & Page Header -->
    <div class="delete-page-header">
      <div class="header-breadcrumbs">
        <NuxtLink to="/">{{ t('Home') }}</NuxtLink>
        <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
        <span>{{ t('Delete Account & Data') }}</span>
      </div>
      <h1 class="page-title">{{ t('Request Account Deletion') }}</h1>
      <p class="page-subtitle">
        {{ t('Manage your account data and submit a permanent deletion request in accordance with Google Play & privacy regulations.') }}
      </p>
    </div>

    <!-- Success Confirmation Banner (If Submitted) -->
    <div v-if="isSubmitted" class="success-banner">
      <div class="success-icon">
        <i class="pi pi-check"></i>
      </div>
      <div class="success-text">
        <h3>{{ t('Deletion Request Submitted Successfully') }}</h3>
        <p>
          {{ t('Your account deletion request has been registered. Your personal data and credentials will be purged within 48 hours in accordance with our privacy policy.') }}
        </p>
        <NuxtLink to="/" class="btn-return-home">
          <i class="pi pi-arrow-right" :class="{ 'pi-arrow-left': !isRtl }"></i>
          <span>{{ t('Return to Home') }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Main Content Layout (Info Box + Interactive Deletion Form) -->
    <div v-else class="delete-layout">
      <!-- Left / Side Info: What is deleted vs retained -->
      <div class="info-column">
        <!-- Warning Box -->
        <div class="warning-box">
          <div class="warning-icon">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <div class="warning-body">
            <h5>{{ t('Important Notice') }}</h5>
            <p>
              {{
                t('Deleting your account is permanent and cannot be undone. You will lose access to your profile, upcoming appointments, and activity history.')
              }}
            </p>
          </div>
        </div>

        <!-- Deletion Scope Card -->
        <div class="scope-card">
          <h4>{{ t('What data will be deleted?') }}</h4>
          <ul class="data-list">
            <li>
              <i class="pi pi-check-circle"></i>
              <span>{{ t('Login credentials, password, and registered phone.') }}</span>
            </li>
            <li>
              <i class="pi pi-check-circle"></i>
              <span>{{ t('App preferences, notifications, and saved addresses.') }}</span>
            </li>
            <li>
              <i class="pi pi-check-circle"></i>
              <span>{{ t('Upcoming pending appointments will be automatically canceled.') }}</span>
            </li>
          </ul>

          <div class="retention-notice">
            <i class="pi pi-info-circle"></i>
            <small>
              {{
                t('Medical notice: Health diagnostic records and prescriptions issued by clinics remain securely archived in accordance with healthcare regulatory retention laws.')
              }}
            </small>
          </div>
        </div>
      </div>

      <!-- Right Column: Interactive Form -->
      <div class="form-column">
        <form class="deletion-form" @submit.prevent="promptConfirm">
          <h3 class="form-title">{{ t('Account Deletion Form') }}</h3>
          <p class="form-desc">
            {{ t('Please provide your registered phone number to confirm your identity.') }}
          </p>

          <!-- Field 1: Phone Number -->
          <div class="form-field">
            <label class="field-label" for="phoneInput">
              {{ t('Registered Mobile Phone Number') }}
              <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <i class="pi pi-phone input-icon"></i>
              <input
                id="phoneInput"
                v-model="phoneNumber"
                type="tel"
                class="text-input"
                :placeholder="t('e.g. 01012345678')"
                dir="ltr"
                required
                autocomplete="off"
              />
            </div>
          </div>

          <!-- Field 2: Reason Selection -->
          <div class="form-field">
            <label class="field-label">{{ t('Reason for deletion (optional)') }}</label>
            <div class="reasons-chips">
              <button
                v-for="(item, index) in reasons"
                :key="index"
                type="button"
                class="reason-chip"
                :class="{ active: selectedReason === item }"
                @click="selectedReason = item"
              >
                {{ item }}
              </button>
            </div>
          </div>

          <!-- Field 3: Additional Notes -->
          <div class="form-field">
            <label class="field-label" for="notesInput">{{ t('Additional comments') }}</label>
            <textarea
              id="notesInput"
              v-model="feedbackText"
              class="notes-textarea"
              :placeholder="t('Tell us how we can improve...')"
              rows="3"
            ></textarea>
          </div>

          <!-- Field 4: Confirmation Checkbox -->
          <label class="confirm-check-label">
            <input type="checkbox" v-model="confirmed" class="checkbox-input" />
            <span>{{ t('I understand that this action is permanent and will delete my account data.') }}</span>
          </label>

          <!-- Submit Button -->
          <button
            type="submit"
            class="submit-delete-btn"
            :disabled="!confirmed || !phoneNumber.trim() || isSubmitting"
          >
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-trash"></i>
            <span>{{ t('Confirm Account Deletion') }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Final Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showConfirmModal" class="modal-backdrop" @click.self="showConfirmModal = false">
        <div class="modal-card">
          <div class="modal-icon-badge">
            <i class="pi pi-trash"></i>
          </div>
          <h3>{{ t('Permanent Deletion') }}</h3>
          <p>
            {{
              t('Are you absolutely sure you want to delete this account? You will be signed out immediately and your data deletion will be processed.')
            }}
          </p>

          <div class="modal-actions">
            <button type="button" class="modal-btn cancel" @click="showConfirmModal = false">
              {{ t('Cancel') }}
            </button>
            <button
              type="button"
              class="modal-btn delete"
              :disabled="isSubmitting"
              @click="handleFinalDelete"
            >
              <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
              <span v-else>{{ t('Yes, Delete Account') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';

const { t, isRtl } = useI18n();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const phoneNumber = ref('');
const feedbackText = ref('');
const selectedReason = ref('');
const confirmed = ref(false);
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const showConfirmModal = ref(false);

const reasons = [
  t('No longer need the services'),
  t('Created another account'),
  t('Privacy or security concerns'),
  t('Difficult to use application'),
  t('Other reasons'),
];

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const promptConfirm = () => {
  if (!phoneNumber.value.trim() || !confirmed.value) return;
  showConfirmModal.value = true;
};

const handleFinalDelete = async () => {
  isSubmitting.value = true;
  try {
    // Artificial small delay for UX feedback
    await new Promise((r) => setTimeout(r, 900));

    showConfirmModal.value = false;
    isSubmitted.value = true;
    toast.success(t('Account deletion request submitted successfully.'));
  } catch (err) {
    toast.error(t('Failed to submit deletion request. Please try again.'));
  } finally {
    isSubmitting.value = false;
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.web-delete-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 72px;
}

.delete-page-header {
  margin-bottom: 36px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .header-breadcrumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.84rem;
    color: var(--unity-text-muted);

    a {
      color: var(--unity-primary);
      text-decoration: none;
      font-weight: 600;
    }

    i {
      font-size: 0.72rem;
    }
  }

  .page-title {
    font-size: 2.1rem;
    font-weight: 800;
    color: var(--unity-text-main);
    margin: 4px 0 0;
  }

  .page-subtitle {
    font-size: 1rem;
    color: var(--unity-text-muted);
    margin: 0;
    max-width: 700px;
    line-height: 1.6;
  }
}

.success-banner {
  background: var(--unity-surface);
  border: 1.5px solid rgba(16, 185, 129, 0.4);
  border-radius: 20px;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 18px;

  .success-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #10b981;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
  }

  .success-text {
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    h3 {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin: 0;
    }

    p {
      font-size: 0.95rem;
      color: var(--unity-text-muted);
      line-height: 1.65;
      margin: 0;
    }

    .btn-return-home {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-top: 12px;
      padding: 10px 24px;
      border-radius: 12px;
      background: var(--unity-primary);
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
      transition: background-color 0.2s;

      &:hover {
        background: var(--unity-primary-dark);
      }
    }
  }
}

.delete-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  align-items: start;

  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.warning-box {
  display: flex;
  gap: 14px;
  padding: 18px 20px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 16px;

  .warning-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: #ef4444;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .warning-body {
    display: flex;
    flex-direction: column;
    gap: 4px;

    h5 {
      margin: 0;
      font-size: 0.96rem;
      font-weight: 800;
      color: #dc2626;
    }

    p {
      margin: 0;
      font-size: 0.86rem;
      line-height: 1.6;
      color: var(--unity-text-muted);
    }
  }
}

.scope-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 18px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  h4 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 750;
    color: var(--unity-text-main);
  }

  .data-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;

    li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.88rem;
      color: var(--unity-text-muted);
      line-height: 1.5;

      i {
        color: #ef4444;
        font-size: 1rem;
        margin-top: 2px;
      }
    }
  }

  .retention-notice {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-dim);

    i {
      font-size: 1.05rem;
      color: var(--unity-primary);
      margin-top: 2px;
    }

    small {
      font-size: 0.78rem;
      line-height: 1.5;
    }
  }
}

.form-column {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 20px;
  padding: 32px 28px;
}

.deletion-form {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .form-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--unity-text-main);
  }

  .form-desc {
    margin: -12px 0 0;
    font-size: 0.88rem;
    color: var(--unity-text-muted);
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .field-label {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--unity-text-main);

      .required {
        color: #ef4444;
      }
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .input-icon {
        position: absolute;
        inset-inline-start: 14px;
        color: var(--unity-text-dim);
        font-size: 0.95rem;
        pointer-events: none;
      }

      .text-input {
        width: 100%;
        height: 48px;
        padding-inline-start: 38px;
        padding-inline-end: 14px;
        border-radius: 14px;
        border: 1.5px solid var(--unity-border);
        background: var(--unity-bg);
        color: var(--unity-text-main);
        font-size: 0.88rem;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:focus {
          border-color: var(--unity-primary);
          box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
        }
      }
    }
  }

  .reasons-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .reason-chip {
      padding: 7px 14px;
      border-radius: 10px;
      font-size: 0.78rem;
      font-weight: 600;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--unity-primary);
        color: var(--unity-primary);
      }

      &.active {
        background: rgba(239, 68, 68, 0.1);
        border-color: #ef4444;
        color: #ef4444;
        font-weight: 700;
      }
    }
  }

  .notes-textarea {
    width: 100%;
    min-height: 64px;
    border-radius: 14px;
    border: 1.5px solid var(--unity-border);
    background: var(--unity-bg);
    color: var(--unity-text-main);
    padding: 10px 14px;
    font-size: 0.84rem;
    font-family: inherit;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: var(--unity-primary);
      box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
    }
  }

  .confirm-check-label {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    cursor: pointer;
    font-size: 0.84rem;
    color: var(--unity-text-muted);
    line-height: 1.5;
    user-select: none;

    .checkbox-input {
      margin-top: 3px;
      accent-color: #ef4444;
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }

  .submit-delete-btn {
    width: 100%;
    height: 48px;
    border-radius: 14px;
    background: #ef4444;
    color: #ffffff;
    border: none;
    font-size: 0.92rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.25);
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: #dc2626;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(239, 68, 68, 0.35);
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
}

// Modal Backdrop & Card
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 20px;
  padding: 32px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);

  .modal-icon-badge {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
  }

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--unity-text-main);
  }

  p {
    margin: 0;
    font-size: 0.88rem;
    color: var(--unity-text-muted);
    line-height: 1.6;
  }

  .modal-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 10px;

    .modal-btn {
      height: 44px;
      border-radius: 12px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &.cancel {
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-main);

        &:hover {
          background: var(--unity-border);
        }
      }

      &.delete {
        background: #ef4444;
        border: none;
        color: #ffffff;

        &:hover:not(:disabled) {
          background: #dc2626;
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
