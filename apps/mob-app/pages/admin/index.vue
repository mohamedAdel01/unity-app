<template>
  <div class="admin-dashboard-page">
    <!-- Top Supervisor Header (Unified) -->
    <AdminTopHeader 
      :title="t('Executive Administration')"
      :subtitle="t('Unity Hospital & Clinics System')"
      icon="pi pi-shield"
    />

    <!-- KPI Metrics Grid -->
    <div class="metrics-grid">
      <div class="metric-card primary">
        <div class="metric-icon">
          <i class="pi pi-users"></i>
        </div>
        <div class="metric-info">
          <span class="label">{{ t('Total Patients') }}</span>
          <strong class="value">{{ kpis.total_patients }}</strong>
        </div>
      </div>

      <div class="metric-card success">
        <div class="metric-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4.5 3v5a6.5 6.5 0 0 0 13 0V3"/>
            <path d="M3 3h3"/>
            <path d="M16 3h3"/>
            <path d="M11 14.5V18a3 3 0 0 0 6 0v-2"/>
            <circle cx="17" cy="16" r="2"/>
          </svg>
        </div>
        <div class="metric-info">
          <span class="label">{{ t('Active Doctors') }}</span>
          <strong class="value">{{ kpis.total_doctors }}</strong>
        </div>
      </div>

      <div class="metric-card warning">
        <div class="metric-icon">
          <i class="pi pi-calendar"></i>
        </div>
        <div class="metric-info">
          <span class="label">{{ t('Today Appointments') }}</span>
          <strong class="value">{{ kpis.today_appointments }}</strong>
        </div>
      </div>

      <div class="metric-card info">
        <div class="metric-icon">
          <i class="pi pi-wallet"></i>
        </div>
        <div class="metric-info">
          <span class="label">{{ t('Revenue') }}</span>
          <strong class="value">{{ kpis.total_revenue }} {{ t('EGP') }}</strong>
        </div>
      </div>
    </div>

    <!-- Quick Management Sections Navigation -->
    <div class="admin-nav-section">
      <h5>{{ t('Hospital Management Sections') }}</h5>
      <div class="nav-tiles-grid">
        <NuxtLink to="/admin/patients" class="nav-tile">
          <div class="tile-icon"><i class="pi pi-id-card"></i></div>
          <div class="tile-info">
            <strong>{{ t('Patients Records') }}</strong>
            <small>{{ t('Manage MRN & medical histories') }}</small>
          </div>
          <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'tile-arrow']"></i>
        </NuxtLink>

        <NuxtLink to="/admin/doctors" class="nav-tile">
          <div class="tile-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4.5 3v5a6.5 6.5 0 0 0 13 0V3"/>
              <path d="M3 3h3"/>
              <path d="M16 3h3"/>
              <path d="M11 14.5V18a3 3 0 0 0 6 0v-2"/>
              <circle cx="17" cy="16" r="2"/>
            </svg>
          </div>
          <div class="tile-info">
            <strong>{{ t('Doctors & Rosters') }}</strong>
            <small>{{ t('Schedules, shifts & availability') }}</small>
          </div>
          <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'tile-arrow']"></i>
        </NuxtLink>

        <NuxtLink to="/admin/clinics" class="nav-tile">
          <div class="tile-icon"><i class="pi pi-building"></i></div>
          <div class="tile-info">
            <strong>{{ t('Clinics & Departments') }}</strong>
            <small>{{ t('Units, rooms & capacities') }}</small>
          </div>
          <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'tile-arrow']"></i>
        </NuxtLink>

        <NuxtLink to="/admin/appointments" class="nav-tile">
          <div class="tile-icon"><i class="pi pi-clock"></i></div>
          <div class="tile-info">
            <strong>{{ t('Bookings & Invoices') }}</strong>
            <small>{{ t('Live bookings & tax invoices') }}</small>
          </div>
          <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'tile-arrow']"></i>
        </NuxtLink>
      </div>
    </div>

    <!-- Broadcast Notification Action -->
    <div class="broadcast-banner">
      <div class="broadcast-text">
        <h6>{{ t('Broadcast Notification') }}</h6>
        <p>{{ t('Send urgent announcements to all registered patients & staff.') }}</p>
      </div>
      <button class="btn-broadcast" @click="isBroadcastModalOpen = true">
        <i class="pi pi-megaphone"></i>
        <span>{{ t('Send Broadcast') }}</span>
      </button>
    </div>

    <!-- Broadcast Modal -->
    <div v-if="isBroadcastModalOpen" class="modal-backdrop" @click="isBroadcastModalOpen = false">
      <div class="modal-sheet" @click.stop>
        <div class="modal-head">
          <h4>{{ t('Broadcast Notification') }}</h4>
          <button class="btn-close" @click="isBroadcastModalOpen = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <label class="field-label">{{ t('Notification Title') }}</label>
          <input 
            v-model="broadcastTitle" 
            type="text" 
            class="input-field" 
            :placeholder="t('e.g. Schedule Update or Public Announcement')"
          />
          <label class="field-label">{{ t('Notification Message') }}</label>
          <textarea 
            v-model="broadcastBody" 
            rows="3" 
            class="input-field textarea" 
            :placeholder="t('Type message contents...')"
          ></textarea>
        </div>
        <div class="modal-foot">
          <button class="btn-cancel" @click="isBroadcastModalOpen = false">{{ t('Cancel') }}</button>
          <button 
            class="btn-send" 
            :disabled="!broadcastTitle.trim() || !broadcastBody.trim()" 
            @click="sendBroadcastNotification"
          >
            {{ t('Send') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AdminTopHeader from '../../components/admin/AdminTopHeader.vue';

definePageMeta({
  layout: 'admin',
});

const router = useRouter();

const { t, isRtl } = useI18n();

const api = useUnityApi();

const toast = useAppToast();

// 2. Data (refs, reactive state)
const kpis = ref({
  total_patients: 0,
  total_doctors: 0,
  total_clinics: 0,
  total_services: 0,
  today_appointments: 0,
  pending_appointments: 0,
  completed_appointments: 0,
  total_revenue: 0,
});

const isBroadcastModalOpen = ref(false);

const broadcastTitle = ref('');

const broadcastBody = ref('');

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const loadDashboardData = async () => {
  try {
    const res = await api.apiRequest({ service: 'ADMIN_DASHBOARD' });
    if (res?.status && res?.data?.kpis) {
      kpis.value = {
        total_patients: res.data.kpis.total_patients || 0,
        total_doctors: res.data.kpis.total_doctors || 0,
        total_clinics: res.data.kpis.total_clinics || 0,
        total_services: res.data.kpis.total_services || 0,
        today_appointments: res.data.kpis.today_appointments || 0,
        pending_appointments: res.data.kpis.pending_appointments || 0,
        completed_appointments: res.data.kpis.completed_appointments || 0,
        total_revenue: res.data.kpis.total_revenue || 0,
      };
    }
  } catch (err) {}
};

const sendBroadcastNotification = async () => {
  if (!broadcastTitle.value.trim() || !broadcastBody.value.trim()) return;
  try {
    await api.apiRequest({
      service: 'ADMIN_BROADCAST_NOTIFICATION',
      payload: {
        title: broadcastTitle.value.trim(),
        body: broadcastBody.value.trim(),
      },
    });
    toast.success(t('Notification broadcasted successfully!'));
    broadcastTitle.value = '';
    broadcastBody.value = '';
    isBroadcastModalOpen.value = false;
  } catch (err: any) {
    toast.error(err.message || t('Failed to send broadcast'));
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  loadDashboardData();
});

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: computed(() => t('Executive Administration — Admin Portal')),
});
</script>

<style scoped lang="scss">
.admin-dashboard-page {
  padding: 14px 18px 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;

  .dashboard-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border-subtle);
    border-radius: 20px;

    .admin-profile {
      display: flex;
      align-items: center;
      gap: 12px;

      .avatar-box {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: var(--unity-primary-light);
        color: var(--unity-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
      }

      .meta-box {
        display: flex;
        flex-direction: column;

        .title-row {
          display: flex;
          align-items: center;
          gap: 6px;

          h4 {
            margin: 0;
            font-size: 0.95rem;
            font-weight: 800;
            color: var(--unity-text-main);
          }

          .badge {
            font-size: 0.65rem;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 8px;
            background: rgba(16, 185, 129, 0.12);
            color: #10b981;
          }
        }

        small {
          font-size: 0.73rem;
          color: var(--unity-text-dim);
        }
      }
    }

    .btn-patient-mode {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      border: 1px solid var(--unity-border);
      background: var(--unity-bg);
      color: var(--unity-text-muted);
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: var(--unity-primary);
        border-color: var(--unity-primary);
        background: var(--unity-primary-light);
      }
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .metric-card {
      background: var(--unity-surface);
      border: 1px solid var(--unity-border-subtle);
      border-radius: 18px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;

      .metric-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
      }

      .metric-info {
        display: flex;
        flex-direction: column;

        .label {
          font-size: 0.72rem;
          color: var(--unity-text-dim);
          font-weight: 600;
        }

        .value {
          font-size: 1.15rem;
          font-weight: 900;
          color: var(--unity-text-main);
          margin-top: 2px;
        }
      }

      &.primary .metric-icon {
        background: var(--unity-primary-light);
        color: var(--unity-primary);
      }

      &.success .metric-icon {
        background: rgba(16, 185, 129, 0.12);
        color: #10b981;
      }

      &.warning .metric-icon {
        background: rgba(245, 158, 11, 0.12);
        color: #f59e0b;
      }

      &.info .metric-icon {
        background: rgba(59, 130, 246, 0.12);
        color: #3b82f6;
      }
    }
  }

  .admin-nav-section {
    display: flex;
    flex-direction: column;
    gap: 12px;

    h5 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    .nav-tiles-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .nav-tile {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
        background: var(--unity-surface);
        border: 1px solid var(--unity-border-subtle);
        border-radius: 18px;
        text-decoration: none;
        transition: transform 0.15s, border-color 0.15s;

        &:active {
          transform: scale(0.99);
        }

        .tile-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--unity-bg);
          border: 1px solid var(--unity-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--unity-primary);
          font-size: 1.1rem;
        }

        .tile-info {
          flex: 1;
          display: flex;
          flex-direction: column;

          strong {
            font-size: 0.88rem;
            font-weight: 800;
            color: var(--unity-text-main);
          }

          small {
            font-size: 0.72rem;
            color: var(--unity-text-dim);
            margin-top: 1px;
          }
        }

        .tile-arrow {
          font-size: 0.8rem;
          color: var(--unity-text-dim);
        }
      }
    }
  }

  .broadcast-banner {
    padding: 16px;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
    border: 1px solid var(--unity-border-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;

    .broadcast-text {
      h6 {
        margin: 0 0 3px;
        font-size: 0.88rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      p {
        margin: 0;
        font-size: 0.74rem;
        color: var(--unity-text-dim);
        line-height: 1.4;
      }
    }

    .btn-broadcast {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 12px;
      background: var(--unity-primary);
      color: #fff;
      border: none;
      font-size: 0.8rem;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
    }
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;

    .modal-sheet {
      width: 100%;
      max-width: 420px;
      background: var(--unity-surface);
      border-radius: 20px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;

        h4 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--unity-text-main);
        }

        .btn-close {
          border: none;
          background: none;
          cursor: pointer;
          font-size: 1rem;
          color: var(--unity-text-dim);
        }
      }

      .modal-body {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .field-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--unity-text-muted);
        }

        .input-field {
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid var(--unity-border);
          background: var(--unity-bg);
          color: var(--unity-text-main);
          font-size: 0.88rem;
          outline: none;

          &:focus {
            border-color: var(--unity-primary);
          }

          &.textarea {
            resize: none;
          }
        }
      }

      .modal-foot {
        display: flex;
        justify-content: flex-end;
        gap: 8px;

        button {
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;

          &.btn-cancel {
            background: none;
            border: 1px solid var(--unity-border);
            color: var(--unity-text-muted);
          }

          &.btn-send {
            background: var(--unity-primary);
            border: none;
            color: #fff;

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }
        }
      }
    }
  }
}
</style>
