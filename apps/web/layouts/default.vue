<template>
  <div class="web-layout-root">
    <!-- Toast Notification Container -->
    <AppToastContainer />

    <!-- Top Web Navigation Header -->
    <WebHeader />

    <!-- Main Viewport Content -->
    <main class="web-main-content">
      <slot />
    </main>

    <!-- Global Web Footer -->
    <WebFooter />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { onMounted } from 'vue';
import { useTheme } from '../composables/useTheme';
import { useI18n } from '../composables/useI18n';
import WebHeader from '../components/web/WebHeader.vue';
import WebFooter from '../components/web/WebFooter.vue';
import AppToastContainer from '../components/common/AppToastContainer.vue';

const theme = useTheme();
const { initLocale } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  theme.initTheme();
  initLocale();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.web-layout-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--unity-bg);
  color: var(--unity-text-main);
  font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background-color 0.25s ease, color 0.25s ease;
}

.web-main-content {
  flex: 1;
  width: 100%;
}
</style>
