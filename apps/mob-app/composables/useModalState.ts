import { ref, readonly } from 'vue';

const isAnyModalOpen = ref(false);
let observer: MutationObserver | null = null;

const BACKDROP_SELECTORS = [
  '.modal-backdrop',
  '.booking-backdrop',
  '.admin-booking-modal-backdrop',
  '.doctor-cases-modal-backdrop',
  '.app-confirm-backdrop',
  '.notification-drawer-backdrop',
  '[class*="-backdrop"]',
  '[class*="modal-backdrop"]',
];

const checkActiveModals = () => {
  if (typeof document === 'undefined') return;
  const found = document.querySelector(BACKDROP_SELECTORS.join(', '));
  const hasModal = !!found;
  if (isAnyModalOpen.value !== hasModal) {
    isAnyModalOpen.value = hasModal;
  }
  if (hasModal) {
    document.body.classList.add('has-open-modal');
  } else {
    document.body.classList.remove('has-open-modal');
  }
};

export const useModalState = () => {
  const initModalObserver = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (observer) return;

    checkActiveModals();

    observer = new MutationObserver(() => {
      checkActiveModals();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });
  };

  const destroyModalObserver = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (typeof document !== 'undefined') {
      document.body.classList.remove('has-open-modal');
    }
    isAnyModalOpen.value = false;
  };

  return {
    isAnyModalOpen: readonly(isAnyModalOpen),
    checkActiveModals,
    initModalObserver,
    destroyModalObserver,
  };
};
