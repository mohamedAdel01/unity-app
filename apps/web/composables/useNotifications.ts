import { ref, computed } from 'vue';
import { useUnityApi } from './useUnityApi';
import { useAuthStore } from '../stores/auth';

// Shared singleton reactive state
const notifications = ref<any[]>([]);
const isFetching = ref(false);
const lastFetchedAt = ref<Date | null>(null);

export function useNotifications() {
  const api = useUnityApi();
  const authStore = useAuthStore();

  const unreadCount = computed(() => {
    return notifications.value.filter((n) => !n.is_read).length;
  });

  const hasUnread = computed(() => unreadCount.value > 0);

  // Fetch notifications from backend with comprehensive step logging
  const NOTIFICATIONS = async () => {
    if (!authStore.isAuthenticated) {
      console.log('ℹ️ [NOTIF-STEP-7: CLIENT_FETCH] User not authenticated, skipping fetch.');
      notifications.value = [];
      return;
    }

    isFetching.value = true;
    console.log(`\n🔔 [NOTIF-STEP-7: CLIENT_FETCH_START] Requesting user notifications from server...`);
    console.log(`   User ID: ${authStore.user?.id || 'N/A'}, Role: ${authStore.user?.role || 'N/A'}`);

    try {
      const res = await api.apiRequest({
        service: 'NOTIFICATIONS',
        filter: { page: 1, limit: 20 },
      });

      console.log('📦 [NOTIF-STEP-10: CLIENT_FETCH_SUCCESS] Raw server response:', res);

      if (res?.status && Array.isArray(res.data)) {
        notifications.value = res.data;
        lastFetchedAt.value = new Date();
        console.log(`✅ [NOTIF-STEP-10: STATE_UPDATED] Loaded ${res.data.length} notifications (${unreadCount.value} unread).`);
      } else {
        console.warn('⚠️ [NOTIF-STEP-10: EMPTY_DATA] Response status was false or data was not an array');
        notifications.value = [];
      }
    } catch (err: any) {
      console.error('❌ [NOTIF-STEP-ERROR: CLIENT_FETCH]', err?.message || err);
    } finally {
      isFetching.value = false;
    }
  };

  const markRead = async (item: any) => {
    if (!item || item.is_read) return;
    console.log(`\n👁️ [NOTIF-CLIENT: MARK_READ] Marking notification ID ${item.id} as read...`);
    item.is_read = true;

    try {
      if (authStore.isAuthenticated && item.id) {
        await api.apiRequest({
          service: 'MARK_NOTIFICATION_READ',
          payload: { id: item.id },
        });
        console.log(`✅ [NOTIF-CLIENT: MARK_READ_SUCCESS] Successfully updated read status on server.`);
      }
    } catch (err: any) {
      console.error('❌ [NOTIF-CLIENT: MARK_READ_ERROR]', err?.message || err);
    }
  };

  const markAllRead = async () => {
    console.log(`\n👁️ [NOTIF-CLIENT: MARK_ALL_READ] Marking all ${notifications.value.length} notifications as read...`);
    notifications.value.forEach((n) => (n.is_read = true));

    try {
      if (authStore.isAuthenticated) {
        await api.apiRequest({
          service: 'MARK_ALL_NOTIFICATIONS_READ',
        });
        console.log(`✅ [NOTIF-CLIENT: MARK_ALL_READ_SUCCESS] Server updated all notifications to read.`);
      }
    } catch (err: any) {
      console.error('❌ [NOTIF-CLIENT: MARK_ALL_READ_ERROR]', err?.message || err);
    }
  };

  return {
    notifications,
    unreadCount,
    hasUnread,
    isFetching,
    lastFetchedAt,
    NOTIFICATIONS,
    markRead,
    markAllRead,
  };
}
