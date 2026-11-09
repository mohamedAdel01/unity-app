<template>
  <div class="live-banner">
    <div class="live-dot-pulse"></div>
    <span>{{ t('home.liveBanner') }}</span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();
</script>

<style scoped lang="scss">
.live-banner {
  background: #ecfdf5;
  border: 1px solid #d1fae5;
  border-radius: 14px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #065f46;

  .live-dot-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    flex-shrink: 0;
  }
}
</style>
