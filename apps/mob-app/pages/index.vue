<template>
  <div class="home-page-container">
    <HomeDashboardView v-if="authStore.isAuthenticated" />
    <OnboardingScreen v-else />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import HomeDashboardView from '../components/home/HomeDashboardView.vue';
import OnboardingScreen from '../components/onboarding/OnboardingScreen.vue';

const authStore = useAuthStore();
authStore.initAuth();
</script>

<style scoped>
.home-page-container {
  width: 100%;
  min-height: 100%;
}
</style>
