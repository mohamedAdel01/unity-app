<template>
  <section class="web-features-grid">
    <div class="features-container">
      <div class="section-head">
        <h2 class="section-title">{{ t('Our Core Medical & Privacy Standards') }}</h2>
        <p class="section-subtitle">
          {{ t('Built with patient privacy, medical ethics, and regulatory compliance at the center of everything we do.') }}
        </p>
      </div>

      <div class="cards-grid">
        <!-- Feature 1: Privacy -->
        <div class="feature-card">
          <div class="card-icon-badge">
            <i class="pi pi-lock"></i>
          </div>
          <h3>{{ t('Data Privacy & End-to-End Encryption') }}</h3>
          <p>
            {{ t('All health records, lab analyses, and personal data are encrypted in transit and at rest according to national and international healthcare standards.') }}
          </p>
        </div>

        <!-- Feature 2: Compliance -->
        <div class="feature-card">
          <div class="card-icon-badge">
            <i class="pi pi-verified"></i>
          </div>
          <h3>{{ t('Official Regulatory Accreditation') }}</h3>
          <p>
            {{ t('Operating under strict licenses from the Ministry of Health, maintaining professional medical confidentiality and patient care charters.') }}
          </p>
        </div>

        <!-- Feature 3: Patient Rights -->
        <div class="feature-card">
          <div class="card-icon-badge">
            <i class="pi pi-user-minus"></i>
          </div>
          <h3>{{ t('Full Account & Data Rights') }}</h3>
          <p>
            {{ t('Empowering users with direct control over their accounts and data deletion requests, respecting medical record statutory retention laws.') }}
          </p>
        </div>

        <!-- Feature 4: Support -->
        <div class="feature-card">
          <div class="card-icon-badge">
            <i class="pi pi-headphones"></i>
          </div>
          <h3>{{ t('Dedicated Support & Assistance') }}</h3>
          <p>
            {{ t('Our medical and technical assistance teams are ready to answer any questions regarding terms, bookings, or data rights at any time.') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.web-features-grid {
  padding: 48px 24px 72px;
  background: var(--unity-bg);
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.section-head {
  text-align: center;
  max-width: 650px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .section-title {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--unity-text-main);
    margin: 0;

    @media (max-width: 640px) {
      font-size: 1.4rem;
    }
  }

  .section-subtitle {
    font-size: 0.95rem;
    color: var(--unity-text-muted);
    line-height: 1.6;
    margin: 0;
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.feature-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 18px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
    border-color: var(--unity-primary);
  }

  .card-icon-badge {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.35rem;
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--unity-text-main);
    margin: 0;
    line-height: 1.35;
  }

  p {
    font-size: 0.88rem;
    color: var(--unity-text-muted);
    line-height: 1.65;
    margin: 0;
  }
}
</style>
