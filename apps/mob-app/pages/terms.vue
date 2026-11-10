<template>
  <div class="terms-page">
    <!-- Header -->
    <header class="terms-header">
      <button class="back-btn" @click="router.back()" aria-label="Back">
        <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
      </button>
      <h1 class="page-title">{{ t('Terms & Privacy Policy') }}</h1>
      <div class="placeholder-icon"></div>
    </header>

    <div class="terms-content">
      <!-- Last Updated Badge -->
      <div class="meta-card">
        <div class="badge-icon">
          <i class="pi pi-shield"></i>
        </div>
        <div>
          <span class="meta-label">{{ t('Official Application Policy') }}</span>
          <p class="meta-date">{{ t('Last updated: November 2026') }}</p>
        </div>
      </div>

      <!-- Section 1 -->
      <section class="policy-section">
        <h3>
          <i class="pi pi-file"></i>
          {{ t('1. Introduction & Acceptance') }}
        </h3>
        <p>
          {{
            t('Welcome to the UNITY Healthcare Application. By accessing or using this application, you agree to be bound by these terms and our privacy policy in accordance with relevant medical and health regulations.')
          }}
        </p>
      </section>

      <!-- Section 2 -->
      <section class="policy-section">
        <h3>
          <i class="pi pi-heart"></i>
          {{ t('2. Medical Services & Consultations') }}
        </h3>
        <p>
          {{
            t('The application facilitates appointment bookings, medical record tracking, and telehealth consultations with licensed practitioners. This service is not an alternative to emergency care; please visit the nearest emergency facility in urgent cases.')
          }}
        </p>
      </section>

      <!-- Section 3 -->
      <section class="policy-section">
        <h3>
          <i class="pi pi-lock"></i>
          {{ t('3. Data Privacy & Protection') }}
        </h3>
        <p>
          {{
            t('We adhere to the highest standards of data protection and privacy. All health records and personal information are encrypted in transit and at rest. We never sell or share your data with unauthorized third parties without explicit consent.')
          }}
        </p>
      </section>

      <!-- Section 4 -->
      <section class="policy-section">
        <h3>
          <i class="pi pi-calendar"></i>
          {{ t('4. Bookings, Cancellation & Refunds') }}
        </h3>
        <p>
          {{
            t('Users may book, reschedule, or cancel appointments via the app within the cancellation window. Refunds are issued to the original payment method or wallet balance in accordance with clinic policies.')
          }}
        </p>
      </section>

      <!-- Section 5 -->
      <section class="policy-section">
        <h3>
          <i class="pi pi-user-minus"></i>
          {{ t('5. Account Management & Data Rights') }}
        </h3>
        <p>
          {{
            t('Users have the right to request the deletion of their account and associated data at any time via the in-app delete account feature, subject to statutory medical record retention obligations.')
          }}
        </p>
      </section>

      <!-- Section 6 -->
      <section class="policy-section">
        <h3>
          <i class="pi pi-envelope"></i>
          {{ t('6. Contact & Support') }}
        </h3>
        <p>
          {{
            t('For any questions or feedback regarding our terms and policies, please contact our legal and support team at: support@unity-health.app')
          }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRouter } from 'vue-router';
import { useI18n } from '../composables/useI18n';

const router = useRouter();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.terms-page {
  padding: 16px 18px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--unity-bg);
  min-height: 100vh;
}

.terms-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .back-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-main);
    cursor: pointer;
    font-size: 0.95rem;
    transition: background-color 0.2s;

    &:active {
      background: var(--unity-border);
    }
  }

  .page-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--unity-text-main);
    margin: 0;
  }

  .placeholder-icon {
    width: 38px;
    height: 38px;
  }
}

.terms-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.meta-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 14px;

  .badge-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: #10b981;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .meta-label {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--unity-text-main);
    display: block;
  }

  .meta-date {
    font-size: 0.78rem;
    color: var(--unity-text-muted);
    margin: 2px 0 0;
  }
}

.policy-section {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 14px;
  padding: 16px;

  h3 {
    margin: 0 0 10px;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--unity-text-main);
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      color: #10b981;
      font-size: 0.95rem;
    }
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.65;
    color: var(--unity-text-muted);
  }
}
</style>
