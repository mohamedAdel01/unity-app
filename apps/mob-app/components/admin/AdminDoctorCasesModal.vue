<template>
  <div v-if="isOpen && doctor" class="doctor-cases-modal-backdrop" @click="close">
    <div class="doctor-cases-modal-sheet" @click.stop>
      <!-- 1. Header -->
      <div class="sheet-header">
        <div class="doctor-info-head">
          <div class="avatar-holder">
            <img 
              v-if="doctor.avatar"
              :src="resolveAvatar(doctor.avatar)" 
              :alt="doctor.name" 
              class="avatar-photo" 
            />
            <div v-else class="avatar-placeholder">
              <i class="pi pi-user"></i>
            </div>
            <span class="status-dot" :class="doctor.is_active ? 'online' : 'offline'"></span>
          </div>
          <div class="doctor-titles">
            <div class="name-badge-row">
              <h3>{{ doctor.name }}</h3>
              <span class="cases-total-pill">{{ totalCases }} {{ t('Doctor Bookings') }}</span>
            </div>
            <p class="specialty-clinic">
              <span>{{ doctor.specialty || doctor.clinic?.name || t('Specialist') }}</span>
              <template v-if="doctor.clinic?.name && doctor.specialty">
                <span class="dot">•</span>
                <span>{{ doctor.clinic.name }}</span>
              </template>
            </p>
          </div>
        </div>

        <button type="button" class="btn-sheet-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- 2. Date & Filter Bar -->
      <div class="filters-container">
        <!-- Active Filter Indicator Banner if Date is selected -->
        <div v-if="selectedDate" class="active-date-banner">
          <div class="date-banner-content">
            <i class="pi pi-calendar-clock"></i>
            <span>{{ t('Filtered by date:') }} <strong>{{ formatHumanDate(selectedDate) }}</strong></span>
          </div>
          <button type="button" class="btn-clear-date" :title="t('Clear date filter')" @click="setDatePreset('all')">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Date Presets Row -->
        <div class="preset-scroll-row">
          <button 
            type="button" 
            class="filter-pill" 
            :class="{ active: datePreset === 'all' }"
            @click="setDatePreset('all')"
          >
            <span>{{ t('All Dates') }}</span>
          </button>

          <button 
            type="button" 
            class="filter-pill" 
            :class="{ active: datePreset === 'today' }"
            @click="setDatePreset('today')"
          >
            <i class="pi pi-calendar"></i>
            <span>{{ t('Today') }}</span>
          </button>

          <button 
            type="button" 
            class="filter-pill" 
            :class="{ active: datePreset === 'tomorrow' }"
            @click="setDatePreset('tomorrow')"
          >
            <span>{{ t('Tomorrow') }}</span>
          </button>

          <button 
            type="button" 
            class="filter-pill custom-date-pill" 
            :class="{ active: datePreset === 'custom' }"
            @click="openDatePicker"
          >
            <i class="pi pi-calendar-plus"></i>
            <span>{{ selectedDate ? formatShortDate(selectedDate) : t('Pick Date') }}</span>
          </button>
          <input 
            ref="dateInputRef"
            type="date" 
            class="hidden-native-date-input" 
            :value="selectedDate"
            @change="onCustomDatePick(($event.target as HTMLInputElement).value)"
            @input="onCustomDatePick(($event.target as HTMLInputElement).value)"
          />
        </div>

        <!-- Status Filter Pills -->
        <div class="status-scroll-row">
          <button 
            type="button" 
            class="status-pill" 
            :class="{ active: selectedStatus === 'all' }"
            @click="selectedStatus = 'all'"
          >
            <span>{{ t('All Statuses') }}</span>
          </button>

          <button 
            type="button" 
            class="status-pill confirmed" 
            :class="{ active: selectedStatus === 'confirmed' }"
            @click="selectedStatus = 'confirmed'"
          >
            <i class="pi pi-check-circle"></i>
            <span>{{ t('Confirmed Status') }}</span>
          </button>

          <button 
            type="button" 
            class="status-pill completed" 
            :class="{ active: selectedStatus === 'completed' }"
            @click="selectedStatus = 'completed'"
          >
            <i class="pi pi-verified"></i>
            <span>{{ t('Completed Status') }}</span>
          </button>

          <button 
            type="button" 
            class="status-pill pending" 
            :class="{ active: selectedStatus === 'pending' }"
            @click="selectedStatus = 'pending'"
          >
            <i class="pi pi-clock"></i>
            <span>{{ t('Pending Status') }}</span>
          </button>

          <button 
            type="button" 
            class="status-pill cancelled" 
            :class="{ active: selectedStatus === 'cancelled' }"
            @click="selectedStatus = 'cancelled'"
          >
            <i class="pi pi-times-circle"></i>
            <span>{{ t('Cancelled Status') }}</span>
          </button>
        </div>
      </div>

      <!-- 3. Virtual Cases List -->
      <div class="cases-scroll-area">
        <AppVirtualList
          :items="appointments"
          :has-more="hasMore"
          :loading="loading"
          :page-size="10"
          :empty-title="t('No bookings scheduled')"
          :empty-subtitle="t('No bookings found for this doctor matching the selected filter.')"
          @load-more="loadMore"
        >
          <template #item="{ item }">
            <div class="case-card" :class="item.status">
              <!-- Top Row: Patient Info + Status Chip -->
              <div class="case-header-row">
                <div class="patient-cell">
                  <div class="patient-avatar-badge">
                    <i class="pi pi-user"></i>
                  </div>
                  <div class="patient-text">
                    <h5 class="patient-name">{{ item.patient?.name || t('Anonymous Patient') }}</h5>
                    <p class="patient-meta">
                      <span v-if="item.patient?.mrn">MRN: {{ item.patient.mrn }}</span>
                      <span v-if="item.patient?.mrn && item.patient?.phone">•</span>
                      <span v-if="item.patient?.phone" dir="ltr">{{ item.patient.phone }}</span>
                    </p>
                  </div>
                </div>

                <span class="case-status-badge" :class="item.status">
                  {{ formatStatus(item.status) }}
                </span>
              </div>

              <!-- Mid Row: Service & Time Details -->
              <div class="case-details-grid">
                <div class="detail-item date-pill">
                  <i class="pi pi-calendar"></i>
                  <span>{{ formatHumanDate(item.date) }}</span>
                </div>
                <div class="detail-item time-pill">
                  <i class="pi pi-clock"></i>
                  <span>{{ formatSlotRange(item.start_time, item.end_time) }}</span>
                </div>
                <div v-if="item.examination?.name || item.service?.name" class="detail-item examination">
                  <i class="pi pi-file-edit"></i>
                  <span>{{ item.examination?.name || item.service?.name }}</span>
                </div>
                <div v-if="item.invoice?.total || item.price" class="detail-item price">
                  <i class="pi pi-wallet"></i>
                  <span>{{ item.invoice?.total || item.price }} {{ t('EGP') }}</span>
                  <span class="invoice-status" :class="isItemPaid(item) ? 'paid' : 'pending'">
                    {{ isItemPaid(item) ? t('Paid Status') : t('Unpaid Status') }}
                  </span>
                </div>
              </div>

              <!-- Notes / Diagnosis snippet if available -->
              <div v-if="item.notes || item.diagnosis" class="case-notes-snippet">
                <i class="pi pi-info-circle"></i>
                <p>{{ item.diagnosis || item.notes }}</p>
              </div>
            </div>
          </template>
        </AppVirtualList>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import AppVirtualList from '../common/AppVirtualList.vue';

const props = defineProps<{
  isOpen: boolean;
  doctor: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { t, isRtl } = useI18n();
const api = useUnityApi();

// 2. Data (refs, reactive state)
const appointments = ref<any[]>([]);
const totalCases = ref(0);
const currentPage = ref(1);
const hasMore = ref(false);
const loading = ref(false);
const dateInputRef = ref<HTMLInputElement | null>(null);

const datePreset = ref<'all' | 'today' | 'tomorrow' | 'custom'>('all');
const selectedDate = ref('');
const selectedStatus = ref('all');

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const openDatePicker = () => {
  if (!dateInputRef.value) return;
  try {
    if (typeof dateInputRef.value.showPicker === 'function') {
      dateInputRef.value.showPicker();
    } else {
      dateInputRef.value.focus();
      dateInputRef.value.click();
    }
  } catch {
    dateInputRef.value.focus();
    dateInputRef.value.click();
  }
};
const close = () => {
  emit('close');
};

const resolveAvatar = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
    return url;
  }
  const config = useRuntimeConfig();
  const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
  return `${baseUrl}${url}`;
};

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const setDatePreset = (preset: 'all' | 'today' | 'tomorrow') => {
  datePreset.value = preset;
  if (preset === 'all') {
    selectedDate.value = '';
  } else if (preset === 'today') {
    selectedDate.value = getLocalDateString(new Date());
  } else if (preset === 'tomorrow') {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    selectedDate.value = getLocalDateString(d);
  }
};

const onCustomDatePick = (val: string) => {
  if (val) {
    datePreset.value = 'custom';
    selectedDate.value = val;
  }
};

const formatHumanDate = (val?: string) => {
  if (!val) return '';
  try {
    const d = new Date(val);
    return new Intl.DateTimeFormat(isRtl.value ? 'ar-EG-u-nu-latn' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return val;
  }
};

const formatShortDate = (val?: string) => {
  if (!val) return '';
  try {
    const d = new Date(val);
    return new Intl.DateTimeFormat(isRtl.value ? 'ar-EG-u-nu-latn' : 'en-US', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return val;
  }
};

const formatDate = (val?: string) => {
  if (!val) return '';
  try {
    const d = new Date(val);
    return d.toISOString().split('T')[0];
  } catch {
    return val;
  }
};

const formatTime12h = (timeStr?: string) => {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;
  let h = parseInt(parts[0], 10);
  const m = parts[1].slice(0, 2);
  if (isNaN(h)) return trimmed;
  const period = h >= 12 ? (isRtl.value ? 'م' : 'PM') : (isRtl.value ? 'ص' : 'AM');
  h = h % 12;
  if (h === 0) h = 12;
  const hPadded = h.toString().padStart(2, '0');
  return `${hPadded}:${m} ${period}`;
};

const formatSlotRange = (start?: string, end?: string) => {
  if (!start) return '';
  const s = formatTime12h(start);
  if (!end) return s;
  const e = formatTime12h(end);
  return `${s} - ${e}`;
};

const isItemPaid = (item: any) => {
  return item?.invoice?.status === 'paid' || item?.payment_status === 'paid' || item?.is_paid === true;
};

const formatStatus = (st?: string) => {
  switch (st) {
    case 'confirmed': return t('Confirmed Status');
    case 'completed': return t('Completed Status');
    case 'pending': return t('Pending Status');
    case 'cancelled': return t('Cancelled Status');
    default: return st || t('Unknown');
  }
};

// Data Fetching Function strictly bound to API service name
const ADMIN_APPOINTMENTS = async (page = 1) => {
  if (!props.doctor) return;
  const targetPage = typeof page === 'number' ? page : 1;
  try {
    loading.value = true;
    const doctorId = props.doctor.id || props.doctor.user_id;
    const filter: Record<string, any> = {
      doctor_id: doctorId,
      page: targetPage,
      limit: 10,
    };

    if (selectedDate.value) {
      filter.date = selectedDate.value;
    }

    if (selectedStatus.value && selectedStatus.value !== 'all') {
      filter.status = selectedStatus.value;
    }

    const res = await api.apiRequest({
      service: 'ADMIN_APPOINTMENTS',
      filter,
    });

    const raw = Array.isArray(res?.data?.appointments)
      ? res.data.appointments
      : Array.isArray(res?.data)
        ? res.data
        : res?.data?.items || [];

    if (targetPage === 1) {
      appointments.value = raw;
    } else {
      appointments.value.push(...raw);
    }

    currentPage.value = targetPage;
    hasMore.value = res?.pagination?.hasMore ?? (raw.length >= 10);
    totalCases.value = res?.pagination?.total ?? appointments.value.length;
  } catch (err) {
    if (targetPage === 1) appointments.value = [];
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  if (hasMore.value && !loading.value) {
    ADMIN_APPOINTMENTS(currentPage.value + 1);
  }
};

// 5. Watches (watch, watchEffect)
watch([selectedDate, selectedStatus], () => {
  ADMIN_APPOINTMENTS(1);
});

watch(
  () => props.isOpen,
  (open) => {
    if (open && props.doctor) {
      datePreset.value = 'all';
      selectedDate.value = '';
      selectedStatus.value = 'all';
      ADMIN_APPOINTMENTS(1);
    }
  }
);

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.doctor-cases-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  direction: rtl;
  animation: fadeIn 0.22s ease-out;

  @media (min-width: 640px) {
    align-items: center;
    padding: 20px;
  }
}

.doctor-cases-modal-sheet {
  background: var(--unity-surface, #ffffff);
  width: 100%;
  max-width: 520px;
  max-height: 88vh;
  border-radius: 28px 28px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 640px) {
    border-radius: 26px;
    max-height: 84vh;
  }

  // 1. Sheet Header
  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--unity-border, #f1f5f9);

    .doctor-info-head {
      display: flex;
      align-items: center;
      gap: 12px;

      .avatar-holder {
        position: relative;
        width: 44px;
        height: 44px;
        flex-shrink: 0;

        .avatar-photo {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e2e8f0;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #f1f5f9;
          border: 2px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 1.25rem;
        }

        .status-dot {
          position: absolute;
          bottom: 0;
          inset-inline-end: 0;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          border: 2px solid #ffffff;

          &.online { background: #10b981; }
          &.offline { background: #94a3b8; }
        }
      }

      .doctor-titles {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .name-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;

          h3 {
            font-size: 1.05rem;
            font-weight: 800;
            color: var(--unity-text-main, #0f172a);
            margin: 0;
          }

          .cases-total-pill {
            font-size: 0.68rem;
            font-weight: 800;
            background: #eef2ff;
            color: #4338ca;
            padding: 2px 8px;
            border-radius: 12px;
          }
        }

        .specialty-clinic {
          font-size: 0.76rem;
          color: var(--unity-text-muted, #64748b);
          margin: 0;

          .dot {
            margin: 0 4px;
            opacity: 0.6;
          }
        }
      }
    }

    .btn-sheet-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--unity-bg, #f8fafc);
      border: 1px solid var(--unity-border, #e2e8f0);
      color: var(--unity-text-muted, #64748b);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #fee2e2;
        color: #ef4444;
        border-color: #fca5a5;
      }
    }
  }

  // 2. Filters
  .filters-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 16px 8px;
    background: var(--unity-bg, #f8fafc);
    border-bottom: 1px solid var(--unity-border, #f1f5f9);

    .active-date-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 0.70rem;
      color: #065f46;

      .date-banner-content {
        display: flex;
        align-items: center;
        gap: 5px;

        i {
          font-size: 0.74rem;
          color: #059669;
        }

        strong {
          color: #047857;
        }
      }

      .btn-clear-date {
        background: transparent;
        border: none;
        color: #059669;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: #d1fae5;
          color: #065f46;
        }
      }
    }

    .preset-scroll-row,
    .status-scroll-row {
      display: flex;
      align-items: center;
      gap: 5px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding-bottom: 1px;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .filter-pill,
    .status-pill {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: 28px;
      padding: 0 10px;
      border-radius: 8px;
      font-size: 0.70rem;
      font-weight: 700;
      background: var(--unity-surface, #ffffff);
      border: 1px solid var(--unity-border, #e2e8f0);
      color: var(--unity-text-muted, #64748b);
      cursor: pointer;
      transition: all 0.15s ease;

      i { font-size: 0.70rem; }

      &.active {
        background: var(--unity-primary, #047857);
        color: #ffffff;
        border-color: var(--unity-primary, #047857);
        box-shadow: 0 1px 4px rgba(4, 120, 87, 0.2);
      }
    }

    .custom-date-pill {
      position: relative;
      cursor: pointer;
    }

    .hidden-native-date-input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      bottom: 0;
      left: 0;
      border: none;
      padding: 0;
      margin: 0;
      pointer-events: none;
    }

    .status-pill {
      height: 26px;
      padding: 0 8px;
      font-size: 0.68rem;

      &.confirmed.active { background: #059669; border-color: #059669; color: #fff; }
      &.completed.active { background: #2563eb; border-color: #2563eb; color: #fff; }
      &.pending.active { background: #d97706; border-color: #d97706; color: #fff; }
      &.cancelled.active { background: #dc2626; border-color: #dc2626; color: #fff; }
    }
  }

  // 3. Cases Scroll Area
  .cases-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px 24px;
    display: flex;
    flex-direction: column;

    .case-card {
      background: var(--unity-surface, #ffffff);
      border: 1px solid var(--unity-border, #e2e8f0);
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
      transition: transform 0.2s;

      &:hover {
        border-color: #cbd5e1;
      }

      .case-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .patient-cell {
          display: flex;
          align-items: center;
          gap: 10px;

          .patient-avatar-badge {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: #f1f5f9;
            color: #475569;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
          }

          .patient-text {
            display: flex;
            flex-direction: column;
            text-align: right;

            .patient-name {
              font-size: 0.88rem;
              font-weight: 800;
              color: var(--unity-text-main, #0f172a);
              margin: 0;
            }

            .patient-meta {
              font-size: 0.7rem;
              color: var(--unity-text-muted, #64748b);
              margin: 1px 0 0;
            }
          }
        }

        .case-status-badge {
          font-size: 0.68rem;
          font-weight: 800;
          padding: 3px 9px;
          border-radius: 10px;
          text-transform: capitalize;

          &.confirmed { background: #dcfce7; color: #166534; }
          &.completed { background: #dbeafe; color: #1e40af; }
          &.pending { background: #fef3c7; color: #92400e; }
          &.cancelled { background: #fee2e2; color: #991b1b; }
        }
      }

      .case-details-grid {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        padding: 8px 10px;
        background: var(--unity-bg, #f8fafc);
        border-radius: 10px;
        font-size: 0.74rem;
        font-weight: 600;
        color: var(--unity-text-main, #1e293b);

        .detail-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;

          i {
            font-size: 0.75rem;
            color: var(--unity-primary, #047857);
          }

          &.price {
            margin-inline-start: auto;

            .invoice-status {
              font-size: 0.62rem;
              font-weight: 800;
              padding: 1px 6px;
              border-radius: 6px;
              margin-inline-start: 4px;

              &.paid { background: #dcfce7; color: #166534; }
              &.pending { background: #fef3c7; color: #92400e; }
              &.cancelled { background: #fee2e2; color: #991b1b; }
            }
          }
        }
      }

      .case-notes-snippet {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 0.72rem;
        color: var(--unity-text-muted, #64748b);
        line-height: 1.4;

        i {
          font-size: 0.75rem;
          color: #6366f1;
          margin-top: 2px;
        }

        p {
          margin: 0;
        }
      }
    }
  }
}

// Dark Mode Support
:global([data-theme='dark']) {
  .doctor-cases-modal-sheet {
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.1);

    .sheet-header {
      border-color: #1e293b;
      .doctor-info-head .doctor-titles .name-badge-row h3 { color: #f8fafc; }
    }

    .filters-container {
      background: #1e293b;
      border-color: #334155;

      .filter-pill,
      .status-pill {
        background: #0f172a;
        border-color: #334155;
        color: #94a3b8;
      }
    }

    .cases-scroll-area .case-card {
      background: #1e293b;
      border-color: #334155;

      .case-header-row .patient-cell .patient-text .patient-name {
        color: #f8fafc;
      }

      .case-details-grid {
        background: #0f172a;
        color: #cbd5e1;
      }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>

