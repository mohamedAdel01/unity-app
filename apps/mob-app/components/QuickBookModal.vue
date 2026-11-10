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
            <!-- Doctor Consultation -->
            <button class="option" @click="chooseDoctor">
              <div class="option-icon doctor">
                <i class="pi pi-user-plus"></i>
              </div>
              <span class="option-label">{{ t('Doctor Consultation') }}</span>
              <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'option-chevron']"></i>
            </button>

            <!-- Medical Service / Lab -->
            <button class="option" @click="chooseService">
              <div class="option-icon service">
                <i class="pi pi-heart-fill"></i>
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
  (e: 'select-service'): void;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const close = () => {
  emit('update:modelValue', false);
};

const chooseDoctor = () => {
  close();
  emit('select-doctor');
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
}

.modal-sheet {
  width: 100%;
  max-width: 440px;
  background: var(--unity-surface);
  border-radius: 24px 24px 0 0;
  padding: 12px 20px 32px;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
  margin: 0 auto 16px;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

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
    box-shadow: 0 4px 12px rgba(4, 120, 87, 0.1);
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

  &.doctor {
    background: var(--unity-primary-light);
    color: var(--unity-primary);
  }

  &.service {
    background: #dbeafe;
    color: #2563eb;
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
