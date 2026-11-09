<template>
  <header class="auth-header">
    <button class="back-nav-btn" aria-label="Back" @click="router.back()">
      <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
    </button>
    <h3 class="auth-title">{{ title || t('Sign In') }}</h3>
    <div class="header-ghost-spacer"></div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

defineProps<{
  title?: string;
}>();

const router = useRouter();
const { t, isRtl } = useI18n();
</script>

<style scoped lang="scss">
.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 16px;

  .back-nav-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-main);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;

    &:hover {
      background: var(--unity-bg);
    }
  }

  .auth-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--unity-text-main);
  }

  .header-ghost-spacer {
    width: 38px;
  }
}
</style>

