<template>
  <div class="otp-display-section">
    <div class="otp-info-text">
      <p class="subtitle">{{ t('Enter the verification code sent to') }}</p>
      <h5 class="target-val">{{ target || '05XXXXXXXX' }}</h5>
    </div>

    <!-- 4 Digit Pin Boxes -->
    <div class="otp-boxes-row">
      <div 
        v-for="(digit, idx) in 4" 
        :key="idx" 
        class="otp-box"
        :class="{ 
          'filled': code[idx] !== undefined, 
          'active': activeIndex === idx 
        }"
      >
        <span v-if="code[idx] !== undefined" class="digit-char">{{ code[idx] }}</span>
        <span v-else class="empty-dash"></span>
      </div>
    </div>

    <!-- Resend Timer -->
    <div class="resend-row">
      <span v-if="countdown > 0" class="timer-text">
        <i class="pi pi-clock"></i>
        <span>{{ t('Resend in') }} 00:{{ countdown < 10 ? '0' + countdown : countdown }}</span>
      </span>
      <button v-else type="button" class="btn-resend" @click="handleResend">
        <i class="pi pi-refresh"></i>
        <span>{{ t('Resend Code') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';

const props = defineProps<{
  code: string;
  target?: string;
}>();

const emit = defineEmits<{
  (e: 'resend'): void;
}>();

const { t } = useI18n();

const activeIndex = computed(() => {
  return Math.min(props.code.length, 3);
});

const countdown = ref(45);
let timer: any = null;

const startTimer = () => {
  countdown.value = 45;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer);
    }
  }, 1000);
};

const handleResend = () => {
  startTimer();
  emit('resend');
};

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped lang="scss">
.otp-display-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 10px 0 16px;

  .otp-info-text {
    text-align: center;

    .subtitle {
      font-size: 0.8rem;
      color: var(--unity-text-muted);
    }

    .target-val {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--unity-text-main);
      margin-top: 2px;
      letter-spacing: 0.5px;
    }
  }
}

.otp-boxes-row {
  display: flex;
  justify-content: center;
  gap: 14px;
  direction: ltr; // Ensures left-to-right digit flow

  .otp-box {
    width: 60px;
    height: 64px;
    border-radius: 18px;
    background: var(--unity-surface);
    border: 1.5px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--unity-text-main);
    box-shadow: var(--unity-shadow-subtle);
    transition: all 0.2s ease;

    &.active {
      border-color: var(--unity-primary);
      box-shadow: 0 0 0 3px var(--unity-primary-light);
      transform: translateY(-2px);
    }

    &.filled {
      border-color: var(--unity-primary);
      background: var(--unity-primary-light);
      color: var(--unity-primary-dark);
    }

    .empty-dash {
      width: 12px;
      height: 3px;
      border-radius: 4px;
      background: var(--unity-border);
    }

    .digit-char {
      animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
  }
}

@keyframes popIn {
  from { transform: scale(0.6); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.resend-row {
  display: flex;
  align-items: center;
  justify-content: center;

  .timer-text {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    color: var(--unity-text-dim);
    font-weight: 500;
  }

  .btn-resend {
    background: transparent;
    border: none;
    color: var(--unity-primary);
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

