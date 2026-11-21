<template>
  <div class="home-screen">
    <!-- Skeleton Loading State -->
    <HomeSkeleton v-if="isInitialLoading" />

    <!-- Actual Dashboard Content -->
    <template v-else>
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

      <!-- Generous bottom clearance spacer ensuring content completely clears floating navbar -->
      <div class="page-bottom-spacer" aria-hidden="true" />
    </template>
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
import HomeSkeleton from './HomeSkeleton.vue';

const api = useUnityApi();

// 2. Data (refs, reactive state)
const upcomingAppointments = ref<any[]>([]);
const isInitialLoading = ref(true);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const PATIENT_APPOINTMENTS = async () => {
  try {
    const res = await api.apiRequest({ service: 'PATIENT_APPOINTMENTS' });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    if (raw.length > 0) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      // Filter only active appointments scheduled for TODAY (confirmed or pending)
      const todayActive = raw.filter((a: any) => {
        if (a.status !== 'confirmed' && a.status !== 'pending') return false;
        if (!a.date) return false;
        const aptDateStr = typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0];
        return aptDateStr === todayStr;
      });
      upcomingAppointments.value = todayActive;
    } else {
      upcomingAppointments.value = [];
    }
  } catch (err) {
    upcomingAppointments.value = [];
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(async () => {
  try {
    await PATIENT_APPOINTMENTS();
  } finally {
    setTimeout(() => {
      isInitialLoading.value = false;
    }, 350);
  }
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.home-screen {
  padding: 14px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;

  .page-bottom-spacer {
    height: 75px;
    flex-shrink: 0;
  }
}
</style>
