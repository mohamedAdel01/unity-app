<template>
  <div class="toast-portal-root">
    <TransitionGroup name="toast-slide" tag="div" class="toast-list">
      <div 
        v-for="item in toasts" 
        :key="item.id" 
        class="toast-item" 
        :class="`toast-${item.type}`"
        :dir="isRtl ? 'rtl' : 'ltr'"
        role="alert"
      >
        <!-- Icon Badge -->
        <div class="toast-icon-wrapper">
          <i v-if="item.type === 'error'" class="pi pi-times-circle"></i>
          <i v-else-if="item.type === 'success'" class="pi pi-check-circle"></i>
          <i v-else-if="item.type === 'warning'" class="pi pi-exclamation-triangle"></i>
          <i v-else class="pi pi-info-circle"></i>
        </div>

        <!-- Text Content -->
        <div class="toast-body">
          <h6 v-if="item.title" class="toast-title">{{ item.title }}</h6>
          <p class="toast-message">{{ item.message }}</p>
        </div>

        <!-- Close Button -->
        <button 
          type="button" 
          class="toast-close-btn" 
          aria-label="Close notification"
          @click="remove(item.id)"
        >
          <i class="pi pi-times"></i>
        </button>

        <!-- Dynamic Timer Progress Bar -->
        <div 
          v-if="item.duration && item.duration > 0" 
          class="toast-progress-bar"
          :style="{ animationDuration: `${item.duration}ms` }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useAppToast } from '../../composables/useAppToast';
import { useI18n } from '../../composables/useI18n';

const { toasts, remove } = useAppToast();
const { isRtl } = useI18n();
</script>

<style scoped lang="scss">
.toast-portal-root {
  position: absolute;
  top: max(14px, env(safe-area-inset-top, 14px));
  left: 14px;
  right: 14px;
  z-index: 999999;
  pointer-events: none;
  display: flex;
  justify-content: center;
}

.toast-list {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px 14px;
  border-radius: 18px;
  background: var(--unity-surface, #ffffff);
  border: 1px solid var(--unity-border, rgba(0, 0, 0, 0.08));
  box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);

  &[dir='ltr'] {
    direction: ltr;
    .toast-body {
      text-align: left;
    }
  }

  &[dir='rtl'] {
    direction: rtl;
    .toast-body {
      text-align: right;
    }
  }

  // Error Styling (Red / Crimson)
  &.toast-error {
    background: #fff8f8;
    border-color: #fecaca;

    .toast-icon-wrapper {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fca5a5;
    }

    .toast-title {
      color: #991b1b;
    }

    .toast-message {
      color: #b91c1c;
    }

    .toast-progress-bar {
      background: #ef4444;
    }
  }

  // Success Styling (Medical Emerald)
  &.toast-success {
    background: #f0fdf4;
    border-color: #bbf7d0;

    .toast-icon-wrapper {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }

    .toast-title {
      color: #14532d;
    }

    .toast-message {
      color: #166534;
    }

    .toast-progress-bar {
      background: #10b981;
    }
  }

  // Warning Styling (Amber / Orange)
  &.toast-warning {
    background: #fffbeb;
    border-color: #fde68a;

    .toast-icon-wrapper {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fcd34d;
    }

    .toast-title {
      color: #78350f;
    }

    .toast-message {
      color: #92400e;
    }

    .toast-progress-bar {
      background: #f59e0b;
    }
  }

  // Info Styling (Sky Blue)
  &.toast-info {
    background: #f0f9ff;
    border-color: #bae6fd;

    .toast-icon-wrapper {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #7dd3fc;
    }

    .toast-title {
      color: #0c4a6e;
    }

    .toast-message {
      color: #075985;
    }

    .toast-progress-bar {
      background: #0284c7;
    }
  }

  .toast-icon-wrapper {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    margin-top: 1px;
  }

  .toast-body {
    flex: 1;
    min-width: 0;
    text-align: start;

    .toast-title {
      margin: 0 0 2px 0;
      font-size: 0.88rem;
      font-weight: 700;
      line-height: 1.3;
    }

    .toast-message {
      margin: 0;
      font-size: 0.8rem;
      font-weight: 500;
      line-height: 1.4;
      word-break: break-word;
    }
  }

  .toast-close-btn {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: transparent;
    border: none;
    color: var(--unity-text-dim, #94a3b8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
    margin-top: 2px;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: var(--unity-text-main, #0f172a);
    }
  }

  .toast-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    opacity: 0.65;
    animation-name: toastProgress;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }
}

@keyframes toastProgress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

// Vue Transition Classes
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.92);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.95);
}
</style>

