<template>
  <div class="auth-footer-link">
    <p>
      <span>{{ isRegister ? t('Already have an account?') : t("Don't have an account?") }} </span>
      <NuxtLink :to="isRegister ? '/auth/login' : '/auth/register'" class="link-action">
        {{ isRegister ? t('Sign In') : t('Create New Account') }}
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

defineProps<{
  isRegister?: boolean;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
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
