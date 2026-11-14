<template>
  <div class="profile-page">
    <ProfileTopHeader :user="user" />
    <ProfileHeroCard :user="user" @edit="onEditProfile" />
    <ProfileReferralCard :user="user" />
    <ProfileMenuSection />
    <ProfileThemeSelector />
    <ProfileLanguageSelector />
    <ProfileFooterInfo />
    <ProfileEditModal 
      v-model="isEditModalOpen"
      :is-open="isEditModalOpen" 
      :user="user" 
      @close="isEditModalOpen = false" 
      @updated="onProfileUpdated" 
    />
    <!-- Generous bottom clearance spacer ensuring content completely clears floating navbar -->
    <div class="page-bottom-spacer" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useUnityApi } from '../composables/useUnityApi';
import ProfileTopHeader from '../components/profile/ProfileTopHeader.vue';
import ProfileHeroCard from '../components/profile/ProfileHeroCard.vue';
import ProfileReferralCard from '../components/profile/ProfileReferralCard.vue';
import ProfileMenuSection from '../components/profile/ProfileMenuSection.vue';
import ProfileThemeSelector from '../components/profile/ProfileThemeSelector.vue';
import ProfileLanguageSelector from '../components/profile/ProfileLanguageSelector.vue';
import ProfileFooterInfo from '../components/profile/ProfileFooterInfo.vue';
import ProfileEditModal from '../components/profile/ProfileEditModal.vue';

definePageMeta({
  middleware: ['auth'],
});

const api = useUnityApi();

// 2. Data (refs, reactive state)
const isEditModalOpen = ref(false);

// 3. Computed (computed properties)
const user = computed(() => api.currentUser.value);

// 4. Methods (functions, handlers)
const onEditProfile = () => {
  isEditModalOpen.value = true;
};

const onProfileUpdated = (_updatedUser: any) => {
  isEditModalOpen.value = false;
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
