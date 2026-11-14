<template>
  <div class="broadcast-banner-wrapper">
    <!-- Broadcast Notification Action Card -->
    <div class="broadcast-banner">
      <div class="broadcast-text">
        <h6>{{ t('Broadcast Notification') }}</h6>
        <p>{{ t('Send urgent announcements to all registered patients & staff.') }}</p>
      </div>
      <button type="button" class="btn-broadcast" @click.stop="openModal">
        <i class="pi pi-megaphone"></i>
        <span>{{ t('Send Broadcast') }}</span>
      </button>
    </div>

    <!-- Broadcast Modal Bottom Sheet -->
    <Teleport to="body">
      <div v-if="isBroadcastModalOpen" class="modal-backdrop" @click="closeModal">
        <div class="modal-sheet" @click.stop>
          <div class="pill"></div>

          <div class="modal-head">
            <div class="head-info">
              <div class="head-icon">
                <i class="pi pi-megaphone"></i>
              </div>
              <div class="head-titles">
                <h4>{{ t('Broadcast Notification') }}</h4>
                <p>{{ t('Send urgent announcements to all registered patients & staff.') }}</p>
              </div>
            </div>
            <button type="button" class="btn-close" :aria-label="t('Close')" @click="closeModal">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="field-label">{{ t('Notification Title') }} <span class="req">*</span></label>
              <div class="input-wrapper">
                <i class="pi pi-bookmark input-icon"></i>
                <input 
                  v-model="broadcastTitle" 
                  type="text" 
                  class="input-field" 
                  :placeholder="t('e.g. Schedule Update or Public Announcement')"
                  dir="rtl"
                  autocomplete="off"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="field-label">{{ t('Notification Message') }} <span class="req">*</span></label>
              <div class="input-wrapper textarea-wrapper">
                <textarea 
                  v-model="broadcastBody" 
                  rows="3" 
                  class="input-field textarea" 
                  :placeholder="t('Type message contents...')"
                  dir="rtl"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="modal-foot">
            <button type="button" class="btn-cancel" @click="closeModal">
              {{ t('Cancel') }}
            </button>
            <button 
              type="button" 
              class="btn-send" 
              :disabled="!broadcastTitle.trim() || !broadcastBody.trim() || isSending" 
              @click="sendBroadcastNotification"
            >
              <i :class="isSending ? 'pi pi-spin pi-spinner' : 'pi pi-send'"></i>
              <span>{{ isSending ? t('Sending...') : t('Send') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, watch, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import { useModalState } from '../../composables/useModalState';

const emit = defineEmits<{
  (e: 'broadcast-sent'): void;
}>();

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();
const { registerModalOpen, registerModalClose } = useModalState();

// 2. Data (refs, reactive state)
const isBroadcastModalOpen = ref(false);
const broadcastTitle = ref('');
const broadcastBody = ref('');
const isSending = ref(false);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const openModal = () => {
  isBroadcastModalOpen.value = true;
};

const closeModal = () => {
  isBroadcastModalOpen.value = false;
};

const sendBroadcastNotification = async () => {
  if (!broadcastTitle.value.trim() || !broadcastBody.value.trim()) return;
  isSending.value = true;
  try {
    await api.apiRequest({
      service: 'ADMIN_BROADCAST_NOTIFICATION',
      payload: {
        title: broadcastTitle.value.trim(),
        body: broadcastBody.value.trim(),
      },
    });
    toast.success(t('Notification broadcasted successfully!'));
    broadcastTitle.value = '';
    broadcastBody.value = '';
    closeModal();
    emit('broadcast-sent');
  } catch (err: any) {
    toast.error(err.message || t('Failed to send broadcast'));
  } finally {
    isSending.value = false;
  }
};

// 5. Watches (watch, watchEffect)
watch(
  isBroadcastModalOpen,
  (open) => {
    if (open) {
      registerModalOpen();
    } else {
      registerModalClose();
    }
  }
);

// 6. Hooks (onMounted, onUnmounted, etc.)
onUnmounted(() => {
  if (isBroadcastModalOpen.value) {
    registerModalClose();
  }
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.broadcast-banner-wrapper {
  width: 100%;
}

.broadcast-banner {
  padding: 16px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
  border: 1px solid var(--unity-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;

  .broadcast-text {
    h6 {
      margin: 0 0 3px;
      font-size: 0.88rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    p {
      margin: 0;
      font-size: 0.74rem;
      color: var(--unity-text-dim);
      line-height: 1.4;
    }
  }

  .btn-broadcast {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: 12px;
    background: var(--unity-primary);
    color: #fff;
    border: none;
    font-size: 0.8rem;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      opacity: 0.92;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-sheet {
  width: 100%;
  max-width: 440px;
  max-height: 85vh;
  overflow-y: auto;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 14px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  border-top: 1.5px solid var(--unity-border);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;

  .pill {
    width: 40px;
    height: 4px;
    border-radius: 10px;
    background: var(--unity-border);
    margin: 0 auto 4px;
    flex-shrink: 0;
  }

  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--unity-border);

    .head-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .head-icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: var(--unity-primary-light);
        color: var(--unity-primary);
        border: 1px solid var(--unity-primary-tint);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        flex-shrink: 0;
      }

      .head-titles {
        h4 {
          margin: 0 0 2px;
          font-size: 1rem;
          font-weight: 800;
          color: var(--unity-text-main);
        }
        p {
          margin: 0;
          font-size: 0.72rem;
          color: var(--unity-text-dim);
          line-height: 1.3;
        }
      }
    }

    .btn-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--unity-bg);
      border: 1.5px solid var(--unity-border);
      color: var(--unity-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
      flex-shrink: 0;

      &:hover {
        background: var(--unity-border);
        color: var(--unity-text-main);
      }
    }
  }

  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 14px;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .field-label {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--unity-text-main);

        .req {
          color: #ef4444;
        }
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        .input-icon {
          position: absolute;
          inset-inline-start: 12px;
          color: var(--unity-text-dim);
          font-size: 0.9rem;
          pointer-events: none;
        }

        .input-field {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          padding-inline-start: 36px;
          border-radius: 12px;
          border: 1.5px solid var(--unity-border);
          background: var(--unity-bg);
          color: var(--unity-text-main);
          font-size: 0.88rem;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;

          &::placeholder {
            color: var(--unity-text-dim);
            font-size: 0.82rem;
          }

          &:focus {
            border-color: var(--unity-primary);
            background: var(--unity-surface);
            box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
          }

          &.textarea {
            height: auto;
            min-height: 80px;
            padding: 10px 14px;
            padding-inline-start: 14px;
            resize: none;
            line-height: 1.5;
          }
        }
      }
    }
  }

  .modal-foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 4px;

    button {
      padding: 10px 20px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;

      &.btn-cancel {
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        color: var(--unity-text-muted);

        &:hover {
          background: var(--unity-border-light);
          color: var(--unity-text-main);
        }
      }

      &.btn-send {
        background: var(--unity-primary-gradient, linear-gradient(135deg, #047857 0%, #064e3b 100%));
        border: none;
        color: #fff;
        box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);

        &:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        &:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
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
