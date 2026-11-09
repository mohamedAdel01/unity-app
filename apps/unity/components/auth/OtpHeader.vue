<template>
  <header class="otp-header">
    <button class="back-btn" aria-label="Back" @click="router.back()">
      <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
    </button>

    <div class="title-wrap">
      <span class="leaf-badge">
        <i class="pi pi-shield"></i>
      </span>
      <h3 class="otp-title">{{ t('auth.otpTitle') }}</h3>
    </div>

    <div class="avatar-holder">
      <i class="pi pi-user"></i>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

const router = useRouter();
const { t, isRtl } = useI18n();
</script>

<style scoped lang="scss">
.otp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 16px;

  .back-btn {
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

    &:hover {
      background: var(--unity-bg);
    }
  }

  .title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;

    .leaf-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #d1fae5;
      color: #047857;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
    }

    .otp-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--unity-text-main);
      letter-spacing: -0.2px;
    }
  }

  .avatar-holder {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #047857;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.05rem;
  }
}
</style>

