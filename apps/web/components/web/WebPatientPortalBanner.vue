<template>
  <section class="web-portal-banner-section">
    <div class="banner-container">
      <div class="banner-card">
        <div class="banner-content">
          <span class="portal-badge">
            <i class="pi pi-mobile"></i>
            <span>{{ t('Your Medical Life in One Place') }}</span>
          </span>

          <h2 class="banner-title">{{ t('Track Your Prescriptions & Lab Results Anywhere') }}</h2>
          <p class="banner-desc">
            {{ t('Access your encrypted medical history, review doctor notes, reschedule appointments, and receive automated clinic notifications.') }}
          </p>

          <div class="banner-actions">
            <NuxtLink v-if="authStore.isAuthenticated" to="/appointments" class="portal-cta-btn">
              <i class="pi pi-calendar"></i>
              <span>{{ t('View My Appointments') }}</span>
            </NuxtLink>
            <NuxtLink v-else to="/auth/login" class="portal-cta-btn">
              <i class="pi pi-sign-in"></i>
              <span>{{ t('Login to Patient Portal') }}</span>
            </NuxtLink>

            <div class="app-badges-inline">
              <div class="store-pill">
                <i class="pi pi-android"></i>
                <span>Google Play</span>
              </div>
              <div class="store-pill">
                <i class="pi pi-apple"></i>
                <span>App Store</span>
              </div>
            </div>
          </div>
        </div>

        <div class="banner-visual">
          <div class="mockup-glass-card">
            <div class="glass-head">
              <i class="pi pi-shield"></i>
              <span>{{ t('Unity Digital Health Vault') }}</span>
            </div>
            <div class="glass-item">
              <i class="pi pi-file-edit"></i>
              <div>
                <strong>{{ t('Comprehensive Checkup Report') }}</strong>
                <small>{{ t('Dr. Ahmed Mahmoud • Cardiology') }}</small>
              </div>
            </div>
            <div class="glass-item">
              <i class="pi pi-check"></i>
              <div>
                <strong>{{ t('Blood Analysis Results') }}</strong>
                <small>{{ t('Unity Central Laboratory') }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';
import { useAuthStore } from '../../stores/auth';

const { t } = useI18n();
const authStore = useAuthStore();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.web-portal-banner-section {
  padding: 56px 20px 64px;
  background: var(--unity-bg);
}

.banner-container {
  max-width: 1200px;
  margin: 0 auto;
}

.banner-card {
  background: linear-gradient(135deg, rgba(65, 91, 46, 0.12) 0%, rgba(65, 91, 46, 0.03) 100%),
              var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 24px;
  padding: 40px 48px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  align-items: center;
  gap: 36px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.04);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 30px 24px;
  }
}

.banner-content {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .portal-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 14px;
    border-radius: 9999px;
    background: rgba(65, 91, 46, 0.12);
    color: var(--unity-primary);
    font-size: 0.78rem;
    font-weight: 700;
    width: fit-content;
  }

  .banner-title {
    font-size: 1.85rem;
    font-weight: 800;
    color: var(--unity-text-main);
    line-height: 1.3;
    margin: 0;

    @media (max-width: 640px) {
      font-size: 1.45rem;
    }
  }

  .banner-desc {
    font-size: 0.88rem;
    color: var(--unity-text-muted);
    line-height: 1.65;
    margin: 0;
    max-width: 580px;
  }

  .banner-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 8px;

    .portal-cta-btn {
      height: 44px;
      padding: 0 22px;
      border-radius: 12px;
      background: var(--unity-primary);
      color: #fff;
      font-size: 0.88rem;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(65, 91, 46, 0.25);
      transition: all 0.2s ease;

      &:hover {
        background: var(--unity-primary-dark, #364c26);
        transform: translateY(-1px);
      }
    }

    .app-badges-inline {
      display: flex;
      align-items: center;
      gap: 10px;

      .store-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 10px;
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        font-size: 0.80rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }
    }
  }
}

.banner-visual {
  display: flex;
  justify-content: center;

  .mockup-glass-card {
    width: 100%;
    max-width: 340px;
    background: var(--unity-surface);
    border: 1.5px solid var(--unity-border);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);

    .glass-head {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.82rem;
      font-weight: 800;
      color: var(--unity-primary);
      padding-bottom: 10px;
      border-bottom: 1px solid var(--unity-border);
    }

    .glass-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);

      i {
        font-size: 1.1rem;
        color: var(--unity-primary);
      }

      div {
        display: flex;
        flex-direction: column;

        strong {
          font-size: 0.82rem;
          color: var(--unity-text-main);
        }

        small {
          font-size: 0.70rem;
          color: var(--unity-text-muted);
        }
      }
    }
  }
}
</style>