import { Capacitor } from '@capacitor/core';
import { storage } from '@shared/utils/storage';
import { useAuthStore } from '../stores/auth';
import { useNotifications } from '../composables/useNotifications';

export default defineNuxtPlugin(async (nuxtApp) => {
  // Only execute on native Android/iOS Capacitor runtimes
  if (!Capacitor.isNativePlatform()) {
    console.log('🌐 [PUSH-INIT: WEB_ENVIRONMENT] Capacitor is not on a native mobile platform. Push plugin skipped.');
    return;
  }

  const platform = Capacitor.getPlatform();
  console.log(`\n======================================================================`);
  console.log(`🚀 [PUSH-STEP-1: NATIVE_BOOT] Initializing Native Mobile Plugin (${platform.toUpperCase()})...`);
  console.log(`======================================================================`);

  const { App } = await import('@capacitor/app');
  const { StatusBar, Style } = await import('@capacitor/status-bar');
  const { Toast } = await import('@capacitor/toast');
  const { PushNotifications } = await import('@capacitor/push-notifications');

  // ─── 1. Status Bar Setup (Unity Medical Emerald Green) ───────────────
  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#047857' });
    console.log('🎨 [PUSH-STEP-1: STATUS_BAR] Status bar colored #047857 successfully.');
  } catch (err) {
    console.warn('⚠️ [PUSH-STEP-1: STATUS_BAR_ERROR]', err);
  }

  // ─── 2. Android Notification Channels (CRITICAL FOR VISIBLE NOTIFICATIONS) ──
  const setupNotificationChannels = async () => {
    if (platform === 'android') {
      try {
        console.log('📢 [PUSH-STEP-2: ANDROID_CHANNELS] Creating high-importance notification channels...');

        // 1. Default Channel (matches standard Firebase FCM messages)
        await PushNotifications.createChannel({
          id: 'default',
          name: 'General Notifications',
          description: 'General announcements and system alerts',
          importance: 5, // High importance = heads-up banner & sound
          visibility: 1,
          sound: 'default',
          vibration: true,
          lights: true,
          lightColor: '#047857',
        });

        // 2. Unity Clinics Channel
        await PushNotifications.createChannel({
          id: 'unity_channel',
          name: 'Unity Clinics Notifications',
          description: 'Appointments, medical alerts and reminders',
          importance: 5,
          visibility: 1,
          sound: 'default',
          vibration: true,
          lights: true,
          lightColor: '#047857',
        });

        console.log('✅ [PUSH-STEP-2: ANDROID_CHANNELS_READY] Default & Unity high-priority channels active.');
      } catch (channelErr: any) {
        console.warn('⚠️ [PUSH-STEP-2: CHANNELS_ERROR]', channelErr?.message || channelErr);
      }
    }
  };

  // ─── 3. Push Registration Flow ────────────────────────────────────────
  const triggerPushFlow = async () => {
    console.log(`\n----------------------------------------------------------------------`);
    console.log('📲 [PUSH-STEP-3: TRIGGER_FLOW] Requesting Push Permissions & Registration...');

    try {
      // 1. Check existing permission
      let permResult = await PushNotifications.checkPermissions();
      console.log(`📋 [PUSH-STEP-3: PERM_STATUS] Current Permission: "${permResult.receive}"`);

      // 2. Prompt if not granted (handles 'prompt', 'prompt-with-rationale', etc.)
      if (permResult.receive !== 'granted') {
        console.log(`❓ [PUSH-STEP-3: PROMPT] Current status is "${permResult.receive}". Requesting native permissions...`);
        permResult = await PushNotifications.requestPermissions();
        console.log(`📋 [PUSH-STEP-3: PROMPT_RESPONSE] User selected: "${permResult.receive}"`);
      }

      // 3. Register with Apple APNs / Google FCM
      if (permResult.receive === 'granted') {
        console.log('🚀 [PUSH-STEP-4: CALLING_REGISTER] Permission granted! Calling PushNotifications.register()...');
        await PushNotifications.register();
        console.log('⏳ [PUSH-STEP-4: WAITING_NATIVE_EVENT] Registration requested. Awaiting "registration" event from OS...');
      } else {
        console.warn(`⚠️ [PUSH-STEP-3: PERM_DENIED] Push permission is "${permResult.receive}". Notifications cannot be displayed.`);
        if (typeof window !== 'undefined') {
          await Toast.show({
            text: `⚠️ يرجى السماح بالإشعارات من إعدادات الهاتف (الحالة: ${permResult.receive})`,
            duration: 'long',
          });
        }
      }
    } catch (err: any) {
      console.error('❌ [PUSH-STEP-ERROR: triggerPushFlow]', err?.message || err);
    }
    console.log(`----------------------------------------------------------------------\n`);
  };

  const unregisterPush = async () => {
    if (typeof localStorage === 'undefined') return;
    const fcmToken = localStorage.getItem('last_fcm_token');
    if (!fcmToken) {
      console.log('ℹ️ [PUSH-UNREGISTER] No saved device token found. Skipping unregister.');
      return;
    }

    try {
      console.log(`📤 [PUSH-UNREGISTER] Unregistering device token from server: ${fcmToken.slice(0, 16)}...`);
      await (nuxtApp as any).$apiRequest({
        service: 'UNREGISTER_DEVICE_TOKEN',
        payload: { token: fcmToken },
      });
      localStorage.removeItem('last_fcm_token');
      console.log('✅ [PUSH-UNREGISTER] Device token successfully unregistered from server.');
    } catch (err: any) {
      console.error('❌ [PUSH-UNREGISTER_ERROR]', err?.message || err);
    }
  };

  nuxtApp.provide('triggerPushFlow', triggerPushFlow);
  nuxtApp.provide('unregisterPush', unregisterPush);

  // ─── 4. Register Native Event Listeners ────────────────────────────────
  let pushInitialized = false;

  const initPush = async () => {
    if (pushInitialized) return;
    pushInitialized = true;

    console.log('\n⚙️ [PUSH-INIT] Initializing notification channels and listeners...');
    await setupNotificationChannels();

    // ─────────────────────────────────────────────────────────────
    // LISTENER A: Device Token Received from OS (Android FCM / iOS APNs)
    // ─────────────────────────────────────────────────────────────
    PushNotifications.addListener('registration', async (pushToken) => {
      console.log('\n======================================================================');
      console.log('🎯 [PUSH-STEP-5: TOKEN_RECEIVED] OS Native Layer returned Device Token!');
      console.log(`   Token Length: ${pushToken.value?.length || 0} characters`);
      console.log(`   Token (First 30): ${pushToken.value?.slice(0, 30)}...`);
      console.log(`   Token (Last 30): ...${pushToken.value?.slice(-30)}`);
      console.log(`   Platform: ${platform}`);
      console.log('======================================================================');

      let tokenValue = pushToken.value;

      // iOS APNs to Firebase FCM Token exchange (if running on iOS)
      if (platform === 'ios') {
        const isApnsHex = /^[0-9a-fA-F]{64}$/.test(tokenValue || '');
        console.log('🍏 ================== [iOS PUSH TOKEN INSPECTION] ==================');
        console.log(`🍏 [iOS-TOKEN-TYPE] Token format: ${isApnsHex ? '64-hex Raw APNs Device Token' : 'FCM / Hybrid Token'}`);
        console.log(`🍏 [iOS-RAW-TOKEN] ${tokenValue}`);

        try {
          console.log('🍏 [iOS-FCM-EXCHANGE] Importing @capacitor-community/fcm to retrieve Firebase FCM token...');
          const { FCM } = await import('@capacitor-community/fcm');
          for (let attempt = 1; attempt <= 4; attempt++) {
            try {
              console.log(`   🔄 [iOS-FCM-ATTEMPT ${attempt}/4] Calling FCM.getToken()...`);
              const fcmRes = await FCM.getToken();
              console.log(`   📋 [iOS-FCM-RESULT] Attempt ${attempt} result:`, fcmRes);

              if (fcmRes?.token && fcmRes.token !== tokenValue) {
                console.log(`   🔥 [iOS-FCM-SUCCESS] Received FCM Token from Firebase SDK on iOS!`);
                console.log(`   🔥 [iOS-FCM-TOKEN] ${fcmRes.token}`);
                tokenValue = fcmRes.token;
                break;
              } else if (fcmRes?.token) {
                console.log(`   ℹ️ [iOS-FCM-SAME] Token returned matches initial value: ${fcmRes.token.slice(0, 20)}...`);
                break;
              }
            } catch (fcmErr: any) {
              console.warn(`   ⚠️ [iOS-FCM-ERROR] Attempt ${attempt} failed:`, fcmErr?.message || fcmErr);
            }
            await new Promise((r) => setTimeout(r, 800 * attempt));
          }
        } catch (importErr: any) {
          console.warn('ℹ️ [iOS-FCM-IMPORT] @capacitor-community/fcm import error or unavailable:', importErr?.message || importErr);
        }
        console.log('🍏 ===================================================================');
      }

      // Always save token locally for debugging and persistence
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('last_fcm_token', tokenValue);
      }
      if (typeof window !== 'undefined') {
        (window as any).__UNITY_FCM_TOKEN__ = tokenValue;
      }

      // ─────────────────────────────────────────────────────────────
      // Send token to backend server
      // ─────────────────────────────────────────────────────────────
      console.log('\n📤 [PUSH-STEP-6: SENDING_TO_BACKEND] Registering device token with Unity backend server...');
      try {
        const response = await (nuxtApp as any).$apiRequest({
          service: 'REGISTER_DEVICE_TOKEN',
          payload: {
            token: tokenValue,
            platform,
          },
        });
        console.log('✅ [PUSH-STEP-7: BACKEND_ACKNOWLEDGED] Server response:', response);

        // Visual confirmation on phone screen in development
        await Toast.show({
          text: `📲 تم تفعيل إشعارات الهاتف بنجاح`,
          duration: 'short',
        });
      } catch (backendErr: any) {
        console.error('❌ [PUSH-STEP-7: BACKEND_ERROR] Failed to send token to server:', backendErr?.message || backendErr);
      }
      console.log('======================================================================\n');
    });

    // ─────────────────────────────────────────────────────────────
    // LISTENER B: Registration Error from OS
    // ─────────────────────────────────────────────────────────────
    PushNotifications.addListener('registrationError', (err) => {
      console.error('\n======================================================================');
      console.error('💥 [PUSH-STEP-ERROR: REGISTRATION_FAILED] Native layer error:', err);
      if (platform === 'ios') {
        console.error('🍏 [iOS-PUSH-ERROR-DIAGNOSTICS] Common iOS registration issues:');
        console.error('   1. iOS Simulator cannot register for real APNs push notifications.');
        console.error('   2. Missing "aps-environment" in App.entitlements or Push Notifications capability.');
        console.error('   3. Provisioning profile for com.unityClinics.app does not have Push Notifications enabled.');
      }
      console.error('======================================================================\n');
      Toast.show({
        text: `❌ خطأ في تسجيل الإشعارات: ${err.error || 'Unknown error'}`,
        duration: 'long',
      });
    });

    // ─────────────────────────────────────────────────────────────
    // LISTENER C: Notification Received in FOREGROUND
    // ─────────────────────────────────────────────────────────────
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('\n======================================================================');
      console.log('🔔 [PUSH-STEP-8: FOREGROUND_NOTIFICATION_RECEIVED] Incoming notification while app is open!');
      console.log('   Title:', notification.title);
      console.log('   Body:', notification.body);
      console.log('   Data Payload:', JSON.stringify(notification.data || {}));
      console.log('   ID:', notification.id);
      console.log('======================================================================\n');

      // Show toast alert on screen
      if (notification.title || notification.body) {
        Toast.show({
          text: `🔔 ${notification.title || ''}: ${notification.body || ''}`.trim(),
          duration: 'long',
        });
      }

      // Refresh in-app notifications
      try {
        const notifService = useNotifications();
        notifService.NOTIFICATIONS();
      } catch (_) {}
    });

    // ─────────────────────────────────────────────────────────────
    // LISTENER D: Notification Clicked by User (from Notification Drawer)
    // ─────────────────────────────────────────────────────────────
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('\n======================================================================');
      console.log('👉 [PUSH-STEP-9: USER_CLICKED_NOTIFICATION] Action performed!');
      console.log('   Action ID:', action.actionId);
      console.log('   Notification:', JSON.stringify(action.notification || {}));
      console.log('======================================================================\n');

      const data = action.notification?.data;
      const router = nuxtApp.$router;

      if (data?.url) {
        router.push(data.url);
      } else if (data?.type === 'appointment') {
        router.push('/appointments');
      } else if (data?.type === 'chat' || data?.type === 'support') {
        router.push('/support');
      } else {
        router.push('/');
      }
    });

    // Run permission request and registration immediately
    await triggerPushFlow();
  };

  // Run when app returns from background
  App.addListener('appStateChange', async ({ isActive }) => {
    console.log(`📱 [APP-STATE-CHANGE] App isActive: ${isActive}`);
    if (isActive) {
      await initPush();
    }
  });

  // Initial delayed boot (allows Capacitor native bridge to settle)
  setTimeout(initPush, 400);

  // ─── 5. OAuth Deep Link Handler ───────────────────────────────────────
  App.addListener('appUrlOpen', async (event) => {
    console.log('🔗 [DEEP-LINK] App opened via URL:', event.url);
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

  // ─── 6. Android Hardware Back Button Handling ─────────────────────────
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
