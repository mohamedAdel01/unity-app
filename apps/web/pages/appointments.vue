<template>
  <AppointmentsHeader :loading="loading" @refresh="onRefresh" />
  <AppointmentsList ref="listRef" />
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import { useI18n } from '../composables/useI18n';
import AppointmentsHeader from '../components/appointments/AppointmentsHeader.vue';
import AppointmentsList from '../components/appointments/AppointmentsList.vue';

definePageMeta({
  middleware: ['auth'],
});

const { t } = useI18n();

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
  } catch (_) {
  } finally {
    loading.value = false;
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: t('My Appointments — Unity Specialized Clinics'),
});
</script>

<style scoped lang="scss">
// Page-level orchestration styles
</style>
