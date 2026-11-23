<template>
  <div class="admin-clinic-doctors-page">
    <AdminDoctorsManageView
      :clinic-id="clinicId"
      @back="onBackToClinics"
      @select-clinic="onSelectClinic"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminDoctorsManageView from '../../../../components/admin/AdminDoctorsManageView.vue';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const router = useRouter();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const clinicId = computed(() => String(route.params.id || 'all'));

// 4. Methods (functions, handlers)
const onBackToClinics = () => {
  router.push('/admin/clinics');
};

const onSelectClinic = (id: string | number) => {
  if (!id || id === 'all') {
    router.replace('/admin/clinics/doctors');
  } else {
    router.replace(`/admin/clinics/${id}/doctors`);
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-clinic-doctors-page {
  width: 100%;
}
</style>
