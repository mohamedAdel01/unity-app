<template>
  <div class="appointments-page">
    <AppointmentsHeader :loading="loading" @refresh="onRefresh" />
    <AppointmentsList ref="listRef" />
    <!-- Generous bottom clearance spacer ensuring content completely clears floating navbar -->
    <div class="page-bottom-spacer" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import AppointmentsHeader from '../components/appointments/AppointmentsHeader.vue';
import AppointmentsList from '../components/appointments/AppointmentsList.vue';

definePageMeta({
  middleware: ['auth'],
});

// 2. Data (refs, reactive state)
const listRef = ref<any>(null);

const loading = ref(false);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const onRefresh = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const fetchAction = listRef.value?.PATIENT_APPOINTMENTS
      ? listRef.value.PATIENT_APPOINTMENTS(1)
      : listRef.value?.loadAppointments?.(1);

    const minAnimationDelay = new Promise((resolve) => setTimeout(resolve, 750));
    await Promise.all([fetchAction, minAnimationDelay]);
  } catch (err) {
    // Graceful recovery
  } finally {
    loading.value = false;
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.appointments-page {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
