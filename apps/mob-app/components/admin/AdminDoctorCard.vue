<template>
  <div class="admin-doctor-card">
    <!-- 1. Doctor Profile Header -->
    <div class="doctor-profile-row">
      <!-- Right Side: Doctor Avatar + Status Dot + Titles -->
      <div class="doctor-identity-cell">
        <!-- Avatar Holder -->
        <div class="avatar-holder">
          <img 
            :src="resolveAvatar(doctor.avatar)" 
            :alt="doctor.name" 
            class="avatar-photo" 
          />
          <span class="status-dot" :class="doctor.is_active ? 'online' : 'offline'"></span>
        </div>

        <!-- Details -->
        <div class="doctor-details">
          <div class="name-status-line">
            <h4 class="doctor-name">{{ doctor.name }}</h4>
            <span class="inline-status-dot" :class="doctor.is_active ? 'online' : 'offline'"></span>
          </div>
          <p class="specialty-clinic-line">
            <span>{{ doctor.specialty }}</span>
            <template v-if="doctor.room">
              <span class="dot-separator">•</span>
              <span>{{ t('Clinic Room') }} {{ doctor.room }}</span>
            </template>
          </p>
        </div>
      </div>

      <!-- Left Side: Status / Appointments Count -->
      <div class="doctor-status-badge" :class="getStatusBadgeClass(doctor.status_badge)">
        <span>{{ doctor.status_badge || t('Open Clinic') }}</span>
      </div>
    </div>

    <!-- 2. Schedule Row (Optional / If provided) -->
    <div v-if="doctor.schedule_time" class="doctor-schedule-strip">
      <i :class="doctor.is_evening ? 'pi pi-moon' : 'pi pi-clock'"></i>
      <span>{{ doctor.schedule_time }}</span>
    </div>

    <!-- 3. Action Buttons Row -->
    <div class="card-action-buttons">
      <!-- Edit Schedule Action -->
      <button 
        class="btn-edit-schedule" 
        :class="{ 'is-primary': doctor.primary_action }"
        @click="emit('edit-schedule', doctor)"
      >
        <i class="pi pi-calendar"></i>
        <span>{{ t('Edit Schedule') }}</span>
      </button>

      <!-- View Cases Action -->
      <button class="btn-view-cases" @click="emit('view-cases', doctor)">
        <i class="pi pi-file"></i>
        <span>{{ t('Cases') }}<template v-if="doctor.cases_count !== undefined && doctor.cases_count !== null"> ({{ doctor.cases_count }})</template></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

const props = defineProps<{
  doctor: any;
}>();

const emit = defineEmits<{
  (e: 'edit-schedule', doctor: any): void;
  (e: 'view-cases', doctor: any): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const getStatusBadgeClass = (status?: string) => {
  if (!status) return 'badge-open';
  if (status.includes('مفتوح') || status.includes('Open')) return 'badge-open';
  if (status.includes('اليوم') || status.includes('Today')) return 'badge-today';
  if (status.includes('يبدأ') || status.includes('Starts')) return 'badge-later';
  return 'badge-open';
};

const resolveAvatar = (url?: string) => {
  if (!url) return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160&auto=format&fit=crop&q=80';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
    return url;
  }
  const config = useRuntimeConfig();
  const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
  return `${baseUrl}${url}`;
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-doctor-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 22px;
  padding: 16px 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 12px;
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .doctor-profile-row .doctor-identity-cell .doctor-details {
      text-align: left;
    }
  }

  // 1. Profile Row
  .doctor-profile-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    .doctor-identity-cell {
      display: flex;
      align-items: center;
      gap: 12px;

      .avatar-holder {
        position: relative;
        width: 48px;
        height: 48px;
        flex-shrink: 0;

        .avatar-photo {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid #e2e8f0;
        }

        .status-dot {
          position: absolute;
          bottom: 1px;
          inset-inline-end: 1px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #ffffff;

          &.online {
            background: #10b981;
          }

          &.offline {
            background: #94a3b8;
          }
        }
      }

      .doctor-details {
        display: flex;
        flex-direction: column;
        text-align: right;

        .name-status-line {
          display: flex;
          align-items: center;
          gap: 6px;

          .doctor-name {
            font-size: 0.98rem;
            font-weight: 800;
            color: var(--unity-text-main);
          }

          .inline-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;

            &.online {
              background: #10b981;
            }

            &.offline {
              background: #94a3b8;
            }
          }
        }

        .specialty-clinic-line {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          color: var(--unity-text-muted);
          margin-top: 2px;

          .dot-separator {
            opacity: 0.5;
          }
        }
      }
    }

    .doctor-status-badge {
      font-size: 0.74rem;
      font-weight: 700;
      white-space: nowrap;

      &.badge-open {
        color: #047857;
      }

      &.badge-today {
        color: var(--unity-text-main);
      }

      &.badge-later {
        color: var(--unity-text-muted);
      }
    }
  }

  // 2. Schedule Strip
  .doctor-schedule-strip {
    background: #f8fafc;
    border-radius: 12px;
    padding: 8px 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--unity-text-main);

    i {
      font-size: 0.9rem;
      color: var(--unity-text-muted);
    }
  }

  // 3. Action Buttons Row
  .card-action-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 2px;

    button {
      flex: 1;
      height: 42px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s;
      border: none;

      i {
        font-size: 0.85rem;
      }
    }

    .btn-edit-schedule {
      background: #f1f5f9;
      color: var(--unity-text-main);

      &:hover {
        background: #e2e8f0;
      }

      &.is-primary {
        background: var(--unity-primary-dark);
        color: #ffffff;
        box-shadow: 0 3px 12px rgba(6, 78, 59, 0.2);

        &:hover {
          background: var(--unity-primary);
        }
      }
    }

    .btn-view-cases {
      background: #eef2ff;
      color: #3730a3;

      &:hover {
        background: #e0e7ff;
      }
    }
  }
}
</style>
