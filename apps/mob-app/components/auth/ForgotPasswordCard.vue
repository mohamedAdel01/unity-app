<template>
  <div class="forgot-card-container">
    <!-- Step Progress Indicator -->
    <div class="step-indicator-bar">
      <div class="step-pill" :class="{ 'active': currentStep >= 1, 'completed': currentStep > 1 }">
        <span class="step-num">1</span>
        <span class="step-name">{{ t('Phone Number') }}</span>
      </div>
      <div class="step-connector" :class="{ 'active': currentStep >= 2 }"></div>
      <div class="step-pill" :class="{ 'active': currentStep >= 2, 'completed': currentStep > 2 }">
        <span class="step-num">2</span>
        <span class="step-name">{{ t('Verification Code') }}</span>
      </div>
      <div class="step-connector" :class="{ 'active': currentStep >= 3 }"></div>
      <div class="step-pill" :class="{ 'active': currentStep >= 3 }">
        <span class="step-num">3</span>
        <span class="step-name">{{ t('New Password') }}</span>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- STEP 1: Phone Number Input                      -->
    <!-- ============================================== -->
    <form v-if="currentStep === 1" class="step-form-body" autocomplete="off" @submit.prevent="handleRequestOtp">
      <div class="step-info-header">
        <div class="step-icon-circle">
          <i class="pi pi-phone"></i>
        </div>
        <h4 class="step-title">{{ t('Forgot Password?') }}</h4>
        <p class="step-description">
          {{ t('Enter your registered phone number to receive a verification code.') }}
        </p>
      </div>

      <div class="input-field-group">
        <label class="field-label">{{ t('Phone Number') }}</label>
        <AppPhoneInput 
          v-model="phone"
          :required="true"
          @valid="val => isPhoneValid = val"
        />
      </div>

      <button 
        type="submit" 
        class="submit-action-btn" 
        :disabled="loading || !phone || !isPhoneValid"
      >
        <i v-if="loading" class="pi pi-spin pi-spinner"></i>
        <span v-else>{{ t('Send Verification Code') }}</span>
        <i :class="[isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right', 'btn-arrow']"></i>
      </button>

      <div class="back-link-row">
        <NuxtLink to="/auth/login" class="back-link">
          <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
          <span>{{ t('Back to Sign In') }}</span>
        </NuxtLink>
      </div>
    </form>

    <!-- ============================================== -->
    <!-- STEP 2: Verify OTP                             -->
    <!-- ============================================== -->
    <form v-else-if="currentStep === 2" class="step-form-body" autocomplete="off" @submit.prevent="handleVerifyOtp">
      <div class="step-info-header">
        <div class="step-icon-circle accent-green">
          <i class="pi pi-shield"></i>
        </div>
        <h4 class="step-title">{{ t('Verification Code') }}</h4>
        <p class="step-description">
          {{ t('Enter the 6-digit code sent to') }}
          <strong class="phone-highlight ltr-inline">{{ phone }}</strong>
        </p>
      </div>

      <!-- 6-digit OTP Box -->
      <div class="otp-inputs-row" dir="ltr">
        <input 
          v-for="idx in 6"
          :key="idx"
          :ref="el => otpInputRefs[idx - 1] = el"
          v-model="otpDigits[idx - 1]"
          type="tel"
          maxlength="1"
          class="otp-digit-input"
          :class="{ 'filled': !!otpDigits[idx - 1] }"
          autocomplete="one-time-code"
          @input="onOtpInput(idx - 1, $event)"
          @keydown="onOtpKeydown(idx - 1, $event)"
          @paste="onOtpPaste"
        />
      </div>

      <div class="resend-countdown-row">
        <span v-if="resendCountdown > 0" class="countdown-text">
          <i class="pi pi-clock"></i>
          {{ t('Resend code in') }} <strong>{{ resendCountdown }}s</strong>
        </span>
        <button 
          v-else 
          type="button" 
          class="btn-resend" 
          :disabled="loading"
          @click="handleRequestOtp"
        >
          <i class="pi pi-refresh"></i>
          <span>{{ t('Resend Code') }}</span>
        </button>
      </div>

      <button 
        type="submit" 
        class="submit-action-btn" 
        :disabled="loading || fullOtp.length !== 6"
      >
        <i v-if="loading" class="pi pi-spin pi-spinner"></i>
        <span v-else>{{ t('Verify Code') }}</span>
        <i :class="[isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right', 'btn-arrow']"></i>
      </button>

      <div class="back-link-row">
        <button type="button" class="back-btn" @click="currentStep = 1">
          <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
          <span>{{ t('Change Phone Number') || t('Back') }}</span>
        </button>
      </div>
    </form>

    <!-- ============================================== -->
    <!-- STEP 3: Set New Password                       -->
    <!-- ============================================== -->
    <form v-else class="step-form-body" autocomplete="off" @submit.prevent="handleResetPassword">
      <div class="step-info-header">
        <div class="step-icon-circle accent-emerald">
          <i class="pi pi-lock"></i>
        </div>
        <h4 class="step-title">{{ t('Set New Password') }}</h4>
        <p class="step-description">
          {{ t('Enter your new password below.') }}
        </p>
      </div>

      <!-- New Password -->
      <div class="input-field-group">
        <label class="field-label">{{ t('New Password') }}</label>
        <div class="input-shell">
          <i class="pi pi-lock field-icon"></i>
          <input 
            v-model="newPassword" 
            :type="showNewPassword ? 'text' : 'password'" 
            placeholder="••••••••" 
            required 
            minlength="6"
            autocomplete="new-password"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
            data-form-type="other"
          />
          <button 
            type="button" 
            class="eye-toggle-btn" 
            :aria-label="showNewPassword ? 'Hide' : 'Show'" 
            @click="showNewPassword = !showNewPassword"
          >
            <i :class="showNewPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
          </button>
        </div>
      </div>

      <!-- Confirm New Password -->
      <div class="input-field-group">
        <label class="field-label">{{ t('Confirm New Password') }}</label>
        <div class="input-shell" :class="{ 'is-error': confirmPassword && newPassword !== confirmPassword }">
          <i class="pi pi-check-circle field-icon"></i>
          <input 
            v-model="confirmPassword" 
            :type="showConfirmPassword ? 'text' : 'password'" 
            placeholder="••••••••" 
            required 
            minlength="6"
            autocomplete="new-password"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
            data-form-type="other"
          />
          <button 
            type="button" 
            class="eye-toggle-btn" 
            :aria-label="showConfirmPassword ? 'Hide' : 'Show'" 
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
          </button>
        </div>
        <span v-if="confirmPassword && newPassword !== confirmPassword" class="error-hint">
          {{ t('Passwords do not match') }}
        </span>
      </div>

      <button 
        type="submit" 
        class="submit-action-btn" 
        :disabled="loading || newPassword.length < 6 || newPassword !== confirmPassword"
      >
        <i v-if="loading" class="pi pi-spin pi-spinner"></i>
        <span v-else>{{ t('Change Password') }}</span>
        <i :class="[isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right', 'btn-arrow']"></i>
      </button>

      <div class="back-link-row">
        <NuxtLink to="/auth/login" class="back-link">
          <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
          <span>{{ t('Back to Sign In') }}</span>
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';
import AppPhoneInput from '../common/AppPhoneInput.vue';

const router = useRouter();
const api = useUnityApi();
const { t, isRtl } = useI18n();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const currentStep = ref<1 | 2 | 3>(1);
const loading = ref(false);

// Step 1: Phone
const phone = ref('');
const isPhoneValid = ref(false);

// Step 2: OTP
const otpDigits = ref<string[]>(['', '', '', '', '', '']);
const otpInputRefs = ref<any[]>([]);
const resendCountdown = ref(0);
let countdownTimer: any = null;

// Step 3: New Password
const resetToken = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// 3. Computed (computed properties)
const fullOtp = computed(() => {
  return otpDigits.value.join('');
});

// 4. Methods (functions, handlers)
const startCountdown = (seconds = 60) => {
  clearInterval(countdownTimer);
  resendCountdown.value = seconds;
  countdownTimer = setInterval(() => {
    if (resendCountdown.value > 0) {
      resendCountdown.value--;
    } else {
      clearInterval(countdownTimer);
    }
  }, 1000);
};

// Step 1: Request OTP
const handleRequestOtp = async () => {
  if (!phone.value || !isPhoneValid.value || loading.value) return;

  loading.value = true;
  try {
    const res = await api.apiRequest({
      service: 'FORGOT_PASSWORD_REQUEST_OTP',
      payload: { phone: phone.value },
    });

    toast.success(res?.message || t('Verification code sent successfully'));
    if (res?.dev_otp) {
      // Auto-fill in dev mode for supreme convenience
      const digits = String(res.dev_otp).split('');
      otpDigits.value = digits.slice(0, 6);
    } else {
      otpDigits.value = ['', '', '', '', '', ''];
    }

    currentStep.value = 2;
    startCountdown(60);

    nextTick(() => {
      otpInputRefs.value[0]?.focus();
    });
  } catch (err: any) {
    toast.error(err?.message || t('Failed to send verification code'));
  } finally {
    loading.value = false;
  }
};

// Step 2: OTP Box Controls
const onOtpInput = (index: number, e: Event) => {
  const target = e.target as HTMLInputElement;
  const val = target.value.replace(/\D/g, '');
  otpDigits.value[index] = val ? val.slice(-1) : '';

  if (val && index < 5) {
    otpInputRefs.value[index + 1]?.focus();
  }
};

const onOtpKeydown = (index: number, e: KeyboardEvent) => {
  if (e.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpInputRefs.value[index - 1]?.focus();
  }
};

const onOtpPaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const pasteData = e.clipboardData?.getData('text') || '';
  const cleanDigits = pasteData.replace(/\D/g, '').slice(0, 6);
  if (!cleanDigits) return;

  for (let i = 0; i < 6; i++) {
    otpDigits.value[i] = cleanDigits[i] || '';
  }

  const focusIndex = Math.min(cleanDigits.length, 5);
  otpInputRefs.value[focusIndex]?.focus();
};

// Step 2: Verify OTP
const handleVerifyOtp = async () => {
  if (fullOtp.value.length !== 6 || loading.value) return;

  loading.value = true;
  try {
    const res = await api.apiRequest({
      service: 'FORGOT_PASSWORD_VERIFY_OTP',
      payload: {
        phone: phone.value,
        otp: fullOtp.value,
      },
    });

    if (res?.data?.reset_token) {
      resetToken.value = res.data.reset_token;
      toast.success(res?.message || t('Code verified successfully!'));
      currentStep.value = 3;
    } else {
      throw new Error(res?.message || 'Verification failed');
    }
  } catch (err: any) {
    toast.error(err?.message || t('Invalid verification code'));
  } finally {
    loading.value = false;
  }
};

// Step 3: Reset Password
const handleResetPassword = async () => {
  if (loading.value) return;

  if (newPassword.value.length < 6) {
    toast.error(t('Password must be at least 6 characters'));
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    toast.error(t('Passwords do not match'));
    return;
  }

  loading.value = true;
  try {
    const res = await api.apiRequest({
      service: 'FORGOT_PASSWORD_RESET',
      payload: {
        reset_token: resetToken.value,
        new_password: newPassword.value,
      },
    });

    toast.success(res?.message || t('Password reset successfully! Please sign in.'));
    router.push('/auth/login');
  } catch (err: any) {
    toast.error(err?.message || t('Failed to reset password. Please try again.'));
  } finally {
    loading.value = false;
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onBeforeUnmount(() => {
  clearInterval(countdownTimer);
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.forgot-card-container {
  width: 100%;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 24px;
  padding: 24px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}

// Step Progress Bar
.step-indicator-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  margin-bottom: 4px;

  .step-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0.5;
    transition: all 0.3s ease;

    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--unity-border);
      color: var(--unity-text-muted);
      font-size: 0.72rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step-name {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--unity-text-muted);

      @media (max-width: 360px) {
        display: none;
      }
    }

    &.active {
      opacity: 1;

      .step-num {
        background: var(--unity-primary);
        color: #ffffff;
      }

      .step-name {
        color: var(--unity-primary);
        font-weight: 700;
      }
    }

    &.completed {
      opacity: 1;

      .step-num {
        background: #059669;
        color: #ffffff;
      }

      .step-name {
        color: #059669;
      }
    }
  }

  .step-connector {
    flex: 1;
    height: 2px;
    background: var(--unity-border);
    margin: 0 8px;
    transition: background 0.3s ease;

    &.active {
      background: var(--unity-primary);
    }
  }
}

// Step Form Body
.step-form-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
}

.step-info-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  .step-icon-circle {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    background: #ecfdf5;
    color: #047857;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    margin-bottom: 4px;

    &.accent-green {
      background: #eff6ff;
      color: #2563eb;
    }

    &.accent-emerald {
      background: #f0fdf4;
      color: #16a34a;
    }
  }

  .step-title {
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--unity-text-main);
    margin: 0;
  }

  .step-description {
    font-size: 0.82rem;
    color: var(--unity-text-muted);
    margin: 0;
    line-height: 1.45;
    max-width: 320px;

    .phone-highlight {
      color: var(--unity-primary);
      font-weight: 700;
    }
  }
}

.input-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: start;

  .field-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--unity-text-main);
  }

  .input-shell {
    display: flex;
    align-items: center;
    height: 48px;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    border-radius: 14px;
    padding: 0 14px;
    transition: all 0.2s ease;

    &:focus-within {
      border-color: var(--unity-primary);
      background: var(--unity-surface);
      box-shadow: 0 0 0 3px var(--unity-primary-light);
    }

    &.is-error {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .field-icon {
      font-size: 1rem;
      color: var(--unity-text-dim);
      margin-inline-end: 10px;
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.88rem;
      color: var(--unity-text-main);
      font-family: inherit;

      &::placeholder {
        color: var(--unity-text-dim);
      }
    }

    .eye-toggle-btn {
      background: transparent;
      border: none;
      color: var(--unity-text-dim);
      font-size: 1rem;
      cursor: pointer;
      padding: 4px;
    }
  }

  .error-hint {
    font-size: 0.72rem;
    color: #ef4444;
    font-weight: 600;
  }
}

// 6-digit OTP Row
.otp-inputs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  margin: 6px 0;

  .otp-digit-input {
    flex: 1;
    height: 52px;
    border-radius: 14px;
    background: var(--unity-bg);
    border: 1.5px solid var(--unity-border);
    color: var(--unity-text-main);
    font-size: 1.35rem;
    font-weight: 800;
    text-align: center;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: var(--unity-primary);
      background: var(--unity-surface);
      box-shadow: 0 0 0 3px var(--unity-primary-light);
      transform: translateY(-2px);
    }

    &.filled {
      border-color: var(--unity-primary);
      background: var(--unity-surface);
    }
  }
}

.resend-countdown-row {
  display: flex;
  align-items: center;
  justify-content: center;

  .countdown-text {
    font-size: 0.78rem;
    color: var(--unity-text-dim);
    display: flex;
    align-items: center;
    gap: 6px;

    strong {
      color: var(--unity-primary);
    }
  }

  .btn-resend {
    background: transparent;
    border: none;
    color: var(--unity-primary);
    font-size: 0.8rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;

    &:hover:not(:disabled) {
      text-decoration: underline;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// Submit Button
.submit-action-btn {
  width: 100%;
  height: 50px;
  border-radius: 16px;
  background: var(--unity-primary);
  color: #fff;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 6px 18px rgba(4, 120, 87, 0.25);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--unity-primary-dark);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-arrow {
    font-size: 0.85rem;
  }
}

.back-link-row {
  display: flex;
  align-items: center;
  justify-content: center;

  .back-link,
  .back-btn {
    background: transparent;
    border: none;
    color: var(--unity-text-muted);
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--unity-primary);
    }
  }
}

.ltr-inline {
  direction: ltr;
  display: inline-block;
}
</style>

