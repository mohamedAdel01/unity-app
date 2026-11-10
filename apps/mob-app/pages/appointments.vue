<template>
  <div class="appointments-page">
    <AppointmentsHeader :loading="loading" @refresh="onRefresh" />
    <AppointmentsList ref="listRef" />
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
  if (listRef.value) {
    loading.value = true;
    await listRef.value.loadAppointments();
    loading.value = false;
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.appointments-page {
  padding: 16px 18px 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
