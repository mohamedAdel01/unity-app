<template>
  <div class="profile-page">
    <ProfileTopHeader :user="user" />
    <ProfileHeroCard :user="user" @edit="onEditProfile" />
    <ProfileMenuSection @action="onMenuAction" />
    <ProfileThemeSelector />
    <ProfileLanguageSelector />
    <ProfileFooterInfo />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUnityApi } from '../composables/useUnityApi';
import ProfileTopHeader from '../components/profile/ProfileTopHeader.vue';
import ProfileHeroCard from '../components/profile/ProfileHeroCard.vue';
import ProfileMenuSection from '../components/profile/ProfileMenuSection.vue';
import ProfileThemeSelector from '../components/profile/ProfileThemeSelector.vue';
import ProfileLanguageSelector from '../components/profile/ProfileLanguageSelector.vue';
import ProfileFooterInfo from '../components/profile/ProfileFooterInfo.vue';

definePageMeta({
  middleware: ['auth'],
});

const router = useRouter();

const api = useUnityApi();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const user = computed(() => api.currentUser.value);

// 4. Methods (functions, handlers)
const onEditProfile = () => {
  // Handles profile editing navigation or modal
};

const onMenuAction = (key: string) => {
  if (key === 'wallet') {
    router.push('/appointments');
  } else if (key === 'support') {
    router.push('/support');
  } else if (key === 'admin') {
    router.push('/admin');
  } else if (key === 'terms') {
    router.push('/terms');
  } else if (key === 'delete-account') {
    router.push('/delete-account');
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.profile-page {
  padding: 14px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
