<template>
  <div class="auth-page">
    <div class="auth-content-wrapper">
      <AuthHeader
        :title="headerTitle"
        :custom-back="true"
        @back="handleStepBack"
      />
      <div class="register-card-shell">
        <RegisterStepIndicator :current-step="currentStep" />
        <RegisterStep1Account 
          v-if="currentStep === 1" 
          :initial-data="registrationData"
          @success="handleStep1Success" 
        />
        <RegisterStep2Otp 
          v-else-if="currentStep === 2" 
          :phone="registrationData.phone" 
          @verified="handleStep2Verified" 
          @change-phone="handleStep2ChangePhone" 
        />
        <RegisterStep3Profile 
          v-else-if="currentStep === 3" 
          :user-name="registrationData.name" 
          @completed="handleRegistrationComplete" 
          @skip="handleRegistrationComplete" 
        />
      </div>
      <AuthFooterLink v-if="currentStep === 1" :is-register="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import AuthHeader from '../../components/auth/AuthHeader.vue';
import RegisterStepIndicator from '../../components/auth/RegisterStepIndicator.vue';
import RegisterStep1Account from '../../components/auth/RegisterStep1Account.vue';
import RegisterStep2Otp from '../../components/auth/RegisterStep2Otp.vue';
import RegisterStep3Profile from '../../components/auth/RegisterStep3Profile.vue';
import AuthFooterLink from '../../components/auth/AuthFooterLink.vue';

definePageMeta({
  middleware: ['guest'],
});

const router = useRouter();
const { t } = useI18n();

// 2. Data (refs, reactive state)
const currentStep = ref(1);

const registrationData = ref({
  name: '',
  phone: '',
  referral_code: '',
});

// 3. Computed (computed properties)
const headerTitle = computed(() => {
  if (currentStep.value === 1) return t('Create New Account');
  if (currentStep.value === 2) return t('Mobile Verification');
  return t('Complete Profile');
});

// 4. Methods (functions, handlers)
const handleStepBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  } else {
    router.push('/');
  }
};

const handleStep1Success = (data: { name: string; phone: string }) => {
  registrationData.value.name = data.name;
  registrationData.value.phone = data.phone;
  currentStep.value = 2;
};

const handleStep2Verified = () => {
  currentStep.value = 3;
};

const handleStep2ChangePhone = () => {
  currentStep.value = 1;
};

const handleRegistrationComplete = () => {
  router.push('/');
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.auth-page {
  flex: 1;
  min-height: 100%;
  padding: 12px 18px 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;

  .auth-content-wrapper {
    width: 100%;
    max-width: 460px;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
}

.register-card-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 22px;
  padding: 18px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
</style>
