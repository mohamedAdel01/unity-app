<template>
  <div class="profile-referral-card">
    <!-- Top row: Icon + Titles & Points badge -->
    <div class="card-header">
      <div class="card-info">
        <div class="gift-icon">
          <i class="pi pi-gift"></i>
        </div>
        <div class="titles">
          <h4>{{ t('Refer Friends & Earn Points') }}</h4>
          <p>{{ t('Share your invite code with friends to earn reward points') }}</p>
        </div>
      </div>
      <div class="points-pill">
        <i class="pi pi-star-fill"></i>
        <span>{{ pointsBalance }}</span>
        <small>{{ t('Points') }}</small>
      </div>
    </div>

    <!-- Actions row: Sleek click-to-copy code chip + Share button -->
    <div class="card-actions">
      <button 
        type="button" 
        class="code-chip" 
        :class="{ copied }" 
        :title="t('Copy Code')" 
        @click="copyCode"
      >
        <div class="chip-main">
          <span class="chip-label">{{ t('Invite Code') }}:</span>
          <strong class="code-val">{{ referralCode }}</strong>
        </div>
        <div class="chip-action">
          <i :class="copied ? 'pi pi-check text-success' : 'pi pi-copy'"></i>
          <span class="action-text">{{ copied ? t('Copied!') : t('Copy') }}</span>
        </div>
      </button>

      <button 
        type="button" 
        class="btn-share" 
        :title="t('Share Invite')" 
        @click="shareInvite"
      >
        <i class="pi pi-share-alt"></i>
        <span>{{ t('Share Invite') }}</span>
      </button>
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

const shareInvite = async () => {
  const shareMsg = referralData.value?.share_message || 
    `${t('Use my invite code to get 50 bonus points on Unity Clinics!')} ${referralCode.value}`;
  const shareUrl = referralData.value?.share_url || 'https://unity-clinics.cyou';

  if (typeof navigator !== 'undefined' && (navigator as any).share) {
    try {
      await (navigator as any).share({
        title: t('Unity Clinics Invitation'),
        text: shareMsg,
        url: shareUrl,
      });
      return;
    } catch (_) {}
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(`${shareMsg}\n${shareUrl}`);
    toast.show({ title: t('Invitation link copied to clipboard!'), type: 'success' });
  } catch (_) {}
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
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    .card-info {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      flex: 1;

      .gift-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(4, 120, 87, 0.08);
        color: var(--unity-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        flex-shrink: 0;
      }

      .titles {
        min-width: 0;
        flex: 1;

        h4 {
          margin: 0;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--unity-text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        p {
          margin: 2px 0 0;
          font-size: 0.72rem;
          color: var(--unity-text-muted);
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .points-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #b45309;
      padding: 3px 9px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.78rem;
      flex-shrink: 0;

      i {
        font-size: 0.78rem;
      }

      small {
        font-size: 0.70rem;
      }
    }
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .code-chip {
      flex: 1;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 0;

      &:hover {
        border-color: var(--unity-primary);
      }

      &.copied {
        border-color: var(--unity-primary);
        background: rgba(4, 120, 87, 0.06);

        .chip-action {
          color: var(--unity-primary);
        }
      }

      .chip-main {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;

        .chip-label {
          font-size: 0.72rem;
          color: var(--unity-text-muted);
          font-weight: 600;
          white-space: nowrap;
        }

        .code-val {
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--unity-primary);
          letter-spacing: 0.5px;
          font-family: monospace;
        }
      }

      .chip-action {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--unity-text-muted);
        transition: color 0.2s ease;

        i {
          font-size: 0.78rem;
        }

        .text-success {
          color: var(--unity-primary);
        }
      }
    }

    .btn-share {
      height: 38px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 14px;
      background: var(--unity-primary);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        background: var(--unity-primary-dark);
      }

      &:active {
        transform: scale(0.97);
      }

      i {
        font-size: 0.78rem;
      }
    }
  }
}
</style>
