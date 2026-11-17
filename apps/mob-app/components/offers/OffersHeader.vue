<template>
  <div class="page-top-header">
    <button class="back-btn" :title="t('Back')" :aria-label="t('Back')" @click="router.back()">
      <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
    </button>
    <div class="header-center">
      <h3 class="page-title">{{ t('Special Offers') }}</h3>
    </div>
    <button 
      class="refresh-btn" 
      :class="{ 'loading': loading }"
      :disabled="loading" 
      :title="t('Refresh')"
      :aria-label="t('Refresh')"
      @click="emit('refresh')"
    >
      <i class="pi pi-refresh" :class="{ 'is-spinning': loading }"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const router = useRouter();
const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.page-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0 10px;

  .header-center {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back-btn, .refresh-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-main);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--unity-bg);
      border-color: var(--unity-primary);
      color: var(--unity-primary);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .refresh-btn {
    &.loading {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .is-spinning {
      animation: spin 0.85s linear infinite;
    }
  }

  .page-title {
    font-size: 1.12rem;
    font-weight: 800;
    color: var(--unity-text-main);
    letter-spacing: -0.2px;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
