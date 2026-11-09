<template>
  <header class="records-header">
    <div class="header-top">
      <button class="back-btn" :aria-label="t('Back')" @click="router.back()">
        <i class="pi pi-arrow-right"></i>
      </button>
      <h1 class="page-title">{{ t('Medical Records & Lab Tests') }}</h1>
      <div class="header-action">
        <button class="icon-btn" :aria-label="t('Search')">
          <i class="pi pi-search"></i>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

const router = useRouter();
const { t } = useI18n();
</script>

<style scoped lang="scss">
.records-header {
  margin-bottom: 4px;

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .back-btn,
  .icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid var(--unity-border);
    background: var(--unity-surface);
    color: var(--unity-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--unity-primary);
      color: var(--unity-primary);
    }
  }

  .page-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--unity-text);
    margin: 0;
    text-align: center;
    flex: 1;
  }
}
</style>

