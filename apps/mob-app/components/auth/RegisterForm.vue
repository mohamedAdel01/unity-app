<template>
  <div class="register-form-card">
    <!-- Step Progress Header -->
    <div class="step-progress-header">
      <div class="step-indicator-row">
        <div class="step-badge" :class="{ 'active': currentStep === 1, 'completed': currentStep > 1 }">
          <span v-if="currentStep > 1"><i class="pi pi-check"></i></span>
          <span v-else>1</span>
        </div>
        <div class="step-connector" :class="{ 'active': currentStep === 2 }"></div>
        <div class="step-badge" :class="{ 'active': currentStep === 2 }">
          <span>2</span>
        </div>
      </div>
      <div class="step-labels">
        <span class="step-title">
          {{ currentStep === 1 ? t('Step 1 of 2') : t('Step 2 of 2') }} • 
          {{ currentStep === 1 ? t('Account Information') : t('Personal Details') }}
        </span>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- STEP 1: Name, Email, Password                  -->
    <!-- Submits to create account immediately in DB    -->
    <!-- ============================================== -->
    <form v-if="currentStep === 1" class="step-content" @submit.prevent="handleStep1Submit">
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
          />
          <button type="button" class="eye-toggle-btn" :aria-label="showPassword ? 'Hide' : 'Show'" @click="showPassword = !showPassword">
            <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
          </button>
        </div>
      </div>

      <!-- Step 1 Submit Button (Registers User in DB) -->
      <button 
        type="submit" 
        class="nav-step-btn next-btn" 
        :disabled="!isStep1Valid || globalStore.loading.includes('register')"
      >
        <i v-if="globalStore.loading.includes('register')" class="pi pi-spin pi-spinner"></i>
        <template v-else>
          <span>{{ t('Continue') }}</span>
          <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'" class="btn-arrow"></i>
        </template>
      </button>
    </form>

    <!-- ============================================== -->
    <!-- STEP 2: Phone, Gender, Avatar, Date of Birth   -->
    <!-- Optional: User can Save or Skip                -->
    <!-- ============================================== -->
    <div v-else class="step-content">
      <!-- Success Note: Account already created -->
      <div class="account-created-banner">
        <i class="pi pi-check-circle"></i>
        <div>
          <h6>{{ t('Account Created Successfully!') }}</h6>
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
            :class="{ 'selected': step2Form.gender === 'male' }"
            @click="step2Form.gender = 'male'"
          >
            <i class="pi pi-user"></i>
            <span>{{ t('Male') }}</span>
          </button>
          <button 
            type="button" 
            class="gender-pill" 
            :class="{ 'selected': step2Form.gender === 'female' }"
            @click="step2Form.gender = 'female'"
          >
            <i class="pi pi-heart"></i>
            <span>{{ t('Female') }}</span>
          </button>
        </div>
      </div>

      <!-- Date of Birth -->
      <div class="input-field-group">
        <label class="field-label">{{ t('Date of Birth') }}</label>
        <AppDatePickerModal v-model="step2Form.date_of_birth" />
      </div>

      <!-- Avatar Upload & Selection -->
      <div class="input-field-group">
        <label class="field-label">{{ isRtl ? 'الصورة الشخصية' : 'Profile Picture' }}</label>
        
        <!-- Upload Card with circular preview & upload button -->
        <div class="avatar-upload-card">
          <div class="avatar-preview-wrapper" @click="triggerFileUpload">
            <img :src="step2Form.avatar" alt="User avatar" class="avatar-preview-img" />
            <div class="camera-badge" :title="isRtl ? 'تغيير الصورة' : 'Change Photo'">
              <i class="pi pi-camera"></i>
            </div>
          </div>

          <div class="upload-info">
            <button type="button" class="btn-choose-file" @click="triggerFileUpload">
              <i class="pi pi-upload"></i>
              <span>{{ isRtl ? 'رفع صورة من جهازك' : 'Upload from device' }}</span>
            </button>
            <small class="upload-hint">{{ isRtl ? 'يدعم JPG, PNG (يتم حفظها في السيرفر)' : 'Supports JPG, PNG (saved on server)' }}</small>
            <input 
              ref="fileInputRef" 
              type="file" 
              accept="image/*" 
              class="hidden-file-input" 
              @change="onAvatarFileChange" 
            />
          </div>
        </div>

        <!-- Optional preset avatars -->
        <div class="preset-avatars-label">
          <small>{{ isRtl ? 'أو اختر من الرموز الجاهزة:' : 'Or choose a preset avatar:' }}</small>
        </div>
        <div class="avatar-choices-row">
          <button 
            v-for="(avatarUrl, idx) in presetAvatars" 
            :key="idx" 
            type="button"
            class="avatar-choice-btn"
            :class="{ 'selected': step2Form.avatar === avatarUrl }"
            @click="step2Form.avatar = avatarUrl"
          >
            <img :src="avatarUrl" alt="Avatar option" />
            <span v-if="step2Form.avatar === avatarUrl" class="check-overlay">
              <i class="pi pi-check"></i>
            </span>
          </button>
        </div>
      </div>

      <!-- Step 2 Action Buttons (Save or Skip) -->
      <div class="step-buttons-row">
        <!-- Skip Button: Account is already created! -->
        <button 
          type="button" 
          class="nav-step-btn skip-btn" 
          @click="handleSkipStep2"
        >
          <span>{{ t('Skip for now') }}</span>
        </button>

        <!-- Save Button: Updates Profile -->
        <button 
          type="button" 
          class="nav-step-btn submit-btn" 
          :disabled="globalStore.loading.includes('completeRegistration')"
          @click="handleStep2Submit"
        >
          <i v-if="globalStore.loading.includes('completeRegistration')" class="pi pi-spin pi-spinner"></i>
          <span v-else>{{ t('Save & Continue') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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
});

// Trigger file input dialog
const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

// Handle avatar image upload & client-side compression
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
      // Scale down image to max 600px dimension for fast network upload
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
      step2Form.value.avatar = canvas.toDataURL('image/jpeg', 0.88);
      toast.success(isRtl.value ? 'تم تحديد صورتك الشخصية وجاهزة للحفظ بالسيرفر!' : 'Avatar selected and ready to save!');
    };
    img.src = rawResult;
  };
  reader.readAsDataURL(file);
};

const presetAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
];

// Step 1 Form
const step1Form = ref({
  name: '',
  phone: '',
  password: '',
});

// Step 2 Form
const step2Form = ref({
  gender: 'male',
  avatar: presetAvatars[0],
  date_of_birth: '1995-05-15',
});

const isPhoneValid = ref(false);

const isStep1Valid = computed(() => {
  return (
    step1Form.value.name.trim().length >= 2 &&
    isPhoneValid.value &&
    step1Form.value.password.length >= 6
  );
});

// Handle Step 1: Creates the account immediately in the database
const handleStep1Submit = async () => {
  if (!isStep1Valid.value) return;

  try {
    globalStore.setLoading(['register', true]);
    await api.register({
      name: step1Form.value.name.trim(),
      phone: step1Form.value.phone.trim(),
      password: step1Form.value.password,
    });

    // Account created and authenticated successfully! Advance to Step 2
    toast.success('تم إنشاء الحساب بنجاح! يمكنك الآن استكمال بياناتك الشخصية.');
    currentStep.value = 2;
  } catch (err: any) {
    toast.error(err.message || 'تعذر إنشاء الحساب');
  } finally {
    globalStore.setLoading(['register', false]);
  }
};

// Handle Step 2: Updates the created user's profile via Step 2 Route
const handleStep2Submit = async () => {
  try {
    globalStore.setLoading(['completeRegistration', true]);
    await api.completeRegistration({
      gender: step2Form.value.gender,
      avatar: step2Form.value.avatar,
      date_of_birth: step2Form.value.date_of_birth,
    });

    toast.success('تم حفظ وتحديث بيانات الملف الشخصي بنجاح!');
    // Navigate to home dashboard
    router.push('/');
  } catch (err: any) {
    toast.warning(err.message || 'تعذر تحديث البيانات الإضافية');
    // If update fails, user can still proceed since account is created
    router.push('/');
  } finally {
    globalStore.setLoading(['completeRegistration', false]);
  }
};

// Handle Skip Step 2: User already has account, jump straight to home dashboard
const handleSkipStep2 = () => {
  router.push('/');
};
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
    width: 140px;
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
      background: var(--unity-primary);
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
    margin-bottom: 6px;
  }

  .field-error-hint {
    color: #dc2626;
    font-size: 0.72rem;
    font-weight: 500;
    margin-top: -2px;
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

    &.is-invalid {
      border-color: #ef4444 !important;
      background: #fff8f8;
    }

    .valid-phone-badge {
      color: #10b981;
      font-size: 1.1rem;
      margin-inline-start: 6px;
      display: flex;
      align-items: center;
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

// Gender selector
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

// Avatar Upload Card & Controls
.avatar-upload-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--unity-surface-muted, #f8fafc);
  border: 1.5px dashed var(--unity-border, #cbd5e1);
  border-radius: 18px;
  padding: 14px 16px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--unity-primary);
  }

  .avatar-preview-wrapper {
    position: relative;
    width: 68px;
    height: 68px;
    flex-shrink: 0;
    cursor: pointer;

    .avatar-preview-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--unity-primary);
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.2);
    }

    .camera-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--unity-primary);
      color: #ffffff;
      font-size: 0.72rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
  }

  .upload-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .btn-choose-file {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 38px;
      padding: 0 14px;
      border-radius: 10px;
      background: var(--unity-surface, #ffffff);
      border: 1px solid var(--unity-border);
      color: var(--unity-primary-dark);
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;

      i {
        font-size: 0.85rem;
        color: var(--unity-primary);
      }

      &:hover {
        background: var(--unity-primary-light);
        border-color: var(--unity-primary);
      }
    }

    .upload-hint {
      font-size: 0.68rem;
      color: var(--unity-text-dim, #94a3b8);
      font-weight: 500;
    }

    .hidden-file-input {
      display: none;
    }
  }
}

.preset-avatars-label {
  margin-top: 6px;
  small {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--unity-text-muted);
  }
}

// Avatar Choices
.avatar-choices-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  .avatar-choice-btn {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid transparent;
    padding: 2px;
    background: transparent;
    cursor: pointer;
    transition: transform 0.2s;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    &.selected {
      border-color: var(--unity-primary);
      transform: scale(1.08);

      .check-overlay {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--unity-primary);
        color: #ffffff;
        font-size: 0.65rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
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
    margin-top: 6px;

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
  margin-top: 6px;

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
