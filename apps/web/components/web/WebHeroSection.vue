<template>
  <section class="web-hero-section">
    <div class="hero-container">
      <!-- Accreditation Pill -->
      <div class="hero-badge">
        <i class="pi pi-verified"></i>
        <span>{{ t('Unity Specialized Clinics • Officially Certified') }}</span>
      </div>

      <!-- Main Headline -->
      <h1 class="hero-title">
        {{ t('Official Medical Services & Patient Information Portal') }}
      </h1>

      <!-- Description -->
      <p class="hero-description">
        {{
          t('Welcome to the official portal for Unity Specialized Clinics. Review our medical terms of service, strict data privacy protocols, and manage your account and personal health data with full transparency.')
        }}
      </p>

      <!-- Action Buttons -->
      <div class="hero-actions">
        <NuxtLink to="/terms" class="btn-primary">
          <i class="pi pi-shield"></i>
          <span>{{ t('Terms & Privacy Policy') }}</span>
        </NuxtLink>
        <NuxtLink to="/delete-account" class="btn-secondary">
          <i class="pi pi-user-minus"></i>
          <span>{{ t('Delete Account & Data') }}</span>
        </NuxtLink>
      </div>

      <!-- App Download Badges -->
      <div class="download-badges-wrapper">
        <span class="download-label">{{ t('Download the Sehaty Care Mobile App') }}</span>
        <div class="badges-row">
          <div class="store-badge">
            <i class="pi pi-android"></i>
            <div>
              <small>{{ t('GET IT ON') }}</small>
              <strong>Google Play</strong>
            </div>
          </div>
          <div class="store-badge">
            <i class="pi pi-apple"></i>
            <div>
              <small>{{ t('Download on the') }}</small>
              <strong>App Store</strong>
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

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.web-hero-section {
  padding: 64px 24px 48px;
  background: linear-gradient(180deg, rgba(4, 120, 87, 0.05) 0%, rgba(0, 0, 0, 0) 100%);
  display: flex;
  justify-content: center;
  text-align: center;
}

.hero-container {
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #10b981;
  font-size: 0.84rem;
  font-weight: 700;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--unity-text-main);
  line-height: 1.3;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 1.7rem;
  }
}

.hero-description {
  font-size: 1.05rem;
  color: var(--unity-text-muted);
  line-height: 1.7;
  margin: 0;
  max-width: 680px;

  @media (max-width: 640px) {
    font-size: 0.92rem;
  }
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 10px;

  .btn-primary,
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 28px;
    border-radius: 14px;
    font-size: 0.95rem;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;

    i {
      font-size: 1.05rem;
    }
  }

  .btn-primary {
    background: var(--unity-primary);
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(4, 120, 87, 0.22);

    &:hover {
      background: var(--unity-primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(4, 120, 87, 0.3);
    }
  }

  .btn-secondary {
    background: var(--unity-surface);
    color: var(--unity-text-main);
    border: 1px solid var(--unity-border);

    &:hover {
      border-color: var(--unity-primary);
      color: var(--unity-primary);
      transform: translateY(-2px);
    }
  }
}

.download-badges-wrapper {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .download-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--unity-text-dim);
  }

  .badges-row {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .store-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 18px;
    border-radius: 12px;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-main);
    text-align: start;

    i {
      font-size: 1.4rem;
      color: var(--unity-primary);
    }

    small {
      display: block;
      font-size: 0.65rem;
      color: var(--unity-text-muted);
      line-height: 1;
    }

    strong {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--unity-text-main);
    }
  }
}
</style>
