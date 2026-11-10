<template>
  <div class="live-banner">
    <div class="live-dot-pulse"></div>
    <span>{{ t('Instant consultations available now with certified doctors • 24/7 Service') }}</span>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
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
  font-weight: 600;
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
