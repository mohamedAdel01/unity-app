<template>
  <div class="support-page">
    <SupportHeader @back="onBack" />
    <SupportEmergencyNotice />
    <SupportContactChannels @open-ticket="openTicketModal" />
    <SupportFaqSection />
    <SupportTicketModal :is-open="isTicketModalOpen" @close="isTicketModalOpen = false" />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../composables/useI18n';
import SupportHeader from '../components/support/SupportHeader.vue';
import SupportEmergencyNotice from '../components/support/SupportEmergencyNotice.vue';
import SupportContactChannels from '../components/support/SupportContactChannels.vue';
import SupportFaqSection from '../components/support/SupportFaqSection.vue';
import SupportTicketModal from '../components/support/SupportTicketModal.vue';

const router = useRouter();
const { t } = useI18n();

// 2. Data (refs, reactive state)
const isTicketModalOpen = ref(false);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const onBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/profile');
  }
};

const openTicketModal = () => {
  isTicketModalOpen.value = true;
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: t('Help & Technical Support'),
});
</script>

<style scoped lang="scss">
.support-page {
  padding: 14px 16px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
</style>

