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
import { ref } from 'vue';
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
const user = ref<any>(api.currentUser.value);

const onEditProfile = () => {
  // Handles profile editing navigation or modal
};

const onMenuAction = (key: string) => {
  if (key === 'wallet') {
    router.push('/appointments');
  } else if (key === 'admin') {
    router.push('/admin/patients');
  }
};
</script>

<style scoped>
.profile-page {
  padding: 14px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
