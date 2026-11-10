<template>
  <div v-if="isOpen && doctor" class="modal-backdrop" @click="close">
    <div class="modal-sheet" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="header-title">
          <i class="pi pi-calendar-times"></i>
          <div>
            <h4>{{ t('Edit Doctor Schedule') }}</h4>
            <small>{{ doctor.name }} • {{ doctor.specialty }}</small>
          </div>
        </div>
        <button class="btn-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Schedule Form -->
      <form class="schedule-form" @submit.prevent="saveSchedule">
        <!-- Clinic Room Number -->
        <div class="form-group">
          <label>{{ t('Clinic Room') }}</label>
          <input v-model="form.room" type="text" placeholder="104" required />
        </div>

        <!-- Shift Type -->
        <div class="form-group">
          <label>{{ t('Shift Type') }}</label>
          <div class="shift-selector">
            <button 
              type="button" 
              class="shift-pill" 
              :class="{ 'selected': form.shift === 'morning' }"
              @click="setShift('morning')"
            >
              <i class="pi pi-sun"></i>
              <span>{{ t('Morning Shift') }}</span>
            </button>
            <button 
              type="button" 
              class="shift-pill" 
              :class="{ 'selected': form.shift === 'evening' }"
              @click="setShift('evening')"
            >
              <i class="pi pi-moon"></i>
              <span>{{ t('Evening Shift') }}</span>
            </button>
          </div>
        </div>

        <!-- Working Hours -->
        <div class="two-col-row">
          <div class="form-group">
            <label>{{ t('Start Time') }}</label>
            <input v-model="form.start_time" type="time" required />
          </div>
          <div class="form-group">
            <label>{{ t('End Time') }}</label>
            <input v-model="form.end_time" type="time" required />
          </div>
        </div>

        <!-- Clinic Status Toggle -->
        <div class="status-toggle-box">
          <div>
            <strong>{{ t('Clinic Live Status') }}</strong>
            <small>{{ t('Display clinic as open for instant patients') }}</small>
          </div>
          <label class="switch-toggle">
            <input v-model="form.is_active" type="checkbox" />
            <span class="slider"></span>
          </label>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="close">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="btn-submit">
            {{ t('Save Changes') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';

const props = defineProps<{
  isOpen: boolean;
  doctor: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'updated', payload: any): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)
const form = ref({
  room: '104',
  shift: 'morning',
  start_time: '10:00',
  end_time: '17:00',
  is_active: true,
});

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const setShift = (type: 'morning' | 'evening') => {
  form.value.shift = type;
  if (type === 'morning') {
    form.value.start_time = '10:00';
    form.value.end_time = '17:00';
  } else {
    form.value.start_time = '16:00';
    form.value.end_time = '22:00';
  }
};

const close = () => {
  emit('close');
};

const saveSchedule = () => {
  emit('updated', {
    doctorId: props.doctor.id,
    ...form.value,
  });
  close();
};

// 5. Watches (watch, watchEffect)
watch(() => props.doctor, (doc) => {
  if (doc) {
    form.value.room = doc.room || '104';
    form.value.is_active = doc.is_active !== false;
    form.value.shift = doc.is_evening ? 'evening' : 'morning';
    form.value.start_time = doc.is_evening ? '16:00' : '10:00';
    form.value.end_time = doc.is_evening ? '22:00' : '17:00';
  }
}, { immediate: true });

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
}

.modal-sheet {
  width: 100%;
  max-width: 430px;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 20px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .modal-header .header-title,
    .form-group label,
    .status-toggle-box div {
      text-align: left;
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;

      i {
        font-size: 1.35rem;
        color: var(--unity-primary);
      }

      h4 {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      small {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
      }
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
    }
  }

  .schedule-form {
    display: flex;
    flex-direction: column;
    gap: 14px;

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: right;

      label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      input {
        width: 100%;
        height: 44px;
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        border-radius: 12px;
        padding: 0 14px;
        font-size: 0.85rem;
        color: var(--unity-text-main);

        &:focus {
          outline: none;
          border-color: var(--unity-primary);
        }
      }
    }

    .shift-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;

      .shift-pill {
        height: 44px;
        border-radius: 12px;
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        color: var(--unity-text-muted);
        font-size: 0.8rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;

        &.selected {
          background: var(--unity-primary-light);
          border-color: var(--unity-primary);
          color: var(--unity-primary-dark);
        }
      }
    }

    .two-col-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .status-toggle-box {
      background: #f8fafc;
      border: 1px solid var(--unity-border);
      border-radius: 14px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      div {
        display: flex;
        flex-direction: column;
        text-align: right;

        strong {
          font-size: 0.84rem;
          color: var(--unity-text-main);
        }

        small {
          font-size: 0.7rem;
          color: var(--unity-text-muted);
        }
      }

      .switch-toggle {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;

        input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: #cbd5e1;
          transition: 0.3s;
          border-radius: 24px;

          &::before {
            position: absolute;
            content: '';
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.3s;
            border-radius: 50%;
          }
        }

        input:checked + .slider {
          background-color: #10b981;
        }

        input:checked + .slider::before {
          transform: translateX(20px);
        }
      }
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 6px;

      button {
        flex: 1;
        padding: 12px;
        border-radius: 14px;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        border: none;
      }

      .btn-cancel {
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-muted);
      }

      .btn-submit {
        background: var(--unity-primary);
        color: #fff;
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
