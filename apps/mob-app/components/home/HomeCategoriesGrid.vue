<template>
  <section class="section-container">
    <div class="section-header">
      <h4>{{ t('What are you looking for today?') }}</h4>
    </div>

    <div class="categories-grid">
      <!-- 1. In-Clinic Doctor Reservation Card -->
      <div 
        class="category-card clinic-card" 
        @click="navigateToCategory('clinic')"
      >
        <div class="cat-icon-wrap icon-clinic">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4.5 3v5a6.5 6.5 0 0 0 13 0V3"/>
            <path d="M3 3h3"/>
            <path d="M16 3h3"/>
            <path d="M11 14.5V18a3 3 0 0 0 6 0v-2"/>
            <circle cx="17" cy="16" r="2"/>
          </svg>
        </div>

        <div class="cat-content">
          <h5>{{ t('Clinic Reservation') }}</h5>
          <p>{{ t('In-clinic appointments & specialized consultations') }}</p>
        </div>

        <div class="card-action-pill clinic-pill">
          <span>{{ t('Book Clinic Visit') }}</span>
        </div>
      </div>

      <!-- 4. Lab & Diagnostic Tests Card (Harmonious Teal-Green Medical Palette) -->
      <div 
        class="category-card lab-card" 
        @click="navigateToCategory('lab')"
      >
        <div class="cat-icon-wrap icon-lab">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
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
const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const navigateToCategory = (type: 'clinic' | 'online' | 'home' | 'lab') => {
  if (type === 'clinic') {
    router.push('/services?tab=doctors&type=clinic');
  } else if (type === 'online') {
    router.push('/services?tab=doctors&type=online');
  } else if (type === 'home') {
    router.push('/services?tab=doctors&type=home');
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
      color: var(--unity-text-main);
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
    border-radius: 20px;
    padding: 18px 12px 14px;
    min-height: 185px;

    @media (min-width: 640px) {
      padding: 22px 18px 18px;
      min-height: 190px;
    }
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
    background: var(--unity-surface);
    border: 1.5px solid var(--unity-border);

    // ─── 1. Clinic Reservation Card (Emerald Green Theme) ───
    &.clinic-card {
      .icon-clinic {
        background: linear-gradient(135deg, var(--unity-primary) 0%, var(--unity-accent) 100%);
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(var(--unity-primary-rgb), 0.25);
      }

      .clinic-pill {
        background: rgba(var(--unity-accent-rgb), 0.10);
        color: var(--unity-primary);
        border: 1px solid rgba(var(--unity-accent-rgb), 0.20);

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          background: rgba(var(--unity-accent-rgb), 0.16);
          color: var(--unity-accent-light);
          border-color: rgba(var(--unity-accent-rgb), 0.32);
        }

        &:hover {
          background: var(--unity-primary);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(var(--unity-primary-rgb), 0.25);
        }
      }
    }

    // ─── 2. Online Video Consultation Card (Sky / Cyan Blue Theme) ───
    &.online-card {
      .icon-online {
        background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(2, 132, 199, 0.25);
      }

      .online-pill {
        background: rgba(2, 132, 199, 0.10);
        color: #0284c7;
        border: 1px solid rgba(2, 132, 199, 0.20);

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          background: rgba(2, 132, 199, 0.16);
          color: #38bdf8;
          border-color: rgba(2, 132, 199, 0.32);
        }

        &:hover {
          background: #0284c7;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
        }
      }
    }

    // ─── 3. Home Visit Reservation Card (Warm Amber Theme) ───
    &.home-card {
      .icon-home {
        background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(217, 119, 6, 0.25);
      }

      .home-pill {
        background: rgba(217, 119, 6, 0.10);
        color: #d97706;
        border: 1px solid rgba(217, 119, 6, 0.20);

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          background: rgba(245, 158, 11, 0.16);
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.32);
        }

        &:hover {
          background: #d97706;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25);
        }
      }
    }

    // ─── 4. Lab & Diagnostic Tests Card (Deep Medical Teal / Sea-Green Theme) ───
    &.lab-card {
      .icon-lab {
        background: linear-gradient(135deg, var(--unity-primary) 0%, var(--unity-primary) 50%, var(--unity-accent) 100%);
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(var(--unity-primary-rgb), 0.25);
      }

      .lab-pill {
        background: rgba(var(--unity-primary-rgb), 0.10);
        color: var(--unity-primary);
        border: 1px solid rgba(var(--unity-primary-rgb), 0.20);

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          background: rgba(var(--unity-accent-rgb), 0.16);
          color: var(--unity-accent-light);
          border-color: rgba(var(--unity-accent-rgb), 0.32);
        }

        &:hover {
          background: var(--unity-primary);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(var(--unity-primary-rgb), 0.25);
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
      width: 48px;
      height: 48px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
      flex-shrink: 0;
      transition: transform 0.25s ease;
    }

    .cat-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      margin-bottom: 12px;

      h5 {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--unity-text-main);
        margin: 0 0 4px;
        line-height: 1.35;
      }

      p {
        font-size: 0.67rem;
        line-height: 1.35;
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
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.70rem;
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
