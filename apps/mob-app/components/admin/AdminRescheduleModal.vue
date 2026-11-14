<template>
  <Teleport to="body">
    <div v-if="isOpen && booking" class="modal-backdrop" @click="close">
    <div class="modal-sheet" @click.stop>
      <div class="modal-header">
        <div class="header-title">
          <i class="pi pi-calendar-plus"></i>
          <div>
            <h4>{{ t('Reschedule Booking') }}</h4>
            <small>#{{ booking.booking_number }} • {{ booking.patient_name }}</small>
          </div>
        </div>
        <button class="btn-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <form class="reschedule-form" @submit.prevent="saveNewSlot">
        <!-- Clinic & Doctor -->
        <div class="form-group">
          <label>{{ t('Clinic') }}</label>
          <input :value="booking.clinic_name" type="text" disabled />
        </div>

        <div class="form-group">
          <label>{{ t('Doctor') }}</label>
          <input :value="booking.doctor_name" type="text" disabled />
        </div>

        <!-- Date & Time Slot -->
        <div class="two-col-row">
          <div class="form-group">
            <label>{{ t('New Date') }}</label>
            <input v-model="form.date" type="date" required />
          </div>
          <div class="form-group">
            <label>{{ t('New Time Slot') }}</label>
            <AppTimePicker v-model="form.time" :title="t('New Time Slot')" />
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="close">{{ t('Cancel') }}</button>
          <button type="submit" class="btn-submit">{{ t('Confirm New Slot') }}</button>
        </div>
      </form>
    </div>
  </div>
  </Teleport>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, watch, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useModalState } from '../../composables/useModalState';
import AppTimePicker from '../common/AppTimePicker.vue';

const props = defineProps<{
  isOpen: boolean;
  booking: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'rescheduled', payload: any): void;
}>();

const { t } = useI18n();
const { registerModalOpen, registerModalClose } = useModalState();

// 2. Data (refs, reactive state)
const form = ref({
  doctor_name: 'د. فهد السالم',
  date: new Date().toISOString().split('T')[0],
  time: '11:00',
});

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const close = () => {
  emit('close');
};

const saveNewSlot = () => {
  emit('rescheduled', {
    bookingId: props.booking.id,
    doctor_name: form.value.doctor_name,
    date: form.value.date,
    time: form.value.time,
  });
  close();
};

// 5. Watches (watch, watchEffect)
watch(() => props.booking, (bk) => {
  if (bk) {
    form.value.doctor_name = bk.doctor_name || 'د. فهد السالم';
    form.value.time = bk.time ? bk.time.replace(/[^0-9:]/g, '') : '11:00';
  }
}, { immediate: true });

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

  &[dir='ltr'] {
    direction: ltr;

    .modal-header .header-title,
    .form-group label {
      text-align: left;
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;

      i {
        font-size: 1.3rem;
        color: var(--unity-primary);
      }

      h4 {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      small {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
      }
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
    }
  }

  .reschedule-form {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
      text-align: right;

      label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      input, select {
        width: 100%;
        height: 44px;
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        border-radius: 12px;
        padding: 0 14px;
        font-size: 0.85rem;
        color: var(--unity-text-main);

        &:focus {
          outline: none;
          border-color: var(--unity-primary);
        }

        &:disabled {
          opacity: 0.7;
          background: #e2e8f0;
        }
      }
    }

    .two-col-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .modal-actions {
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
      }

      .btn-cancel {
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-muted);
      }

      .btn-submit {
        background: var(--unity-primary);
        color: #fff;
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
