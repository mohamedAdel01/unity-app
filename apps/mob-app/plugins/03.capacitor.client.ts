import { Capacitor } from '@capacitor/core';
import { storage } from '@shared/utils/storage';
import { useAuthStore } from '../stores/auth';
import { useNotifications } from '../composables/useNotifications';

export default defineNuxtPlugin(async (nuxtApp) => {
  // Only execute on native Android/iOS Capacitor runtimes
  if (!Capacitor.isNativePlatform()) return;

  const { App } = await import('@capacitor/app');
  const { StatusBar, Style } = await import('@capacitor/status-bar');
  const { Toast } = await import('@capacitor/toast');
  const { PushNotifications } = await import('@capacitor/push-notifications');

  // ─── 1. Status Bar Setup (Unity Medical Emerald Green) ───────────────
  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#047857' });
  } catch (err) {
    console.warn('⚠️ [StatusBar] Init error:', err);
  }

  // ─── 2. Push Notification Helpers ─────────────────────────────────────
  const triggerPushFlow = async () => {
    console.log('\n[Push Flow] 🚀 triggerPushFlow invoked...');
    const rawToken = (await storage.get('unity_token')) || (await storage.get('token')) || (typeof localStorage !== 'undefined' ? localStorage.getItem('unity_token') : null);
    const token = rawToken?.replace(/['"]+/g, '');

    if (!token) {
      console.log('[Push Flow] ⚠️ User not authenticated. Push registration deferred until login.');
      return;
    }

    console.log('[Push Flow] 👤 User is authenticated. Checking push permissions...');
    try {
      let permResult = await PushNotifications.checkPermissions();
      console.log(`[Push Flow] 📋 Current permission status: "${permResult.receive}"`);

      if (permResult.receive === 'prompt') {
        console.log('[Push Flow] ❓ Requesting push permission prompt from user...');
        permResult = await PushNotifications.requestPermissions();
        console.log(`[Push Flow] 📋 User response: "${permResult.receive}"`);
      }

      if (permResult.receive === 'granted') {
        console.log('[Push Flow] 📲 Calling PushNotifications.register()...');
        await PushNotifications.register();
      } else {
        console.warn(`[Push Flow] ⚠️ Push permission not granted (status: "${permResult.receive}").`);
      }
    } catch (err) {
      console.error('[Push Flow] ❌ Push setup error:', err);
    }
  };

  const unregisterPush = async () => {
    if (typeof localStorage === 'undefined') return;
    const fcmToken = localStorage.getItem('last_fcm_token');
    if (!fcmToken) {
      console.log('[Push Flow] ℹ️ unregisterPush skipped: No saved device token found.');
      return;
    }

    try {
      console.log(`[Push Flow] 📤 Unregistering device token from server: ${fcmToken.slice(0, 12)}...`);
      await (nuxtApp as any).$apiRequest({
        service: 'UNREGISTER_DEVICE_TOKEN',
        payload: { token: fcmToken },
      });
      localStorage.removeItem('last_fcm_token');
      console.log('✅ [Push Flow] Device token successfully unregistered from server.');
    } catch (err) {
      console.error('❌ [Push Flow] Failed to unregister device token:', err);
    }
  };

  // Provide to Nuxt app
  nuxtApp.provide('triggerPushFlow', triggerPushFlow);
  nuxtApp.provide('unregisterPush', unregisterPush);

  // ─── 3. Initialize Push Listeners ─────────────────────────────────────
  let pushInitialized = false;

  const initPush = async () => {
    if (pushInitialized) return;
    pushInitialized = true;
    console.log('[Push Init] ⚙️ Initializing push listeners...');

    // Listener: Registration success from Native Layer
    PushNotifications.addListener('registration', async (pushToken) => {
      console.log('\n================== [CLIENT PUSH REGISTRATION] ==================');
      console.log('🎯 Native registration event received!');
      console.log(`🔑 Native Token: ${pushToken.value?.slice(0, 16)}... (length: ${pushToken.value?.length})`);

      const rawToken = (await storage.get('unity_token')) || (await storage.get('token')) || (typeof localStorage !== 'undefined' ? localStorage.getItem('unity_token') : null);
      const token = rawToken?.replace(/['"]+/g, '');
      if (!token) {
        console.log('⚠️ User not logged in. Token will not be sent to server yet.');
        console.log('================================================================\n');
        return;
      }

      let tokenValue = pushToken.value;
      const platform = Capacitor.getPlatform();

      // iOS APNs to FCM exchange support
      if (platform === 'ios') {
        try {
          const { FCM } = await import('@capacitor-community/fcm');
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              const fcmRes = await FCM.getToken();
              if (fcmRes?.token && fcmRes.token !== pushToken.value) {
                tokenValue = fcmRes.token;
                break;
              }
            } catch (_) {}
            await new Promise((r) => setTimeout(r, 500 * attempt));
          }
        } catch (_) {}
      }

      console.log(`📤 Sending REGISTER_DEVICE_TOKEN to backend (Platform: ${platform})...`);
      try {
        await (nuxtApp as any).$apiRequest({
          service: 'REGISTER_DEVICE_TOKEN',
          payload: {
            token: tokenValue,
            platform,
          },
        });
        console.log('✅ Device token successfully registered with backend server!');
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('last_fcm_token', tokenValue);
        }
      } catch (err) {
        console.error('❌ Failed to register device token with backend:', err);
      }
      console.log('================================================================\n');
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('\n💥 [CLIENT PUSH ERROR] registrationError event:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📥 [CLIENT PUSH] Foreground notification received:', notification);
      if (notification?.title || notification?.body) {
        Toast.show({
          text: `${notification.title || ''}: ${notification.body || ''}`.trim(),
        });
      }
      try {
        const notifService = useNotifications();
        notifService.NOTIFICATIONS();
      } catch (_) {}
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('👉 [CLIENT PUSH] Notification clicked:', action);
      const data = action.notification.data;
      const router = nuxtApp.$router;

      if (data?.url) {
        router.push(data.url);
      } else if (data?.type === 'appointment') {
        router.push('/appointments');
      } else if (data?.type === 'chat') {
        router.push('/support');
      }
    });

    await triggerPushFlow();
  };

  // Run when app returns from background
  App.addListener('appStateChange', async ({ isActive }) => {
    if (isActive) await initPush();
  });

  // Initial delayed boot
  setTimeout(initPush, 350);

  // ─── 4. OAuth Deep Link Handler ───────────────────────────────────────
  App.addListener('appUrlOpen', async (event) => {
    if (event.url.includes('/auth') || event.url.startsWith('unity://') || event.url.startsWith('unityclinics://')) {
      try {
        const url = new URL(event.url);
        const token = url.searchParams.get('token');
        const user = url.searchParams.get('user');

        if (token && user) {
          await storage.set('unity_token', token);
          await storage.set('unity_user', user);
          const authStore = useAuthStore();
          authStore.setAuth(JSON.parse(user), token);
          await triggerPushFlow();

          setTimeout(() => {
            window.location.href = '/';
          }, 250);
        }
      } catch (err) {
        console.error('Failed to parse app deep link URL:', err);
      }
    }
  });

  // ─── 5. Android Hardware Back Button Handling ─────────────────────────
  let navDepth = 0;
  let lastBackPress = 0;
  const router = nuxtApp.$router;

  router.afterEach((to, from, failure) => {
    if (failure) return;
    const pos = typeof window !== 'undefined' && window.history.state?.position !== undefined
      ? window.history.state.position
      : null;

    if (pos !== null) {
      navDepth = pos;
    } else {
      navDepth++;
    }
  });

  App.addListener('backButton', async () => {
    // 1. Close any open modal / backdrop / drawer / sheet first
    const openBackdrop = document.querySelector<HTMLElement>(
      '.notif-backdrop, .modal-backdrop, .confirm-modal-backdrop, .admin-booking-modal-backdrop, .doctor-cases-modal-backdrop, .date-picker-backdrop, .time-picker-backdrop, .more-menu-backdrop, .country-dropdown-overlay'
    );
    if (openBackdrop) {
      openBackdrop.click();
      return;
    }

    // Also dispatch Escape key event for any component listening to Escape
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        bubbles: true,
      })
    );

    // 2. Normal back navigation
    const currentPath = router.currentRoute.value.path;
    const isHome = currentPath === '/' || currentPath === '/ar' || currentPath === '/en' || currentPath === '/admin';

    if (isHome) {
      const now = Date.now();
      if (lastBackPress && lastBackPress + 2000 > now) {
        App.exitApp();
      } else {
        lastBackPress = now;
        await Toast.show({
          text: 'اضغط رجوع مرة أخرى للخروج من التطبيق',
        });
      }
    } else if (navDepth > 0) {
      router.back();
    } else {
      router.push('/');
    }
  });
});
