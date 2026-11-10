<template>
  <div class="hero-headline">
    <h3>{{ t('How are you feeling today?') }}</h3>
    <p>{{ t('Get the finest healthcare for you and your family at your fingertips') }}</p>
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
.hero-headline {
  margin-top: 4px;

  h3 {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--unity-text-main);
    letter-spacing: -0.2px;
  }

  p {
    font-size: 0.8rem;
    color: var(--unity-text-muted);
    margin-top: 2px;
  }
}
</style>
