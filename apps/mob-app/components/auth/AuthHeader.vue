<template>
  <header class="auth-header">
    <div class="top-nav-row">
      <button class="back-nav-btn" :aria-label="t('Back')" @click="handleBack">
        <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
      </button>
      <div class="header-ghost-spacer"></div>
    </div>

    <!-- Official Unity Clinics Logo & Brand Identity (Seamless Transparent) -->
    <div class="brand-hero-box">
      <div class="brand-logo-wrap">
        <img src="/logo.png" alt="Unity Clinics" class="unity-brand-logo" />
      </div>
      <h2 class="auth-heading">{{ title || t('Sign In') }}</h2>
      <p class="auth-subheading">
        {{ t('Welcome to Unity Clinics integrated medical platform') }}
      </p>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

const props = defineProps<{
  title?: string;
  customBack?: boolean;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const router = useRouter();
const { t, isRtl } = useI18n();

const handleBack = () => {
  if (props.customBack) {
    emit('back');
  } else {
    router.back();
  }
};
</script>

<style scoped lang="scss">
.auth-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0 8px;

  .top-nav-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

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
      transform: scale(1.05);
    }
  }

  .header-ghost-spacer {
    width: 38px;
  }

  .brand-hero-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 6px;
    padding: 0 0 6px;
  }

  .brand-logo-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2px;
  }

  .unity-brand-logo {
    height: 72px;
    width: auto;
    max-width: 190px;
    object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(0, 118, 99, 0.08));
  }

  .auth-heading {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--unity-text-main);
    margin: 4px 0 0;
  }

  .auth-subheading {
    font-size: 0.82rem;
    color: var(--unity-text-muted);
    margin: 0;
    max-width: 310px;
    line-height: 1.4;
  }
}
</style>
