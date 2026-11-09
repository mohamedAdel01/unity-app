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
      @booking-completed="onBookingCompleted"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useBookingModal } from '../../composables/useBookingModal';
import QuickBookModal from '../QuickBookModal.vue';
import NotificationSheet from '../NotificationSheet.vue';
import BookingFlowModal from '../BookingFlowModal.vue';

const router = useRouter();
const bookingModal = useBookingModal();

const onSelectDoctor = () => {
  router.push('/services?tab=doctors');
};

const onSelectService = () => {
  router.push('/services?tab=services');
};

const onBookingCompleted = () => {
  router.push('/appointments');
};
</script>
