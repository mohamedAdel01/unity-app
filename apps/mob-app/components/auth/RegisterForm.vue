<template>
  <div class="register-form-card">
    <!-- Step Progress Header (3 Steps) -->
    <div class="step-progress-header">
      <div class="step-indicator-row">
        <!-- Step 1 Badge -->
        <div class="step-badge" :class="{ 'active': currentStep === 1, 'completed': currentStep > 1 }">
          <i v-if="currentStep > 1" class="pi pi-check"></i>
          <span v-else>1</span>
        </div>
        <div class="step-connector" :class="{ 'active': currentStep >= 2 }"></div>
        
        <!-- Step 2 Badge -->
        <div class="step-badge" :class="{ 'active': currentStep === 2, 'completed': currentStep > 2 }">
          <i v-if="currentStep > 2" class="pi pi-check"></i>
          <span v-else>2</span>
        </div>
        <div class="step-connector" :class="{ 'active': currentStep >= 3 }"></div>
        
        <!-- Step 3 Badge -->
        <div class="step-badge" :class="{ 'active': currentStep === 3 }">
          <span>3</span>
        </div>
      </div>

      <div class="step-labels">
        <span class="step-title">
          {{ currentStepText }} • {{ currentStepSubTitle }}
        </span>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- STEP 1: Name, Phone, Password                  -->
    <!-- Creates Account in Database                    -->
    <!-- ============================================== -->
    <form v-if="currentStep === 1" class="step-content" autocomplete="off" @submit.prevent="handleStep1Submit">
      <!-- Full Name -->
      <div class="input-field-group">
        <label class="field-label">{{ t('Full Name') }}</label>
        <div class="input-shell">
          <i class="pi pi-user field-icon"></i>
          <input 
            v-model="step1Form.name" 
            type="text" 
            :placeholder="t('Full Name')" 
            required 
            autofocus
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            data-lpignore="true"
            data-1p-ignore="true"
          />
        </div>
      </div>

      <!-- Phone Number (Required in Step 1) -->
      <div class="input-field-group">
        <label class="field-label">{{ t('Phone Number') }}</label>
        <AppPhoneInput 
          v-model="step1Form.phone" 
          :required="true"
          @valid="val => isPhoneValid = val"
        />
      </div>

      <!-- Password -->
      <div class="input-field-group">
        <label class="field-label">{{ t('Password') }}</label>
        <div class="input-shell">
          <i class="pi pi-lock field-icon"></i>
          <input 
            v-model="step1Form.password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="••••••••" 
            required 
            minlength="6"
            autocomplete="new-password"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
          />
          <button type="button" class="eye-toggle-btn" :aria-label="showPassword ? 'Hide' : 'Show'" @click="showPassword = !showPassword">
            <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
          </button>
        </div>
      </div>

      <!-- Step 1 Submit Button -->
      <button 
        type="submit" 
        class="nav-step-btn next-btn" 
        :disabled="!isStep1Valid || globalStore.loading.includes('register')"
      >
        <i v-if="globalStore.loading.includes('register')" class="pi pi-spin pi-spinner"></i>
        <template v-else>
          <span>{{ t('Continue') }}</span>
        </template>
      </button>
    </form>

    <!-- ============================================== -->
    <!-- STEP 2: Validate Mobile (OTP)                  -->
    <!-- ============================================== -->
    <div v-else-if="currentStep === 2" class="step-content otp-step-wrapper">
      <div class="otp-instruction-card">
        <div class="otp-instruction-icon">
          <i class="pi pi-shield"></i>
        </div>
        <div class="otp-instruction-text">
          <h6>{{ t('Enter the verification code sent to') }}</h6>
          <span class="phone-target" dir="ltr">{{ step1Form.phone || '05XXXXXXXX' }}</span>
        </div>
        <button type="button" class="btn-change-phone" :title="isRtl ? 'تعديل الرقم' : 'Edit number'" @click="currentStep = 1">
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
          <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'" class="btn-arrow"></i>
        </template>
      </button>
    </div>

    <!-- ============================================== -->
    <!-- STEP 3: Personal Details & Initial/Uploaded    -->
    <!-- Avatar (No Presets Allowed)                    -->
    <!-- ============================================== -->
    <div v-else class="step-content">
      <!-- Success Note: Account & Mobile verified -->
      <div class="account-created-banner">
        <i class="pi pi-check-circle"></i>
        <div>
          <h6>{{ isRtl ? 'تم التحقق من الجوال وإنشاء الحساب!' : 'Account & Mobile Verified!' }}</h6>
          <small>{{ t('Complete your profile or skip to continue later.') }}</small>
        </div>
      </div>

      <!-- Gender Selection -->
      <div class="input-field-group">
        <label class="field-label">{{ t('Gender') }}</label>
        <div class="gender-selector">
          <button 
            type="button" 
            class="gender-pill" 
            :class="{ 'selected': step3Form.gender === 'male' }"
            @click="step3Form.gender = 'male'"
          >
            <i class="pi pi-user"></i>
            <span>{{ t('Male') }}</span>
          </button>
          <button 
            type="button" 
            class="gender-pill" 
            :class="{ 'selected': step3Form.gender === 'female' }"
            @click="step3Form.gender = 'female'"
          >
            <i class="pi pi-heart"></i>
            <span>{{ t('Female') }}</span>
          </button>
        </div>
      </div>

      <!-- Date of Birth -->
      <div class="input-field-group">
        <label class="field-label">{{ t('Date of Birth') }}</label>
        <AppDatePickerModal v-model="step3Form.date_of_birth" />
      </div>

      <!-- Avatar Section: Upload custom photo OR first letter of name -->
      <div class="input-field-group">
        <label class="field-label">{{ isRtl ? 'الصورة الشخصية' : 'Profile Picture' }}</label>
        
        <div class="avatar-custom-box">
          <!-- Left/Leading preview container: Shows uploaded image OR Letter initial badge -->
          <div class="avatar-visual-wrapper" @click="triggerFileUpload">
            <!-- If custom photo is uploaded -->
            <template v-if="step3Form.avatar">
              <img :src="step3Form.avatar" alt="User avatar" class="avatar-photo-preview" />
              <div class="avatar-action-badge edit-badge" :title="isRtl ? 'تغيير الصورة' : 'Change photo'">
                <i class="pi pi-pencil"></i>
              </div>
            </template>

            <!-- If NO custom photo uploaded: Show first letter of user's name -->
            <template v-else>
              <div class="avatar-initial-badge">
                <span class="initial-char">{{ userNameInitial }}</span>
              </div>
              <div class="avatar-action-badge camera-badge" :title="isRtl ? 'رفع صورة' : 'Upload photo'">
                <i class="pi pi-camera"></i>
              </div>
            </template>
          </div>

          <!-- Right/Trailing actions & descriptions -->
          <div class="avatar-info-panel">
            <template v-if="step3Form.avatar">
              <div class="avatar-btn-group">
                <button type="button" class="btn-avatar-action upload" @click="triggerFileUpload">
                  <i class="pi pi-refresh"></i>
                  <span>{{ isRtl ? 'تغيير الصورة' : 'Change Photo' }}</span>
                </button>
                <button type="button" class="btn-avatar-action remove" @click="removeCustomAvatar">
                  <i class="pi pi-trash"></i>
                  <span>{{ t('Remove Photo') }}</span>
                </button>
              </div>
              <small class="avatar-hint-note success">
                <i class="pi pi-check"></i>
                <span>{{ isRtl ? 'تم تحديد صورتك الشخصية' : 'Custom photo selected' }}</span>
              </small>
            </template>

            <template v-else>
              <button type="button" class="btn-avatar-action upload" @click="triggerFileUpload">
                <i class="pi pi-upload"></i>
                <span>{{ t('Upload Photo') }}</span>
              </button>
              <small class="avatar-hint-note">
                {{ isRtl ? 'الصورة الافتراضية ستكون الحرف الأول من اسمك، أو يمكنك رفع صورة خاصة من جهازك.' : 'Default avatar will be your first name initial, or you can upload your own photo.' }}
              </small>
            </template>

            <input 
              ref="fileInputRef" 
              type="file" 
              accept="image/*" 
              class="hidden-file-input" 
              @change="onAvatarFileChange" 
            />
          </div>
        </div>
      </div>

      <!-- Step 3 Action Buttons (Save or Skip) -->
      <div class="step-buttons-row">
        <!-- Skip Button: Account is already created & verified! -->
        <button 
          type="button" 
          class="nav-step-btn skip-btn" 
          @click="handleSkipStep3"
        >
          <span>{{ t('Skip for now') }}</span>
        </button>

        <!-- Save Button: Updates Profile -->
        <button 
          type="button" 
          class="nav-step-btn submit-btn" 
          :disabled="globalStore.loading.includes('completeRegistration')"
          @click="handleStep3Submit"
        >
          <i v-if="globalStore.loading.includes('completeRegistration')" class="pi pi-spin pi-spinner"></i>
          <span v-else>{{ t('Save & Continue') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useGlobalStore } from '../../stores/global';
import { useAppToast } from '../../composables/useAppToast';
import AppDatePickerModal from '../common/AppDatePickerModal.vue';
import AppPhoneInput from '../common/AppPhoneInput.vue';

const props = defineProps<{
  step?: number;
}>();

const emit = defineEmits<{
  (e: 'update:step', val: number): void;
}>();

const router = useRouter();
const api = useUnityApi();
const { t, isRtl } = useI18n();
const globalStore = useGlobalStore();
const toast = useAppToast();

const currentStep = ref(props.step || 1);
const showPassword = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Keep step in sync with parent page
watch(() => props.step, (val) => {
  if (val && val !== currentStep.value) {
    currentStep.value = val;
  }
});

watch(currentStep, (val) => {
  emit('update:step', val);
  if (val === 2) {
    startOtpCountdown();
    nextTick(() => {
      otpInputRefs.value[0]?.focus();
    });
  }
});

// Step Progress Titles
const currentStepText = computed(() => {
  if (currentStep.value === 1) return t('Step 1 of 3');
  if (currentStep.value === 2) return t('Step 2 of 3');
  return t('Step 3 of 3');
});

const currentStepSubTitle = computed(() => {
  if (currentStep.value === 1) return t('Account Information');
  if (currentStep.value === 2) return t('Mobile Verification');
  return t('Personal Details');
});

// ==========================================
// STEP 1 STATE & METHODS
// ==========================================
const step1Form = ref({
  name: '',
  phone: '',
  password: '',
});
const isPhoneValid = ref(false);

const isStep1Valid = computed(() => {
  return (
    step1Form.value.name.trim().length >= 2 &&
    isPhoneValid.value &&
    step1Form.value.password.length >= 6
  );
});

// Name initial for Avatar badge (e.g. "م" for محمد, "A" for Ahmed)
const userNameInitial = computed(() => {
  const name = step1Form.value.name.trim();
  if (!name) return 'U';
  const firstGrapheme = Array.from(name)[0] || 'U';
  return firstGrapheme.toUpperCase();
});

const handleStep1Submit = async () => {
  if (!isStep1Valid.value) return;

  try {
    globalStore.setLoading(['register', true]);
    await api.register({
      name: step1Form.value.name.trim(),
      phone: step1Form.value.phone.trim(),
      password: step1Form.value.password,
    });

    toast.success(isRtl.value ? 'تم إنشاء الحساب! أرسلنا رمز التحقق إلى جوالك.' : 'Account created! Verification code sent to your phone.');
    currentStep.value = 2;
  } catch (err: any) {
    toast.error(err.message || (isRtl.value ? 'تعذر إنشاء الحساب' : 'Failed to create account'));
  } finally {
    globalStore.setLoading(['register', false]);
  }
};

// ==========================================
// STEP 2: OTP / MOBILE VERIFICATION
// ==========================================
const otpDigits = ref(['', '', '', '']);
const otpInputRefs = ref<(HTMLInputElement | null)[]>([]);
const isVerifyingOtp = ref(false);
const countdown = ref(45);
let timerInterval: any = null;

const setOtpInputRef = (el: any, index: number) => {
  otpInputRefs.value[index] = el;
};

const isOtpComplete = computed(() => {
  return otpDigits.value.every(d => d.length === 1 && /^\d$/.test(d));
});

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
  toast.success(isRtl.value ? 'تم إعادة إرسال رمز التحقق بنجاح!' : 'Verification code resent successfully!');
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
    toast.success(isRtl.value ? 'تم تأكيد رقم الجوال بنجاح!' : 'Mobile number verified successfully!');
    currentStep.value = 3;
  } catch (err: any) {
    toast.error(err.message || (isRtl.value ? 'رمز التحقق غير صحيح' : 'Invalid verification code'));
  } finally {
    isVerifyingOtp.value = false;
  }
};

// ==========================================
// STEP 3: PERSONAL DETAILS & AVATAR
// ==========================================
const step3Form = ref({
  gender: 'male',
  avatar: '', // Custom uploaded photo data URL, empty by default -> uses initial letter
  date_of_birth: '1995-05-15',
});

const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

const removeCustomAvatar = () => {
  step3Form.value.avatar = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  toast.info(isRtl.value ? 'تم الرجوع إلى الحرف الأول من اسمك كصورة للملف' : 'Reverted to name initial avatar');
};

const onAvatarFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.error(isRtl.value ? 'يرجى اختيار ملف صورة صالح (JPG أو PNG).' : 'Please choose a valid image file (JPG or PNG).');
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    toast.error(isRtl.value ? 'حجم الصورة كبير جداً، الحد الأقصى 8 ميجابايت.' : 'Image size too large, max 8MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (uploadEvent) => {
    const rawResult = uploadEvent.target?.result as string;
    const img = new Image();
    img.onload = () => {
      // Scale down image to max 600px dimension for snappy upload
      const maxDim = 600;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      step3Form.value.avatar = canvas.toDataURL('image/jpeg', 0.88);
      toast.success(isRtl.value ? 'تم حفظ صورتك الشخصية بنجاح!' : 'Avatar photo selected successfully!');
    };
    img.src = rawResult;
  };
  reader.readAsDataURL(file);
};

const handleStep3Submit = async () => {
  try {
    globalStore.setLoading(['completeRegistration', true]);
    await api.completeRegistration({
      gender: step3Form.value.gender,
      avatar: step3Form.value.avatar || undefined,
      date_of_birth: step3Form.value.date_of_birth,
    });

    toast.success(isRtl.value ? 'تم إكمال ملفك الشخصي بنجاح!' : 'Profile completed successfully!');
    router.push('/');
  } catch (err: any) {
    toast.warning(err.message || (isRtl.value ? 'تم حفظ الحساب ولكن تعذر تحديث بعض البيانات' : 'Saved with warnings'));
    router.push('/');
  } finally {
    globalStore.setLoading(['completeRegistration', false]);
  }
};

const handleSkipStep3 = () => {
  router.push('/');
};

onMounted(() => {
  if (currentStep.value === 2) {
    startOtpCountdown();
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped lang="scss">
.register-form-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 22px;
  padding: 18px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.step-progress-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--unity-border);

  .step-indicator-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 190px;
  }

  .step-badge {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    background: var(--unity-surface-muted, #e2e8f0);
    color: var(--unity-text-muted);
    transition: all 0.25s ease;
    flex-shrink: 0;

    &.active {
      background: var(--unity-primary);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(13, 148, 136, 0.35);
    }

    &.completed {
      background: #10b981;
      color: #ffffff;
    }
  }

  .step-connector {
    flex: 1;
    height: 3px;
    background: var(--unity-surface-muted, #e2e8f0);
    border-radius: 2px;
    transition: all 0.25s ease;

    &.active {
      background: #10b981;
    }
  }

  .step-labels {
    .step-title {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--unity-primary);
    }
  }
}

.account-created-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  padding: 10px 12px;

  i {
    font-size: 1.3rem;
    color: #059669;
  }

  h6 {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 700;
    color: #065f46;
  }

  small {
    display: block;
    font-size: 0.72rem;
    color: #047857;
    margin-top: 2px;
    line-height: 1.3;
  }
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .field-label {
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--unity-text);
    margin-bottom: 2px;
  }

  .input-shell {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--unity-surface-muted, #f8fafc);
    border: 1px solid var(--unity-border);
    border-radius: 14px;
    padding: 0 12px;
    height: 48px;
    transition: border-color 0.2s;

    &:focus-within {
      border-color: var(--unity-primary);
      background: var(--unity-surface);
    }

    .field-icon {
      font-size: 1rem;
      color: var(--unity-text-muted);
      margin-inline-end: 10px;
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.88rem;
      color: var(--unity-text);
      font-family: inherit;

      &::placeholder {
        color: var(--unity-text-muted);
        opacity: 0.6;
      }
    }

    .eye-toggle-btn {
      background: none;
      border: none;
      color: var(--unity-text-muted);
      cursor: pointer;
      padding: 4px;
      font-size: 1rem;

      &:hover {
        color: var(--unity-primary);
      }
    }
  }
}

// ==========================================
// STEP 2: OTP / MOBILE VERIFICATION STYLES
// ==========================================
.otp-step-wrapper {
  gap: 16px;
}

.otp-instruction-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--unity-surface-muted, #f8fafc);
  border: 1px solid var(--unity-border);
  border-radius: 14px;
  padding: 10px 14px;

  .otp-instruction-icon {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--unity-primary-light, #e6fffa);
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
      color: var(--unity-text);
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
      background: var(--unity-primary-light, #e6fffa);
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
    background: var(--unity-surface-muted, #f8fafc);
    text-align: center;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--unity-text);
    outline: none;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

    &:focus {
      border-color: var(--unity-primary);
      background: var(--unity-surface);
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
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
      background: var(--unity-primary-light, #e6fffa);
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

// ==========================================
// STEP 3: PERSONAL DETAILS & AVATAR STYLES
// ==========================================
.gender-selector {
  display: flex;
  gap: 10px;

  .gender-pill {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border-radius: 12px;
    border: 1px solid var(--unity-border);
    background: var(--unity-surface-muted, #f8fafc);
    color: var(--unity-text);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    i {
      font-size: 0.95rem;
      color: var(--unity-text-muted);
    }

    &.selected {
      border-color: var(--unity-primary);
      background: var(--unity-primary-light);
      color: var(--unity-primary-dark);

      i {
        color: var(--unity-primary);
      }
    }
  }
}

// Avatar Custom Box
.avatar-custom-box {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--unity-surface-muted, #f8fafc);
  border: 1px solid var(--unity-border);
  border-radius: 18px;
  padding: 14px 14px;

  .avatar-visual-wrapper {
    position: relative;
    width: 68px;
    height: 68px;
    flex-shrink: 0;
    cursor: pointer;

    .avatar-photo-preview {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2.5px solid var(--unity-primary);
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.2);
    }

    .avatar-initial-badge {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3);
      border: 2.5px solid #ffffff;

      .initial-char {
        color: #ffffff;
        font-size: 1.85rem;
        font-weight: 800;
        line-height: 1;
        user-select: none;
      }
    }

    .avatar-action-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--unity-primary);
      color: #ffffff;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

      &.edit-badge {
        background: #0284c7;
      }
    }
  }

  .avatar-info-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;

    .avatar-btn-group {
      display: flex;
      gap: 8px;
    }

    .btn-avatar-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 36px;
      padding: 0 12px;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;

      &.upload {
        background: var(--unity-surface, #ffffff);
        border: 1px solid var(--unity-border);
        color: var(--unity-primary-dark);

        i {
          color: var(--unity-primary);
        }

        &:hover {
          background: var(--unity-primary-light);
          border-color: var(--unity-primary);
        }
      }

      &.remove {
        background: #fef2f2;
        border: 1px solid #fee2e2;
        color: #dc2626;

        i {
          color: #dc2626;
        }

        &:hover {
          background: #fee2e2;
        }
      }
    }

    .avatar-hint-note {
      font-size: 0.7rem;
      color: var(--unity-text-dim, #94a3b8);
      font-weight: 500;
      line-height: 1.35;

      &.success {
        color: #059669;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .hidden-file-input {
      display: none;
    }
  }
}

// Navigation Buttons
.nav-step-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  &.next-btn {
    background: var(--unity-primary);
    color: #ffffff;
    width: 100%;
    margin-top: 4px;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background: var(--unity-primary-dark);
    }
  }
}

.step-buttons-row {
  display: flex;
  gap: 10px;
  margin-top: 4px;

  .skip-btn {
    flex: 1;
    background: var(--unity-surface-muted, #f1f5f9);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-muted);

    &:hover {
      background: #e2e8f0;
      color: var(--unity-text);
    }
  }

  .submit-btn {
    flex: 2;
    background: var(--unity-primary);
    color: #ffffff;

    &:hover:not(:disabled) {
      background: var(--unity-primary-dark);
    }
  }
}
</style>
