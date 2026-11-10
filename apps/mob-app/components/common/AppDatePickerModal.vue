<template>
  <div class="app-date-picker-root">
    <!-- Trigger Shell (looks like an input field) -->
    <button 
      type="button" 
      class="date-trigger-shell"
      :class="{ 'has-value': !!modelValue, 'is-open': isOpen }"
      @click="openPicker"
    >
      <i class="pi pi-calendar field-icon"></i>
      <span class="date-display-text">{{ formattedDisplay }}</span>
      <i class="pi pi-chevron-down chevron-icon"></i>
    </button>

    <!-- Modal Dialog (Rendered in Teleport or within frame) -->
    <Teleport to="body">
      <Transition name="fade-modal">
        <div v-if="isOpen" class="date-picker-backdrop" @click.self="closePicker">
          <div class="date-picker-sheet">
            <!-- Sheet Header -->
            <div class="sheet-header">
              <div class="title-wrap">
                <i class="pi pi-calendar-plus header-icon"></i>
                <div>
                  <h5>{{ title || (t('Select Date of Birth')) }}</h5>
                  <small>{{ formattedDisplay }}</small>
                </div>
              </div>
              <button type="button" class="close-sheet-btn" @click="closePicker">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Quick Selector Header (Year & Month Jump) -->
            <div class="selection-nav-bar">
              <!-- Year Selector Dropdown/Button -->
              <div class="nav-segment">
                <label>{{ t('Year') }}</label>
                <select v-model="selectedYear" class="styled-select" @change="onMonthOrYearChange">
                  <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
                </select>
              </div>

              <!-- Month Selector Dropdown/Button -->
              <div class="nav-segment">
                <label>{{ t('Month') }}</label>
                <select v-model="selectedMonth" class="styled-select" @change="onMonthOrYearChange">
                  <option v-for="(m, idx) in monthNames" :key="idx" :value="idx">
                    {{ m }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Calendar Days Grid -->
            <div class="calendar-grid-card">
              <!-- Weekday Headers -->
              <div class="weekdays-row">
                <span v-for="(dayName, dIdx) in weekDayHeaders" :key="dIdx" class="weekday-name">
                  {{ dayName }}
                </span>
              </div>

              <!-- Days of Month -->
              <div class="days-matrix">
                <!-- Blank padding days for start of month -->
                <div 
                  v-for="blank in startBlankDays" 
                  :key="`blank-${blank}`" 
                  class="day-cell is-blank"
                ></div>

                <!-- Actual Days -->
                <button 
                  v-for="d in daysInMonth" 
                  :key="`day-${d}`" 
                  type="button" 
                  class="day-cell day-btn"
                  :class="{ 
                    'is-selected': selectedDay === d,
                    'is-today': isToday(d)
                  }"
                  @click="selectedDay = d"
                >
                  <span>{{ d }}</span>
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="sheet-actions">
              <button type="button" class="confirm-btn" @click="confirmDate">
                <i class="pi pi-check"></i>
                <span>{{ t('Confirm Date') }}</span>
              </button>
              <button type="button" class="cancel-btn" @click="closePicker">
                <span>{{ t('Cancel') }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';

const props = withDefaults(defineProps<{
  modelValue?: string;
  title?: string;
  minYear?: number;
  maxYear?: number;
}>(), {
  modelValue: '1995-05-15',
  minYear: 1935,
  maxYear: () => new Date().getFullYear(),
});

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)
const isOpen = ref(false);

const monthNamesAr = [
  'يناير (01)', 'فبراير (02)', 'مارس (03)', 'أبريل (04)',
  'مايو (05)', 'يونيو (06)', 'يوليو (07)', 'أغسطس (08)',
  'سبتمبر (09)', 'أكتوبر (10)', 'نوفمبر (11)', 'ديسمبر (12)'
];

const monthNamesEn = [
  'January (01)', 'February (02)', 'March (03)', 'April (04)',
  'May (05)', 'June (06)', 'July (07)', 'August (08)',
  'September (09)', 'October (10)', 'November (11)', 'December (12)'
];

// Internal selected state
const selectedYear = ref(1995);

const selectedMonth = ref(4);

// 0-indexed (4 = May)
const selectedDay = ref(15);

// 3. Computed (computed properties)
const monthNames = computed(() => monthNamesAr);

const weekDayHeaders = computed(() => ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']);

// Year options: descending from maxYear to minYear
const yearOptions = computed(() => {
  const years: number[] = [];
  for (let y = props.maxYear; y >= props.minYear; y--) {
    years.push(y);
  }
  return years;
});

// Calculate days in current selected month & year
const daysInMonth = computed(() => {
  return new Date(selectedYear.value, selectedMonth.value + 1, 0).getDate();
});

// Blank days before the 1st day of month
const startBlankDays = computed(() => {
  return new Date(selectedYear.value, selectedMonth.value, 1).getDay();
});

const formattedDisplay = computed(() => {
  if (!props.modelValue && !selectedDay.value) {
    return t('Select Date of Birth');
  }
  const cleanM = (selectedMonth.value + 1).toString().padStart(2, '0');
  const cleanD = selectedDay.value.toString().padStart(2, '0');
  const cleanY = selectedYear.value;

  const rawMonthName = monthNames.value[selectedMonth.value]?.split(' ')[0] || '';
  return `${cleanD} ${rawMonthName} ${cleanY}`;
});

// 4. Methods (functions, handlers)
// Parse incoming value
const parseDateValue = (str?: string) => {
  if (!str) return;
  const parts = str.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y)) selectedYear.value = y;
    if (!isNaN(m)) selectedMonth.value = m;
    if (!isNaN(d)) selectedDay.value = d;
  }
};

const onMonthOrYearChange = () => {
  const maxDay = daysInMonth.value;
  if (selectedDay.value > maxDay) {
    selectedDay.value = maxDay;
  }
};

const isToday = (d: number) => {
  const now = new Date();
  return (
    now.getFullYear() === selectedYear.value &&
    now.getMonth() === selectedMonth.value &&
    now.getDate() === d
  );
};

const openPicker = () => {
  parseDateValue(props.modelValue);
  isOpen.value = true;
};

const closePicker = () => {
  isOpen.value = false;
};

const confirmDate = () => {
  const cleanM = (selectedMonth.value + 1).toString().padStart(2, '0');
  const cleanD = selectedDay.value.toString().padStart(2, '0');
  const isoString = `${selectedYear.value}-${cleanM}-${cleanD}`;
  emit('update:modelValue', isoString);
  closePicker();
};

// 5. Watches (watch, watchEffect)
watch(() => props.modelValue, (newVal) => {
  parseDateValue(newVal);
}, { immediate: true });

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.app-date-picker-root {
  width: 100%;
}

.date-trigger-shell {
  width: 100%;
  height: 48px;
  background: var(--unity-surface-muted, #f8fafc);
  border: 1px solid var(--unity-border, #e2e8f0);
  border-radius: 14px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: start;
  transition: all 0.2s ease;

  &:hover, &.is-open {
    border-color: var(--unity-primary, #047857);
    background: var(--unity-surface, #ffffff);
    box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
  }

  .field-icon {
    font-size: 1.05rem;
    color: var(--unity-primary, #047857);
    margin-inline-end: 10px;
  }

  .date-display-text {
    flex: 1;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--unity-text, #0f172a);
    font-family: inherit;
  }

  .chevron-icon {
    font-size: 0.8rem;
    color: var(--unity-text-dim, #94a3b8);
    transition: transform 0.2s ease;
  }

  &.is-open .chevron-icon {
    transform: rotate(180deg);
  }
}

// Backdrop overlay
.date-picker-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 9999999;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 520px) {
    align-items: center;
    padding: 20px;
  }
}

// Sheet Card
.date-picker-sheet {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 28px 28px 0 0;
  padding: 20px 20px 28px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 520px) {
    border-radius: 26px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;

    .title-wrap {
      display: flex;
      align-items: center;
      gap: 12px;

      .header-icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: #ecfdf5;
        color: #047857;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
      }

      h5 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
        color: #0f172a;
      }

      small {
        font-size: 0.8rem;
        font-weight: 600;
        color: #047857;
      }
    }

    .close-sheet-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f8fafc;
      border: none;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #e2e8f0;
        color: #0f172a;
      }
    }
  }

  .selection-nav-bar {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 12px;

    .nav-segment {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        font-size: 0.75rem;
        font-weight: 700;
        color: #475569;
      }

      .styled-select {
        height: 42px;
        background: #f8fafc;
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        padding: 0 10px;
        font-size: 0.88rem;
        font-weight: 600;
        color: #0f172a;
        font-family: inherit;
        outline: none;
        cursor: pointer;
        transition: border-color 0.2s;

        &:focus {
          border-color: #047857;
          background: #ffffff;
        }
      }
    }
  }

  .calendar-grid-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 14px 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .weekdays-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;

      .weekday-name {
        font-size: 0.72rem;
        font-weight: 700;
        color: #64748b;
      }
    }

    .days-matrix {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;

      .day-cell {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        font-size: 0.86rem;
        font-weight: 600;

        &.is-blank {
          visibility: hidden;
        }

        &.day-btn {
          background: transparent;
          border: none;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.18s ease;

          &:hover {
            background: #e2e8f0;
          }

          &.is-selected {
            background: #047857 !important;
            color: #ffffff !important;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(4, 120, 87, 0.35);
            transform: scale(1.05);
          }

          &.is-today:not(.is-selected) {
            border: 1.5px solid #047857;
            color: #047857;
            font-weight: 700;
          }
        }
      }
    }
  }

  .sheet-actions {
    display: flex;
    gap: 10px;
    margin-top: 4px;

    button {
      flex: 1;
      height: 48px;
      border-radius: 14px;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .confirm-btn {
      background: #047857;
      color: #ffffff;
      box-shadow: 0 6px 18px rgba(4, 120, 87, 0.28);

      &:hover {
        background: #065f46;
      }
    }

    .cancel-btn {
      background: #f1f5f9;
      color: #475569;

      &:hover {
        background: #e2e8f0;
      }
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.22s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
</style>
