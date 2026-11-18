<template>
  <OffersHeader :loading="loading" @refresh="onRefresh" />
  <OffersCatalog ref="catalogRef" />
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import { useI18n } from '../composables/useI18n';
import OffersHeader from '../components/offers/OffersHeader.vue';
import OffersCatalog from '../components/offers/OffersCatalog.vue';

const { t } = useI18n();

// 2. Data (refs, reactive state)
const catalogRef = ref<any>(null);
const loading = ref(false);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const onRefresh = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const fetchAction = catalogRef.value?.OFFERS ? catalogRef.value.OFFERS(1) : Promise.resolve();
    const minAnimationDelay = new Promise((resolve) => setTimeout(resolve, 600));
    await Promise.all([fetchAction, minAnimationDelay]);
  } catch (_) {
  } finally {
    loading.value = false;
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: t('Medical Offers & Packages — Unity Specialized Clinics'),
});
</script>

<style scoped lang="scss">
// Page-level orchestration styles
</style>
