<template>
  <section class="section-container pb-section">
    <div class="section-header">
      <div class="header-with-badge">
        <i class="pi pi-history history-icon"></i>
        <h4>{{ t('home.pastRecordsTitle') }}</h4>
      </div>
      <NuxtLink to="/appointments" class="see-all-link">
        {{ t('home.visitHistory') }} 
        <i :class="isRtl ? 'pi pi-angle-left' : 'pi pi-angle-right'"></i>
      </NuxtLink>
    </div>

    <div class="past-records-list">
      <!-- Item 1: Doctor Consultation -->
      <div class="past-record-card">
        <div class="record-top">
          <div class="record-icon clinic-icon">
            <i class="pi pi-plus-circle"></i>
          </div>
          <div class="record-info">
            <div class="info-title-wrap">
              <h5>{{ t('home.pastDocName') }}</h5>
              <span class="status-chip completed">{{ t('appointments.statusCompleted') }}</span>
            </div>
            <p>{{ t('home.pastDocVisit') }}</p>
            <div class="record-date">
              <i class="pi pi-calendar"></i>
              <span>{{ t('home.pastDocDate') }}</span>
            </div>
          </div>
        </div>
        <div class="record-actions">
          <button class="btn-action-outline" @click="viewReport">
            <i class="pi pi-file"></i> {{ t('home.viewReport') }}
          </button>
          <button class="btn-action-fill" @click="rebook">
            <i class="pi pi-refresh"></i> {{ t('home.rebook') }}
          </button>
        </div>
      </div>

      <!-- Item 2: Lab Package -->
      <div class="past-record-card">
        <div class="record-top">
          <div class="record-icon lab-icon">
            <i class="pi pi-filter"></i>
          </div>
          <div class="record-info">
            <div class="info-title-wrap">
              <h5>{{ t('home.pastLabTitle') }}</h5>
              <span class="status-chip ready">{{ t('home.pastLabStatus') }}</span>
            </div>
            <p>{{ t('home.pastLabSub') }}</p>
            <div class="record-date">
              <i class="pi pi-calendar"></i>
              <span>{{ t('home.pastLabDate') }}</span>
            </div>
          </div>
        </div>
        <div class="record-actions">
          <button class="btn-action-outline" @click="downloadResults">
            <i class="pi pi-download"></i> {{ t('home.downloadResult') }}
          </button>
          <button class="btn-action-fill" @click="rebookLab">
            <i class="pi pi-refresh"></i> {{ t('home.requestAgain') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';
import { useAppToast } from '../../composables/useAppToast';

const router = useRouter();
const { t, isRtl } = useI18n();
const bookingModal = useBookingModal();
const toast = useAppToast();

const viewReport = () => {
  router.push('/appointments');
};

const rebook = () => {
  bookingModal.openQuickBook();
};

const downloadResults = () => {
  toast.success(isRtl.value ? 'تم تنزيل تقرير المختبر بصيغة PDF بنجاح.' : 'Lab report PDF downloaded successfully.', 'المختبر والتحاليل');
};

const rebookLab = () => {
  router.push('/services?tab=services');
};
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

