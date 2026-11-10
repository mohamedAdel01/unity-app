<template>
  <div class="home-screen">
    <!-- Top Greeting Header -->
    <HomeHeader />

    <!-- Upcoming Appointment Card (Positioned first in Home as requested) -->
    <HomeUpcomingCard />

    <!-- Hero Title -->
    <HomeHeroHeadline />

    <!-- Search & Quick Filter Pills -->
    <HomeSearchSection 
      @search="q => searchQuery = q" 
      @filter="cat => activeFilter = cat" 
    />

    <!-- 24/7 Live Instant Consultation Banner -->
    <HomeLiveBanner />

    <!-- 6 Categories Grid -->
    <HomeCategoriesGrid />

    <!-- Certified Top Doctors (Image 1 style) -->
    <HomeTopDoctors 
      :search-query="searchQuery" 
      :category-filter="activeFilter" 
    />

    <!-- Past Appointments & Lab Tests (Image 1 style) -->
    <HomePastAppointments />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import HomeHeader from './HomeHeader.vue';
import HomeHeroHeadline from './HomeHeroHeadline.vue';
import HomeSearchSection from './HomeSearchSection.vue';
import HomeLiveBanner from './HomeLiveBanner.vue';
import HomeCategoriesGrid from './HomeCategoriesGrid.vue';
import HomeUpcomingCard from './HomeUpcomingCard.vue';
import HomeTopDoctors from './HomeTopDoctors.vue';
import HomePastAppointments from './HomePastAppointments.vue';

// 2. Data (refs, reactive state)
const searchQuery = ref('');

const activeFilter = ref('all');

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.home-screen {
  padding: 16px 18px 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
