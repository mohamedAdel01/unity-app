<template>
  <div class="admin-doctors-all-page">
    <AdminDoctorsManageView
      clinic-id="all"
      @back="onBackToClinics"
      @select-clinic="onSelectClinic"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRouter } from 'vue-router';
import AdminDoctorsManageView from '../../../components/admin/AdminDoctorsManageView.vue';

definePageMeta({
  layout: 'admin',
});

const router = useRouter();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const onBackToClinics = () => {
  router.push('/admin/clinics');
};

const onSelectClinic = (id: string | number) => {
  if (!id || id === 'all') {
    router.push('/admin/clinics/doctors');
  } else {
    router.push(`/admin/clinics/${id}/doctors`);
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-doctors-all-page {
  width: 100%;
}
</style>
