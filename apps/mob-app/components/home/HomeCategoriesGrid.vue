<template>
  <section class="section-container">
    <div class="section-header">
      <h4>{{ t('What are you looking for today?') }}</h4>
      <NuxtLink to="/services" class="see-all-link">
        {{ t('Browse Services') }} 
        <i :class="isRtl ? 'pi pi-angle-left' : 'pi pi-angle-right'"></i>
      </NuxtLink>
    </div>

    <div class="categories-grid">
      <!-- 1. Doctor Consultation Checkup Card -->
      <div 
        class="category-card doctor-card" 
        @click="navigateToCategory('doctor')"
      >
        <div class="cat-icon-wrap icon-doctor">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

        <div class="card-action-cue">
          <span>{{ t('Book Now') }}</span>
          <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
        </div>
      </div>

      <!-- 2. Lab & Diagnostic Tests Card -->
      <div 
        class="category-card lab-card" 
        @click="navigateToCategory('lab')"
      >
        <div class="cat-icon-wrap icon-lab">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2v7.31L4.35 18.5A2 2 0 0 0 6.07 22h11.86a2 2 0 0 0 1.72-3.5L14 9.31V2"/>
            <path d="M8.5 2h7"/>
            <path d="M7 16h10"/>
          </svg>
        </div>

        <div class="cat-content">
          <h5>{{ t('Book Tests & Lab Examinations') }}</h5>
          <p>{{ t('Lab tests, diagnostics & comprehensive packages') }}</p>
        </div>

        <div class="card-action-cue">
          <span>{{ t('Explore Tests') }}</span>
          <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
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
  gap: 12px;
  width: 100%;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h4 {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin: 0;
    }

    .see-all-link {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--unity-primary);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      transition: gap 0.2s;

      &:hover {
        gap: 6px;
      }
    }
  }
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  .category-card {
    position: relative;
    border-radius: 22px;
    padding: 16px 14px 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);

    &.doctor-card {
      background: linear-gradient(150deg, var(--unity-surface) 0%, rgba(16, 185, 129, 0.08) 100%);
      border: 1.5px solid rgba(16, 185, 129, 0.22);

      .icon-doctor {
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        color: #059669;
        box-shadow: 0 6px 14px rgba(16, 185, 129, 0.18);
        border: 1px solid #a7f3d0;
      }

      .card-action-cue {
        color: #059669;
        background: rgba(16, 185, 129, 0.08);

        &:hover {
          background: rgba(16, 185, 129, 0.16);
        }
      }
    }

    &.lab-card {
      background: linear-gradient(150deg, var(--unity-surface) 0%, rgba(13, 148, 136, 0.08) 100%);
      border: 1.5px solid rgba(13, 148, 136, 0.22);

      .icon-lab {
        background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
        color: #0d9488;
        box-shadow: 0 6px 14px rgba(13, 148, 136, 0.18);
        border: 1px solid #99f6e4;
      }

      .card-action-cue {
        color: #0d9488;
        background: rgba(13, 148, 136, 0.08);

        &:hover {
          background: rgba(13, 148, 136, 0.16);
        }
      }
    }

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
    }

    &:active {
      transform: scale(0.97);
    }

    .cat-icon-wrap {
      width: 54px;
      height: 54px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      transition: transform 0.25s ease;
    }

    &:hover .cat-icon-wrap {
      transform: scale(1.06);
    }

    .cat-content {
      display: flex;
      flex-direction: column;
      flex: 1;

      h5 {
        font-size: 0.92rem;
        font-weight: 800;
        color: var(--unity-text-main);
        margin: 0 0 4px;
        line-height: 1.35;
      }

      p {
        font-size: 0.72rem;
        line-height: 1.4;
        color: var(--unity-text-muted);
        margin: 0 0 12px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .card-action-cue {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      width: 100%;
      transition: all 0.2s ease;

      i {
        font-size: 0.72rem;
        transition: transform 0.2s ease;
      }
    }
  }
}
</style>
