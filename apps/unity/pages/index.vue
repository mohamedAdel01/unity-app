<template>
  <div class="home-screen">
    <!-- Top Greeting Header -->
    <HomeHeader />

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

    <!-- Upcoming Appointment Card (Image 2 style) -->
    <HomeUpcomingCard />

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
import { ref } from 'vue';
import HomeHeader from '../components/home/HomeHeader.vue';
import HomeHeroHeadline from '../components/home/HomeHeroHeadline.vue';
import HomeSearchSection from '../components/home/HomeSearchSection.vue';
import HomeLiveBanner from '../components/home/HomeLiveBanner.vue';
import HomeCategoriesGrid from '../components/home/HomeCategoriesGrid.vue';
import HomeUpcomingCard from '../components/home/HomeUpcomingCard.vue';
import HomeTopDoctors from '../components/home/HomeTopDoctors.vue';
import HomePastAppointments from '../components/home/HomePastAppointments.vue';

const searchQuery = ref('');
const activeFilter = ref('all');
</script>

<style scoped>
.home-screen {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
