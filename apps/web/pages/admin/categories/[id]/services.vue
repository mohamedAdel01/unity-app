<template>
  <div class="admin-category-services-page">
    <AdminServicesManageView
      :category-id="categoryId"
      @back="onBackToCategories"
      @select-category="onSelectCategory"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminServicesManageView from '../../../../components/admin/AdminServicesManageView.vue';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const router = useRouter();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const categoryId = computed(() => String(route.params.id || 'all'));

// 4. Methods (functions, handlers)
const onBackToCategories = () => {
  router.push('/admin/categories');
};

const onSelectCategory = (id: string | number) => {
  if (!id || id === 'all') {
    router.push('/admin/categories/services');
  } else {
    router.push(`/admin/categories/${id}/services`);
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-category-services-page {
  width: 100%;
}
</style>