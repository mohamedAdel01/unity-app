<template>
  <div class="broadcast-banner-wrapper">
    <!-- Broadcast Notification Action Card -->
    <div class="broadcast-banner">
      <div class="broadcast-text">
        <h6>{{ t('Broadcast Notification') }}</h6>
        <p>{{ t('Send urgent announcements to all registered patients & staff.') }}</p>
      </div>
      <button class="btn-broadcast" @click="isBroadcastModalOpen = true">
        <i class="pi pi-megaphone"></i>
        <span>{{ t('Send Broadcast') }}</span>
      </button>
    </div>

    <!-- Broadcast Modal -->
    <Teleport to="body">
      <div v-if="isBroadcastModalOpen" class="modal-backdrop" @click="isBroadcastModalOpen = false">
        <div class="modal-sheet" @click.stop>
          <div class="modal-head">
            <h4>{{ t('Broadcast Notification') }}</h4>
            <button class="btn-close" @click="isBroadcastModalOpen = false">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <label class="field-label">{{ t('Notification Title') }}</label>
            <input 
              v-model="broadcastTitle" 
              type="text" 
              class="input-field" 
              :placeholder="t('e.g. Schedule Update or Public Announcement')"
            />
            <label class="field-label">{{ t('Notification Message') }}</label>
            <textarea 
              v-model="broadcastBody" 
              rows="3" 
              class="input-field textarea" 
              :placeholder="t('Type message contents...')"
            ></textarea>
          </div>
          <div class="modal-foot">
            <button class="btn-cancel" @click="isBroadcastModalOpen = false">{{ t('Cancel') }}</button>
            <button 
              class="btn-send" 
              :disabled="!broadcastTitle.trim() || !broadcastBody.trim() || isSending" 
              @click="sendBroadcastNotification"
            >
              {{ isSending ? t('Sending...') : t('Send') }}
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
    isBroadcastModalOpen.value = false;
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
  },
  { immediate: true }
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
  }
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  .modal-sheet {
    width: 100%;
    max-width: 420px;
    background: var(--unity-surface);
    border-radius: 20px;
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;

      h4 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      .btn-close {
        border: none;
        background: none;
        cursor: pointer;
        font-size: 1rem;
        color: var(--unity-text-dim);
      }
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .field-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--unity-text-muted);
      }

      .input-field {
        padding: 10px 14px;
        border-radius: 12px;
        border: 1px solid var(--unity-border);
        background: var(--unity-bg);
        color: var(--unity-text-main);
        font-size: 0.88rem;
        outline: none;

        &:focus {
          border-color: var(--unity-primary);
        }

        &.textarea {
          resize: none;
        }
      }
    }

    .modal-foot {
      display: flex;
      justify-content: flex-end;
      gap: 8px;

      button {
        padding: 8px 18px;
        border-radius: 10px;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;

        &.btn-cancel {
          background: none;
          border: 1px solid var(--unity-border);
          color: var(--unity-text-muted);
        }

        &.btn-send {
          background: var(--unity-primary);
          border: none;
          color: #fff;

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}
</style>

