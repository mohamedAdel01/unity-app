<template>
  <div class="page-top-header">
    <button class="back-btn" @click="router.back()">
      <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
    </button>
    <h3 class="page-title">{{ t('profile.pageTitle') }}</h3>
    <div class="header-icon-wrap">
      <i class="pi pi-user"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

const router = useRouter();
const { t, isRtl } = useI18n();
</script>

<style scoped lang="scss">
.page-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .back-btn, .header-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-main);
  }

  .back-btn {
    cursor: pointer;
  }

  .page-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--unity-text-main);
  }
}
</style>

