<template>
  <div class="home-screen">
    <!-- 1. Top Greeting Header -->
    <HomeHeader />

    <!-- 2. Current/Upcoming Appointment Card (shows only if patient has an appointment today/upcoming) -->
    <HomeUpcomingCard 
      :appointment="upcomingAppointment" 
      @refresh="PATIENT_APPOINTMENTS"
    />

    <!-- 3. Attractive Primary Action Cards (Doctor Checkup & Lab Tests, no pills, expressive icons) -->
    <HomeCategoriesGrid />

    <!-- 4. Today's Special Offers (Image, description, price & strikethrough discount price) -->
    <HomeTodayOffers />

    <!-- 5. Our Top Doctors -->
    <HomeTopDoctors 
      :search-query="searchQuery" 
      :category-filter="activeFilter" 
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, onMounted } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import HomeHeader from './HomeHeader.vue';
import HomeUpcomingCard from './HomeUpcomingCard.vue';
import HomeCategoriesGrid from './HomeCategoriesGrid.vue';
import HomeTodayOffers from './HomeTodayOffers.vue';
import HomeTopDoctors from './HomeTopDoctors.vue';

const api = useUnityApi();

// 2. Data (refs, reactive state)
const searchQuery = ref('');
const activeFilter = ref('all');
const upcomingAppointment = ref<any | null>(null);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const PATIENT_APPOINTMENTS = async () => {
  try {
    const res = await api.apiRequest({ service: 'PATIENT_APPOINTMENTS' });
    if (res && res.status && Array.isArray(res.data) && res.data.length > 0) {
      // Find active upcoming/today appointment
      const active = res.data.find((a: any) => a.status === 'confirmed' || a.status === 'pending');
      upcomingAppointment.value = active || null;
    } else {
      upcomingAppointment.value = null;
    }
  } catch (err) {
    upcomingAppointment.value = null;
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  PATIENT_APPOINTMENTS();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.home-screen {
  padding: 16px 20px 52px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
</style>
