<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="notif-backdrop" @click="close">
        <div class="notif-drawer" @click.stop>
          <div class="drawer-pill"></div>

          <div class="drawer-header">
            <div class="header-info">
              <div class="icon-wrap">
                <i class="pi pi-bell"></i>
                <span v-if="unreadCount > 0" class="badge-dot"></span>
              </div>
              <div>
                <h3>{{ t('Notifications') }}</h3>
                <span class="subtext">{{ unreadCount }} {{ t('New Notifications') }}</span>
              </div>
            </div>

            <div class="header-actions">
              <button 
                v-if="unreadCount > 0" 
                class="read-all-btn" 
                :disabled="loading"
                @click="markAllRead"
              >
                {{ t('Mark all as read') }}
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
              <span>{{ t('Loading notifications...') }}</span>
            </div>

            <!-- Not logged in State -->
            <div v-else-if="!authStore.isAuthenticated" class="state-empty">
              <div class="empty-icon">
                <i class="pi pi-lock"></i>
              </div>
              <h4>{{ t('Login Required') }}</h4>
              <p>{{ t('Please log in to view your notifications and alerts.') }}</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="notifications.length === 0" class="state-empty">
              <div class="empty-icon">
                <i class="pi pi-check-circle"></i>
              </div>
              <h4>{{ t('No notifications') }}</h4>
              <p>{{ t('Your appointment alerts, reminders, and lab results will appear here.') }}</p>
            </div>

            <!-- Notification Items List -->
            <div v-else class="notif-list">
              <div 
                v-for="item in notifications" 
                :key="item.id"
                class="notif-item"
                :class="{ 'unread': !item.is_read, 'expanded': isExpanded(item.id) }"
                @click="toggleItem(item)"
              >
                <div class="item-icon" :class="getIconClass(item.type)">
                  <i :class="getIcon(item.type)"></i>
                </div>
                <div class="item-content">
                  <div class="item-top">
                    <h5>{{ getLocalizedTitle(item) }}</h5>
                    <div class="top-meta">
                      <span class="item-time">{{ formatTime(item.created_at) }}</span>
                      <i 
                        v-if="getLocalizedBody(item)" 
                        class="expand-chevron pi" 
                        :class="isExpanded(item.id) ? 'pi-chevron-up' : 'pi-chevron-down'"
                      ></i>
                    </div>
                  </div>
                  <Transition name="expand">
                    <p v-if="isExpanded(item.id)" class="item-body">
                      {{ getLocalizedBody(item) }}
                    </p>
                  </Transition>
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
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch, onMounted } from 'vue';
import { useUnityApi } from '../composables/useUnityApi';
import { useI18n } from '../composables/useI18n';
import { useGlobalStore } from '../stores/global';
import { useAuthStore } from '../stores/auth';
import { useNotifications } from '../composables/useNotifications';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'count-changed', count: number): void;
}>();

const api = useUnityApi();

const { t, isRtl, resolveI18n } = useI18n();

const globalStore = useGlobalStore();

const authStore = useAuthStore();

const { 
  notifications, 
  unreadCount, 
  isFetching, 
  NOTIFICATIONS, 
  markRead: executeMarkRead, 
  markAllRead: executeMarkAllRead 
} = useNotifications();

// 2. Data (refs, reactive state)
const expandedMap = ref<Record<string | number, boolean>>({});

// 3. Computed (computed properties)
// Use globalStore loading tracker or local fetching state for NOTIFICATIONS service
const loading = computed(() => globalStore.loading.includes('NOTIFICATIONS') || isFetching.value);
const isExpanded = (id: string | number) => Boolean(expandedMap.value[id]);

// 4. Methods (functions, handlers)
const toggleItem = async (item: any) => {
  const current = Boolean(expandedMap.value[item.id]);
  expandedMap.value = {
    ...expandedMap.value,
    [item.id]: !current,
  };
  if (!current && !item.is_read) {
    await markRead(item);
  }
};

const markRead = async (item: any) => {
  await executeMarkRead(item);
  emit('count-changed', unreadCount.value);
};

const markAllRead = async () => {
  await executeMarkAllRead();
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
    if (diffMin < 1) return t('Now');
    if (diffMin < 60) return isRtl.value ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return isRtl.value ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return t('Yesterday');
    if (diffDays < 7) return isRtl.value ? `منذ ${diffDays} أيام` : `${diffDays}d ago`;
    return date.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return '';
  }
};

const getLocalizedTitle = (item: any) => {
  if (!item?.title) return '';
  const resolved = resolveI18n(item.title);
  return t(resolved);
};

const getLocalizedBody = (item: any) => {
  if (!item?.body) return '';
  let body = String(item.body).trim();

  // 1. Universal multilingual / embedded JSON resolution
  body = resolveI18n(body);

  // 2. Fix duplicate "Dr. د/" or "Dr. د." prefix anywhere in the text
  body = body
    .replace(/Dr\.\s*د\/\s*/gi, isRtl.value ? 'د/ ' : 'Dr. ')
    .replace(/Dr\.\s*د\.\s*/gi, isRtl.value ? 'د. ' : 'Dr. ')
    .replace(/Dr\.\s*Dr\.\s*/gi, 'Dr. ');

  // 3. Handle legacy booking notification (with or without closing parenthesis)
  const bookRegex = /Your appointment\s*\(?(.*?)(?:\)\s*|\s+)on\s+(\S+)\s+at\s+(\S+)\s+has been registered\.?\s*Pending confirmation or payment\.?/i;
  const match = body.match(bookRegex);
  if (match) {
    let serviceName = match[1].trim().replace(/^\(+|\)+$/g, '').trim();
    const date = match[2].trim();
    let time = match[3].trim();
    if (time.split(':').length === 3) time = time.slice(0, 5);

    if (isRtl.value) {
      let serviceAr = serviceName
        .replace(/Follow-up Consultation with Dr\.?/i, 'متابعة كشف مع د/')
        .replace(/Consultation with Dr\.?/i, 'كشف مع د/')
        .replace(/Medical Examination/i, 'خدمة طبية')
        .replace(/Medical Service/i, 'خدمة طبية')
        .replace(/Medical Offer/i, 'عرض طبي');
      return `تم تسجيل موعدك (${serviceAr}) بتاريخ ${date} الساعة ${time} بنجاح. قيد المراجعة أو الدفع.`;
    } else {
      let serviceEn = serviceName
        .replace(/د\/\s*/g, '')
        .replace(/د\.\s*/g, '')
        .replace(/احمد مصطفي/g, 'Ahmed Moustafa')
        .replace(/محمد عادل/g, 'Mohamed Adel')
        .replace(/السيد مايله/g, 'Elsayed Maila');
      return `Your appointment (${serviceEn}) on ${date} at ${time} has been registered. Pending confirmation or payment.`;
    }
  }

  // 4. Handle scheduled appointment pattern
  const schedRegex = /An appointment\s*\(?(.*?)(?:\)\s*|\s+)on\s+(\S+)\s+at\s+(\S+)\s+has been scheduled for you\.?/i;
  const schedMatch = body.match(schedRegex);
  if (schedMatch) {
    let serviceName = schedMatch[1].trim().replace(/^\(+|\)+$/g, '').trim();
    const date = schedMatch[2].trim();
    let time = schedMatch[3].trim();
    if (time.split(':').length === 3) time = time.slice(0, 5);
    if (isRtl.value) {
      return `تم حجز موعد لك (${serviceName}) بتاريخ ${date} الساعة ${time} بنجاح.`;
    } else {
      return `An appointment (${serviceName}) on ${date} at ${time} has been scheduled for you.`;
    }
  }

  // 5. Handle confirmation & cancellation
  if (isRtl.value) {
    const confirmRegex = /Your appointment (?:on )?(\S+) at (\S+) has been confirmed\./i;
    const confirmMatch = body.match(confirmRegex);
    if (confirmMatch) {
      return `تم تأكيد موعدك بتاريخ ${confirmMatch[1]} الساعة ${confirmMatch[2]} بنجاح.`;
    }

    if (body.includes('Your appointment has been cancelled successfully') || body.includes('Your appointment has been cancelled')) {
      return 'تم إلغاء موعدك بنجاح.';
    }

    if (body.includes('Your consultation has been marked as completed')) {
      return 'تم اكتمال الكشف الطبي بنجاح.';
    }
  } else {
    // English mode doctor name cleanups
    body = body
      .replace(/احمد مصطفي/g, 'Ahmed Moustafa')
      .replace(/محمد عادل/g, 'Mohamed Adel')
      .replace(/السيد مايله/g, 'Elsayed Maila');
  }

  return body;
};

// 5. Watches (watch, watchEffect)
watch(() => props.modelValue, (newVal) => {
  if (newVal && authStore.isAuthenticated) {
    NOTIFICATIONS();
  }
});

watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    NOTIFICATIONS();
  } else {
    notifications.value = [];
    emit('count-changed', 0);
  }
});

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  if (authStore.isAuthenticated) {
    NOTIFICATIONS();
  }
});

// 7. Meta (useHead, useSeoMeta)
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

  @media (min-width: 640px) {
    align-items: center;
    padding: 24px;
  }
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

  @media (min-width: 640px) {
    border-radius: 28px;
    max-width: 520px;
    border: 1px solid var(--unity-border);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  }
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

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          border-color: #111827;
        }
      }
    }

    h3 {
      font-size: 1.05rem;
      font-weight: 600;
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
  align-items: center;
  gap: 12px;
  padding: 11px 13px;
  border-radius: 16px;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  cursor: pointer;
  position: relative;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &.expanded {
    align-items: flex-start;
    padding: 13px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
  }

  &.unread {
    background: var(--unity-primary-light);
    border-color: var(--unity-primary-tint);
  }

  &:hover {
    border-color: var(--unity-primary);
  }

  .item-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.05rem;
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

    :global([data-theme='dark']) &,
    :global(html.dark) & {
      &.icon-green {
        background: rgba(92, 128, 66, 0.18);
        color: #8ab36b;
      }
      &.icon-blue {
        background: rgba(2, 132, 199, 0.18);
        color: #38bdf8;
      }
      &.icon-amber {
        background: rgba(245, 158, 11, 0.18);
        color: #fbbf24;
      }
      &.icon-slate {
        background: rgba(148, 163, 184, 0.16);
        color: #cbd5e1;
      }
    }
  }

  .item-content {
    flex: 1;
    min-width: 0;

    .item-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 0;

      h5 {
        font-size: 0.86rem;
        font-weight: 700;
        color: var(--unity-text-main);
        margin: 0;
        line-height: 1.3;
      }

      .top-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;

        .item-time {
          font-size: 0.68rem;
          color: var(--unity-text-muted);
          white-space: nowrap;
        }

        .expand-chevron {
          font-size: 0.62rem;
          color: var(--unity-text-dim);
          transition: transform 0.2s ease;
        }
      }
    }

    .item-body {
      margin-top: 8px;
      font-size: 0.76rem;
      color: var(--unity-text-muted);
      line-height: 1.45;
      padding-top: 6px;
      border-top: 1px dashed var(--unity-border);
    }
  }

  .unread-bullet {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--unity-primary);
    flex-shrink: 0;
    margin-top: 2px;
  }
}

// Expand/Collapse Transition
.expand-enter-active,
.expand-leave-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  transform: translateY(-4px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 250px;
  transform: translateY(0);
}
</style>
