<template>
  <div class="home-screen">
    <!-- 1. Top Greeting Header -->
    <HomeHeader />

    <!-- 2. Current/Upcoming Appointments (Compact sleek card / carousel for today & upcoming) -->
    <HomeUpcomingCard 
      :appointments="upcomingAppointments" 
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
const upcomingAppointments = ref<any[]>([]);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const PATIENT_APPOINTMENTS = async () => {
  try {
    const res = await api.apiRequest({ service: 'PATIENT_APPOINTMENTS' });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    if (raw.length > 0) {
      // Find all active upcoming/today appointments (confirmed or pending)
      const active = raw.filter((a: any) => a.status === 'confirmed' || a.status === 'pending');
      upcomingAppointments.value = active;
    } else {
      upcomingAppointments.value = [];
    }
  } catch (err) {
    upcomingAppointments.value = [];
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
  padding: 16px 20px 48px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
</style>
