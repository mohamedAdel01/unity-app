<template>
  <div class="app-global-modals">
    <!-- Quick Book Bottom Sheet (Doctor vs Service choice) -->
    <QuickBookModal
      v-model="bookingModal.isQuickBookOpen.value"
      @select-doctor="onSelectDoctor"
      @select-service="onSelectService"
    />

    <!-- Notifications Drawer -->
    <NotificationSheet
      v-model="bookingModal.isNotificationOpen.value"
    />

    <!-- 15-minute Booking & Payment Checkout Wizard -->
    <BookingFlowModal
      v-model="bookingModal.isBookingFlowOpen.value"
      :doctor="bookingModal.activeDoctor.value"
      :service="bookingModal.activeService.value"
      :selected-date="bookingModal.activeDate.value"
      :selected-slot="bookingModal.activeSlot.value"
      :initial-type="bookingModal.activeType.value"
      @booking-completed="onBookingCompleted"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRouter } from 'vue-router';
import { useBookingModal } from '../../composables/useBookingModal';
import QuickBookModal from '../QuickBookModal.vue';
import NotificationSheet from '../NotificationSheet.vue';
import BookingFlowModal from '../BookingFlowModal.vue';

const router = useRouter();

const bookingModal = useBookingModal();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const onSelectDoctor = () => {
  router.push('/services?tab=doctors');
};

const onSelectService = () => {
  router.push('/services?tab=services');
};

const onBookingCompleted = () => {
  router.push('/appointments');
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>
