<template>
  <WebTermsContent />
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../composables/useI18n';
import WebTermsContent from '../components/web/WebTermsContent.vue';

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: t('Terms & Privacy Policy — Unity Specialized Clinics'),
});
</script>

<style scoped lang="scss">
// Page-level orchestration styles
</style>
