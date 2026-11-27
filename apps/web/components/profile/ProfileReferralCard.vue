<template>
  <div class="profile-referral-card">
    <!-- 1. Header: Clean Title with Star / Gift Icon -->
    <div class="card-header">
      <div class="title-with-icon">
        <i class="pi pi-star-fill header-icon"></i>
        <h4 class="card-title">{{ t('Referral Points') }}</h4>
      </div>
    </div>

    <!-- 2. Full-Width Description (No truncation) -->
    <p class="card-description">
      {{ t('Share your invite code with friends to earn reward points that can be redeemed on upcoming bookings') }}
    </p>

    <!-- 3. Points & Referral Code Section (Simpler, No Share Button) -->
    <div class="points-code-section">
      <!-- Simple Points Balance Strip -->
      <div class="points-balance-strip">
        <span class="points-label">{{ t('Current Balance') }}</span>
        <div class="points-value">
          <i class="pi pi-star-fill"></i>
          <span class="points-count">{{ pointsBalance }}</span>
          <span class="points-unit">{{ t('Points') }}</span>
        </div>
      </div>

      <!-- Referral Code Copy Chip (Full Width, No Share Button) -->
      <div class="code-copy-shell" @click="copyCode">
        <div class="code-info">
          <span class="code-label">{{ t('Invite Code') }}:</span>
          <strong class="code-val">{{ referralCode }}</strong>
        </div>
        <button 
          type="button" 
          class="btn-copy" 
          :class="{ copied }" 
          :title="t('Copy Code')"
          @click.stop="copyCode"
        >
          <i :class="copied ? 'pi pi-check text-success' : 'pi pi-copy'"></i>
          <span>{{ copied ? t('Copied!') : t('Copy') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';

const props = defineProps<{
  user?: any;
}>();

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const copied = ref(false);
const referralData = ref<any>(null);

// 3. Computed (computed properties)
const referralCode = computed(() => {
  if (referralData.value?.referral_code) return referralData.value.referral_code;
  if (props.user?.referral_code) return props.user.referral_code;
  if (props.user?.name || props.user?.phone) {
    const raw = props.user?.name || 'UNI';
    const clean = raw.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'UNI';
    const phoneSuffix = props.user?.phone ? String(props.user.phone).slice(-4) : '2026';
    return `${clean}${phoneSuffix}`;
  }
  return '---';
});

const pointsBalance = computed(() => {
  return referralData.value?.points_balance ?? props.user?.points_balance ?? 0;
});

// 4. Methods (functions, handlers)
const MY_REFERRAL_INFO = async () => {
  try {
    const res = await api.apiRequest({ service: 'MY_REFERRAL_INFO' });
    if (res?.data) {
      referralData.value = res.data;
    }
  } catch (_) {}
};

const copyCode = async () => {
  if (!referralCode.value || referralCode.value === '---') return;
  try {
    await navigator.clipboard.writeText(referralCode.value);
    copied.value = true;
    toast.show({ title: t('Referral code copied to clipboard!'), type: 'success' });
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch (_) {
    toast.show({ title: referralCode.value, type: 'info' });
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  MY_REFERRAL_INFO();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.profile-referral-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 18px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 10px;

      .header-icon {
        font-size: 1rem;
        color: #d97706;
        background: #fef3c7;
        padding: 8px;
        border-radius: 10px;
        border: 1px solid #fde68a;
      }

      .card-title {
        margin: 0;
        font-size: 0.96rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }
    }
  }

  .card-description {
    margin: 0;
    font-size: 0.82rem;
    color: var(--unity-text-muted);
    line-height: 1.55;
    width: 100%;
    text-align: inherit;
  }

  .points-code-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 2px;

    .points-balance-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 12px;

      .points-label {
        font-size: 0.82rem;
        font-weight: 700;
        color: #92400e;
      }

      .points-value {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #b45309;

        i {
          font-size: 0.90rem;
          color: #d97706;
        }

        .points-count {
          font-size: 1.05rem;
          font-weight: 800;
        }

        .points-unit {
          font-size: 0.78rem;
          font-weight: 700;
        }
      }
    }

    .code-copy-shell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 8px 6px 14px;
      background: var(--unity-bg);
      border: 1.5px dashed var(--unity-border);
      border-radius: 12px;
      min-height: 46px;
      box-sizing: border-box;
      cursor: pointer;
      transition: all 0.2s ease;

      &:active {
        border-color: var(--unity-primary);
        background: rgba(65, 91, 46, 0.03);
      }

      .code-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .code-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--unity-text-muted);
        }

        .code-val {
          font-size: 0.96rem;
          font-weight: 800;
          color: var(--unity-primary);
          letter-spacing: 0.8px;
          font-family: monospace;
        }
      }

      .btn-copy {
        height: 32px;
        padding: 0 12px;
        border-radius: 8px;
        background: var(--unity-surface);
        border: 1px solid var(--unity-border);
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--unity-text-main);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: all 0.2s ease;

        &:active {
          border-color: var(--unity-primary);
          color: var(--unity-primary);
        }

        &.copied {
          background: rgba(65, 91, 46, 0.1);
          border-color: var(--unity-primary);
          color: var(--unity-primary);
        }

        i {
          font-size: 0.78rem;
        }

        .text-success {
          color: var(--unity-primary);
        }
      }
    }
  }
}
</style>
