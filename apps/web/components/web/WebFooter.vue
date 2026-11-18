<template>
  <footer class="web-footer">
    <div class="footer-container">
      <!-- Top Row: Brand & Links Grid -->
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
          <div class="contact-mini-row">
            <span><i class="pi pi-phone"></i> 19000</span>
            <span><i class="pi pi-envelope"></i> care@unity-clinics.com</span>
          </div>
        </div>

        <!-- Navigation Links Group 1: Clinics & Services -->
        <div class="footer-nav">
          <h5 class="nav-title">{{ t('Medical Services') }}</h5>
          <ul class="nav-list">
            <li>
              <NuxtLink to="/services">{{ t('Specialized Clinics') }}</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/services">{{ t('Laboratory & Diagnostics') }}</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/offers">{{ t('Medical Offers & Packages') }}</NuxtLink>
            </li>
            <li>
              <a href="#" @click.prevent="bookingModal.openBookingFlow()">{{ t('Book Appointment') }}</a>
            </li>
          </ul>
        </div>

        <!-- Navigation Links Group 2: Patient Portal -->
        <div class="footer-nav">
          <h5 class="nav-title">{{ t('Patient Portal') }}</h5>
          <ul class="nav-list">
            <li>
              <NuxtLink to="/appointments">{{ t('My Appointments') }}</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/records">{{ t('Medical Records') }}</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/profile">{{ t('My Account') }}</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/auth/login">{{ t('Login') }}</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Navigation Links Group 3: Legal & Support -->
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
              <NuxtLink to="/help">{{ t('Help & FAQ') }}</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/support">{{ t('Technical Support') }}</NuxtLink>
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
import { useBookingModal } from '../../composables/useBookingModal';

const { t } = useI18n();
const bookingModal = useBookingModal();

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
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.footer-top {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 32px;

  @media (max-width: 992px) {
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .brand-row {
    display: flex;
    align-items: center;
    gap: 12px;

    .footer-logo {
      width: 44px;
      height: 44px;
      object-fit: contain;
      border-radius: 12px;
    }

    .brand-name {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--unity-primary);
      margin: 0;
      line-height: 1.25;
    }

    .brand-desc {
      font-size: 0.74rem;
      color: var(--unity-text-muted);
      margin: 0;
    }
  }

  .moh-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 12px;
    border-radius: 9999px;
    background: rgba(4, 120, 87, 0.08);
    color: var(--unity-primary);
    font-size: 0.76rem;
    font-weight: 700;
    width: fit-content;
  }

  .contact-mini-row {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 0.80rem;
    color: var(--unity-text-muted);
    font-weight: 600;

    span {
      display: inline-flex;
      align-items: center;
      gap: 6px;

      i {
        color: var(--unity-primary);
      }
    }
  }
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .nav-title {
    font-size: 0.90rem;
    font-weight: 800;
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

    li a {
      color: var(--unity-text-muted);
      font-size: 0.82rem;
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: var(--unity-primary);
        text-decoration: underline;
      }
    }
  }
}

.footer-bottom {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid var(--unity-border);
  padding-top: 20px;
  font-size: 0.76rem;
  color: var(--unity-text-dim);
  text-align: center;

  .copyright-text {
    margin: 0;
    font-weight: 600;
  }

  .legal-notice {
    margin: 0;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>