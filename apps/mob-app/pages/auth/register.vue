<template>
  <div class="auth-page">
    <AuthHeader :title="t('Create New Account')" />
    <RegisterForm />
    <QuickLoginButtons />
    <AuthFooterLink :is-register="true" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';
import AuthHeader from '../../components/auth/AuthHeader.vue';
import RegisterForm from '../../components/auth/RegisterForm.vue';
import QuickLoginButtons from '../../components/auth/QuickLoginButtons.vue';
import AuthFooterLink from '../../components/auth/AuthFooterLink.vue';

definePageMeta({
  middleware: ['guest'],
});

const { t } = useI18n();
</script>

<style scoped>
.auth-page {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
</style>

