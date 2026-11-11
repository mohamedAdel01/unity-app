<template>
  <div class="app-time-picker-root">
    <!-- Trigger Button that replaces the raw input -->
    <button 
      type="button" 
      class="time-trigger-shell"
      :class="{ 'has-value': !!modelValue, 'is-open': isOpen }"
      @click="openPicker"
    >
      <div class="trigger-content">
        <i class="pi pi-clock trigger-icon"></i>
        <span class="time-display-text">{{ formattedDisplay }}</span>
      </div>
      <i class="pi pi-angle-down chevron-icon"></i>
    </button>

    <!-- Teleported Modal Popup -->
    <Teleport to="body">
      <Transition name="fade-time-picker">
        <div v-if="isOpen" class="time-picker-backdrop" @click.self="closePicker">
          <div class="time-picker-dialog" @click.stop>
            <!-- Dialog Header -->
            <div class="dialog-header">
              <div class="header-info">
                <i class="pi pi-clock header-icon"></i>
                <div>
                  <h5>{{ title || t('Select Time') }}</h5>
                  <small>{{ t('Choose hour, minute, and shift') }}</small>
                </div>
              </div>
              <button type="button" class="btn-close-dialog" :aria-label="t('Close')" @click="closePicker">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Big Live Time Preview Card -->
            <div class="time-preview-card">
              <div class="preview-digits">
                <span class="digit-box">{{ tempHour }}</span>
                <span class="digit-separator">:</span>
                <span class="digit-box">{{ tempMinute }}</span>
              </div>
              <span class="preview-period-badge" :class="tempPeriod.toLowerCase()">
                {{ tempPeriod === 'AM' ? t('Morning Shift') : t('Evening Shift') }}
              </span>
            </div>

            <!-- 3-Column Picker Selector (Hours, Minutes, Period) -->
            <div class="picker-columns-container">
              <!-- Column 1: Hours (01 - 12) -->
              <div class="picker-col">
                <span class="col-title">{{ t('Hours') }}</span>
                <div class="col-scroll">
                  <button 
                    v-for="h in hoursList" 
                    :key="`hour-${h}`"
                    type="button" 
                    class="col-item-btn"
                    :class="{ 'active': tempHour === h }"
                    @click="tempHour = h"
                  >
                    {{ h }}
                  </button>
                </div>
              </div>

              <!-- Column 2: Minutes (00, 05, 10, ... 55) -->
              <div class="picker-col">
                <span class="col-title">{{ t('Minutes') }}</span>
                <div class="col-scroll">
                  <button 
                    v-for="m in minutesList" 
                    :key="`min-${m}`"
                    type="button" 
                    class="col-item-btn"
                    :class="{ 'active': tempMinute === m }"
                    @click="tempMinute = m"
                  >
                    {{ m }}
                  </button>
                </div>
              </div>

              <!-- Column 3: Period (AM / PM) -->
              <div class="picker-col period-col">
                <span class="col-title">{{ t('Period') }}</span>
                <div class="col-scroll">
                  <button 
                    type="button" 
                    class="col-item-btn period-btn"
                    :class="{ 'active': tempPeriod === 'AM' }"
                    @click="tempPeriod = 'AM'"
                  >
                    <span class="period-code">AM</span>
                    <span class="period-ar">{{ t('AM') }}</span>
                  </button>
                  <button 
                    type="button" 
                    class="col-item-btn period-btn"
                    :class="{ 'active': tempPeriod === 'PM' }"
                    @click="tempPeriod = 'PM'"
                  >
                    <span class="period-code">PM</span>
                    <span class="period-ar">{{ t('PM') }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Dialog Actions -->
            <div class="dialog-actions">
              <button type="button" class="btn-cancel" @click="closePicker">
                {{ t('Cancel') }}
              </button>
              <button type="button" class="btn-confirm" @click="confirmTime">
                <i class="pi pi-check"></i>
                <span>{{ t('Confirm Time') }}</span>
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
import { ref, computed, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';

const props = withDefaults(
  defineProps<{
    modelValue?: string; // Format: "HH:mm" (24-hour e.g. "09:00", "17:30")
    title?: string;
    placeholder?: string;
  }>(),
  {
    modelValue: '09:00',
    title: '',
    placeholder: '--:--',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)
const isOpen = ref(false);

const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const tempHour = ref('09');
const tempMinute = ref('00');
const tempPeriod = ref<'AM' | 'PM'>('AM');

// 3. Computed (computed properties)
const formattedDisplay = computed(() => {
  if (!props.modelValue) return props.placeholder;

  // Parse "HH:mm"
  const parts = props.modelValue.split(':');
  if (parts.length < 2) return props.modelValue;

  let h = parseInt(parts[0], 10);
  const m = parts[1].padStart(2, '0');
  if (isNaN(h)) return props.modelValue;

  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;

  const hStr = String(h).padStart(2, '0');
  return `${hStr}:${m} ${period}`;
});

// 4. Methods (functions, handlers)
const parseTimeToParts = (timeStr?: string) => {
  if (!timeStr) {
    tempHour.value = '09';
    tempMinute.value = '00';
    tempPeriod.value = 'AM';
    return;
  }

  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let h = parseInt(parts[0], 10);
    const m = parts[1].slice(0, 2);

    if (!isNaN(h)) {
      tempPeriod.value = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      tempHour.value = String(h).padStart(2, '0');
    }
    tempMinute.value = minutesList.includes(m) ? m : String(Math.round(parseInt(m || '0', 10) / 5) * 5).padStart(2, '0');
    if (!minutesList.includes(tempMinute.value)) {
      tempMinute.value = '00';
    }
  }
};

const openPicker = () => {
  parseTimeToParts(props.modelValue);
  isOpen.value = true;
};

const closePicker = () => {
  isOpen.value = false;
};

const confirmTime = () => {
  let h = parseInt(tempHour.value, 10);
  if (tempPeriod.value === 'PM') {
    if (h < 12) h += 12;
  } else {
    if (h === 12) h = 0;
  }

  const final24 = `${String(h).padStart(2, '0')}:${tempMinute.value}`;
  emit('update:modelValue', final24);
  emit('change', final24);
  closePicker();
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && !isOpen.value) {
      parseTimeToParts(newVal);
    }
  },
  { immediate: true }
);

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.app-time-picker-root {
  position: relative;
  width: 100%;
}

.time-trigger-shell {
  width: 100%;
  height: 40px;
  background: var(--unity-bg, #f8fafc);
  border: 1px solid var(--unity-border, #e2e8f0);
  border-radius: 12px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    border-color: var(--unity-primary, #047857);
    background: #ffffff;
  }

  &.is-open,
  &:focus {
    border-color: var(--unity-primary, #047857);
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
  }

  .trigger-content {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    .trigger-icon {
      color: var(--unity-primary, #047857);
      font-size: 0.85rem;
    }

    .time-display-text {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--unity-text-main, #0f172a);
      letter-spacing: 0.3px;
    }
  }

  .chevron-icon {
    font-size: 0.72rem;
    color: var(--unity-text-dim, #94a3b8);
    transition: transform 0.2s;
  }

  &.is-open .chevron-icon {
    transform: rotate(180deg);
  }
}

/* Modal Backdrop */
.time-picker-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

/* Dialog Sheet */
.time-picker-dialog {
  width: 100%;
  max-width: 330px;
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18), 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: dialogScaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px 10px;
    border-bottom: 1px solid var(--unity-border, #f1f5f9);

    .header-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .header-icon {
        color: var(--unity-primary, #047857);
        font-size: 1.1rem;
        background: #ecfdf5;
        padding: 8px;
        border-radius: 10px;
      }

      h5 {
        margin: 0;
        font-size: 0.92rem;
        font-weight: 800;
        color: var(--unity-text-main, #0f172a);
      }

      small {
        font-size: 0.7rem;
        color: var(--unity-text-muted, #64748b);
      }
    }

    .btn-close-dialog {
      background: none;
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--unity-text-dim, #94a3b8);
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        background: #f1f5f9;
        color: var(--unity-text-main, #0f172a);
      }
    }
  }

  /* Live Big Time Preview */
  .time-preview-card {
    margin: 12px 18px 8px;
    padding: 10px 14px;
    background: #f0fdf4;
    border: 1.5px solid #bbf7d0;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .preview-digits {
      display: flex;
      align-items: center;
      gap: 4px;

      .digit-box {
        font-size: 1.5rem;
        font-weight: 900;
        color: #047857;
        font-variant-numeric: tabular-nums;
        line-height: 1;
      }

      .digit-separator {
        font-size: 1.3rem;
        font-weight: 900;
        color: #059669;
        line-height: 1;
        animation: pulseColon 1.5s infinite;
      }
    }

    .preview-period-badge {
      font-size: 0.74rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
      background: #047857;
      color: #ffffff;
      letter-spacing: 0.4px;

      &.pm {
        background: #0f766e;
      }
    }
  }

  /* 3-Column Picker */
  .picker-columns-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1.1fr;
    gap: 8px;
    padding: 10px 18px 14px;

    .picker-col {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .col-title {
        font-size: 0.68rem;
        font-weight: 700;
        color: var(--unity-text-muted, #64748b);
        text-align: center;
      }

      .col-scroll {
        max-height: 180px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding-inline-end: 2px;
        -webkit-overflow-scrolling: touch;

        &::-webkit-scrollbar {
          width: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .col-item-btn {
          width: 100%;
          height: 34px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #334155;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          flex-shrink: 0;

          &:hover {
            border-color: #047857;
            color: #047857;
            background: #f0fdf4;
          }

          &.active {
            background: #047857;
            color: #ffffff;
            border-color: #047857;
            box-shadow: 0 3px 8px rgba(4, 120, 87, 0.28);
            font-weight: 800;
            transform: scale(1.02);
          }
        }

        &.period-col,
        .period-btn {
          height: 48px;
          display: flex;
          flex-direction: column;
          gap: 1px;

          .period-code {
            font-size: 0.8rem;
            font-weight: 800;
          }

          .period-ar {
            font-size: 0.62rem;
            font-weight: 600;
            opacity: 0.85;
          }
        }
      }
    }
  }

  /* Actions */
  .dialog-actions {
    display: flex;
    gap: 8px;
    padding: 12px 18px 16px;
    border-top: 1px solid var(--unity-border, #f1f5f9);

    button {
      flex: 1;
      height: 40px;
      border-radius: 12px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #64748b;

      &:hover {
        background: #f1f5f9;
        color: #0f172a;
      }
    }

    .btn-confirm {
      background: var(--unity-primary, #047857);
      border: none;
      color: #ffffff;
      box-shadow: 0 3px 10px rgba(4, 120, 87, 0.25);

      &:hover {
        background: #065f46;
      }
    }
  }
}

@keyframes dialogScaleUp {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulseColon {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Transitions */
.fade-time-picker-enter-active,
.fade-time-picker-leave-active {
  transition: opacity 0.2s ease;
}

.fade-time-picker-enter-from,
.fade-time-picker-leave-to {
  opacity: 0;
}
</style>
