import { ref } from 'vue';

const isQuickBookOpen = ref(false);
const isBookingFlowOpen = ref(false);
const isNotificationOpen = ref(false);

const activeDoctor = ref<any>(null);
const activeService = ref<any>(null);
const activeDate = ref<string>('');
const activeSlot = ref<any>(null);

export function useBookingModal() {
  const openQuickBook = () => {
    isQuickBookOpen.value = true;
  };

  const closeQuickBook = () => {
    isQuickBookOpen.value = false;
  };

  const openBookingFlow = (options: {
    doctor?: any;
    service?: any;
    date?: string;
    slot?: any;
  } = {}) => {
    activeDoctor.value = options.doctor || null;
    activeService.value = options.service || null;
    activeDate.value = options.date || '';
    activeSlot.value = options.slot || null;
    isBookingFlowOpen.value = true;
  };

  const closeBookingFlow = () => {
    isBookingFlowOpen.value = false;
  };

  const openNotifications = () => {
    isNotificationOpen.value = true;
  };

  const closeNotifications = () => {
    isNotificationOpen.value = false;
  };

  return {
    isQuickBookOpen,
    isBookingFlowOpen,
    isNotificationOpen,
    activeDoctor,
    activeService,
    activeDate,
    activeSlot,
    openQuickBook,
    closeQuickBook,
    openBookingFlow,
    closeBookingFlow,
    openNotifications,
    closeNotifications,
  };
}

