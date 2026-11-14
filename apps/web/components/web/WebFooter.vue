<template>
  <footer class="web-footer">
    <div class="footer-container">
      <!-- Top Row: Brand & Accreditation -->
      <div class="footer-top">
        <div class="footer-brand">
          <div class="brand-row">
            <img src="/logo.webp" alt="Unity Specialized Clinics" class="footer-logo" />
            <div>
              <h4 class="brand-name">{{ t('Unity Specialized Clinics') }}</h4>
              <p class="brand-desc">{{ t('Official Medical Services & Patient Information Portal') }}</p>
            </div>
          </div>
          <div class="moh-badge">
            <i class="pi pi-verified"></i>
            <span>{{ t('Unity Specialized Clinics • Officially Certified') }}</span>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-nav">
          <h5 class="nav-title">{{ t('Legal & Compliance') }}</h5>
          <ul class="nav-list">
            <li>
              <NuxtLink to="/terms">{{ t('Terms & Privacy Policy') }}</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/delete-account">{{ t('Request Account Deletion') }}</NuxtLink>
            </li>
            <li>
              <a href="mailto:support@unity-health.app">{{ t('Technical Support') }}</a>
            </li>
            <li>
              <a href="mailto:privacy@unity-health.app">{{ t('Privacy Inquiries') }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Row: Copyright & Legal Notice -->
      <div class="footer-bottom">
        <p class="copyright-text">
          &copy; {{ currentYear }} {{ t('Unity Specialized Clinics. All rights reserved.') }}
        </p>
        <p class="legal-notice">
          {{ t('Medical notice: Health diagnostic records and prescriptions issued by clinics remain securely archived in accordance with healthcare regulatory retention laws.') }}
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed } from 'vue';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const currentYear = computed(() => new Date().getFullYear());

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.web-footer {
  background: var(--unity-surface);
  border-top: 1px solid var(--unity-border);
  padding: 48px 24px 32px;
  margin-top: auto;
  transition: background-color 0.25s ease, border-color 0.25s ease;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  flex-wrap: wrap;
}

.footer-brand {
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .brand-row {
    display: flex;
    align-items: center;
    gap: 14px;

    .footer-logo {
      width: 48px;
      height: 48px;
      object-fit: contain;
      border-radius: 12px;
    }

    .brand-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--unity-primary);
      margin: 0;
    }

    .brand-desc {
      font-size: 0.82rem;
      color: var(--unity-text-muted);
      margin: 2px 0 0;
    }
  }

  .moh-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 9999px;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.25);
    color: #10b981;
    font-size: 0.8rem;
    font-weight: 700;
    width: fit-content;
  }
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .nav-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--unity-text-main);
    margin: 0;
  }

  .nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    a {
      font-size: 0.86rem;
      color: var(--unity-text-muted);
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: var(--unity-primary);
      }
    }
  }
}

.footer-bottom {
  padding-top: 24px;
  border-top: 1px solid var(--unity-border);
  display: flex;
  flex-direction: column;
  gap: 8px;

  .copyright-text {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--unity-text-main);
  }

  .legal-notice {
    margin: 0;
    font-size: 0.76rem;
    color: var(--unity-text-dim);
    line-height: 1.6;
  }
}
</style>
