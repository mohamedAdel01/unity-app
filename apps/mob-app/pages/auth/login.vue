<template>
  <div class="auth-page">
    <div class="auth-content-wrapper">
      <AuthHeader :title="t('Sign In')" />
      <LoginForm />
      <QuickLoginButtons />
      <AuthFooterLink :is-register="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';
import AuthHeader from '../../components/auth/AuthHeader.vue';
import LoginForm from '../../components/auth/LoginForm.vue';
import QuickLoginButtons from '../../components/auth/QuickLoginButtons.vue';
import AuthFooterLink from '../../components/auth/AuthFooterLink.vue';

definePageMeta({
  middleware: ['guest'],
});

const { t } = useI18n();
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
