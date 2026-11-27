<template>
  <section class="web-steps-section">
    <div class="steps-container">
      <div class="section-head">
        <span class="section-tag">{{ t('Instant Medical Booking') }}</span>
        <h2 class="section-title">{{ t('Book Your Doctor in 3 Simple Steps') }}</h2>
      </div>

      <div class="steps-row">
        <!-- Step 1 -->
        <div class="step-card">
          <div class="step-number">01</div>
          <div class="step-icon">
            <i class="pi pi-building"></i>
          </div>
          <h3>{{ t('Choose Clinic or Specialist') }}</h3>
          <p>{{ t('Select from our certified departments or search your preferred doctor directly.') }}</p>
        </div>

        <!-- Step 2 -->
        <div class="step-card">
          <div class="step-number">02</div>
          <div class="step-icon">
            <i class="pi pi-calendar"></i>
          </div>
          <h3>{{ t('Pick Convenient Time') }}</h3>
          <p>{{ t('Browse live doctor schedules and choose the slot that perfectly fits your day.') }}</p>
        </div>

        <!-- Step 3 -->
        <div class="step-card">
          <div class="step-number">03</div>
          <div class="step-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <h3>{{ t('Receive Instant Confirmation') }}</h3>
          <p>{{ t('Your booking is instantly confirmed with reception without waiting or upfront card charge.') }}</p>
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
.web-steps-section {
  padding: 56px 20px;
  background: var(--unity-surface);
  border-top: 1px solid var(--unity-border);
  border-bottom: 1px solid var(--unity-border);
}

.steps-container {
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 36px;
  text-align: center;
}

.section-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  .section-tag {
    font-size: 0.80rem;
    font-weight: 700;
    color: var(--unity-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-title {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--unity-text-main);
    margin: 0;

    @media (max-width: 640px) {
      font-size: 1.45rem;
    }
  }
}

.steps-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  position: relative;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 18px;
  }
}

.step-card {
  background: var(--unity-bg);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 32px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
  transition: all 0.25s ease;

  &:hover {
    border-color: var(--unity-primary);
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(var(--unity-primary-rgb), 0.08);

    .step-icon {
      background: var(--unity-primary);
      color: #fff;
    }
  }

  .step-number {
    position: absolute;
    top: 14px;
    inset-inline-start: 16px;
    font-size: 0.76rem;
    font-weight: 800;
    color: var(--unity-text-dim);
    letter-spacing: 0.5px;
  }

  .step-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: rgba(var(--unity-primary-rgb), 0.08);
    color: var(--unity-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    transition: all 0.2s ease;
  }

  h3 {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--unity-text-main);
    margin: 0;
  }

  p {
    font-size: 0.82rem;
    color: var(--unity-text-muted);
    line-height: 1.6;
    margin: 0;
    max-width: 280px;
  }
}
</style>