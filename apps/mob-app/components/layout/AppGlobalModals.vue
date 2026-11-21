<template>
  <div class="app-global-modals">
    <!-- Quick Book Bottom Sheet (Clinic, Online, Home, Service) -->
    <QuickBookModal
      v-model="bookingModal.isQuickBookOpen.value"
      @select-doctor="onSelectDoctor"
      @select-online="onSelectOnline"
      @select-home="onSelectHome"
      @select-service="onSelectService"
    />

    <!-- Notifications Drawer -->
    <NotificationSheet
      v-model="bookingModal.isNotificationOpen.value"
    />

    <!-- 15-minute Booking & Payment Checkout Wizard -->
    <BookingFlowModal
      :model-value="bookingModal.isBookingFlowOpen?.value ?? false"
      :doctor="bookingModal.activeDoctor?.value ?? null"
      :service="bookingModal.activeService?.value ?? null"
      :examination="bookingModal.activeService?.value ?? null"
      :appointment="bookingModal.activeAppointment?.value ?? null"
      :selected-date="bookingModal.activeDate?.value ?? ''"
      :selected-slot="bookingModal.activeSlot?.value ?? null"
      :initial-type="bookingModal.activeType?.value ?? 'consultation'"
      :consultation-type="bookingModal.activeConsultationType?.value ?? 'clinic'"
      @update:model-value="(val) => { if (!val) bookingModal.closeBookingFlow(); else if (bookingModal.isBookingFlowOpen) bookingModal.isBookingFlowOpen.value = val; }"
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
  router.push('/services?tab=doctors&type=clinic');
};

const onSelectOnline = () => {
  router.push('/services?tab=doctors&type=online');
};

const onSelectHome = () => {
  router.push('/services?tab=doctors&type=home');
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
