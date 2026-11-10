<template>
  <div class="otp-action-and-keypad">
    <!-- Big Confirm & Continue Action Button (From Mockup) -->
    <button 
      class="confirm-continue-btn" 
      :disabled="codeLength < 4 || loading" 
      @click="emit('confirm')"
    >
      <i v-if="loading" class="pi pi-spin pi-spinner"></i>
      <template v-else>
        <i :class="[isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right', 'action-arrow']"></i>
        <span>{{ t('Confirm & Continue') }}</span>
      </template>
    </button>

    <!-- Interactive Keypad Grid -->
    <div class="virtual-keypad">
      <!-- Rows 1 to 3 (Numbers 1-9) -->
      <div class="keypad-grid">
        <button 
          v-for="num in ['1', '2', '3', '4', '5', '6', '7', '8', '9']" 
          :key="num"
          type="button" 
          class="key-btn number-key"
          @click="emit('digit', num)"
        >
          <span>{{ num }}</span>
        </button>

        <!-- Bottom Row: Clear | 0 | Backspace -->
        <button type="button" class="key-btn action-key clear-key" @click="emit('clear')">
          <span>{{ t('Clear') }}</span>
        </button>

        <button type="button" class="key-btn number-key zero-key" @click="emit('digit', '0')">
          <span>0</span>
        </button>

        <button type="button" class="key-btn action-key backspace-key" aria-label="Delete" @click="emit('backspace')">
          <svg viewBox="0 0 24 24" class="backspace-icon">
            <path fill="currentColor" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Security Notice Footer (From Mockup) -->
    <div class="security-notice-box">
      <i class="pi pi-lock lock-icon"></i>
      <p>{{ t('Verification code is for your use only, do not share it with anyone.') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

defineProps<{
  codeLength: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'digit', val: string): void;
  (e: 'backspace'): void;
  (e: 'clear'): void;
  (e: 'confirm'): void;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.otp-action-and-keypad {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: auto;
  padding-bottom: 24px;
}

.confirm-continue-btn {
  width: 100%;
  height: 52px;
  border-radius: 18px;
  background: #39886f; // Matching mockup exact green button color
  color: #fff;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 6px 18px rgba(57, 136, 111, 0.3);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #2e6e5a;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .action-arrow {
    font-size: 0.95rem;
  }
}

.virtual-keypad {
  padding: 10px 10px 0;

  .keypad-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    direction: ltr; // Consistent keypad arrangement (1-2-3, 4-5-6, etc.)

    .key-btn {
      height: 58px;
      border-radius: 50%;
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      transition: all 0.15s ease;

      &:active {
        background: var(--unity-border-light);
        transform: scale(0.94);
      }

      &.number-key {
        font-size: 1.55rem;
        font-weight: 500;
        color: var(--unity-text-main);
      }

      &.zero-key {
        background: #fff;
        border: 1px solid var(--unity-border);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        width: 70px;
        height: 70px;
        border-radius: 50%;
        margin: 0 auto;
        font-size: 1.6rem;
      }

      &.action-key {
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--unity-text-muted);

        &.clear-key {
          font-family: inherit;
        }

        .backspace-icon {
          width: 24px;
          height: 24px;
          color: var(--unity-text-muted);
        }
      }
    }
  }
}

.security-notice-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  padding: 0 10px;

  .lock-icon {
    font-size: 0.95rem;
    color: #047857;
    flex-shrink: 0;
  }

  p {
    font-size: 0.72rem;
    color: var(--unity-text-dim);
    line-height: 1.4;
  }
}
</style>
