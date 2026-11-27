<template>
  <Teleport to="body">
    <div v-if="isOpen && booking" class="modal-backdrop" @click="close">
      <div class="modal-sheet" @click.stop>
        <div class="modal-header">
          <div class="header-title">
            <div class="header-icon-wrap">
              <i class="pi pi-wallet"></i>
            </div>
            <div>
              <h4>{{ t('Update Payment Status') }}</h4>
              <small>#{{ booking.booking_number }} • {{ booking.patient_name }}</small>
            </div>
          </div>
          <button type="button" class="btn-close" :aria-label="t('Close')" @click="close">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-content">
          <!-- Total Price Banner -->
          <div class="price-summary-banner">
            <span class="banner-label">{{ t('Total Required Amount') }}</span>
            <div class="banner-amount">
              <span class="amount-number">{{ booking.price || 0 }}</span>
              <span class="amount-currency">{{ t('EGP') }}</span>
            </div>
          </div>

          <!-- Payment Status Section -->
          <div class="section-group">
            <label class="section-label">{{ t('Payment Status') }}</label>
            <div class="status-options-grid">
              <button
                v-for="opt in paymentStatusOptions"
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

          <!-- Payment Method Section -->
          <div class="section-group">
            <label class="section-label">{{ t('Payment Method') }}</label>
            <div class="method-options-row">
              <button
                type="button"
                class="method-btn"
                :class="{ 'is-active': selectedMethod === 'cash' }"
                @click="selectedMethod = 'cash'"
              >
                <i class="pi pi-wallet"></i>
                <span>{{ t('Cash at Reception') }}</span>
              </button>

              <button
                type="button"
                class="method-btn"
                :class="{ 'is-active': selectedMethod === 'card' }"
                @click="selectedMethod = 'card'"
              >
                <i class="pi pi-credit-card"></i>
                <span>{{ t('Card / Electronic') }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button 
            type="button" 
            class="btn-submit" 
            :disabled="loading"
            @click="savePaymentStatus"
          >
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ t('Save Payment Status') }}</span>
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
  (e: 'save', payload: { bookingId: string | number; invoiceId?: string; status: string; payment_method: string; booking: any }): void;
}>();

const { t } = useI18n();
const { registerModalOpen, registerModalClose } = useModalState();

// 2. Data (refs, reactive state)
const selectedStatus = ref<string>('pending');
const selectedMethod = ref<'cash' | 'card'>('cash');

// 3. Computed (computed properties)
const paymentStatusOptions = computed(() => [
  {
    value: 'paid',
    label: t('Paid Status'),
    desc: t('Full consultation fee has been collected'),
    icon: 'pi pi-check-circle',
    colorClass: 'opt-paid',
  },
  {
    value: 'pending',
    label: t('Unpaid Status'),
    desc: t('Payment pending at reception or online'),
    icon: 'pi pi-clock',
    colorClass: 'opt-pending',
  },
  {
    value: 'refunded',
    label: t('Refunded'),
    desc: t('Amount refunded to patient'),
    icon: 'pi pi-replay',
    colorClass: 'opt-refunded',
  },
  {
    value: 'cancelled',
    label: t('Cancelled'),
    desc: t('Invoice cancelled'),
    icon: 'pi pi-times-circle',
    colorClass: 'opt-cancelled',
  },
]);

// 4. Methods (functions, handlers)
const close = () => {
  emit('close');
};

const savePaymentStatus = () => {
  if (!props.booking) return;
  emit('save', {
    bookingId: props.booking.id,
    invoiceId: props.booking.invoice_id || props.booking.invoice?.id || props.booking.raw?.invoice?.id,
    status: selectedStatus.value,
    payment_method: selectedMethod.value,
    booking: props.booking,
  });
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.booking,
  (bk) => {
    if (bk) {
      if (bk.is_paid || bk.payment_status === 'paid' || bk.invoice?.status === 'paid') {
        selectedStatus.value = 'paid';
      } else if (bk.payment_status === 'refunded' || bk.invoice?.status === 'refunded') {
        selectedStatus.value = 'refunded';
      } else if (bk.payment_status === 'cancelled' || bk.invoice?.status === 'cancelled') {
        selectedStatus.value = 'cancelled';
      } else {
        selectedStatus.value = 'pending';
      }

      const method = String(bk.payment_method || bk.invoice?.payment_method || 'cash').toLowerCase();
      selectedMethod.value = method.includes('card') || method.includes('paymob') ? 'card' : 'cash';
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
      background: #eff6ff;
      color: #2563eb;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      :global([data-theme='dark']) &,
      :global(html.dark) & {
        background: rgba(59, 130, 246, 0.16) !important;
        border: 1px solid rgba(59, 130, 246, 0.28) !important;
        color: #60a5fa !important;
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
  gap: 0.85rem;

  .price-summary-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1rem;
    border-radius: 14px;
    background: var(--unity-bg, #f8fafc);
    border: 1.5px solid var(--unity-border, #e2e8f0);

    .banner-label {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--unity-text-main, #1e293b);
    }

    .banner-amount {
      display: inline-flex;
      align-items: baseline;
      gap: 4px;

      .amount-number {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--unity-primary, #415b2e);
      }

      .amount-currency {
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--unity-text-dim, #64748b);
      }
    }
  }

  .section-group {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;

    .section-label {
      font-size: 0.80rem;
      font-weight: 700;
      color: var(--unity-text-main, #1e293b);
    }
  }

  .status-options-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .status-option-card {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.7rem 0.85rem;
    border-radius: 14px;
    border: 1.5px solid var(--unity-border, #e2e8f0);
    background: var(--unity-surface, #ffffff);
    cursor: pointer;
    text-align: start;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: inherit;

    .option-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i {
        font-size: 1.1rem;
      }
    }

    .option-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;

      .option-title {
        font-size: 0.86rem;
        font-weight: 800;
        color: var(--unity-text-main, #0f172a);
      }

      .option-desc {
        font-size: 0.72rem;
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

    // Colors
    &.opt-paid {
      .option-icon-wrap { background: #f2f6ee; color: #415b2e; }
      &.is-active {
        border-color: #415b2e;
        background: #f0fdf4;
        .active-check { color: #415b2e; }
      }
    }

    &.opt-pending {
      .option-icon-wrap { background: #fffbeb; color: #d97706; }
      &.is-active {
        border-color: #f59e0b;
        background: #fffdf5;
        .active-check { color: #d97706; }
      }
    }

    &.opt-refunded {
      .option-icon-wrap { background: #f5f3ff; color: #7c3aed; }
      &.is-active {
        border-color: #7c3aed;
        background: #faf5ff;
        .active-check { color: #7c3aed; }
      }
    }

    &.opt-cancelled {
      .option-icon-wrap { background: #fef2f2; color: #dc2626; }
      &.is-active {
        border-color: #ef4444;
        background: #fff5f5;
        .active-check { color: #dc2626; }
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

      &.opt-paid {
        .option-icon-wrap { background: rgba(92, 128, 66, 0.16) !important; color: #8ab36b !important; }
        &.is-active {
          border-color: #5c8042 !important;
          background: rgba(92, 128, 66, 0.14) !important;
          .active-check { color: #8ab36b !important; }
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
      &.opt-refunded {
        .option-icon-wrap { background: rgba(124, 58, 237, 0.16) !important; color: #a78bfa !important; }
        &.is-active {
          border-color: #7c3aed !important;
          background: rgba(124, 58, 237, 0.14) !important;
          .active-check { color: #a78bfa !important; }
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
    }
  }

  .method-options-row {
    display: flex;
    gap: 0.65rem;

    .method-btn {
      flex: 1;
      height: 44px;
      border-radius: 12px;
      border: 1.5px solid var(--unity-border, #e2e8f0);
      background: var(--unity-surface, #ffffff);
      color: var(--unity-text-dim, #64748b);
      font-size: 0.84rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s ease;

      i {
        font-size: 1rem;
      }

      &.is-active {
        border-color: var(--unity-primary, #415b2e);
        background: #f2f6ee;
        color: var(--unity-primary, #415b2e);
        font-weight: 800;
      }

      &:hover:not(.is-active) {
        border-color: #cbd5e1;
        background: var(--unity-bg, #f8fafc);
      }

      :global([data-theme='dark']) &,
      :global(html.dark) & {
        background: #111827;
        border-color: #1f2937;
        color: #9ca3af;

        &:hover:not(.is-active) {
          border-color: #374151;
          background: #1a2333;
        }

        &.is-active {
          border-color: #5c8042 !important;
          background: rgba(92, 128, 66, 0.16) !important;
          color: #8ab36b !important;
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
    background: var(--unity-primary, #415b2e);
    border: none;
    color: #ffffff;
    font-size: 0.88rem;
    font-weight: 800;
    cursor: pointer;
    font-family: inherit;
    box-shadow: 0 4px 12px rgba(65, 91, 46, 0.2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
      background: var(--unity-primary-dark, #364c26);
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
