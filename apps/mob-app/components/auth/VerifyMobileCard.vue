<template>
  <div class="verify-card-container">
    <div class="verify-card-content">
      <div class="step-info-header">
        <div class="step-icon-circle accent-emerald">
          <i class="pi pi-shield"></i>
        </div>
        <h4 class="step-title">{{ t('Mobile Verification') }}</h4>
        <p class="step-description">
          {{ t('Enter the 6-digit code sent to') }}
          <strong class="phone-highlight" dir="ltr">{{ displayPhone }}</strong>
        </p>
      </div>

      <!-- 6-digit OTP Inputs -->
      <div class="otp-inputs-row" dir="ltr">
        <input
          v-for="idx in 6"
          :key="idx"
          :ref="el => otpInputRefs[idx - 1] = el"
          v-model="otpDigits[idx - 1]"
          type="tel"
          size="1"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          class="otp-digit-input"
          :class="{ 'filled': !!otpDigits[idx - 1] }"
          autocomplete="one-time-code"
          @input="onOtpInput(idx - 1, $event)"
          @keydown="onOtpKeydown(idx - 1, $event)"
          @paste="onOtpPaste"
        />
      </div>

      <!-- Resend Timer -->
      <div class="resend-countdown-row">
        <span v-if="resendCountdown > 0" class="countdown-text">
          <i class="pi pi-clock"></i>
          <span>{{ t('Resend code in') }} <strong>{{ resendCountdown }}s</strong></span>
        </span>
        <button
          v-else
          type="button"
          class="btn-resend"
          :disabled="isResending"
          @click="SEND_VERIFICATION_OTP"
        >
          <i v-if="isResending" class="pi pi-spin pi-spinner"></i>
          <i v-else class="pi pi-refresh"></i>
          <span>{{ t('Resend Code') }}</span>
        </button>
      </div>

      <!-- Security Note -->
      <p class="otp-security-note">
        <i class="pi pi-info-circle"></i>
        <span>{{ t('Verification code is for your use only, do not share it with anyone.') }}</span>
      </p>

      <!-- Submit Button -->
      <button
        type="button"
        class="submit-action-btn"
        :disabled="isSubmitting || fullOtp.length !== 6"
        @click="VERIFY_MOBILE_OTP"
      >
        <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
        <template v-else>
          <span>{{ t('Verify & Continue') }}</span>
          <i :class="[isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right', 'btn-arrow']"></i>
        </template>
      </button>

      <!-- Back to login / switch account -->
      <div class="back-link-row">
        <button type="button" class="back-btn" @click="handleSwitchAccount">
          <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
          <span>{{ t('Login with another account') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useAuthStore } from '../../stores/auth';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';

const { t, isRtl } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { apiRequest } = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const otpDigits = ref(['', '', '', '', '', '']);
const otpInputRefs = ref<any[]>([]);
const resendCountdown = ref(45);
const isSubmitting = ref(false);
const isResending = ref(false);
let timerInterval: any = null;

// 3. Computed (computed properties)
const phone = computed(() => {
  const queryPhone = route.query.phone as string;
  if (queryPhone) return queryPhone;
  return authStore.user?.phone || '';
});

const displayPhone = computed(() => {
  return phone.value || '05XXXXXXXX';
});

const fullOtp = computed(() => {
  return otpDigits.value.join('');
});

// 4. Methods (functions, handlers)
const startCountdown = () => {
  resendCountdown.value = 45;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (resendCountdown.value > 0) {
      resendCountdown.value--;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
};

const onOtpInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const val = input.value.slice(-1);
  otpDigits.value[index] = val;

  if (val && index < 5) {
    nextTick(() => {
      otpInputRefs.value[index + 1]?.focus();
    });
  }

  if (fullOtp.value.length === 6 && /^\d{6}$/.test(fullOtp.value)) {
    VERIFY_MOBILE_OTP();
  }
};

const onOtpKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputRefs.value[index - 1]?.focus();
  }
};

const onOtpPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pasteData = event.clipboardData?.getData('text') || '';
  const digits = pasteData.replace(/\D/g, '').slice(0, 6);
  if (digits.length > 0) {
    digits.split('').forEach((char, idx) => {
      if (idx < 6) otpDigits.value[idx] = char;
    });
    if (digits.length === 6) {
      VERIFY_MOBILE_OTP();
    } else {
      otpInputRefs.value[digits.length]?.focus();
    }
  }
};

const SEND_VERIFICATION_OTP = async () => {
  if (!phone.value) {
    toast.error(t('Please enter a valid phone with country code (e.g. +201012345678)'));
    return;
  }
  try {
    isResending.value = true;
    const res = await apiRequest({
      service: 'SEND_VERIFICATION_OTP',
      payload: { phone: phone.value },
    });
    if (res && res.status !== false) {
      startCountdown();
      toast.success(t('Verification code resent successfully!'));
      otpDigits.value = ['', '', '', '', '', ''];
      nextTick(() => {
        otpInputRefs.value[0]?.focus();
      });
    } else {
      toast.error(res?.message || t('Failed to send verification code'));
    }
  } catch (err: any) {
    toast.error(err.message || t('Failed to send verification code'));
  } finally {
    isResending.value = false;
  }
};

const VERIFY_MOBILE_OTP = async () => {
  if (fullOtp.value.length !== 6 || isSubmitting.value) return;

  try {
    isSubmitting.value = true;
    const res = await apiRequest({
      module: 'auth',
      service: 'VERIFY_MOBILE_OTP',
      payload: {
        phone: phone.value,
        otp: fullOtp.value,
      },
      pinia: true,
    });

    if (res && res.status) {
      toast.success(t('Mobile number verified successfully!'));

      if (res.data?.token && res.data?.user) {
        authStore.setAuth(res.data.user, res.data.token);
      } else if (authStore.user) {
        authStore.user.mobile_verified = true;
      }

      const redirectPath = (route.query.redirect as string) || '/';
      await router.replace(redirectPath);
    } else {
      toast.error(res?.message || t('Invalid verification code'));
    }
  } catch (err: any) {
    toast.error(err?.data?.message || err?.message || t('Invalid verification code'));
  } finally {
    isSubmitting.value = false;
  }
};

const handleSwitchAccount = async () => {
  await authStore.logout();
  router.replace('/auth/login');
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  if (authStore.isAuthenticated && authStore.user?.role === 'patient' && authStore.user?.mobile_verified === true) {
    router.replace('/');
    return;
  }
  startCountdown();
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
.verify-card-container {
  width: 100%;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  padding: 24px 20px;
  box-sizing: border-box;

  .verify-card-content {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
}

.step-info-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .step-icon-circle {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: rgba(65, 91, 46, 0.08);
    color: var(--unity-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    margin-bottom: 4px;
  }

  .step-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--unity-text-main);
    margin: 0;
  }

  .step-description {
    font-size: 0.88rem;
    color: var(--unity-text-muted);
    line-height: 1.5;
    margin: 0;
    max-width: 320px;

    .phone-highlight {
      color: var(--unity-primary);
      font-weight: 700;
      display: inline-block;
      margin: 0 4px;
    }
  }
}

.otp-inputs-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 6px 0;

  .otp-digit-input {
    width: 44px;
    height: 48px;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--unity-text-main);
    background: var(--unity-bg);
    border: 1.5px solid var(--unity-border);
    border-radius: 12px;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;

    &:focus {
      border-color: var(--unity-primary);
      background: var(--unity-surface);
      box-shadow: 0 0 0 3px rgba(65, 91, 46, 0.12);
    }

    &.filled {
      border-color: var(--unity-primary);
      background: var(--unity-surface);
    }
  }
}

.resend-countdown-row {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 36px;

  .countdown-text {
    font-size: 0.84rem;
    color: var(--unity-text-muted);
    display: flex;
    align-items: center;
    gap: 6px;

    i {
      font-size: 0.84rem;
    }

    strong {
      color: var(--unity-primary);
      font-weight: 600;
    }
  }

  .btn-resend {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: var(--unity-primary);
    font-size: 0.86rem;
    font-weight: 600;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 8px;
    transition: background 0.2s;

    &:hover:not(:disabled) {
      background: rgba(65, 91, 46, 0.08);
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      pointer-events: none;
    }
  }
}

.otp-security-note {
  font-size: 0.78rem;
  color: var(--unity-text-dim);
  text-align: center;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  line-height: 1.4;

  i {
    font-size: 0.85rem;
    flex-shrink: 0;
  }
}

.submit-action-btn {
  width: 100%;
  height: 48px;
  background: var(--unity-primary);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(65, 91, 46, 0.2);

  &:hover:not(:disabled) {
    filter: brightness(1.05);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
    box-shadow: none;
  }

  .btn-arrow {
    font-size: 0.82rem;
  }
}

.back-link-row {
  display: flex;
  justify-content: center;
  margin-top: 2px;

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: var(--unity-text-muted);
    font-size: 0.84rem;
    cursor: pointer;
    padding: 4px 8px;
    transition: color 0.2s;

    &:hover {
      color: var(--unity-text-main);
    }

    i {
      font-size: 0.78rem;
    }
  }
}
</style>
