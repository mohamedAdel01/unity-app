<template>
  <div class="appointments-page">
    <AppointmentsHeader :loading="loading" @refresh="onRefresh" />
    <AppointmentsList ref="listRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppointmentsHeader from '../components/appointments/AppointmentsHeader.vue';
import AppointmentsList from '../components/appointments/AppointmentsList.vue';

definePageMeta({
  middleware: ['auth'],
});

const listRef = ref<any>(null);
const loading = ref(false);

const onRefresh = async () => {
  if (listRef.value) {
    loading.value = true;
    await listRef.value.loadAppointments();
    loading.value = false;
  }
};
</script>

<style scoped>
.appointments-page {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
