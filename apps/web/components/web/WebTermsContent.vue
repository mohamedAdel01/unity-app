<template>
  <div class="web-terms-container">
    <!-- Breadcrumb & Page Header -->
    <div class="terms-page-header">
      <div class="header-breadcrumbs">
        <NuxtLink to="/">{{ t('Home') }}</NuxtLink>
        <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
        <span>{{ t('Terms & Privacy Policy') }}</span>
      </div>
      <h1 class="page-title">{{ t('Terms & Privacy Policy') }}</h1>
      <p class="page-subtitle">
        {{ t('Official legal terms and data privacy standards governing Unity Specialized Clinics and Sehaty Care Application.') }}
      </p>
    </div>

    <!-- Main Content Layout (Sidebar + Sections) -->
    <div class="terms-layout">
      <!-- Sidebar / Meta Card -->
      <aside class="terms-sidebar">
        <div class="policy-meta-card">
          <div class="meta-badge-icon">
            <i class="pi pi-shield"></i>
          </div>
          <div>
            <h4 class="meta-title">{{ t('Official Application Policy') }}</h4>
            <p class="meta-date">{{ t('Last updated: November 2026') }}</p>
          </div>
        </div>

        <nav class="quick-nav">
          <span class="quick-nav-title">{{ t('Table of Contents') }}</span>
          <a href="#section-1" class="quick-nav-link">
            <i class="pi pi-file"></i>
            <span>{{ t('1. Introduction & Acceptance') }}</span>
          </a>
          <a href="#section-2" class="quick-nav-link">
            <i class="pi pi-heart"></i>
            <span>{{ t('2. Medical Services & Consultations') }}</span>
          </a>
          <a href="#section-3" class="quick-nav-link">
            <i class="pi pi-lock"></i>
            <span>{{ t('3. Data Privacy & Protection') }}</span>
          </a>
          <a href="#section-4" class="quick-nav-link">
            <i class="pi pi-calendar"></i>
            <span>{{ t('4. Bookings, Cancellation & Refunds') }}</span>
          </a>
          <a href="#section-5" class="quick-nav-link">
            <i class="pi pi-user-minus"></i>
            <span>{{ t('5. Account Management & Data Rights') }}</span>
          </a>
          <a href="#section-6" class="quick-nav-link">
            <i class="pi pi-envelope"></i>
            <span>{{ t('6. Contact & Support') }}</span>
          </a>
        </nav>

        <div class="sidebar-help-box">
          <i class="pi pi-info-circle"></i>
          <p>{{ t('Have legal or privacy questions? Contact our compliance department directly.') }}</p>
          <a href="mailto:privacy@unity-health.app" class="contact-pill">privacy@unity-health.app</a>
        </div>
      </aside>

      <!-- Main Policy Content Cards -->
      <div class="terms-sections">
        <!-- Section 1 -->
        <section id="section-1" class="policy-card">
          <div class="card-head">
            <span class="section-num">01</span>
            <h2>
              <i class="pi pi-file"></i>
              {{ t('1. Introduction & Acceptance') }}
            </h2>
          </div>
          <div class="card-body">
            <p>
              {{
                t('Welcome to the UNITY Healthcare Application. By accessing or using this application, you agree to be bound by these terms and our privacy policy in accordance with relevant medical and health regulations.')
              }}
            </p>
            <p>
              {{
                t('These terms apply to all patients, visitors, and registered users of Unity Specialized Clinics digital services across web and mobile platforms.')
              }}
            </p>
          </div>
        </section>

        <!-- Section 2 -->
        <section id="section-2" class="policy-card">
          <div class="card-head">
            <span class="section-num">02</span>
            <h2>
              <i class="pi pi-heart"></i>
              {{ t('2. Medical Services & Consultations') }}
            </h2>
          </div>
          <div class="card-body">
            <p>
              {{
                t('The application facilitates appointment bookings, medical record tracking, and telehealth consultations with licensed practitioners. This service is not an alternative to emergency care; please visit the nearest emergency facility in urgent cases.')
              }}
            </p>
            <div class="alert-box">
              <i class="pi pi-exclamation-circle"></i>
              <span>{{ t('Medical notice: In case of acute or life-threatening symptoms, call emergency services immediately.') }}</span>
            </div>
          </div>
        </section>

        <!-- Section 3 -->
        <section id="section-3" class="policy-card">
          <div class="card-head">
            <span class="section-num">03</span>
            <h2>
              <i class="pi pi-lock"></i>
              {{ t('3. Data Privacy & Protection') }}
            </h2>
          </div>
          <div class="card-body">
            <p>
              {{
                t('We adhere to the highest standards of data protection and privacy. All health records and personal information are encrypted in transit and at rest. We never sell or share your data with unauthorized third parties without explicit consent.')
              }}
            </p>
            <ul class="policy-bullets">
              <li>{{ t('All communications and records use TLS 1.3 encryption.') }}</li>
              <li>{{ t('Health information is stored in compliance with local Ministry of Health standards.') }}</li>
              <li>{{ t('Only your treating physician and certified clinic team can view your clinical history.') }}</li>
            </ul>
          </div>
        </section>

        <!-- Section 4 -->
        <section id="section-4" class="policy-card">
          <div class="card-head">
            <span class="section-num">04</span>
            <h2>
              <i class="pi pi-calendar"></i>
              {{ t('4. Bookings, Cancellation & Refunds') }}
            </h2>
          </div>
          <div class="card-body">
            <p>
              {{
                t('Users may book, reschedule, or cancel appointments via the app within the cancellation window. Refunds are issued to the original payment method or wallet balance in accordance with clinic policies.')
              }}
            </p>
          </div>
        </section>

        <!-- Section 5 -->
        <section id="section-5" class="policy-card">
          <div class="card-head">
            <span class="section-num">05</span>
            <h2>
              <i class="pi pi-user-minus"></i>
              {{ t('5. Account Management & Data Rights') }}
            </h2>
          </div>
          <div class="card-body">
            <p>
              {{
                t('Users have the right to request the deletion of their account and associated data at any time via the in-app delete account feature, subject to statutory medical record retention obligations.')
              }}
            </p>
            <div class="card-action-bar">
              <NuxtLink to="/delete-account" class="action-btn">
                <i class="pi pi-arrow-right" :class="{ 'pi-arrow-left': !isRtl }"></i>
                <span>{{ t('Request Account Deletion Online') }}</span>
              </NuxtLink>
            </div>
          </div>
        </section>

        <!-- Section 6 -->
        <section id="section-6" class="policy-card">
          <div class="card-head">
            <span class="section-num">06</span>
            <h2>
              <i class="pi pi-envelope"></i>
              {{ t('6. Contact & Support') }}
            </h2>
          </div>
          <div class="card-body">
            <p>
              {{
                t('For any questions or feedback regarding our terms and policies, please contact our legal and support team at: support@unity-health.app')
              }}
            </p>
            <div class="contact-cards-row">
              <div class="contact-sub-card">
                <i class="pi pi-envelope"></i>
                <div>
                  <strong>{{ t('Technical Support') }}</strong>
                  <a href="mailto:support@unity-health.app">support@unity-health.app</a>
                </div>
              </div>
              <div class="contact-sub-card">
                <i class="pi pi-shield"></i>
                <div>
                  <strong>{{ t('Privacy Inquiries') }}</strong>
                  <a href="mailto:privacy@unity-health.app">privacy@unity-health.app</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.web-terms-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 72px;
}

.terms-page-header {
  margin-bottom: 36px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .header-breadcrumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.84rem;
    color: var(--unity-text-muted);

    a {
      color: var(--unity-primary);
      text-decoration: none;
      font-weight: 600;
    }

    i {
      font-size: 0.72rem;
    }
  }

  .page-title {
    font-size: 2.1rem;
    font-weight: 800;
    color: var(--unity-text-main);
    margin: 4px 0 0;
  }

  .page-subtitle {
    font-size: 1rem;
    color: var(--unity-text-muted);
    margin: 0;
    max-width: 700px;
    line-height: 1.6;
  }
}

.terms-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 36px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.terms-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 90px;

  @media (max-width: 900px) {
    position: static;
  }
}

.policy-meta-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 16px;

  .meta-badge-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #10b981;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    flex-shrink: 0;
  }

  .meta-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--unity-text-main);
    margin: 0;
  }

  .meta-date {
    font-size: 0.78rem;
    color: var(--unity-text-muted);
    margin: 2px 0 0;
  }
}

.quick-nav {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .quick-nav-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--unity-text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 8px 8px;
    border-bottom: 1px solid var(--unity-border);
  }

  .quick-nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--unity-text-muted);
    text-decoration: none;
    transition: all 0.2s ease;

    i {
      font-size: 0.9rem;
      color: var(--unity-primary);
    }

    &:hover {
      background: var(--unity-primary-light);
      color: var(--unity-primary);
    }
  }
}

.sidebar-help-box {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  i {
    font-size: 1.4rem;
    color: var(--unity-primary);
  }

  p {
    font-size: 0.82rem;
    color: var(--unity-text-muted);
    margin: 0;
    line-height: 1.5;
  }

  .contact-pill {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--unity-primary);
    text-decoration: none;
  }
}

.terms-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.policy-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 18px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-margin-top: 100px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: rgba(4, 120, 87, 0.35);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--unity-border);

    .section-num {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--unity-primary);
      background: var(--unity-primary-light);
      padding: 4px 10px;
      border-radius: 8px;
    }

    h2 {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;

      i {
        font-size: 1.1rem;
        color: var(--unity-primary);
      }
    }
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 12px;

    p {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.7;
      color: var(--unity-text-muted);
    }
  }

  .alert-box {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.25);
    color: #dc2626;
    font-size: 0.85rem;
    font-weight: 600;

    i {
      font-size: 1.1rem;
      flex-shrink: 0;
    }
  }

  .policy-bullets {
    margin: 4px 0 0;
    padding-inline-start: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    li {
      font-size: 0.88rem;
      color: var(--unity-text-muted);
      line-height: 1.6;
    }
  }

  .card-action-bar {
    margin-top: 6px;

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      border-radius: 12px;
      background: var(--unity-primary-light);
      color: var(--unity-primary);
      text-decoration: none;
      font-size: 0.86rem;
      font-weight: 700;
      transition: all 0.2s ease;

      &:hover {
        background: var(--unity-primary);
        color: #ffffff;
      }
    }
  }

  .contact-cards-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 8px;

    .contact-sub-card {
      flex: 1;
      min-width: 220px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 14px;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);

      i {
        font-size: 1.3rem;
        color: var(--unity-primary);
      }

      strong {
        display: block;
        font-size: 0.86rem;
        color: var(--unity-text-main);
      }

      a {
        font-size: 0.8rem;
        color: var(--unity-primary);
        text-decoration: none;
      }
    }
  }
}
</style>
