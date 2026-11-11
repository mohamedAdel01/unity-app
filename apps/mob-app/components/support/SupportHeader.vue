<template>
  <header class="support-header">
    <div class="header-main-row">
      <button class="back-action-btn" type="button" @click="emit('back')" :aria-label="t('Back')">
        <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
      </button>

      <div class="header-titles">
        <h1 class="page-title">{{ t('Help & Technical Support') }}</h1>
        <p class="page-subtitle">{{ t('We are here to assist you 24/7') }}</p>
      </div>

      <div class="online-status-badge">
        <span class="pulse-indicator"></span>
        <span class="status-label">{{ t('Online') }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.support-header {
  padding: 12px 0 6px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;

  .header-main-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .back-action-btn {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: var(--unity-surface, #ffffff);
    border: 1px solid var(--unity-border, #e2e8f0);
    color: var(--unity-text-main, #0f172a);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:active {
      transform: scale(0.95);
      background: var(--unity-surface-muted, #f8fafc);
    }
  }

  .header-titles {
    flex: 1;
    min-width: 0;

    .page-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--unity-text-main, #0f172a);
      margin: 0;
      line-height: 1.3;
    }

    .page-subtitle {
      font-size: 0.8rem;
      color: var(--unity-text-secondary, #64748b);
      margin: 2px 0 0;
      line-height: 1.2;
    }
  }

  .online-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid rgba(16, 185, 129, 0.2);
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;

    .pulse-indicator {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.35);
      animation: pulse 1.8s infinite;
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}
</style>

