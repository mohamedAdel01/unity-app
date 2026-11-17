<template>
  <div class="admin-doctor-card">
    <!-- 1. Doctor Profile Header -->
    <div class="doctor-profile-row">
      <!-- Right Side: Doctor Avatar + Status Dot + Titles -->
      <div class="doctor-identity-cell">
        <!-- Avatar Holder -->
        <div class="avatar-holder">
          <img 
            v-if="doctorAvatarUrl"
            :src="doctorAvatarUrl" 
            :alt="doctorDisplayName" 
            class="avatar-photo" 
          />
          <div v-else class="avatar-placeholder">
            <i class="pi pi-user"></i>
          </div>
          <span class="status-dot" :class="isDoctorActive ? 'online' : 'offline'"></span>
        </div>

        <!-- Details -->
        <div class="doctor-details">
          <div class="name-status-line">
            <h4 class="doctor-name">{{ doctorDisplayName }}</h4>
            <span class="inline-status-dot" :class="isDoctorActive ? 'online' : 'offline'"></span>
          </div>
          <p class="specialty-clinic-line">
            <span>{{ doctorDisplaySpecialty }}</span>
            <template v-if="doctorRoom">
              <span class="dot-separator">•</span>
              <span>{{ t('Clinic Room') }} {{ doctorRoom }}</span>
            </template>
          </p>
        </div>
      </div>

      <!-- Left Side: Controls Cell (Status Switch Toggle Only) -->
      <div class="doctor-controls-cell">
        <button 
          type="button" 
          class="unity-switch-toggle" 
          :class="{ 'active': isDoctorActive }" 
          :aria-checked="isDoctorActive"
          role="switch"
          :title="isDoctorActive ? t('Open Clinic') : t('Unavailable')"
          @click.stop="emit('toggle-status', props.doctor)"
        >
          <span class="switch-slider"></span>
        </button>
      </div>
    </div>

    <!-- 2. Schedule Row (Optional / If provided) -->
    <div v-if="scheduleTime" class="doctor-schedule-strip">
      <i :class="isEveningSchedule ? 'pi pi-moon' : 'pi pi-clock'"></i>
      <span>{{ scheduleTime }}</span>
    </div>

    <!-- 3. Bottom Action Bar: 3 Icon-only Buttons side-by-side (Matching unified standard) -->
    <div class="card-bottom-actions-row">
      <!-- 1. Edit Doctor -->
      <button 
        type="button"
        class="action-icon-btn btn-edit" 
        :title="t('Edit Doctor')" 
        :aria-label="t('Edit Doctor')"
        @click.stop="emit('edit', props.doctor)"
      >
        <i class="pi pi-pencil"></i>
      </button>

      <!-- 2. Edit Schedule -->
      <button 
        type="button"
        class="action-icon-btn btn-schedule" 
        :title="t('Edit Schedule')" 
        :aria-label="t('Edit Schedule')"
        @click.stop="emit('edit-schedule', props.doctor)"
      >
        <i class="pi pi-calendar"></i>
      </button>

      <!-- 3. Bookings / Cases -->
      <button 
        type="button"
        class="action-icon-btn btn-bookings" 
        :title="t('Bookings')" 
        :aria-label="t('Bookings')"
        @click.stop="emit('view-cases', props.doctor)"
      >
        <i class="pi pi-calendar-plus"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed } from 'vue';
import { useI18n } from '../../composables/useI18n';

const props = withDefaults(
  defineProps<{
    doctor?: any;
  }>(),
  {
    doctor: () => ({}),
  }
);

const emit = defineEmits<{
  (e: 'edit', doctor: any): void;
  (e: 'edit-schedule', doctor: any): void;
  (e: 'view-cases', doctor: any): void;
  (e: 'toggle-status', doctor: any): void;
}>();

const { t, isRtl } = useI18n();
const config = useRuntimeConfig();
const baseUrl = config?.public?.API_URL || config?.public?.apiUrl || 'http://localhost:4000';

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const isDoctorActive = computed(() => {
  return Boolean(props.doctor?.is_active ?? (props.doctor?.status === 'active'));
});

const doctorDisplayName = computed(() => {
  const doc = props.doctor;
  if (!doc) return '';
  const isArabic = Boolean(isRtl?.value);
  if (isArabic) {
    return doc.name_ar || doc.name || doc.name_en || '';
  }
  return doc.name_en || doc.name || doc.name_ar || '';
});

const doctorDisplaySpecialty = computed(() => {
  const doc = props.doctor;
  if (!doc) return '';
  if (typeof doc.clinic === 'string' && doc.clinic.trim()) {
    return doc.clinic;
  }
  const isArabic = Boolean(isRtl?.value);
  if (isArabic) {
    return doc.clinic?.name_ar || doc.clinic_ar || doc.specialty_ar || doc.specialty || doc.clinic?.name_en || '';
  }
  return doc.clinic?.name_en || doc.clinic_en || doc.specialty_en || doc.specialty || doc.clinic?.name_ar || '';
});

const doctorRoom = computed(() => {
  return props.doctor?.room || props.doctor?.room_number || '';
});

const scheduleTime = computed(() => {
  return props.doctor?.schedule_time || '';
});

const isEveningSchedule = computed(() => {
  return Boolean(props.doctor?.is_evening);
});

const casesCountText = computed(() => {
  const count = props.doctor?.cases_count;
  return count !== undefined && count !== null ? String(count) : '';
});

const doctorAvatarUrl = computed(() => {
  const raw = props.doctor?.avatar || props.doctor?.avatar_url;
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  return `${baseUrl}${trimmed}`;
});

// 4. Methods (functions, handlers)

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

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #f1f5f9;
          border: 1.5px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 1.25rem;
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

    .doctor-controls-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      .unity-switch-toggle {
        position: relative;
        width: 44px;
        height: 24px;
        border-radius: 9999px;
        background: #cbd5e1;
        border: none;
        padding: 2px;
        cursor: pointer;
        outline: none;
        display: inline-flex;
        align-items: center;
        transition: background-color 0.25s ease;
        flex-shrink: 0;
        direction: ltr;

        .switch-slider {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(0);
        }

        &.active {
          background: #059669;

          .switch-slider {
            transform: translateX(20px);
          }
        }
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

  // 3. Bottom Action Row: 3 Icon-only buttons side-by-side
  .card-bottom-actions-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    margin-top: 10px;

    .action-icon-btn {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 0;
      flex-shrink: 0;

      i {
        font-size: 1.15rem;
      }

      &.btn-edit {
        background: var(--unity-surface, #ffffff);
        border: 1.5px solid var(--unity-border, #e2e8f0);
        color: var(--unity-text-muted, #64748b);

        &:hover {
          background: var(--unity-surface-muted, #f8fafc);
          border-color: #cbd5e1;
          color: var(--unity-text-main, #0f172a);
          transform: translateY(-1px);
        }
      }

      &.btn-schedule {
        background: #ecfdf5;
        border: 1.5px solid #a7f3d0;
        color: #047857;

        &:hover {
          background: #d1fae5;
          border-color: #6ee7b7;
          transform: translateY(-1px);
        }
      }

      &.btn-bookings {
        background: var(--unity-primary, #047857);
        border: none;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(4, 120, 87, 0.22);

        &:hover {
          background: var(--unity-primary-dark, #065f46);
          transform: translateY(-1px);
        }
      }

      &:active {
        transform: scale(0.96);
      }
    }
  }
}
</style>
