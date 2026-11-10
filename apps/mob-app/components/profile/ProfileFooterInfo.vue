<template>
  <div class="profile-footer-section">
    <!-- Logout Button -->
    <button class="logout-action-btn" @click="handleLogout">
      <i class="pi pi-sign-out"></i>
      <span>{{ t('Log Out of Account') }}</span>
    </button>

    <!-- App Compliance Badge & Build Number -->
    <div class="compliance-box">
      <div class="unity-brand-seal">
        <img src="/logo.webp" alt="عيادات يونيتي التخصصية" class="footer-brand-logo" />
      </div>
      <div class="moh-badge">
        <i class="pi pi-verified"></i>
        <span>{{ t('Unity Specialized Clinics • Officially Certified') }}</span>
      </div>
      <p class="build-version">{{ t('Sehaty Care App • Version 2.4.1 (Build 890)') }}</p>
      <NuxtLink to="/delete-account" class="delete-account-link">
        {{ t('Request Account Deletion') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRouter } from 'vue-router';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';

const router = useRouter();

const api = useUnityApi();

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const handleLogout = async () => {
  await api.apiRequest({ module: 'auth', service: 'LOGOUT', pinia: true });
  router.push('/auth/login');
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.profile-footer-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 4px;
  padding-bottom: 30px;

  .logout-action-btn {
    width: 100%;
    padding: 13px;
    border-radius: 16px;
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fee2e2;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;

    i {
      font-size: 0.95rem;
    }

    &:hover {
      background: #fee2e2;
    }
  }

  .compliance-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;

    .unity-brand-seal {
      background: transparent;
      padding: 4px 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2px;

      .footer-brand-logo {
        height: 36px;
        width: auto;
        object-fit: contain;
      }
    }

    .moh-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 600;
      color: #047857;

      i {
        font-size: 0.85rem;
      }
    }

    .build-version {
      font-size: 0.68rem;
      color: var(--unity-text-dim);
    }

    .delete-account-link {
      font-size: 0.74rem;
      color: #ef4444;
      text-decoration: underline;
      cursor: pointer;
      margin-top: 4px;
      opacity: 0.85;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
