<template>
  <div class="booking-calendar-root">
    <!-- Calendar Month Header & Navigation -->
    <div class="cal-nav-header">
      <div class="month-title-wrap">
        <i class="pi pi-calendar cal-header-icon"></i>
        <h4 class="month-title">{{ currentMonthLabel }}</h4>
      </div>

      <div class="nav-arrows-group">
        <button 
          type="button" 
          class="cal-arrow-btn" 
          :disabled="isPrevMonthDisabled"
          :title="t('Previous Month')"
          @click="prevMonth"
        >
          <i :class="isRtl ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"></i>
        </button>

        <button 
          type="button" 
          class="cal-arrow-btn" 
          :disabled="isNextMonthDisabled"
          :title="t('Next Month')"
          @click="nextMonth"
        >
          <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
        </button>
      </div>
    </div>

    <!-- Weekday Header Row -->
    <div class="cal-weekdays-grid">
      <span 
        v-for="dayName in weekdayHeaders" 
        :key="dayName" 
        class="weekday-label"
      >
        {{ dayName }}
      </span>
    </div>

    <!-- Calendar Month Days Grid -->
    <div class="cal-days-grid">
      <!-- Empty Padding Slots Before Month Start -->
      <div 
        v-for="pad in paddingDaysBefore" 
        :key="`pad-${pad}`" 
        class="cal-cell empty-pad"
      ></div>

      <!-- Month Days -->
      <button
        v-for="dayObj in monthDays"
        :key="dayObj.dateStr"
        type="button"
        class="cal-cell day-cell"
        :class="{
          'is-available': dayObj.isAvailable,
          'is-disabled': !dayObj.isAvailable || dayObj.isPast,
          'is-selected': modelValue === dayObj.dateStr,
          'is-today': dayObj.isToday
        }"
        :disabled="!dayObj.isAvailable || dayObj.isPast"
        @click="onSelectDate(dayObj.dateStr)"
      >
        <span class="day-num">{{ dayObj.dayNum }}</span>
        <span v-if="dayObj.isAvailable" class="avail-dot" :title="t('Available for Booking')"></span>
      </button>
    </div>

    <!-- Calendar Legend & Hint -->
    <div class="cal-legend-bar">
      <div class="legend-item active">
        <span class="dot-indicator green"></span>
        <span>{{ t('Available for Booking') }}</span>
      </div>
      <div class="legend-item muted">
        <span class="dot-indicator gray"></span>
        <span>{{ t('Unavailable') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    availableDates?: string[];
    minDate?: string;
    maxMonthsAhead?: number;
  }>(),
  {
    modelValue: '',
    availableDates: () => [],
    minDate: () => new Date().toISOString().split('T')[0],
    maxMonthsAhead: 3,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', date: string): void;
  (e: 'select', date: string): void;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

const currentYear = ref(todayDate.getFullYear());
const currentMonth = ref(todayDate.getMonth()); // 0-indexed (0 = Jan, 10 = Nov)

// 3. Computed (computed properties)
const availableSet = computed(() => {
  return new Set(props.availableDates || []);
});

const currentMonthLabel = computed(() => {
  const d = new Date(currentYear.value, currentMonth.value, 1);
  return d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
});

const isPrevMonthDisabled = computed(() => {
  const currentView = new Date(currentYear.value, currentMonth.value, 1);
  const minView = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  return currentView.getTime() <= minView.getTime();
});

const isNextMonthDisabled = computed(() => {
  const currentView = new Date(currentYear.value, currentMonth.value, 1);
  const maxView = new Date(todayDate.getFullYear(), todayDate.getMonth() + props.maxMonthsAhead, 1);
  return currentView.getTime() >= maxView.getTime();
});

const weekdayHeaders = computed(() => {
  // Saturday to Friday (standard in Egypt / Arab countries)
  if (isRtl.value) {
    return ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
  }
  return ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
});

const paddingDaysBefore = computed(() => {
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1);
  // getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  // Our week starts on Saturday (idx 0), Sunday (1) ... Friday (6)
  const jsDay = firstDayOfMonth.getDay();
  const saturdayBasedDay = (jsDay + 1) % 7;
  return saturdayBasedDay;
});

const monthDays = computed(() => {
  const totalDays = new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];
  const list = [];

  for (let d = 1; d <= totalDays; d++) {
    const year = currentYear.value;
    const month = String(currentMonth.value + 1).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dateObj = new Date(year, currentMonth.value, d);
    dateObj.setHours(0, 0, 0, 0);

    const isPast = dateObj.getTime() < todayDate.getTime();
    const isAvailable = !isPast && availableSet.value.has(dateStr);
    const isToday = dateStr === todayStr;

    list.push({
      dayNum: d,
      dateStr,
      isPast,
      isAvailable,
      isToday,
    });
  }

  return list;
});

// 4. Methods (functions, handlers)
const prevMonth = () => {
  if (isPrevMonthDisabled.value) return;
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (isNextMonthDisabled.value) return;
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const onSelectDate = (dateStr: string) => {
  if (!availableSet.value.has(dateStr)) return;
  emit('update:modelValue', dateStr);
  emit('select', dateStr);
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      const parts = newVal.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          currentYear.value = y;
          currentMonth.value = m;
        }
      }
    }
  },
  { immediate: true }
);

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.booking-calendar-root {
  background: var(--unity-surface, #ffffff);
  border: 1px solid var(--unity-border, rgba(226, 232, 240, 0.9));
  border-radius: 16px;
  padding: 16px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

.cal-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--unity-border, rgba(226, 232, 240, 0.6));

  .month-title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;

    .cal-header-icon {
      font-size: 1.05rem;
      color: var(--unity-primary, #059669);
    }

    .month-title {
      font-size: 0.96rem;
      font-weight: 700;
      color: var(--unity-text-main, #0f172a);
      margin: 0;
      text-transform: capitalize;
    }
  }

  .nav-arrows-group {
    display: flex;
    align-items: center;
    gap: 6px;

    .cal-arrow-btn {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      border: 1px solid var(--unity-border, rgba(226, 232, 240, 0.8));
      background: var(--unity-bg, #f8fafc);
      color: var(--unity-text-main, #334155);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.82rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: var(--unity-primary, #059669);
        color: #ffffff;
        border-color: var(--unity-primary, #059669);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }
  }
}

.cal-weekdays-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  gap: 4px;

  .weekday-label {
    font-size: 0.74rem;
    font-weight: 600;
    color: var(--unity-text-muted, #94a3b8);
    padding: 4px 0;
  }
}

.cal-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;

  .cal-cell {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-size: 0.88rem;
    position: relative;
    border: none;
    background: transparent;
    transition: all 0.2s ease;

    &.empty-pad {
      pointer-events: none;
    }

    &.day-cell {
      cursor: pointer;
      font-weight: 600;
      color: var(--unity-text-main, #1e293b);

      .day-num {
        line-height: 1;
        z-index: 1;
      }

      .avail-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #10b981;
        margin-top: 3px;
        transition: transform 0.2s ease;
      }

      &.is-available {
        background: rgba(16, 185, 129, 0.08);
        border: 1px solid rgba(16, 185, 129, 0.35);
        color: #065f46;

        &:hover {
          background: rgba(16, 185, 129, 0.18);
          border-color: #10b981;
          transform: translateY(-1px);
        }
      }

      &.is-selected {
        background: var(--unity-primary, #059669) !important;
        border-color: var(--unity-primary, #059669) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
        transform: scale(1.04);

        .avail-dot {
          background: #ffffff;
        }
      }

      &.is-disabled {
        opacity: 0.25;
        cursor: not-allowed;
        color: var(--unity-text-muted, #94a3b8);
        background: transparent !important;
        border: none !important;

        .avail-dot {
          display: none;
        }
      }

      &.is-today:not(.is-selected) {
        font-weight: 800;
        text-decoration: underline;
        text-underline-offset: 3px;
      }
    }
  }
}

.cal-legend-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px dashed var(--unity-border, rgba(226, 232, 240, 0.7));
  font-size: 0.76rem;
  color: var(--unity-text-muted, #64748b);

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;

    .dot-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.green {
        background: #10b981;
        box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
      }

      &.gray {
        background: #cbd5e1;
      }
    }
  }
}
</style>

