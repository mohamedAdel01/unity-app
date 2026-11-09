<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-backdrop" @click="close">
        <div class="modal-container" :dir="isRtl ? 'rtl' : 'ltr'" @click.stop>
          <div class="modal-pill-indicator"></div>

          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ t('quickBook.modalTitle') }}</h3>
              <p class="modal-subtitle">{{ t('quickBook.modalSubtitle') }}</p>
            </div>
            <button class="close-btn" @click="close">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="options-grid">
            <!-- Option 1: Doctor Booking -->
            <div class="booking-option-card doctor-card" @click="chooseDoctor">
              <div class="option-icon-wrap doctor-icon">
                <i class="pi pi-user-plus"></i>
              </div>
              <div class="option-content">
                <div class="option-top">
                  <h4>{{ t('quickBook.doctorTitle') }}</h4>
                  <span class="badge badge-emerald">{{ t('quickBook.doctorBadge') }}</span>
                </div>
                <p>{{ t('quickBook.doctorDesc') }}</p>
                <div class="option-meta">
                  <span><i class="pi pi-check-circle"></i> {{ t('quickBook.doctorImmediate') }}</span>
                  <span><i class="pi pi-video"></i> {{ t('quickBook.doctorFormat') }}</span>
                </div>
              </div>
              <div class="option-arrow">
                <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
              </div>
            </div>

            <!-- Option 2: Medical Service Booking -->
            <div class="booking-option-card service-card" @click="chooseService">
              <div class="option-icon-wrap service-icon">
                <i class="pi pi-heart-fill"></i>
              </div>
              <div class="option-content">
                <div class="option-top">
                  <h4>{{ t('quickBook.serviceTitle') }}</h4>
                  <span class="badge badge-cyan">{{ t('quickBook.serviceBadge') }}</span>
                </div>
                <p>{{ t('quickBook.serviceDesc') }}</p>
                <div class="option-meta">
                  <span><i class="pi pi-home"></i> {{ t('quickBook.serviceHomeVisit') }}</span>
                  <span><i class="pi pi-file"></i> {{ t('quickBook.serviceFastResult') }}</span>
                </div>
              </div>
              <div class="option-arrow">
                <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
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
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-container {
  width: 100%;
  max-width: 440px;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 16px 20px 36px;
  border-top: 1px solid var(--unity-border);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-pill-indicator {
  width: 44px;
  height: 5px;
  border-radius: 10px;
  background: var(--unity-border);
  margin: 0 auto 18px;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;

  .modal-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--unity-text-main);
    letter-spacing: -0.3px;
  }

  .modal-subtitle {
    font-size: 0.85rem;
    color: var(--unity-text-muted);
    margin-top: 2px;
  }

  .close-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--unity-border);
      color: var(--unity-text-main);
    }
  }
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.booking-option-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: 20px;
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: var(--unity-primary);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px -4px rgba(4, 120, 87, 0.15);
  }

  .option-icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    flex-shrink: 0;

    &.doctor-icon {
      background: var(--unity-primary-light);
      color: var(--unity-primary);
    }

    &.service-icon {
      background: #e0f2fe;
      color: #0284c7;
    }
  }

  .option-content {
    flex: 1;

    .option-top {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      h4 {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }
    }

    p {
      font-size: 0.8rem;
      color: var(--unity-text-muted);
      line-height: 1.4;
      margin-bottom: 8px;
    }

    .option-meta {
      display: flex;
      align-items: center;
      gap: 12px;

      span {
        font-size: 0.72rem;
        color: var(--unity-primary);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;

        i {
          font-size: 0.75rem;
        }
      }
    }
  }

  .badge {
    font-size: 0.68rem;
    padding: 2px 8px;
    border-radius: 20px;
    font-weight: 700;

    &.badge-emerald {
      background: var(--unity-primary-tint);
      color: var(--unity-primary-dark);
    }

    &.badge-cyan {
      background: #e0f2fe;
      color: #0369a1;
    }
  }

  .option-arrow {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--unity-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-dim);
    transition: all 0.2s;
    font-size: 0.85rem;
  }

  &:hover .option-arrow {
    background: var(--unity-primary);
    color: #fff;
    transform: translateX(4px);
  }
}
</style>
