<template>
  <Teleport to="body">
    <div 
      v-if="toasts.length > 0" 
      class="toast-portal-root" 
      :dir="isRtl ? 'rtl' : 'ltr'"
    >
      <div 
        class="toast-stack-wrapper" 
        :class="{ 'is-fanned': isHovered && toasts.length > 1 }"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <TransitionGroup name="toast-card">
          <div 
            v-for="item in visibleToasts" 
            :key="item.id" 
            class="toast-card" 
            :class="[
              `toast-${item.type}`,
              `stack-pos-${item.stackIndex}`,
              { 'is-front': item.stackIndex === 0 }
            ]"
            :style="getStackStyle(item.stackIndex)"
            role="alert"
            @click="onCardClick(item)"
          >
            <!-- Compact Icon Badge -->
            <div class="toast-icon-wrapper">
              <i v-if="item.type === 'error'" class="pi pi-times"></i>
              <i v-else-if="item.type === 'success'" class="pi pi-check"></i>
              <i v-else-if="item.type === 'warning'" class="pi pi-exclamation-triangle"></i>
              <i v-else class="pi pi-info-circle"></i>
            </div>

            <!-- Compact Body: Title + Message inline / tight block -->
            <div class="toast-body">
              <div class="toast-text-line">
                <strong v-if="item.title" class="toast-title">{{ item.title }}</strong>
                <span class="toast-message">{{ item.message }}</span>
              </div>
            </div>

            <!-- Compact Close Button -->
            <button 
              type="button" 
              class="toast-close-btn" 
              :aria-label="t('Close notification')"
              @click.stop="remove(item.id)"
            >
              <i class="pi pi-times"></i>
            </button>

            <!-- Dynamic Timer Progress Bar (Thin, Front Card Only) -->
            <div 
              v-if="item.duration && item.duration > 0 && item.stackIndex === 0" 
              class="toast-progress-bar"
              :style="{ animationDuration: `${item.duration}ms` }"
            ></div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useAppToast, type ToastItem } from '../../composables/useAppToast';
import { useI18n } from '../../composables/useI18n';

const { toasts, remove } = useAppToast();
const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)
const isHovered = ref(false);

// 3. Computed (computed properties)
const visibleToasts = computed(() => {
  // Present newest toast on top (stackIndex = 0), and prior toasts stacked behind
  const reversed = [...toasts.value].reverse();
  return reversed.map((item, idx) => ({
    ...item,
    stackIndex: idx,
  }));
});

// 4. Methods (functions, handlers)
const bringToFront = (id: string) => {
  const idx = toasts.value.findIndex(t => t.id === id);
  if (idx !== -1) {
    const [picked] = toasts.value.splice(idx, 1);
    toasts.value.push(picked);
  }
};

const onCardClick = (item: ToastItem & { stackIndex: number }) => {
  if (item.stackIndex !== 0) {
    bringToFront(item.id);
  }
};

const getStackStyle = (stackIndex: number) => {
  // If user hovers with mouse or fans out:
  if (isHovered.value && toasts.value.length > 1) {
    return {
      transform: `translateY(${stackIndex * 44}px) scale(1)`,
      zIndex: 40 - stackIndex,
      opacity: stackIndex > 3 ? 0 : 1,
      pointerEvents: 'auto' as const,
    };
  }

  // Playing cards stacked deck effect ("ورق كوتشينه ورا بعضه"):
  // Card 0 (front): full size, scale(1), 0px
  // Card 1 (behind): slightly down & slightly scaled down to peek from behind
  // Card 2 (behind that): further down & narrower to show deck depth
  const translateY = stackIndex * 7;
  const scale = Math.max(0.78, 1 - stackIndex * 0.05);
  const opacity = stackIndex === 0 ? 1 : stackIndex === 1 ? 0.88 : stackIndex === 2 ? 0.65 : 0;

  return {
    transform: `translateY(${translateY}px) scale(${scale})`,
    zIndex: 40 - stackIndex,
    opacity,
    pointerEvents: (stackIndex <= 1 || isHovered.value ? 'auto' : 'none') as 'auto' | 'none',
  };
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.toast-portal-root {
  position: fixed;
  top: max(104px, calc(env(safe-area-inset-top, 0px) + 54px));
  left: 0;
  right: 0;
  margin: 0 auto;
  max-width: 430px;
  z-index: 999999;
  pointer-events: none;
  display: flex;
  justify-content: center;
  padding: 0 12px;
}

.toast-stack-wrapper {
  position: relative;
  width: auto;
  max-width: fit-content;
  min-height: 32px;
  display: flex;
  justify-content: center;
  pointer-events: none;
  transition: min-height 0.25s ease;

  &.is-fanned {
    min-height: 100px;
  }
}

.toast-card {
  position: absolute;
  top: 0;
  width: auto;
  max-width: min(88vw, 300px);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 9px 5px 10px;
  border-radius: 999px;
  background: var(--unity-surface, #ffffff);
  border: 1px solid var(--unity-border, rgba(0, 0, 0, 0.08));
  box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transform-origin: top center;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.28s ease;
  overflow: hidden;
  cursor: pointer;
  white-space: nowrap;
  pointer-events: auto;

  &.is-front {
    cursor: default;
  }

  // Direction handling
  [dir='ltr'] & {
    direction: ltr;
    .toast-body {
      text-align: left;
    }
  }

  [dir='rtl'] & {
    direction: rtl;
    .toast-body {
      text-align: right;
    }
  }

  // Error Card (Crimson)
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

  // Success Card (Emerald)
  &.toast-success {
    background: #f0fdf4;
    border-color: #bbf7d0;

    .toast-icon-wrapper {
      background: #dcfce7;
      color: #16a34a;
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

  // Warning Card (Amber)
  &.toast-warning {
    background: #fffbeb;
    border-color: #fde68a;

    .toast-icon-wrapper {
      background: #fef3c7;
      color: #d97706;
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

  // Info Card (Sky Blue)
  &.toast-info {
    background: #f0f9ff;
    border-color: #bae6fd;

    .toast-icon-wrapper {
      background: #e0f2fe;
      color: #0284c7;
      border: 1px solid #7dd3fc;
    }

    .toast-title {
      color: #0c4a6e;
    }

    .toast-message {
      color: #0369a1;
    }

    .toast-progress-bar {
      background: #0ea5e9;
    }
  }

  // Dark Theme Nuances
  :global([data-theme='dark']) & {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.45);

    &.toast-error {
      background: rgba(69, 10, 10, 0.95);
      border-color: #7f1d1d;
      .toast-title { color: #fecaca; }
      .toast-message { color: #fca5a5; }
    }
    &.toast-success {
      background: rgba(6, 78, 59, 0.95);
      border-color: #065f46;
      .toast-title { color: #bbf7d0; }
      .toast-message { color: #86efac; }
    }
    &.toast-warning {
      background: rgba(120, 53, 15, 0.95);
      border-color: #92400e;
      .toast-title { color: #fde68a; }
      .toast-message { color: #fcd34d; }
    }
    &.toast-info {
      background: rgba(12, 74, 110, 0.95);
      border-color: #075985;
      .toast-title { color: #bae6fd; }
      .toast-message { color: #7dd3fc; }
    }
  }

  .toast-icon-wrapper {
    flex-shrink: 0;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.62rem;
  }

  .toast-body {
    flex: 1;
    min-width: 0;

    .toast-text-line {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      max-width: 100%;

      .toast-title {
        font-size: 0.72rem;
        font-weight: 700;
        line-height: 1.2;
        white-space: nowrap;

        &::after {
          content: ':';
          margin-inline-start: 1px;
        }
      }

      .toast-message {
        font-size: 0.72rem;
        font-weight: 600;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .toast-close-btn {
    flex-shrink: 0;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: transparent;
    border: none;
    color: var(--unity-text-dim, #94a3b8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.58rem;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;

    &:hover {
      background: rgba(0, 0, 0, 0.08);
      color: var(--unity-text-main, #0f172a);
    }
  }

  .toast-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1.5px;
    opacity: 0.75;
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

// Vue Transition Classes for Card Entering / Leaving
.toast-card-enter-active,
.toast-card-leave-active {
  transition: all 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-card-enter-from {
  opacity: 0;
  transform: translateY(-16px) scale(0.92) !important;
}

.toast-card-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9) !important;
}

.toast-card-move {
  transition: all 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
