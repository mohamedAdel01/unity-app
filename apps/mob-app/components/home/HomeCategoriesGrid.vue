<template>
  <section class="section-container">
    <div class="section-header">
      <h4>{{ t('What are you looking for today?') }}</h4>
    </div>

    <div class="categories-grid">
      <!-- 1. Doctor Consultation Checkup Card -->
      <div 
        class="category-card doctor-card" 
        @click="navigateToCategory('doctor')"
      >
        <div class="cat-icon-wrap icon-doctor">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4.5 3v5a6.5 6.5 0 0 0 13 0V3"/>
            <path d="M3 3h3"/>
            <path d="M16 3h3"/>
            <path d="M11 14.5V18a3 3 0 0 0 6 0v-2"/>
            <circle cx="17" cy="16" r="2"/>
          </svg>
        </div>

        <div class="cat-content">
          <h5>{{ t('Doctor Consultation Checkup') }}</h5>
          <p>{{ t('In-clinic appointments & specialized consultations') }}</p>
        </div>

        <div class="card-action-pill doctor-pill">
          <span>{{ t('Book Now') }}</span>
        </div>
      </div>

      <!-- 2. Lab & Diagnostic Tests Card (Harmonious Teal-Green Medical Palette) -->
      <div 
        class="category-card lab-card" 
        @click="navigateToCategory('lab')"
      >
        <div class="cat-icon-wrap icon-lab">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2v7.31L4.35 18.5A2 2 0 0 0 6.07 22h11.86a2 2 0 0 0 1.72-3.5L14 9.31V2"/>
            <path d="M8.5 2h7"/>
            <path d="M7 16h10"/>
          </svg>
        </div>

        <div class="cat-content">
          <h5>{{ t('Book Tests & Lab Examinations') }}</h5>
          <p>{{ t('Lab tests, diagnostics & comprehensive packages') }}</p>
        </div>

        <div class="card-action-pill lab-pill">
          <span>{{ t('Explore Tests') }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

const router = useRouter();
const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const navigateToCategory = (type: 'doctor' | 'lab') => {
  if (type === 'doctor') {
    router.push('/services?tab=doctors');
  } else {
    router.push('/services?tab=services');
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.section-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    h4 {
      font-size: 0.86rem;
      font-weight: 700;
      color: var(--unity-text-main, #334155);
      opacity: 0.9;
      margin: 0;
      line-height: 1.3;
    }
  }
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 11px;

  @media (min-width: 640px) {
    gap: 16px;
  }

  .category-card {
    position: relative;
    border-radius: 22px;
    padding: 20px 14px 16px;
    min-height: 200px;

    @media (min-width: 640px) {
      padding: 24px 20px 20px;
      min-height: 180px;
    }
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);

    // ─── 1. Doctor Consultation Card (Emerald Green Theme) ───
    &.doctor-card {
      background: var(--unity-surface);
      border: 1.5px solid var(--unity-border);

      .icon-doctor {
        background: linear-gradient(135deg, #047857 0%, #10b981 100%);
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);
      }

      .doctor-pill {
        background: rgba(16, 185, 129, 0.10);
        color: #047857;
        border: 1px solid rgba(16, 185, 129, 0.20);

        &:hover {
          background: #047857;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);
        }
      }
    }

    // ─── 2. Lab & Diagnostic Tests Card (Deep Medical Teal / Sea-Green Theme) ───
    &.lab-card {
      background: var(--unity-surface);
      border: 1.5px solid var(--unity-border);

      .icon-lab {
        background: linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%);
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(15, 118, 110, 0.25);
      }

      .lab-pill {
        background: rgba(13, 148, 136, 0.10);
        color: #0f766e;
        border: 1px solid rgba(13, 148, 136, 0.20);

        &:hover {
          background: #0f766e;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);
        }
      }
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);

      .cat-icon-wrap {
        transform: scale(1.06);
      }
    }

    &:active {
      transform: scale(0.98);
    }

    .cat-icon-wrap {
      width: 50px;
      height: 50px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      flex-shrink: 0;
      transition: transform 0.25s ease;
    }

    .cat-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      margin-bottom: 14px;

      h5 {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--unity-text-main, #334155);
        margin: 0 0 5px;
        line-height: 1.35;
      }

      p {
        font-size: 0.69rem;
        line-height: 1.4;
        color: var(--unity-text-dim);
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .card-action-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 7px 14px;
      border-radius: 24px;
      font-size: 0.72rem;
      font-weight: 700;
      width: 100%;
      margin-top: auto;
      transition: all 0.2s ease;

      i {
        font-size: 0.64rem;
        transition: transform 0.2s ease;
      }
    }
  }
}
</style>
