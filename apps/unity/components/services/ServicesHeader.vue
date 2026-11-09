<template>
  <div class="page-top-header">
    <button class="back-btn" @click="router.back()">
      <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
    </button>
    <h3 class="page-title">{{ t('servicesCatalog.pageTitle') }}</h3>
    <div class="placeholder-icon">
      <i class="pi pi-search"></i>
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

  .back-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-main);
    cursor: pointer;
  }

  .page-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--unity-text-main);
  }

  .placeholder-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-dim);
  }
}
</style>
