<template>
  <div class="admin-clinics-page">
    <div class="supervisor-top-bar" aria-hidden="true" style="display:none;" />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRoute } from 'vue-router';

definePageMeta({
  layout: 'admin',
});

await navigateTo('/admin/doctors?tab=clinics', { replace: true });

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-clinics-page {
  width: 100%;
}
</style>
