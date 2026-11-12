<template>
  <div v-if="isOpen" class="modal-backdrop" @click="emit('close')">
    <div class="modal-sheet" @click.stop>
      <div class="modal-head">
        <h4>{{ isEdit ? t('Edit Examination') : t('Add New Examination') }}</h4>
        <button class="btn-close" :aria-label="t('Close')" @click="emit('close')">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <form class="modal-body" @submit.prevent="saveExamination">
        <!-- Examination Basic Info -->
        <div class="form-group">
          <label class="field-label">{{ t('Examination Name') }}</label>
          <input 
            v-model="form.name" 
            type="text" 
            class="input-field" 
            :placeholder="t('e.g. Complete Blood Count (CBC)')"
            required 
            autofocus
          />
        </div>

        <div class="two-col-grid">
          <div class="form-group">
            <label class="field-label">{{ t('Price') }} ({{ t('EGP') }})</label>
            <input 
              v-model="form.price" 
              type="number" 
              min="0" 
              step="1" 
              class="input-field" 
              placeholder="0"
              required
            />
          </div>
          <div class="form-group">
            <label class="field-label">{{ t('Duration') }} ({{ t('minutes') }})</label>
            <input 
              v-model="form.duration" 
              type="number" 
              min="5" 
              max="180" 
              step="5" 
              class="input-field" 
              placeholder="15"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="field-label">{{ t('Description (Optional)') }}</label>
          <textarea 
            v-model="form.description" 
            rows="2" 
            class="input-field textarea" 
            :placeholder="t('e.g. Diagnostic scan including detailed medical report')"
          ></textarea>
        </div>

        <!-- Examination Schedules Section -->
        <div class="schedules-config-section">
          <div class="section-header-row">
            <div class="title-with-badge">
              <i class="pi pi-calendar-plus"></i>
              <label class="section-title">{{ t('Available Days & Hours') }}</label>
            </div>
          </div>

          <!-- Days Horizontal Navigation (Matches Doctor Schedule Modal) -->
          <div class="days-nav-wrapper">
            <div class="days-nav-scroll">
              <button 
                v-for="day in ALL_DAYS" 
                :key="day.key" 
                type="button" 
                class="day-nav-tab" 
                :class="{ 
                  'active': selectedDay === day.key,
                  'has-slots': (schedulesByDay[day.key] || []).length > 0,
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

          <!-- Schedule Content for Selected Day -->
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
                  'slot-overlap-error': isSlotOverlapping(selectedDay, idx) || isSlotTimeInvalid(slot)
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

                <!-- Overlap / Invalid Warning -->
                <div v-if="slot.is_active && isSlotTimeInvalid(slot)" class="overlap-warning-box">
                  <i class="pi pi-exclamation-triangle"></i>
                  <span>{{ t('End time must be after start time') }}</span>
                </div>
                <div v-else-if="slot.is_active && isSlotOverlapping(selectedDay, idx)" class="overlap-warning-box">
                  <i class="pi pi-exclamation-circle"></i>
                  <span>{{ t('This shift overlaps with another shift') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="modal-foot">
          <button type="button" class="btn-cancel" @click="emit('close')">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="btn-confirm" :disabled="!isFormValid || submitting">
            <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ isEdit ? t('Save Changes') : t('Add Examination') }}</span>
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

interface ScheduleItem {
  day_of_week: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Examination {
  id?: string | number;
  name: string;
  price: number;
  duration?: number;
  description?: string | null;
  is_active?: boolean;
  schedules?: ScheduleItem[];
}

const props = defineProps<{
  isOpen: boolean;
  examination?: Examination | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', examination: any): void;
  (e: 'updated', examination: any): void;
}>();

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

const ALL_DAYS: Array<{ key: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'; label: string }> = [
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
];

// 2. Data (refs, reactive state)
const form = ref<{
  name: string;
  price: number | string;
  duration: number | string;
  description: string;
}>({
  name: '',
  price: '',
  duration: 15,
  description: '',
});

interface ScheduleSlot {
  id?: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const selectedDay = ref<'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'>('saturday');

const schedulesByDay = ref<Record<string, ScheduleSlot[]>>({
  saturday: [],
  sunday: [],
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
});

const submitting = ref(false);

// 3. Computed (computed properties)
const isEdit = computed(() => !!props.examination?.id);

const currentDayLabel = computed(() => {
  const match = ALL_DAYS.find((d) => d.key === selectedDay.value);
  return match ? match.label : '';
});

const hasAnyScheduleOverlap = computed(() => {
  return ALL_DAYS.some((d) => {
    const slots = schedulesByDay.value[d.key] || [];
    return slots.some((s, idx) => {
      if (!s.is_active) return false;
      return isSlotTimeInvalid(s) || isSlotOverlapping(d.key, idx);
    });
  });
});

const isFormValid = computed(() => {
  return (
    form.value.name.trim().length >= 2 &&
    form.value.price !== '' &&
    form.value.price !== null &&
    !isNaN(Number(form.value.price)) &&
    Number(form.value.price) >= 0 &&
    !hasAnyScheduleOverlap.value
  );
});

// 4. Methods (functions, handlers)
const timeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 0;
  const parts = String(timeStr).trim().split(':');
  if (parts.length < 2) return 0;
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
};

const isSlotTimeInvalid = (slot: ScheduleSlot): boolean => {
  const start = timeToMinutes(slot.start_time);
  const end = timeToMinutes(slot.end_time);
  return end <= start;
};

const isSlotOverlapping = (dayKey: string, slotIndex: number): boolean => {
  const slots = schedulesByDay.value[dayKey];
  if (!slots || slots.length < 2) return false;
  const target = slots[slotIndex];
  if (!target || !target.is_active) return false;

  const targetStart = timeToMinutes(target.start_time);
  const targetEnd = timeToMinutes(target.end_time);
  if (targetEnd <= targetStart) return true;

  return slots.some((other, oIdx) => {
    if (oIdx === slotIndex || !other.is_active) return false;
    const oStart = timeToMinutes(other.start_time);
    const oEnd = timeToMinutes(other.end_time);
    if (oEnd <= oStart) return false;
    return Math.max(targetStart, oStart) < Math.min(targetEnd, oEnd);
  });
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

const initSchedules = (existingSchedules?: ScheduleItem[]) => {
  ALL_DAYS.forEach((d) => {
    schedulesByDay.value[d.key] = [];
  });

  if (Array.isArray(existingSchedules) && existingSchedules.length > 0) {
    existingSchedules.forEach((s) => {
      const day = String(s.day_of_week).toLowerCase();
      if (schedulesByDay.value[day]) {
        schedulesByDay.value[day].push({
          start_time: s.start_time || '09:00',
          end_time: s.end_time || '17:00',
          is_active: s.is_active !== false,
        });
      }
    });
  } else {
    resetSchedulesState();
  }
};

const saveExamination = async () => {
  if (!isFormValid.value || submitting.value) return;
  submitting.value = true;
  try {
    const numPrice = Number(form.value.price || 0);
    const numDuration = form.value.duration !== '' && form.value.duration !== null ? Number(form.value.duration) : 15;

    const payloadSchedules: Array<{
      day_of_week: string;
      start_time: string;
      end_time: string;
      is_active: boolean;
    }> = [];

    ALL_DAYS.forEach((d) => {
      const daySlots = schedulesByDay.value[d.key] || [];
      daySlots.forEach((s) => {
        if (s.start_time && s.end_time) {
          payloadSchedules.push({
            day_of_week: d.key,
            start_time: s.start_time,
            end_time: s.end_time,
            is_active: s.is_active,
          });
        }
      });
    });

    if (isEdit.value && props.examination?.id) {
      const res = await api.apiRequest({
        service: 'ADMIN_UPDATE_EXAMINATION',
        payload: {
          id: props.examination.id,
          name: form.value.name.trim(),
          price: numPrice,
          duration: numDuration,
          description: form.value.description?.trim() || null,
          schedules: payloadSchedules,
        },
      });

      const updated = {
        ...props.examination,
        name: form.value.name.trim(),
        price: numPrice,
        duration: numDuration,
        description: form.value.description?.trim() || null,
        schedules: res?.data?.schedules || payloadSchedules,
      };

      emit('updated', updated);
      emit('close');
      toast.show({ title: t('Examination updated successfully!'), type: 'success' });
    } else {
      const res = await api.apiRequest({
        service: 'ADMIN_CREATE_EXAMINATION',
        payload: {
          name: form.value.name.trim(),
          price: numPrice,
          duration: numDuration,
          description: form.value.description?.trim() || null,
          schedules: payloadSchedules,
        },
      });

      if (res?.status && res?.data) {
        const created = {
          id: res.data.id,
          name: res.data.name,
          price: res.data.price,
          duration: res.data.duration,
          description: res.data.description,
          schedules: res.data.schedules || payloadSchedules,
          is_active: true,
        };

        form.value = {
          name: '',
          price: '',
          duration: 15,
          description: '',
        };
        initSchedules();

        emit('created', created);
        emit('close');
        toast.show({ title: t('New examination added successfully!'), type: 'success' });
      }
    }
  } catch (err: any) {
    toast.show({
      title: err.message || (isEdit.value ? t('Failed to update examination') : t('Failed to create examination')),
      type: 'error',
    });
  } finally {
    submitting.value = false;
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.examination,
  (val) => {
    if (val) {
      form.value = {
        name: val.name || '',
        price: val.price !== undefined && val.price !== null ? Number(val.price) : '',
        duration: val.duration !== undefined && val.duration !== null ? Number(val.duration) : 15,
        description: val.description || '',
      };
      initSchedules(val.schedules);
    } else {
      form.value = {
        name: '',
        price: '',
        duration: 15,
        description: '',
      };
      initSchedules();
    }
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (open) => {
    if (open && !props.examination) {
      form.value = {
        name: '',
        price: '',
        duration: 15,
        description: '',
      };
      initSchedules();
    }
  }
);

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 640px) {
    align-items: center;
    padding: 20px;
  }
}

.modal-sheet {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 20px 20px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;
  overflow: hidden;

  @media (min-width: 640px) {
    border-radius: 28px;
  }

  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h4 {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin: 0;
    }

    .btn-close {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: var(--unity-border);
        color: var(--unity-text-main);
      }
    }
  }

  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: right;
    overflow-y: auto;
    padding-right: 2px;
    flex: 1;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .field-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--unity-text-main);
    }

    .input-field {
      width: 100%;
      height: 44px;
      background: var(--unity-bg);
      border: 1.5px solid var(--unity-border);
      border-radius: 12px;
      padding: 0 14px;
      font-size: 0.85rem;
      color: var(--unity-text-main);
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;

      &:focus {
        border-color: var(--unity-primary);
      }

      &.textarea {
        height: auto;
        padding: 10px 14px;
        resize: none;
      }
    }
  }

  /* Schedule Configuration Section */
  .schedules-config-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 6px;
    padding: 14px;
    background: var(--unity-bg);
    border: 1.5px solid var(--unity-border);
    border-radius: 16px;

    .section-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .title-with-badge {
        display: flex;
        align-items: center;
        gap: 8px;

        i {
          color: var(--unity-primary);
          font-size: 0.95rem;
        }

        .section-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--unity-text-main);
        }
      }
    }

    .days-nav-wrapper {
      margin-bottom: 6px;

      .days-nav-scroll {
        display: flex;
        align-items: center;
        gap: 8px;
        overflow-x: auto;
        padding: 4px 2px;
        -webkit-overflow-scrolling: touch;

        &::-webkit-scrollbar {
          display: none;
        }

        .day-nav-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
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

    .day-schedule-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
      padding-inline-end: 2px;
      max-height: 40vh;

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
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
          }

          .overlap-warning-box {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 10px;
            background: #fef2f2;
            border-radius: 10px;
            color: #dc2626;
            font-size: 0.76rem;
            font-weight: 700;

            i {
              font-size: 0.9rem;
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
  }

  .modal-foot {
    display: flex;
    gap: 10px;
    margin-top: 6px;

    button {
      flex: 1;
      height: 46px;
      border-radius: 14px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);

      &:hover {
        background: var(--unity-border);
        color: var(--unity-text-main);
      }
    }

    .btn-confirm {
      background: var(--unity-primary);
      color: #fff;
      box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);

      &:hover:not(:disabled) {
        background: var(--unity-primary-dark);
      }

      &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
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
