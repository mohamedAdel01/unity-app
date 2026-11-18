<template>
  <WebHeroSection />
  <WebClinicsGrid />
  <WebTopDoctors />
  <WebFeaturedOffers />
  <WebQuickSteps />
  <WebPatientPortalBanner />
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../composables/useI18n';
import WebHeroSection from '../components/web/WebHeroSection.vue';
import WebClinicsGrid from '../components/web/WebClinicsGrid.vue';
import WebTopDoctors from '../components/web/WebTopDoctors.vue';
import WebFeaturedOffers from '../components/web/WebFeaturedOffers.vue';
import WebQuickSteps from '../components/web/WebQuickSteps.vue';
import WebPatientPortalBanner from '../components/web/WebPatientPortalBanner.vue';

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: t('Unity Specialized Clinics — World-Class Specialized Healthcare'),
});
</script>

<style scoped lang="scss">
// Page-level orchestration styles
</style>
