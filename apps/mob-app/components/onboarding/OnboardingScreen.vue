<template>
  <div class="onboarding-container" :class="{ 'dark-mode': isDark }">
    <!-- Top Action Bar with Real Interactive Skip Button & Unity Clinics Brand -->
    <header class="onboarding-top-bar">
      <div class="onboarding-brand-pill">
        <img src="/logo-small.png" alt="Unity Clinics" class="onboarding-logo-img" />
      </div>
      <button type="button" class="skip-btn" @click="router.push('/auth/register')">
        {{ t('Skip') }}
      </button>
    </header>

    <!-- Full-Bleed Background Images for 3 Slides -->
    <div class="slides-viewport" @touchstart="onTouchStart" @touchend="onTouchEnd">
      <div v-for="(slide, idx) in slides" :key="idx" class="slide-item" :class="{ 'active': currentSlide === idx }"
        :style="{ backgroundImage: `url(${slide.image})` }">
        <!-- Dark Gradient Overlay for Contrast & Readability -->
        <div class="dark-overlay"></div>
      </div>

      <!-- Top Wave Cutout Overlay matching user request -->
      <div class="top-wave-mask">
        <svg viewBox="0 0 1000 160" preserveAspectRatio="none" class="wave-svg">
          <defs>
            <linearGradient id="topWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" :stop-color="isDark ? '#090d16' : '#f8fafc'" stop-opacity="0.98" class="wave-stop-0" />
              <stop offset="65%" :stop-color="isDark ? '#090d16' : '#f8fafc'" stop-opacity="0.85" class="wave-stop-65" />
              <stop offset="100%" :stop-color="isDark ? '#090d16' : '#f8fafc'" stop-opacity="0.55" class="wave-stop-100" />
            </linearGradient>
          </defs>
          <path fill="url(#topWaveGrad)" d="M 0,0 L 1000,0 L 1000,95 C 840,145 680,90 500,85 C 320,80 160,155 0,110 Z" />
        </svg>
      </div>
    </div>

    <!-- Bottom Content Overlay (Text, Dots, Buttons) -->
    <div class="onboarding-bottom-card">
      <!-- Slide Text Information (Animated on slide change) -->
      <transition name="slide-fade" mode="out-in">
        <div :key="currentSlide" class="slide-text-block">
          <h2 class="slide-title">{{ t(slides[currentSlide].titleKey) }}</h2>
                  </div>
      </transition>

      <!-- 3-Dot Pagination Indicator matching exact mockup -->
      <div class="dots-indicator-row">
        <button v-for="(_, idx) in slides" :key="idx" type="button" class="dot-pill"
          :class="{ 'active': currentSlide === idx }" :aria-label="`Go to slide ${idx + 1}`"
          @click="currentSlide = idx"></button>
      </div>

      <!-- Bottom Action Button & Auth Helper -->
      <div class="action-footer">
        <button type="button" class="primary-action-btn" @click="nextSlide">
          <span>{{ currentSlide < slides.length - 1 ? t('Continue') : t('Create New Account') }}</span>
              <svg class="action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
        </button>

        <!-- Secondary Login Link: "لديك حساب بالفعل؟ تسجيل الدخول" -->
        <div class="auth-helper-row">
          <NuxtLink to="/auth/login" class="sub-link">
            <span class="auth-muted">{{ t('Already have an account?') }}</span>
            <span class="auth-action">{{ t('Sign In') }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useTheme } from '../../composables/useTheme';
// Direct asset imports so Vite/Nuxt resolves and bundles them reliably
import slide1 from '~/assets/images/onboarding/slide-1.jpg';
import slide2 from '~/assets/images/onboarding/slide-2.jpg';
import slide3 from '~/assets/images/onboarding/slide-3.jpg';

const router = useRouter();

const { t } = useI18n();

const { currentTheme } = useTheme();

// 2. Data (refs, reactive state)
const currentSlide = ref(0);

// The 3 exact slides matching the user's design & uploaded images
const slides = [
  {
    image: slide1,
    titleKey: 'onboarding.slide1.title',
    descKey: 'onboarding.slide1.desc',
  },
  {
    image: slide2,
    titleKey: 'onboarding.slide2.title',
    descKey: 'onboarding.slide2.desc',
  },
  {
    image: slide3,
    titleKey: 'onboarding.slide3.title',
    descKey: 'onboarding.slide3.desc',
  },
];

// Touch swipe gestures
let touchStartX = 0;

// 3. Computed (computed properties)
const isDark = computed(() => currentTheme.value === 'dark');

// 4. Methods (functions, handlers)
const nextSlide = () => {
  if (currentSlide.value < slides.length - 1)
    currentSlide.value++;
  else
    router.push('/auth/register');

};

const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
};

const onTouchEnd = (e: TouchEvent) => {
  const touchEndX = e.changedTouches[0].clientX;
  const diffX = touchEndX - touchStartX;

  if (Math.abs(diffX) > 40) {
    if (diffX < 0 && currentSlide.value > 0) currentSlide.value--;
    else if (diffX > 0 && currentSlide.value < slides.length - 1) currentSlide.value++;
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.onboarding-container {
  --ob-bg: #f8fafc;
  --ob-bg-rgb: 248, 250, 252;
  --ob-title-color: #0f172a;
    --ob-skip-bg: rgba(255, 255, 255, 0.88);
  --ob-skip-text: #0f172a;
  --ob-skip-border: rgba(15, 23, 42, 0.14);
  --ob-dot-inactive: #cbd5e1;
  --ob-auth-muted: #64748b;
  --ob-title-shadow: none;

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--ob-bg);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 20;
  transition: background-color 0.3s ease;

  // Adapt dynamically to dark theme
  :global([data-theme='dark']) &,
  :global(.dark) &,
  &.dark-mode {
    --ob-bg: #090d16;
    --ob-bg-rgb: 9, 13, 22;
    --ob-title-color: #ffffff;
        --ob-skip-bg: rgba(9, 14, 23, 0.65);
    --ob-skip-text: #ffffff;
    --ob-skip-border: rgba(255, 255, 255, 0.22);
    --ob-dot-inactive: #4b5563;
    --ob-auth-muted: #9ca3af;
    --ob-title-shadow: 0 2px 14px rgba(0, 0, 0, 0.85);
  }
}

// Top Skip Action Bar
.onboarding-top-bar {
  position: absolute;
  top: max(24px, env(safe-area-inset-top, 24px));
  left: 20px;
  right: 20px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .onboarding-brand-pill {
    background: transparent;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 8px;

    .onboarding-logo-img {
      height: 48px;
      width: 48px;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
      object-fit: cover;
    }

    .brand-text {
      color: #ffffff;
      font-weight: 800;
      font-size: 1.05rem;
      letter-spacing: 1px;
      text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
    }
  }

  .skip-btn {
    background: var(--ob-skip-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--ob-skip-border);
    color: var(--ob-skip-text);
    font-size: 0.85rem;
    font-weight: 600;
    padding: 7px 18px;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;

    &:hover {
      filter: brightness(0.95);
    }
  }
}

// Background Carousel Viewport
.slides-viewport {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;

  .slide-item {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);

    &.active {
      opacity: 1;
    }

    .dark-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(var(--ob-bg-rgb), 0.98) 0%, rgba(var(--ob-bg-rgb), 0.75) 10%, rgba(var(--ob-bg-rgb), 0.15) 22%, rgba(0, 0, 0, 0.00) 42%, rgba(0, 0, 0, 0.00) 52%, rgba(var(--ob-bg-rgb), 0.35) 64%, rgba(var(--ob-bg-rgb), 0.76) 75%, rgba(var(--ob-bg-rgb), 0.94) 86%, rgba(var(--ob-bg-rgb), 1.0) 100%);
      transition: background 0.3s ease;
    }
  }

  // Top Wave Cutout Overlay
  .top-wave-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: max(115px, calc(env(safe-area-inset-top, 24px) + 75px));
    z-index: 5;
    pointer-events: none;
    overflow: hidden;

    .wave-svg {
      width: 100%;
      height: 100%;
      display: block;

      .wave-stop-0 {
        stop-color: var(--ob-bg);
        stop-opacity: 0.98;
      }

      .wave-stop-65 {
        stop-color: var(--ob-bg);
        stop-opacity: 0.85;
      }

      .wave-stop-100 {
        stop-color: var(--ob-bg);
        stop-opacity: 0.55;
      }
    }
  }
}

// Bottom Card Content
.onboarding-bottom-card {
  position: relative;
  z-index: 10;
  padding: 0 20px max(32px, env(safe-area-inset-bottom, 32px));
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 18px;

  .slide-text-block {
    min-height: 52px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .slide-title {
      color: var(--ob-title-color);
      font-size: 2.15rem;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0;
      line-height: 1.25;
      text-shadow: var(--ob-title-shadow);
      transition: color 0.3s ease;
    }

    .slide-subtitle {
      color: var(--ob-subtitle-color);
      font-size: 0.98rem;
      font-weight: 500;
      line-height: 1.5;
      margin: 0 auto;
      max-width: 320px;
      text-shadow: 0 1px 8px rgba(0, 0, 0, 0.65);
      transition: color 0.3s ease;
    }
  }

  // Dots Pagination
  .dots-indicator-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 4px;

    .dot-pill {
      height: 4px;
      width: 6px;
      border-radius: 999px;
      background: var(--ob-dot-inactive);
      border: none;
      cursor: pointer;
      padding: 0;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

      &.active {
        width: 28px;
        background: #00b074; // Emerald green matching mockup
      }
    }
  }

  // Action Footer
  .action-footer {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 4px;

    .primary-action-btn {
      width: 100%;
      height: 54px;
      border-radius: 16px;
      background: #00b074; // Emerald green matching mockup
      color: #ffffff;
      font-size: 1.05rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 8px 24px rgba(0, 176, 116, 0.38);
      transition: all 0.25s ease;

      .action-arrow {
        transition: transform 0.2s ease;

        [dir="ltr"] & {
          transform: rotate(180deg);
        }
      }

      &:hover {
        background: #009c66;
        transform: translateY(-1px);

        .action-arrow {
          transform: translateX(-3px);
        }

        [dir="ltr"] & .action-arrow {
          transform: rotate(180deg) translateX(-3px);
        }
      }

      &:active {
        transform: scale(0.98);
      }
    }

    // Secondary Link
    .auth-helper-row {
      .sub-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
        font-size: 0.88rem;

        .auth-muted {
          color: var(--ob-auth-muted);
          transition: color 0.3s ease;
        }

        .auth-action {
          color: #00b074;
          font-weight: 700;
          transition: color 0.2s;
        }

        &:hover .auth-action {
          color: #10b981;
          text-decoration: underline;
        }
      }
    }
  }
}

// Slide Fade Transition
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
