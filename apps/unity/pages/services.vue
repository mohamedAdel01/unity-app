<template>
  <div class="services-page">
    <ServicesHeader />
    <ServicesCatalog />
  </div>
</template>

<script setup lang="ts">
import ServicesHeader from '../components/services/ServicesHeader.vue';
import ServicesCatalog from '../components/services/ServicesCatalog.vue';
</script>

<style scoped>
.services-page {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
