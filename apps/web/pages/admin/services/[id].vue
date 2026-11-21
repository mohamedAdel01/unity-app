<template>
  <div class="admin-services-id-redirect" />
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRoute } from 'vue-router';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const id = String(route.params.id || '');
if (id === 'all') {
  await navigateTo('/admin/categories/services', { replace: true });
} else {
  await navigateTo(`/admin/categories/${id}/services`, { replace: true });
}

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-services-id-redirect {
  width: 100%;
}
</style>
