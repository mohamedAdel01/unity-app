<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-backdrop" @click="close">
        <div class="modal-sheet" @click.stop>
          <div class="pill"></div>

          <div class="sheet-header">
            <h3>{{ t('What would you like to book today?') }}</h3>
            <button class="close-btn" @click="close">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="options">
            <!-- 1. Clinic Doctor Reservation -->
            <button class="option" @click="chooseClinic">
              <div class="option-icon clinic">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4.5 3v5a6.5 6.5 0 0 0 13 0V3"/>
                  <path d="M3 3h3"/>
                  <path d="M16 3h3"/>
                  <path d="M11 14.5V18a3 3 0 0 0 6 0v-2"/>
                  <circle cx="17" cy="16" r="2"/>
                </svg>
              </div>
              <span class="option-label">{{ t('Clinic Reservation') }}</span>
              <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'option-chevron']"></i>
            </button>

            <!-- 4. Medical Service / Lab -->
            <button class="option" @click="chooseService">
              <div class="option-icon service">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 2v7.31L4.35 18.5A2 2 0 0 0 6.07 22h11.86a2 2 0 0 0 1.72-3.5L14 9.31V2"/>
                  <path d="M8.5 2h7"/>
                  <path d="M7 16h10"/>
                </svg>
              </div>
              <span class="option-label">{{ t('Medical Service or Lab Test') }}</span>
              <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'option-chevron']"></i>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../composables/useI18n';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'select-doctor'): void;
  (e: 'select-online'): void;
  (e: 'select-home'): void;
  (e: 'select-service'): void;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const close = () => {
  emit('update:modelValue', false);
};

const chooseClinic = () => {
  close();
  emit('select-doctor');
};

const chooseOnline = () => {
  close();
  emit('select-online');
};

const chooseHome = () => {
  close();
  emit('select-home');
};

const chooseService = () => {
  close();
  emit('select-service');
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 640px) {
    align-items: center;
    padding: 24px;
  }
}

.modal-sheet {
  width: 100%;
  max-width: 440px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--unity-surface);
  border-radius: 24px 24px 0 0;
  padding: 12px 20px 28px;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @media (min-width: 640px) {
    border-radius: 24px;
    max-width: 500px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.pill {
  width: 40px;
  height: 4px;
  border-radius: 10px;
  background: var(--unity-border);
  margin: 0 auto 12px;
  flex-shrink: 0;
}

.sheet-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h3 {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--unity-text-main);
  }

  .close-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--unity-border);
    }
  }
}

.options {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1.5px solid var(--unity-border);
  background: var(--unity-surface);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: var(--unity-primary);
    box-shadow: 0 4px 12px rgba(65, 91, 46, 0.1);
  }
}

.option-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;

  &.clinic,
  &.doctor {
    background: var(--unity-primary-light);
    color: var(--unity-primary);
  }

  &.online {
    background: #e0f2fe;
    color: #0284c7;
  }

  &.home {
    background: #fef3c7;
    color: #d97706;
  }

  &.service {
    background: #f0fdf4;
    color: #415b2e;
  }

  :global([data-theme='dark']) &,
  :global(html.dark) & {
    &.clinic,
    &.doctor {
      background: rgba(92, 128, 66, 0.18);
      color: #8ab36b;
    }

    &.service {
      background: rgba(92, 128, 66, 0.2);
      color: #8ab36b;
    }

    &.online {
      background: rgba(2, 132, 199, 0.18);
      color: #38bdf8;
    }

    &.home {
      background: rgba(245, 158, 11, 0.18);
      color: #fbbf24;
    }
  }
}

.option-label {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: var(--unity-text-main);
  text-align: start;
}

.option-chevron {
  color: var(--unity-text-dim);
  font-size: 0.8rem;
}
</style>
