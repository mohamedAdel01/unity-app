<template>
  <div class="home-page-container">
    <HomeDashboardView v-if="authStore.isAuthenticated && !authStore.isReceptionist && !authStore.isAdmin" />
    <OnboardingScreen v-else-if="!authStore.isAuthenticated" />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import HomeDashboardView from '../components/home/HomeDashboardView.vue';
import OnboardingScreen from '../components/onboarding/OnboardingScreen.vue';

const router = useRouter();
const authStore = useAuthStore();

authStore.initAuth();

if (authStore.isAuthenticated) {
  if (authStore.isAdmin) {
    router.replace('/admin');
  } else if (authStore.isReceptionist) {
    router.replace('/admin/appointments');
  }
}

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.home-page-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
