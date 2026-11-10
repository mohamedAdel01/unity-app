<template>
  <div class="page-top-header">
    <button class="back-btn" @click="router.back()">
      <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
    </button>
    <h3 class="page-title">{{ t('My Bookings & Appointments') }}</h3>
    <button class="refresh-btn" @click="emit('refresh')">
      <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
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
  }

  .page-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--unity-text-main);
  }
}
</style>
