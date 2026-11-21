<template>
  <div class="admin-doctors-redirect" />
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRoute } from 'vue-router';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
if (route.query.clinic && route.query.clinic !== 'all') {
  await navigateTo(`/admin/clinics/${route.query.clinic}/doctors`, { replace: true });
} else {
  await navigateTo('/admin/clinics/doctors', { replace: true });
}

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-doctors-redirect {
  width: 100%;
}
</style>
