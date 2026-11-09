<template>
  <div class="auth-page">
    <AuthHeader :title="t('Sign In')" />
    <LoginForm @request-otp="onRequestOtp" />
    <QuickLoginButtons />
    <AuthFooterLink :is-register="false" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import AuthHeader from '../../components/auth/AuthHeader.vue';
import LoginForm from '../../components/auth/LoginForm.vue';
import QuickLoginButtons from '../../components/auth/QuickLoginButtons.vue';
import AuthFooterLink from '../../components/auth/AuthFooterLink.vue';

const router = useRouter();
const { t } = useI18n();

const onRequestOtp = (identifier: string) => {
  router.push({
    path: '/auth/otp',
    query: { target: identifier || '05XXXXXXXX' },
  });
};
</script>

<style scoped>
.auth-page {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
</style>

