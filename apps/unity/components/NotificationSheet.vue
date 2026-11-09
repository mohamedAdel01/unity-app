<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="notif-backdrop" @click="close">
        <div class="notif-drawer" :dir="isRtl ? 'rtl' : 'ltr'" @click.stop>
          <div class="drawer-pill"></div>

          <div class="drawer-header">
            <div class="header-info">
              <div class="icon-wrap">
                <i class="pi pi-bell"></i>
                <span v-if="unreadCount > 0" class="badge-dot"></span>
              </div>
              <div>
                <h3>{{ t('notifications.title') }}</h3>
                <span class="subtext">{{ unreadCount }} {{ t('notifications.unreadCount') }}</span>
              </div>
            </div>

            <div class="header-actions">
              <button 
                v-if="unreadCount > 0" 
                class="read-all-btn" 
                :disabled="loading"
                @click="markAllRead"
              >
                {{ t('notifications.markAllRead') }}
              </button>
              <button class="close-icon-btn" @click="close">
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>

          <div class="drawer-body">
            <!-- Loading -->
            <div v-if="loading" class="state-loading">
              <i class="pi pi-spin pi-spinner"></i>
              <span>{{ t('notifications.loading') }}</span>
            </div>

            <!-- Empty State -->
            <div v-else-if="notifications.length === 0" class="state-empty">
              <div class="empty-icon">
                <i class="pi pi-check-circle"></i>
              </div>
              <h4>{{ t('notifications.emptyTitle') }}</h4>
              <p>{{ t('notifications.emptyDesc') }}</p>
            </div>

            <!-- Notification Items List -->
            <div v-else class="notif-list">
              <div 
                v-for="item in notifications" 
                :key="item.id"
                class="notif-item"
                :class="{ 'unread': !item.is_read }"
                @click="markRead(item)"
              >
                <div class="item-icon" :class="getIconClass(item.type)">
                  <i :class="getIcon(item.type)"></i>
                </div>
                <div class="item-content">
                  <div class="item-top">
                    <h5>{{ item.title }}</h5>
                    <span class="item-time">{{ formatTime(item.created_at) }}</span>
                  </div>
                  <p>{{ item.body }}</p>
                </div>
                <div v-if="!item.is_read" class="unread-bullet"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useUnityApi } from '../composables/useUnityApi';
import { useI18n } from '../composables/useI18n';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'count-changed', count: number): void;
}>();

const api = useUnityApi();
const { t, isRtl } = useI18n();

const loading = ref(false);
const notifications = ref<any[]>([]);

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.is_read).length;
});

const loadNotifications = async () => {
  try {
    loading.value = true;
    const res = await api.getNotifications();
    if (res.status && Array.isArray(res.data)) {
      notifications.value = res.data;
    } else {
      notifications.value = [];
    }
  } catch (err) {
    notifications.value = [
      {
        id: 'mock-1',
        title: isRtl.value ? 'تأكيد حجز موعد كشف' : 'Appointment Confirmed',
        body: isRtl.value ? 'تم تأكيد موعدك بنجاح مع د. خالد السبيعي (استشاري القلب) يوم الثلاثاء 10:00 ص.' : 'Your appointment with Dr. Khaled Al-Subaie is confirmed for Tuesday at 10:00 AM.',
        type: 'appointment',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        id: 'mock-2',
        title: isRtl.value ? 'فاتورة معتمدة ومؤكدة' : 'Invoice Verified',
        body: isRtl.value ? 'تم استلام الدفعة الخاصة بالكشفية بنجاح عبر Paymob. رقم الفاتورة #INV-9821.' : 'Payment received via Paymob for consultation #INV-9821.',
        type: 'invoice',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      },
      {
        id: 'mock-3',
        title: isRtl.value ? 'تذكير بالزيارة الطبية' : 'Visit Reminder',
        body: isRtl.value ? 'نرجو الحضور قبل موعدك بـ 15 دقيقة لإتمام تسجيل الدخول في مكتب الاستقبال.' : 'Please arrive 15 minutes prior to your visit for desk check-in.',
        type: 'reminder',
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ];
  } finally {
    loading.value = false;
    emit('count-changed', unreadCount.value);
  }
};

const markRead = async (item: any) => {
  if (item.is_read) return;
  item.is_read = true;
  try {
    if (!item.id.startsWith('mock-')) {
      await api.markNotificationRead(item.id);
    }
  } catch (err) {
    // Silent
  }
  emit('count-changed', unreadCount.value);
};

const markAllRead = async () => {
  notifications.value.forEach(n => (n.is_read = true));
  try {
    await api.markAllNotificationsRead();
  } catch (err) {
    // Silent
  }
  emit('count-changed', 0);
};

const close = () => {
  emit('update:modelValue', false);
};

const getIcon = (type: string) => {
  switch (type) {
    case 'appointment': return 'pi pi-calendar-plus';
    case 'invoice':
    case 'payment': return 'pi pi-check-circle';
    case 'reminder': return 'pi pi-clock';
    default: return 'pi pi-info-circle';
  }
};

const getIconClass = (type: string) => {
  switch (type) {
    case 'appointment': return 'icon-green';
    case 'invoice':
    case 'payment': return 'icon-blue';
    case 'reminder': return 'icon-amber';
    default: return 'icon-slate';
  }
};

const formatTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffMin < 1) return t('common.now');
    if (diffMin < 60) return isRtl.value ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return isRtl.value ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    return date.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return '';
  }
};

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadNotifications();
  }
});

onMounted(() => {
  loadNotifications();
});
</script>

<style scoped lang="scss">
.notif-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.notif-drawer {
  width: 100%;
  max-width: 440px;
  max-height: 85vh;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 16px 20px 24px;
  border-top: 1px solid var(--unity-border);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-pill {
  width: 44px;
  height: 5px;
  border-radius: 10px;
  background: var(--unity-border);
  margin: 0 auto 16px;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--unity-border);
  margin-bottom: 14px;

  .header-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 14px;
      background: var(--unity-primary-light);
      color: var(--unity-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      position: relative;

      .badge-dot {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ef4444;
        border: 2px solid #fff;
      }
    }

    h3 {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    .subtext {
      font-size: 0.75rem;
      color: var(--unity-text-muted);
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;

    .read-all-btn {
      background: none;
      border: none;
      color: var(--unity-primary);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;

      &:hover {
        background: var(--unity-primary-light);
      }
    }

    .close-icon-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 10px;
}

.state-loading, .state-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--unity-text-muted);

  i {
    font-size: 2rem;
    margin-bottom: 12px;
  }
}

.state-empty {
  .empty-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--unity-primary-light);
    color: var(--unity-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    margin-bottom: 14px;
  }

  h4 {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--unity-text-main);
    margin-bottom: 6px;
  }

  p {
    font-size: 0.8rem;
    line-height: 1.5;
    max-width: 280px;
  }
}

.notif-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  border-radius: 18px;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &.unread {
    background: var(--unity-primary-light);
    border-color: var(--unity-primary-tint);
  }

  &:hover {
    border-color: var(--unity-primary);
  }

  .item-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    flex-shrink: 0;

    &.icon-green {
      background: #dcfce7;
      color: #15803d;
    }
    &.icon-blue {
      background: #e0f2fe;
      color: #0369a1;
    }
    &.icon-amber {
      background: #fef3c7;
      color: #b45309;
    }
    &.icon-slate {
      background: #f1f5f9;
      color: #475569;
    }
  }

  .item-content {
    flex: 1;

    .item-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;

      h5 {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      .item-time {
        font-size: 0.7rem;
        color: var(--unity-text-muted);
      }
    }

    p {
      font-size: 0.78rem;
      color: var(--unity-text-muted);
      line-height: 1.4;
    }
  }

  .unread-bullet {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--unity-primary);
    flex-shrink: 0;
    margin-top: 6px;
  }
}
</style>
