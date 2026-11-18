<template>
  <div class="step-content otp-step-wrapper">
    <!-- Instruction Card -->
    <div class="otp-instruction-card">
      <div class="otp-instruction-icon">
        <i class="pi pi-shield"></i>
      </div>
      <div class="otp-instruction-text">
        <h6>{{ t('Enter the verification code sent to') }}</h6>
        <span class="phone-target" dir="ltr">{{ phone || '05XXXXXXXX' }}</span>
      </div>
      <button 
        type="button" 
        class="btn-change-phone" 
        :title="t('Edit number')" 
        @click="emit('change-phone')"
      >
        <i class="pi pi-pencil"></i>
      </button>
    </div>

    <!-- 4 PIN Digits Box Input -->
    <div class="otp-pin-boxes" dir="ltr" @paste="handleOtpPaste">
      <input 
        v-for="(digit, idx) in otpDigits" 
        :key="idx" 
        :ref="el => setOtpInputRef(el, idx)"
        v-model="otpDigits[idx]" 
        type="tel" 
        inputmode="numeric" 
        pattern="[0-9]*" 
        maxlength="1" 
        class="otp-digit-input" 
        :class="{ 'filled': !!otpDigits[idx] }"
        @input="onDigitInput($event, idx)"
        @keydown="onDigitKeydown($event, idx)"
        @focus="onDigitFocus(idx)"
      />
    </div>

    <!-- Resend Timer -->
    <div class="otp-resend-row">
      <span v-if="countdown > 0" class="resend-countdown">
        <i class="pi pi-clock"></i>
        <span>{{ t('Resend in') }} 00:{{ countdown < 10 ? '0' + countdown : countdown }}</span>
      </span>
      <button v-else type="button" class="btn-resend-active" @click="handleResendOtp">
        <i class="pi pi-refresh"></i>
        <span>{{ t('Resend Code') }}</span>
      </button>
    </div>

    <!-- Verification Hint -->
    <p class="otp-security-note">
      <i class="pi pi-info-circle"></i>
      <span>{{ t('Verification code is for your use only, do not share it with anyone.') }}</span>
    </p>

    <!-- Step 2 Verify Button -->
    <button 
      type="button" 
      class="nav-step-btn next-btn" 
      :disabled="!isOtpComplete || isVerifyingOtp"
      @click="handleVerifyOtp"
    >
      <i v-if="isVerifyingOtp" class="pi pi-spin pi-spinner"></i>
      <template v-else>
        <span>{{ t('Confirm & Continue') }}</span>
        <i :class="[isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right', 'btn-arrow']"></i>
      </template>
    </button>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';

const props = defineProps<{
  phone: string;
}>();

const emit = defineEmits<{
  (e: 'verified'): void;
  (e: 'change-phone'): void;
}>();

const { t, isRtl } = useI18n();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const otpDigits = ref(['', '', '', '']);
const otpInputRefs = ref<(HTMLInputElement | null)[]>([]);
const isVerifyingOtp = ref(false);
const countdown = ref(45);
let timerInterval: any = null;

// 3. Computed (computed properties)
const isOtpComplete = computed(() => {
  return otpDigits.value.every(d => d.length === 1 && /^\d$/.test(d));
});

// 4. Methods (functions, handlers)
const setOtpInputRef = (el: any, index: number) => {
  otpInputRefs.value[index] = el;
};

const startOtpCountdown = () => {
  countdown.value = 45;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
};

const handleResendOtp = () => {
  otpDigits.value = ['', '', '', ''];
  startOtpCountdown();
  toast.success(t('Verification code resent successfully!'));
  nextTick(() => {
    otpInputRefs.value[0]?.focus();
  });
};

const onDigitInput = (e: Event, index: number) => {
  const input = e.target as HTMLInputElement;
  const val = input.value.slice(-1);
  otpDigits.value[index] = val;

  if (val && index < 3) {
    otpInputRefs.value[index + 1]?.focus();
  }

  if (isOtpComplete.value) {
    handleVerifyOtp();
  }
};

const onDigitKeydown = (e: KeyboardEvent, index: number) => {
  if (e.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputRefs.value[index - 1]?.focus();
  }
};

const onDigitFocus = (index: number) => {
  otpInputRefs.value[index]?.select();
};

const handleOtpPaste = (e: ClipboardEvent) => {
  const pasteData = e.clipboardData?.getData('text') || '';
  const digits = pasteData.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 0) {
    digits.split('').forEach((char, idx) => {
      if (idx < 4) otpDigits.value[idx] = char;
    });
    if (digits.length === 4) {
      handleVerifyOtp();
    } else {
      otpInputRefs.value[digits.length]?.focus();
    }
  }
};

const handleVerifyOtp = async () => {
  if (!isOtpComplete.value) return;

  try {
    isVerifyingOtp.value = true;
    await new Promise(r => setTimeout(r, 600));
    toast.success(t('Mobile number verified successfully!'));
    emit('verified');
  } catch (err: any) {
    toast.error(err.message || t('Invalid verification code'));
  } finally {
    isVerifyingOtp.value = false;
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  startOtpCountdown();
  nextTick(() => {
    otpInputRefs.value[0]?.focus();
  });
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.step-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.otp-instruction-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--unity-bg);
  border: 1.5px solid var(--unity-border);
  border-radius: 14px;
  padding: 10px 14px;

  .otp-instruction-icon {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(4, 120, 87, 0.08);
    color: var(--unity-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .otp-instruction-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;

    h6 {
      margin: 0;
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--unity-text-muted);
    }

    .phone-target {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--unity-text-main);
      letter-spacing: 0.5px;
    }
  }

  .btn-change-phone {
    background: none;
    border: none;
    color: var(--unity-primary);
    font-size: 0.9rem;
    padding: 6px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: rgba(4, 120, 87, 0.08);
    }
  }
}

.otp-pin-boxes {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 6px 0;

  .otp-digit-input {
    width: 52px;
    height: 56px;
    border-radius: 14px;
    border: 1.5px solid var(--unity-border);
    background: var(--unity-bg);
    text-align: center;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--unity-text-main);
    outline: none;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

    &:focus {
      border-color: var(--unity-primary);
      background: var(--unity-surface);
      box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
      transform: translateY(-2px);
    }

    &.filled {
      border-color: #10b981;
      background: var(--unity-surface);
    }
  }
}

.otp-resend-row {
  display: flex;
  justify-content: center;
  align-items: center;

  .resend-countdown {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--unity-text-muted);

    i {
      font-size: 0.85rem;
    }
  }

  .btn-resend-active {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--unity-primary);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 8px;
    transition: background 0.2s;

    &:hover {
      background: rgba(4, 120, 87, 0.08);
    }
  }
}

.otp-security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0;
  font-size: 0.72rem;
  color: var(--unity-text-muted);
  text-align: center;
  line-height: 1.3;

  i {
    font-size: 0.78rem;
  }
}

.nav-step-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  border-radius: 14px;
  font-size: 0.90rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &.next-btn {
    background: var(--unity-primary);
    color: #ffffff;
    width: 100%;
    margin-top: 4px;
    box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background: var(--unity-primary-dark);
    }
  }

  .btn-arrow {
    font-size: 0.85rem;
  }
}
</style>
