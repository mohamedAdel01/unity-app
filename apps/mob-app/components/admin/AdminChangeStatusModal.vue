<template>
  <Teleport to="body">
    <div v-if="isOpen && booking" class="modal-backdrop" @click="close">
      <div class="modal-sheet" @click.stop>
        <div class="modal-header">
          <div class="header-title">
            <div class="header-icon-wrap">
              <i class="pi pi-sliders-h"></i>
            </div>
            <div>
              <h4>{{ t('Update Attendance & Appointment Status') }}</h4>
              <small>#{{ booking.booking_number }} • {{ booking.patient_name }}</small>
            </div>
          </div>
          <button type="button" class="btn-close" :aria-label="t('Close')" @click="close">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-content">
          <p class="status-subtitle">{{ t('Select the current attendance status for this appointment:') }}</p>

          <div class="status-options-grid">
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              type="button"
              class="status-option-card"
              :class="[opt.colorClass, { 'is-active': selectedStatus === opt.value }]"
              @click="selectedStatus = opt.value"
            >
              <div class="option-icon-wrap">
                <i :class="opt.icon"></i>
              </div>
              <div class="option-text">
                <span class="option-title">{{ opt.label }}</span>
                <small class="option-desc">{{ opt.desc }}</small>
              </div>
              <div class="option-radio">
                <i v-if="selectedStatus === opt.value" class="pi pi-check-circle active-check"></i>
                <span v-else class="radio-dot"></span>
              </div>
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <button 
            type="button" 
            class="btn-submit" 
            :disabled="loading || selectedStatus === booking.status"
            @click="saveStatus"
          >
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ t('Save Status') }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useModalState } from '../../composables/useModalState';

const props = defineProps<{
  isOpen: boolean;
  booking: any;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: { bookingId: string | number; status: string; booking: any }): void;
}>();

const { t } = useI18n();
const { registerModalOpen, registerModalClose } = useModalState();

// 2. Data (refs, reactive state)
const selectedStatus = ref<string>('confirmed');

// 3. Computed (computed properties)
const statusOptions = computed(() => [
  {
    value: 'completed',
    label: t('Attended & Completed'),
    desc: t('Patient arrived and examination was completed'),
    icon: 'pi pi-check-circle',
    colorClass: 'opt-completed',
  },
  {
    value: 'cancelled',
    label: t('Did Not Attend / Cancelled'),
    desc: t('Patient did not attend or booking was cancelled'),
    icon: 'pi pi-times-circle',
    colorClass: 'opt-cancelled',
  },
  {
    value: 'confirmed',
    label: t('Confirmed / Awaiting Arrival'),
    desc: t('Booking is confirmed and awaiting patient arrival'),
    icon: 'pi pi-calendar-clock',
    colorClass: 'opt-confirmed',
  },
  {
    value: 'pending',
    label: t('Under Review / Pending'),
    desc: t('New booking awaiting reception confirmation'),
    icon: 'pi pi-hourglass',
    colorClass: 'opt-pending',
  },
]);

// 4. Methods (functions, handlers)
const close = () => {
  emit('close');
};

const saveStatus = () => {
  if (!props.booking) return;
  emit('save', {
    bookingId: props.booking.id,
    status: selectedStatus.value,
    booking: props.booking,
  });
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.booking,
  (bk) => {
    if (bk && bk.status) {
      selectedStatus.value = bk.status;
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
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 640px) {
    align-items: center;
    padding: 1.5rem;
  }
}

.modal-sheet {
  background: var(--unity-surface, #ffffff);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  width: 100%;
  max-width: 480px;
  padding: 1.25rem;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.12);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 90vh;
  overflow-y: auto;

  @media (min-width: 640px) {
    border-radius: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--unity-border, #e2e8f0);
  padding-bottom: 0.85rem;

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .header-icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: var(--unity-primary-light, #ecfdf5);
      color: var(--unity-primary, #047857);
      display: inline-flex;
      align-items: center;
      justify-content: center;

      :global([data-theme='dark']) &,
      :global(html.dark) & {
        background: rgba(16, 185, 129, 0.14);
        color: #34d399;
      }

      i {
        font-size: 1.15rem;
      }
    }

    h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      color: var(--unity-text-main, #0f172a);
      line-height: 1.3;
    }

    small {
      color: var(--unity-text-dim, #64748b);
      font-size: 0.76rem;
      font-weight: 600;
    }
  }

  .btn-close {
    background: transparent;
    border: none;
    color: var(--unity-text-dim, #64748b);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease;

    &:hover {
      background: var(--unity-bg, #f1f5f9);
      color: var(--unity-text-main, #0f172a);
    }
  }
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .status-subtitle {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--unity-text-dim, #64748b);
  }

  .status-options-grid {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .status-option-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.75rem 0.9rem;
    border-radius: 14px;
    border: 1.5px solid var(--unity-border, #e2e8f0);
    background: var(--unity-surface, #ffffff);
    cursor: pointer;
    text-align: start;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: inherit;

    .option-icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i {
        font-size: 1.15rem;
      }
    }

    .option-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;

      .option-title {
        font-size: 0.88rem;
        font-weight: 800;
        color: var(--unity-text-main, #0f172a);
      }

      .option-desc {
        font-size: 0.74rem;
        color: var(--unity-text-dim, #64748b);
        line-height: 1.3;
      }
    }

    .option-radio {
      width: 20px;
      height: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .radio-dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid var(--unity-border, #cbd5e1);
      }

      .active-check {
        font-size: 1.2rem;
      }
    }

    // Color theme variants
    &.opt-completed {
      .option-icon-wrap {
        background: #eff6ff;
        color: #2563eb;
      }
      &.is-active {
        border-color: #3b82f6;
        background: #f0f7ff;
        .active-check { color: #2563eb; }
      }
    }

    &.opt-cancelled {
      .option-icon-wrap {
        background: #fef2f2;
        color: #dc2626;
      }
      &.is-active {
        border-color: #ef4444;
        background: #fff5f5;
        .active-check { color: #dc2626; }
      }
    }

    &.opt-confirmed {
      .option-icon-wrap {
        background: #ecfdf5;
        color: #047857;
      }
      &.is-active {
        border-color: #047857;
        background: #f0fdf4;
        .active-check { color: #047857; }
      }
    }

    &.opt-pending {
      .option-icon-wrap {
        background: #fffbeb;
        color: #d97706;
      }
      &.is-active {
        border-color: #f59e0b;
        background: #fffdf5;
        .active-check { color: #d97706; }
      }
    }

    &:hover:not(.is-active) {
      border-color: #cbd5e1;
      background: var(--unity-bg, #f8fafc);
      transform: translateY(-1px);
    }

    :global([data-theme='dark']) &,
    :global(html.dark) & {
      border-color: #1f2937 !important;
      background: #111827 !important;

      &:hover:not(.is-active) {
        border-color: #374151 !important;
        background: #1a2333 !important;
      }

      &.opt-completed {
        .option-icon-wrap { background: rgba(59, 130, 246, 0.16) !important; color: #60a5fa !important; }
        &.is-active {
          border-color: #3b82f6 !important;
          background: rgba(59, 130, 246, 0.14) !important;
          .active-check { color: #60a5fa !important; }
        }
      }
      &.opt-cancelled {
        .option-icon-wrap { background: rgba(239, 68, 68, 0.16) !important; color: #f87171 !important; }
        &.is-active {
          border-color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.14) !important;
          .active-check { color: #f87171 !important; }
        }
      }
      &.opt-confirmed {
        .option-icon-wrap { background: rgba(16, 185, 129, 0.16) !important; color: #34d399 !important; }
        &.is-active {
          border-color: #10b981 !important;
          background: rgba(16, 185, 129, 0.14) !important;
          .active-check { color: #34d399 !important; }
        }
      }
      &.opt-pending {
        .option-icon-wrap { background: rgba(245, 158, 11, 0.16) !important; color: #fbbf24 !important; }
        &.is-active {
          border-color: #f59e0b !important;
          background: rgba(245, 158, 11, 0.14) !important;
          .active-check { color: #fbbf24 !important; }
        }
      }
    }
  }
}

.modal-actions {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 0.25rem;

  .btn-submit {
    width: 100%;
    flex: 1;
    height: 44px;
    border-radius: 12px;
    background: var(--unity-primary, #047857);
    border: none;
    color: #ffffff;
    font-size: 0.88rem;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    box-shadow: 0 4px 12px rgba(4, 120, 87, 0.2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
      background: var(--unity-primary-dark, #065f46);
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
