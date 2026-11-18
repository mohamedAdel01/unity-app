<template>
  <ProfileTopHeader :user="user" />
  <ProfileHeroCard :user="user" @edit="onEditProfile" />
  <ProfileReferralCard v-if="!authStore.isReceptionist && !authStore.isAdmin" :user="user" />
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
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useUnityApi } from '../composables/useUnityApi';
import { useAuthStore } from '../stores/auth';
import { useI18n } from '../composables/useI18n';
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
const authStore = useAuthStore();
const { t } = useI18n();

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
useHead({
  title: t('My Account — Unity Specialized Clinics'),
});
</script>

<style scoped lang="scss">
// Page-level orchestration styles
</style>
