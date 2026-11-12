<template>
  <div v-if="isOpen && doctor" class="modal-backdrop" @click="close">
    <div class="modal-sheet" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="header-title">
          <div class="modal-icon-badge">
            <i class="pi pi-calendar-plus"></i>
          </div>
          <div class="header-texts">
            <h4>{{ t('Edit Doctor Schedule') }}</h4>
            <small>{{ doctor.name }} • {{ doctor.specialty || doctor.clinic?.name || '' }}</small>
          </div>
        </div>
        <button class="btn-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Days of Week Tabs (Horizontal Pills) -->
      <div class="days-tabs-wrapper">
        <div class="days-tabs-scroll">
          <button 
            v-for="day in weekDays" 
            :key="day.key"
            type="button"
            class="day-tab-btn"
            :class="{ 
              'active': selectedDay === day.key,
              'has-active-slots': (schedulesByDay[day.key] || []).some(s => s.is_active)
            }"
            @click="selectedDay = day.key"
          >
            <span class="day-label">{{ t(day.label) }}</span>
            <span 
              v-if="(schedulesByDay[day.key] || []).length > 0" 
              class="slots-count-dot"
            >
              {{ (schedulesByDay[day.key] || []).length }}
            </span>
          </button>
        </div>
      </div>

      <!-- Schedule Content For Selected Day -->
      <form class="schedule-form" @submit.prevent="saveSchedule">
        <div class="day-schedule-body">
          <div class="day-headline-row">
            <div class="headline-title">
              <i class="pi pi-clock"></i>
              <h5>{{ t(currentDayLabel) }}</h5>
            </div>
            <button 
              type="button" 
              class="btn-add-slot-header"
              @click="addSlot(selectedDay)"
            >
              <i class="pi pi-plus"></i>
              <span>{{ t('Add New Slot') }}</span>
            </button>
          </div>

          <!-- Empty Slots State for This Day -->
          <div 
            v-if="!schedulesByDay[selectedDay] || schedulesByDay[selectedDay].length === 0" 
            class="empty-day-slots"
          >
            <i class="pi pi-calendar"></i>
            <h6>{{ t('No working hours for this day') }}</h6>
            <p>{{ t('Click add slot to enable working hours') }}</p>
          </div>

          <!-- List of Slots for This Day -->
          <div v-else class="slots-list">
            <div 
              v-for="(slot, idx) in schedulesByDay[selectedDay]" 
              :key="idx" 
              class="slot-card"
              :class="{ 
                'is-disabled': !slot.is_active,
                'slot-overlap-error': isSlotOverlapping(selectedDay, idx)
              }"
            >
              <!-- Slot Top Row: Status Switch & Delete -->
              <div class="slot-header-row">
                <div class="slot-status-group" @click="slot.is_active = !slot.is_active">
                  <button 
                    type="button"
                    class="unity-switch-toggle" 
                    :class="{ 'active': slot.is_active }"
                    :aria-checked="slot.is_active"
                    role="switch"
                    :title="slot.is_active ? t('Active Slot') : t('Inactive Slot')"
                    @click.stop="slot.is_active = !slot.is_active"
                  >
                    <span class="switch-slider"></span>
                  </button>
                  <span class="status-label" :class="{ 'is-active': slot.is_active }">
                    {{ slot.is_active ? t('Active Slot') : t('Inactive Slot') }}
                  </span>
                </div>

                <!-- Delete Slot -->
                <button 
                  type="button" 
                  class="btn-remove-slot" 
                  :title="t('Remove Slot')" 
                  @click="removeSlot(selectedDay, idx)"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>

              <!-- Slot Time Inputs -->
              <div class="slot-time-inputs">
                <div class="time-field">
                  <label>{{ t('Start Time') }}</label>
                  <AppTimePicker v-model="slot.start_time" :title="t('Start Time')" />
                </div>

                <div class="time-field">
                  <label>{{ t('End Time') }}</label>
                  <AppTimePicker v-model="slot.end_time" :title="t('End Time')" />
                </div>
              </div>

              <!-- Overlap / Invalid Warning Banner -->
              <div v-if="isSlotOverlapping(selectedDay, idx)" class="overlap-warning-box">
                <i class="pi pi-exclamation-triangle"></i>
                <span>{{ isSlotTimeInvalid(slot) ? t('End time must be after start time') : t('This shift overlaps with another shift') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="close">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="btn-submit" :disabled="loading || hasAnyScheduleOverlap">
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ t('Save Changes') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AppTimePicker from '../common/AppTimePicker.vue';

interface ScheduleSlot {
  id?: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const props = defineProps<{
  isOpen: boolean;
  doctor: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'updated', payload: any): void;
}>();

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const loading = ref(false);
const selectedDay = ref('saturday');

const weekDays = [
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
];

const schedulesByDay = ref<Record<string, ScheduleSlot[]>>({
  saturday: [],
  sunday: [],
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
});

// 3. Computed (computed properties)
const currentDayLabel = computed(() => {
  const match = weekDays.find(d => d.key === selectedDay.value);
  return match ? match.label : '';
});

const timeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 0;
  const str = String(timeStr).trim().toUpperCase();
  const isPM = str.includes('PM');
  const isAM = str.includes('AM');
  const clean = str.replace(/[^0-9:]/g, '');
  const parts = clean.split(':');
  if (parts.length < 2) return 0;
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  return h * 60 + m;
};

const isSlotTimeInvalid = (slot: ScheduleSlot): boolean => {
  if (!slot.start_time || !slot.end_time) return false;
  return timeToMinutes(slot.end_time) <= timeToMinutes(slot.start_time);
};

const isSlotOverlapping = (dayKey: string, slotIndex: number): boolean => {
  const slots = schedulesByDay.value[dayKey] || [];
  const current = slots[slotIndex];
  if (!current || !current.is_active || !current.start_time || !current.end_time) return false;

  const cStart = timeToMinutes(current.start_time);
  const cEnd = timeToMinutes(current.end_time);
  if (cEnd <= cStart) return true;

  for (let i = 0; i < slots.length; i++) {
    if (i === slotIndex) continue;
    const other = slots[i];
    if (!other.is_active || !other.start_time || !other.end_time) continue;

    const oStart = timeToMinutes(other.start_time);
    const oEnd = timeToMinutes(other.end_time);

    // Overlap condition: max(start) < min(end)
    if (Math.max(cStart, oStart) < Math.min(cEnd, oEnd)) {
      return true;
    }
  }
  return false;
};

const hasAnyScheduleOverlap = computed(() => {
  for (const day of weekDays) {
    const slots = schedulesByDay.value[day.key] || [];
    for (let i = 0; i < slots.length; i++) {
      if (isSlotOverlapping(day.key, i)) return true;
    }
  }
  return false;
});

// 4. Methods (functions, handlers)
const resetSchedulesState = () => {
  schedulesByDay.value = {
    saturday: [],
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
  };
};

const populateSchedules = (schedulesList: any[]) => {
  resetSchedulesState();
  if (Array.isArray(schedulesList)) {
    schedulesList.forEach((s) => {
      const day = String(s.day_of_week).toLowerCase();
      if (schedulesByDay.value[day]) {
        schedulesByDay.value[day].push({
          id: s.id,
          start_time: s.start_time || '09:00',
          end_time: s.end_time || '17:00',
          is_active: s.is_active !== false,
        });
      }
    });
  }
};

const addSlot = (day: string) => {
  if (!schedulesByDay.value[day]) {
    schedulesByDay.value[day] = [];
  }
  const currentSlots = schedulesByDay.value[day];
  let defaultStart = '09:00';
  let defaultEnd = '17:00';

  if (currentSlots.length > 0) {
    const last = currentSlots[currentSlots.length - 1];
    defaultStart = last.end_time || '18:00';
    defaultEnd = '22:00';
  }

  schedulesByDay.value[day].push({
    start_time: defaultStart,
    end_time: defaultEnd,
    is_active: true,
  });
};

const removeSlot = (day: string, idx: number) => {
  if (schedulesByDay.value[day]) {
    schedulesByDay.value[day].splice(idx, 1);
  }
};

const close = () => {
  emit('close');
};

const saveSchedule = async () => {
  if (!props.doctor?.id || loading.value) return;

  if (hasAnyScheduleOverlap.value) {
    toast.error(t('Please resolve overlapping work shifts before saving'));
    return;
  }

  loading.value = true;
  try {
    const allSchedules: Array<{
      day_of_week: string;
      start_time: string;
      end_time: string;
      is_active: boolean;
    }> = [];

    weekDays.forEach((d) => {
      const slots = schedulesByDay.value[d.key] || [];
      slots.forEach((s) => {
        if (s.start_time && s.end_time) {
          allSchedules.push({
            day_of_week: d.key,
            start_time: s.start_time,
            end_time: s.end_time,
            is_active: s.is_active !== false,
          });
        }
      });
    });

    await api.apiRequest({
      service: 'ADMIN_UPDATE_DOCTOR_SCHEDULES',
      payload: {
        id: props.doctor.id,
        schedules: allSchedules,
      },
    });

    toast.success(t('Doctor schedule updated successfully!'));
    emit('updated', {
      doctorId: props.doctor.id,
      schedules: allSchedules,
    });
    close();
  } catch (err: any) {
    toast.error(err?.data?.message || err?.message || t('Failed to update schedule'));
  } finally {
    loading.value = false;
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.doctor,
  async (doc) => {
    if (!doc) {
      resetSchedulesState();
      return;
    }

    if (Array.isArray(doc.schedules) && doc.schedules.length > 0) {
      populateSchedules(doc.schedules);
    } else {
      resetSchedulesState();
      // Fetch fresh details from backend
      try {
        const res = await api.apiRequest({
          service: 'ADMIN_DOCTOR_BY_ID',
          filter: { id: doc.id },
        });
        const serverSchedules = res?.data?.user?.doctor_schedules || res?.data?.schedules;
        if (Array.isArray(serverSchedules)) {
          populateSchedules(serverSchedules);
        }
      } catch (err) {}
    }
  },
  { immediate: true }
);

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-sheet {
  width: 100%;
  max-width: 440px;
  max-height: 85vh;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 20px 18px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;
  overflow: hidden;

  &[dir='ltr'] {
    direction: ltr;

    .modal-header .header-title,
    .day-headline-row .headline-title,
    .time-field label {
      text-align: left;
    }
  }

  // Header
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;

      .modal-icon-badge {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        color: #047857;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
      }

      .header-texts {
        h4 {
          margin: 0;
          font-size: 1.02rem;
          font-weight: 800;
          color: var(--unity-text-main);
        }

        small {
          font-size: 0.74rem;
          color: var(--unity-text-dim);
        }
      }
    }

    .btn-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-dim);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        color: var(--unity-text-main);
        background: var(--unity-surface);
      }
    }
  }

  // Days Tabs Wrapper
  .days-tabs-wrapper {
    flex-shrink: 0;
    width: 100%;
    border-bottom: 1px solid var(--unity-border-subtle);
    padding-bottom: 8px;

    .days-tabs-scroll {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
      padding: 2px 2px 4px;

      &::-webkit-scrollbar {
        display: none;
      }

      .day-tab-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        padding: 8px 14px;
        border-radius: 20px;
        background: var(--unity-surface);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-muted);
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;

        .slots-count-dot {
          background: rgba(16, 185, 129, 0.15);
          color: #047857;
          border-radius: 12px;
          padding: 1px 6px;
          font-size: 0.68rem;
          font-weight: 800;
        }

        &:hover {
          border-color: var(--unity-primary);
          color: var(--unity-primary);
        }

        &.active {
          background: var(--unity-primary);
          color: #ffffff;
          border-color: var(--unity-primary);
          box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);

          .slots-count-dot {
            background: rgba(255, 255, 255, 0.25);
            color: #ffffff;
          }
        }
      }
    }
  }

  // Schedule Form & Scrollable Body
  .schedule-form {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;

    .day-schedule-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
      padding-inline-end: 2px;
      max-height: 48vh;
      margin-bottom: 12px;

      .day-headline-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .headline-title {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--unity-text-main);

          i {
            color: var(--unity-primary);
            font-size: 0.9rem;
          }

          h5 {
            margin: 0;
            font-size: 0.92rem;
            font-weight: 800;
          }
        }

        .btn-add-slot-header {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border-radius: 12px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
          font-size: 0.74rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #d1fae5;
          }
        }
      }

      // Empty Day State
      .empty-day-slots {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 28px 16px;
        background: #f8fafc;
        border: 1.5px dashed var(--unity-border);
        border-radius: 20px;
        gap: 6px;

        i {
          font-size: 1.8rem;
          color: var(--unity-text-dim);
          margin-bottom: 4px;
        }

        h6 {
          margin: 0;
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--unity-text-main);
        }

        p {
          margin: 0;
          font-size: 0.74rem;
          color: var(--unity-text-muted);
        }
      }

      // Slots List
      .slots-list {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .slot-card {
          background: #ffffff;
          border: 1px solid var(--unity-border);
          border-radius: 18px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
          transition: all 0.2s;

          &.is-disabled {
            opacity: 0.65;
            background: #f8fafc;
          }

          &.slot-overlap-error {
            border: 1.5px solid #ef4444 !important;
            background: rgba(239, 68, 68, 0.03);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
          }

          .overlap-warning-box {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            background: rgba(239, 68, 68, 0.1);
            border-radius: 10px;
            color: #dc2626;
            font-size: 0.72rem;
            font-weight: 700;

            i {
              font-size: 0.8rem;
              flex-shrink: 0;
            }
          }

          .slot-header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .slot-status-group {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              cursor: pointer;
              user-select: none;

              .status-label {
                font-size: 0.76rem;
                font-weight: 700;
                color: var(--unity-text-muted);
                transition: color 0.2s;

                &.is-active {
                  color: var(--unity-text-main);
                }
              }

              .unity-switch-toggle {
                position: relative;
                width: 42px;
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
                direction: ltr; // Crucial for reliable translation in RTL

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
                    transform: translateX(18px);
                  }
                }
              }
            }

            .btn-remove-slot {
              background: none;
              border: none;
              color: #ef4444;
              cursor: pointer;
              font-size: 0.9rem;
              padding: 6px;
              border-radius: 8px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s;

              &:hover {
                background: #fee2e2;
              }

              &:active {
                transform: scale(0.92);
              }
            }
          }

          .slot-time-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;

            .time-field {
              display: flex;
              flex-direction: column;
              gap: 4px;

              label {
                font-size: 0.72rem;
                font-weight: 700;
                color: var(--unity-text-muted);
              }

              .time-input-shell {
                position: relative;
                display: flex;
                align-items: center;

                i {
                  position: absolute;
                  inset-inline-start: 10px;
                  color: var(--unity-text-dim);
                  font-size: 0.78rem;
                  pointer-events: none;
                }

                input {
                  width: 100%;
                  height: 38px;
                  border: 1px solid var(--unity-border);
                  border-radius: 12px;
                  padding-inline-start: 28px;
                  padding-inline-end: 10px;
                  font-size: 0.82rem;
                  font-weight: 600;
                  color: var(--unity-text-main);
                  background: var(--unity-bg);
                  outline: none;

                  &:focus {
                    border-color: var(--unity-primary);
                  }
                }
              }
            }
          }
        }
      }
    }

    // Modal Actions
    .modal-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--unity-border-subtle);
      flex-shrink: 0;

      button {
        flex: 1;
        height: 44px;
        border-radius: 16px;
        font-size: 0.86rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;

        &.btn-cancel {
          background: var(--unity-bg);
          border: 1px solid var(--unity-border);
          color: var(--unity-text-muted);

          &:hover {
            color: var(--unity-text-main);
            background: #f1f5f9;
          }
        }

        &.btn-submit {
          background: var(--unity-primary);
          border: none;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          &:hover:not(:disabled) {
            background: var(--unity-primary-dark);
          }
        }
      }
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
