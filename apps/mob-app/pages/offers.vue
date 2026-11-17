<template>
  <div class="offers-page">
    <OffersHeader :loading="loading" @refresh="onRefresh" />
    <OffersCatalog ref="catalogRef" />
    <!-- Generous bottom clearance spacer ensuring content completely clears floating navbar -->
    <div class="page-bottom-spacer" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import OffersHeader from '../components/offers/OffersHeader.vue';
import OffersCatalog from '../components/offers/OffersCatalog.vue';

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
  } catch (err) {
    // Graceful recovery
  } finally {
    loading.value = false;
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.offers-page {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
</style>
