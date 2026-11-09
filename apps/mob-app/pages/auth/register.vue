<template>
  <div class="auth-page">
    <div class="auth-content-wrapper">
      <AuthHeader :title="currentStep === 1 ? t('Create New Account') : (isRtl ? 'إكمال الملف الشخصي' : 'Complete Profile')" />
      <RegisterForm v-model:step="currentStep" />
      <QuickLoginButtons v-if="currentStep === 1" />
      <AuthFooterLink v-if="currentStep === 1" :is-register="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';
import AuthHeader from '../../components/auth/AuthHeader.vue';
import RegisterForm from '../../components/auth/RegisterForm.vue';
import QuickLoginButtons from '../../components/auth/QuickLoginButtons.vue';
import AuthFooterLink from '../../components/auth/AuthFooterLink.vue';

definePageMeta({
  middleware: ['guest'],
});

const { t, isRtl } = useI18n();
const currentStep = ref(1);
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
