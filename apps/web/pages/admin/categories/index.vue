<template>
  <div class="admin-categories-page">
    <AdminCategoriesManageView
      @select-category="onSelectCategory"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRouter } from 'vue-router';
import AdminCategoriesManageView from '../../../components/admin/AdminCategoriesManageView.vue';

definePageMeta({
  layout: 'admin',
});

const router = useRouter();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const onSelectCategory = (cat: any) => {
  if (!cat?.id || cat.id === 'all') {
    router.push('/admin/categories/services');
  } else {
    router.push(`/admin/categories/${cat.id}/services`);
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-categories-page {
  width: 100%;
}
</style>
