import { ref } from 'vue';

const isQuickBookOpen = ref(false);
const isBookingFlowOpen = ref(false);
const isNotificationOpen = ref(false);

const activeDoctor = ref<any>(null);
const activeService = ref<any>(null);
const activeDate = ref<string>('');
const activeSlot = ref<any>(null);
const activeType = ref<'consultation' | 'follow_up'>('consultation');
const activeAppointment = ref<any>(null);

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
    examination?: any;
    date?: string;
    slot?: any;
    type?: 'consultation' | 'follow_up' | 'examination';
    appointment?: any;
  } = {}) => {
    const isExam = options.type === 'examination' || Boolean(options.examination || options.service);
    activeDoctor.value = isExam ? (options.doctor || null) : (options.doctor !== undefined ? options.doctor : (options.appointment?.doctor || null));
    activeService.value = options.service || options.examination || options.appointment?.examination || options.appointment?.offer || null;
    activeDate.value = options.date || (options.appointment?.date ? new Date(options.appointment.date).toISOString().split('T')[0] : '');
    activeSlot.value = options.slot || (options.appointment?.start_time ? { start_time: options.appointment.start_time, end_time: options.appointment.end_time } : null);
    activeType.value = (options.type as any) || (isExam ? 'examination' : (options.appointment?.type || 'consultation'));
    activeAppointment.value = options.appointment || null;
    isBookingFlowOpen.value = true;
  };

  const closeBookingFlow = () => {
    isBookingFlowOpen.value = false;
    activeDoctor.value = null;
    activeService.value = null;
    activeDate.value = '';
    activeSlot.value = null;
    activeAppointment.value = null;
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
    activeType,
    activeAppointment,
    openQuickBook,
    closeQuickBook,
    openBookingFlow,
    closeBookingFlow,
    openNotifications,
    closeNotifications,
  };
}

