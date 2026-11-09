<template>
  <div class="auth-footer-link">
    <p>
      <span>{{ isRegister ? t('auth.haveAccount') : t('auth.noAccountYet') }} </span>
      <NuxtLink :to="isRegister ? '/auth/login' : '/auth/register'" class="link-action">
        {{ isRegister ? t('auth.loginNow') : t('auth.createNewAccount') }}
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';

defineProps<{
  isRegister?: boolean;
}>();

const { t } = useI18n();
</script>

<style scoped lang="scss">
.auth-footer-link {
  text-align: center;
  padding: 16px 0 24px;

  p {
    font-size: 0.85rem;
    color: var(--unity-text-muted);

    .link-action {
      color: var(--unity-primary);
      font-weight: 600;
      text-decoration: none;
      margin-inline-start: 4px;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>

