<template>
  <div class="page-top-header">
    <button class="back-btn" @click="router.back()">
      <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
    </button>
    <h3 class="page-title">{{ t('My Bookings & Appointments') }}</h3>
    <button 
      class="refresh-btn" 
      :class="{ 'loading': loading }"
      :disabled="loading" 
      :title="t('Refresh')"
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

  .back-btn, .refresh-btn {
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
    transition: all 0.2s ease;

    &:active:not(:disabled) {
      transform: scale(0.92);
    }
  }

  .refresh-btn {
    &.loading {
      cursor: wait;
      opacity: 0.9;
      background: rgba(16, 185, 129, 0.08);
      border-color: var(--unity-primary);
      color: var(--unity-primary);
    }

    i.is-spinning {
      animation: spinRefresh 0.75s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      color: var(--unity-primary);
    }
  }

  @keyframes spinRefresh {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .page-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--unity-text-main);
  }
}
</style>
