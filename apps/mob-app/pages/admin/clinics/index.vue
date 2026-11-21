<template>
  <div class="admin-clinics-page">
    <AdminClinicsManageView
      @select-clinic="onSelectClinic"
      @select-all-doctors="onSelectAllDoctors"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRouter } from 'vue-router';
import AdminClinicsManageView from '../../../components/admin/AdminClinicsManageView.vue';

definePageMeta({
  layout: 'admin',
});

const router = useRouter();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const onSelectClinic = (clinic: any) => {
  if (!clinic?.id || clinic.id === 'all') {
    router.push('/admin/clinics/doctors');
  } else {
    router.push(`/admin/clinics/${clinic.id}/doctors`);
  }
};

const onSelectAllDoctors = () => {
  router.push('/admin/clinics/doctors');
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-clinics-page {
  width: 100%;
}
</style>
