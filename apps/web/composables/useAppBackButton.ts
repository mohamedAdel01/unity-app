import { useRouter, useRoute } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { App as CapApp, type PluginListenerHandle } from '@capacitor/app';
import { Toast } from '@capacitor/toast';
import { useI18n } from './useI18n';
import { useAppToast } from './useAppToast';
import { useBookingModal } from './useBookingModal';
import { useModalState } from './useModalState';

let backButtonListener: PluginListenerHandle | null = null;
let lastBackPressTime = 0;

export function useAppBackButton() {
  const router = useRouter();
  const route = useRoute();
  const { t } = useI18n();
  const toast = useAppToast();
  const bookingModal = useBookingModal();
  const { isAnyModalOpen } = useModalState();

  const handleBackButton = async (_event?: { canGoBack?: boolean }) => {
    // 1. If any booking modal/sheet is open, close it first
    if (bookingModal.isQuickBookOpen.value) {
      bookingModal.closeQuickBook();
      return;
    }
    if (bookingModal.isNotificationOpen.value) {
      bookingModal.closeNotifications();
      return;
    }
    if (bookingModal.isBookingFlowOpen.value) {
      bookingModal.closeBookingFlow();
      return;
    }

    // 2. If any other modal sheet / backdrop is open, dismiss it
    if (isAnyModalOpen.value && typeof document !== 'undefined') {
      const activeBackdrop = document.querySelector('.modal-backdrop, [class*="modal-backdrop"]') as HTMLElement | null;
      if (activeBackdrop) {
        activeBackdrop.click();
        return;
      }
    }

    // 3. Check if we are on a root exit page
    const currentPath = route.path;
    const rootPaths = ['/', '/admin', '/auth/login'];
    const isRootPage = rootPaths.includes(currentPath);

    // If not on root page, navigate back
    if (!isRootPage) {
      router.back();
      return;
    }

    // 4. On root page: Double-tap back to exit
    const now = Date.now();
    if (now - lastBackPressTime < 2000) {
      if (Capacitor.isNativePlatform()) {
        try {
          await CapApp.exitApp();
        } catch {
          // ignore
        }
      }
    } else {
      lastBackPressTime = now;
      const msg = t('Press back again to exit');
      toast.info(msg);

      if (Capacitor.isNativePlatform()) {
        try {
          await Toast.show({
            text: msg,
            duration: 'short',
            position: 'bottom',
          });
        } catch {
          // fallback to in-app toast
        }
      }
    }
  };

  const initBackButtonHandler = async () => {
    if (typeof window === 'undefined') return;

    if (Capacitor.isNativePlatform()) {
      if (!backButtonListener) {
        backButtonListener = await CapApp.addListener('backButton', (data) => {
          handleBackButton(data);
        });
      }
    }
  };

  const destroyBackButtonHandler = async () => {
    if (backButtonListener) {
      await backButtonListener.remove();
      backButtonListener = null;
    }
  };

  return {
    handleBackButton,
    initBackButtonHandler,
    destroyBackButtonHandler,
  };
}
