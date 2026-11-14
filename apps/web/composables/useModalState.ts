import { ref, computed } from 'vue';

const openModalsCount = ref(0);
const isAnyModalOpen = computed(() => openModalsCount.value > 0);

const syncBodyClass = () => {
  if (typeof document === 'undefined') return;
  if (openModalsCount.value > 0) {
    document.body.classList.add('has-open-modal');
    document.documentElement.classList.add('has-open-modal');
  } else {
    document.body.classList.remove('has-open-modal');
    document.documentElement.classList.remove('has-open-modal');
  }
};

export const useModalState = () => {
  const registerModalOpen = () => {
    openModalsCount.value++;
    syncBodyClass();
  };

  const registerModalClose = () => {
    openModalsCount.value = Math.max(0, openModalsCount.value - 1);
    syncBodyClass();
  };

  const checkActiveModals = () => {
    syncBodyClass();
  };

  const initModalObserver = () => {
    syncBodyClass();
  };

  const destroyModalObserver = () => {
    openModalsCount.value = 0;
    syncBodyClass();
  };

  return {
    isAnyModalOpen,
    registerModalOpen,
    registerModalClose,
    checkActiveModals,
    initModalObserver,
    destroyModalObserver,
  };
};
