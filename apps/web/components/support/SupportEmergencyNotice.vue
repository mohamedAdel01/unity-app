<template>
  <aside class="emergency-notice-card" role="alert">
    <div class="notice-icon-box">
      <i class="pi pi-exclamation-triangle"></i>
    </div>
    <div class="notice-content">
      <h6 class="notice-title">{{ t('Medical Emergency Notice') }}</h6>
      <p class="notice-desc">
        {{ t('This support channel is for general, technical, and booking inquiries. For immediate life-threatening medical emergencies, please call the ambulance service directly (123) or visit the nearest emergency room.') }}
      </p>
    </div>
    <a href="tel:123" class="emergency-call-btn" :aria-label="t('Call 123')">
      <i class="pi pi-phone"></i>
      <span>123</span>
    </a>
  </aside>
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
.emergency-notice-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.22);
  border-radius: 16px;
  padding: 12px 14px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;

  .notice-icon-box {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .notice-content {
    flex: 1;
    min-width: 0;

    .notice-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #b91c1c;
      margin: 0 0 3px;
    }

    .notice-desc {
      font-size: 0.72rem;
      color: var(--unity-text-secondary, #64748b);
      margin: 0;
      line-height: 1.35;
    }
  }

  .emergency-call-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #ef4444;
    color: #ffffff;
    padding: 7px 12px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 800;
    text-decoration: none;
    flex-shrink: 0;
    transition: transform 0.15s ease, background 0.15s ease;

    &:active {
      transform: scale(0.95);
      background: #dc2626;
    }
  }
}
</style>

