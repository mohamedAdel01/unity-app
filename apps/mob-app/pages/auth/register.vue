<template>
  <div class="auth-page">
    <div class="auth-content-wrapper">
      <AuthHeader
        :title="currentStep === 1 ? t('Create New Account') : currentStep === 2 ? t('Mobile Verification') : t('Complete Profile')"
        :custom-back="true" @back="handleStepBack" />
      <RegisterForm v-model:step="currentStep" />
      <QuickLoginButtons v-if="currentStep === 1" />
      <AuthFooterLink v-if="currentStep === 1" :is-register="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import AuthHeader from '../../components/auth/AuthHeader.vue';
import RegisterForm from '../../components/auth/RegisterForm.vue';
import QuickLoginButtons from '../../components/auth/QuickLoginButtons.vue';
import AuthFooterLink from '../../components/auth/AuthFooterLink.vue';

definePageMeta({
  middleware: ['guest'],
});

const router = useRouter();

const { t } = useI18n();

// 2. Data (refs, reactive state)
const currentStep = ref(1);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const handleStepBack = () => {
  if (currentStep.value > 1) currentStep.value--;
  else router.push('/');
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
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin: auto 0;
  }
}
</style>
