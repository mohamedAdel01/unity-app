<template>
  <WebHeroSection />
  <WebFeaturesGrid />
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../composables/useI18n';
import WebHeroSection from '../components/web/WebHeroSection.vue';
import WebFeaturesGrid from '../components/web/WebFeaturesGrid.vue';

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: t('Unity Specialized Clinics — Official Medical Services & Patient Information Portal'),
});
</script>

<style scoped lang="scss">
// Page-level orchestration styles
</style>
