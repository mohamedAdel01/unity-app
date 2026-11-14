<template>
  <div class="profile-referral-card">
    <div class="card-header">
      <div class="header-icon-wrap">
        <i class="pi pi-gift"></i>
      </div>
      <div class="header-titles">
        <h4>{{ t('Refer Friends & Earn Points') }}</h4>
        <p>{{ t('Share your invite code with friends to earn reward points') }}</p>
      </div>
      <div class="points-pill">
        <i class="pi pi-star-fill"></i>
        <span>{{ pointsBalance }}</span>
        <small>{{ t('Points') }}</small>
      </div>
    </div>

    <!-- Referral Code Shell -->
    <div class="referral-box">
      <div class="code-info">
        <span class="label">{{ t('Your Invitation Code') }}</span>
        <strong class="code-value">{{ referralCode }}</strong>
      </div>
      <button type="button" class="btn-copy-code" :title="t('Copy Code')" @click="copyCode">
        <i :class="copied ? 'pi pi-check' : 'pi pi-copy'"></i>
        <span>{{ copied ? t('Copied!') : t('Copy') }}</span>
      </button>
    </div>

    <!-- Referral Action & Stats -->
    <div class="card-footer">
      <div class="friends-stat">
        <i class="pi pi-users"></i>
        <span>{{ t('Friends Joined:') }} <strong>{{ totalInvited }}</strong></span>
      </div>

      <button type="button" class="btn-share-invite" @click="shareInvite">
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

const totalInvited = computed(() => {
  return referralData.value?.total_invited ?? 0;
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
  background: linear-gradient(135deg, var(--unity-surface) 0%, rgba(4, 120, 87, 0.06) 100%);
  border: 1.5px solid rgba(4, 120, 87, 0.2);
  border-radius: 20px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--unity-shadow-subtle);
  direction: rtl;
  text-align: right;

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-icon-wrap {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      background: var(--unity-primary-light);
      color: var(--unity-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .header-titles {
      flex: 1;
      min-width: 0;

      h4 {
        margin: 0 0 2px;
        font-size: 0.96rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      p {
        margin: 0;
        font-size: 0.74rem;
        color: var(--unity-text-muted);
        line-height: 1.3;
      }
    }

    .points-pill {
      display: flex;
      align-items: center;
      gap: 5px;
      background: var(--unity-surface);
      border: 1.5px solid #f59e0b;
      color: #d97706;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 0.85rem;
      flex-shrink: 0;

      i {
        font-size: 0.85rem;
      }

      small {
        font-size: 0.68rem;
        font-weight: 700;
      }
    }
  }

  .referral-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--unity-bg);
    border: 1.5px dashed var(--unity-border);
    border-radius: 14px;
    padding: 8px 14px;

    .code-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .label {
        font-size: 0.70rem;
        color: var(--unity-text-muted);
        font-weight: 600;
      }

      .code-value {
        font-size: 1.15rem;
        font-weight: 900;
        color: var(--unity-primary);
        letter-spacing: 1px;
        font-family: monospace;
      }
    }

    .btn-copy-code {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 36px;
      padding: 0 14px;
      border-radius: 10px;
      background: var(--unity-primary);
      color: #ffffff;
      border: none;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        background: var(--unity-primary-dark);
      }
    }
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 4px;

    .friends-stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      color: var(--unity-text-muted);

      i {
        color: var(--unity-primary);
        font-size: 0.85rem;
      }

      strong {
        color: var(--unity-text-main);
        font-weight: 800;
      }
    }

    .btn-share-invite {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: 1px solid var(--unity-border);
      color: var(--unity-text-main);
      height: 32px;
      padding: 0 12px;
      border-radius: 10px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--unity-primary);
        color: var(--unity-primary);
      }
    }
  }
}
</style>
