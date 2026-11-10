<template>
  <div class="services-page">
    <ServicesHeader />
    <ServicesCatalog />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import ServicesHeader from '../components/services/ServicesHeader.vue';
import ServicesCatalog from '../components/services/ServicesCatalog.vue';

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.services-page {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
