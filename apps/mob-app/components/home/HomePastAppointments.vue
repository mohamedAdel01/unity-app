<template>
  <section v-if="pastAppointments.length > 0" class="section-container pb-section">
    <div class="section-header">
      <div class="header-with-badge">
        <i class="pi pi-history history-icon"></i>
        <h4>{{ t('My last appointment') }}</h4>
      </div>
      <NuxtLink to="/appointments" class="see-all-link">
        {{ t('Visit History') }} 
        <i :class="isRtl ? 'pi pi-angle-left' : 'pi pi-angle-right'"></i>
      </NuxtLink>
    </div>

    <div class="past-records-list">
      <div 
        v-for="apt in pastAppointments" 
        :key="apt.id" 
        class="past-record-card"
      >
        <div class="record-top">
          <div class="record-icon" :class="apt.doctor ? 'clinic-icon' : 'lab-icon'">
            <i :class="apt.doctor ? 'pi pi-user-plus' : 'pi pi-table'"></i>
          </div>
          <div class="record-info">
            <div class="info-title-wrap">
              <h5>{{ apt.doctor?.name || apt.doctor?.user?.name || apt.service?.name || t('Doctor Consultation') }}</h5>
              <span class="status-chip" :class="apt.status === 'completed' ? 'completed' : 'ready'">
                {{ apt.status === 'completed' ? t('Completed') : t('Cancelled') }}
              </span>
            </div>
            <p v-if="apt.doctor?.specialty || apt.clinic?.name || apt.service?.description">
              {{ apt.doctor?.specialty || apt.clinic?.name || apt.service?.description }}
            </p>
            <div v-if="apt.date || apt.start_time" class="record-date">
              <i class="pi pi-calendar"></i>
              <span>{{ apt.date }} {{ apt.start_time ? '• ' + apt.start_time : '' }}</span>
            </div>
          </div>
        </div>
        <div class="record-actions">
          <button class="btn-action-outline" @click="viewReport(apt)">
            <i class="pi pi-file"></i> {{ t('View Report') }}
          </button>
          <button class="btn-action-fill" @click="rebook(apt)">
            <i class="pi pi-refresh"></i> {{ t('Rebook') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';
import { useAppToast } from '../../composables/useAppToast';

const router = useRouter();

const api = useUnityApi();

const { t, isRtl } = useI18n();

const bookingModal = useBookingModal();

const toast = useAppToast();

// 2. Data (refs, reactive state)
const pastAppointments = ref<any[]>([]);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const PATIENT_APPOINTMENTS = async () => {
  try {
    const res = await api.apiRequest({ service: 'PATIENT_APPOINTMENTS' });
    if (res && res.status && Array.isArray(res.data) && res.data.length > 0) {
      const past = res.data.filter((a: any) => a.status === 'completed' || a.status === 'cancelled');
      pastAppointments.value = past.slice(0, 3);
    } else {
      pastAppointments.value = [];
    }
  } catch (err) {
    pastAppointments.value = [];
  }
};

const viewReport = (apt?: any) => {
  router.push('/records');
};

const rebook = (apt?: any) => {
  if (apt?.doctor) {
    bookingModal.openBookingFlow({ doctor: apt.doctor });
  } else if (apt?.service) {
    bookingModal.openBookingFlow({ service: apt.service });
  } else {
    bookingModal.openQuickBook();
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  PATIENT_APPOINTMENTS();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.section-container {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &.pb-section {
    padding-bottom: 20px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h4 {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    .header-with-badge {
      display: flex;
      align-items: center;
      gap: 6px;

      .history-icon {
        color: #0284c7;
        font-size: 1.15rem;
      }
    }

    .see-all-link {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--unity-primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 2px;
    }
  }
}

.past-records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.past-record-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--unity-shadow-subtle);

  .record-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 14px;

    .record-icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;

      &.clinic-icon {
        background: #ecfdf5;
        color: #047857;
      }

      &.lab-icon {
        background: #f0fdfa;
        color: #0d9488;
      }
    }

    .record-info {
      flex: 1;

      .info-title-wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2px;

        h5 {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--unity-text-main);
        }

        .status-chip {
          font-size: 0.65rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;

          &.completed {
            background: #e0f2fe;
            color: #0369a1;
          }

          &.ready {
            background: #dcfce7;
            color: #15803d;
          }
        }
      }

      p {
        font-size: 0.78rem;
        color: var(--unity-text-muted);
      }

      .record-date {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        color: var(--unity-text-dim);
        margin-top: 6px;

        i {
          font-size: 0.75rem;
        }
      }
    }
  }

  .record-actions {
    display: flex;
    gap: 10px;

    button {
      flex: 1;
      padding: 9px;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-action-outline {
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-main);

      &:hover {
        background: var(--unity-border);
      }
    }

    .btn-action-fill {
      background: #34d399;
      color: #022c22;
      border: none;

      &:hover {
        background: #10b981;
      }
    }
  }
}
</style>
