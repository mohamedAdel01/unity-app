<template>
  <div class="onboarding-container" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Full-Bleed Background Images for 3 Slides -->
    <div class="slides-viewport" @touchstart="onTouchStart" @touchend="onTouchEnd">
      <div 
        v-for="(slide, idx) in slides" 
        :key="idx" 
        class="slide-item"
        :class="{ 'active': currentSlide === idx }"
        :style="{ backgroundImage: `url(${slide.image})` }"
      >
        <!-- Dark Gradient Overlay for Contrast & Readability -->
        <div class="dark-overlay"></div>
      </div>
    </div>

    <!-- Bottom Content Overlay (Text, Dots, Buttons) -->
    <div class="onboarding-bottom-card">
      <!-- Slide Text Information (Animated on slide change) -->
      <transition name="slide-fade" mode="out-in">
        <div :key="currentSlide" class="slide-text-block">
          <h2 class="slide-title">{{ t(slides[currentSlide].titleKey) }}</h2>
          <p class="slide-subtitle">{{ t(slides[currentSlide].descKey) }}</p>
        </div>
      </transition>

      <!-- 3-Dot Pagination Indicator matching exact mockup -->
      <div class="dots-indicator-row">
        <button 
          v-for="(_, idx) in slides" 
          :key="idx"
          type="button"
          class="dot-pill"
          :class="{ 'active': currentSlide === idx }"
          :aria-label="`Go to slide ${idx + 1}`"
          @click="currentSlide = idx"
        ></button>
      </div>

      <!-- Bottom Action Button & Auth Helper -->
      <div class="action-footer">
        <button 
          v-if="currentSlide < slides.length - 1" 
          type="button" 
          class="primary-action-btn"
          @click="nextSlide"
        >
          <span>{{ t('Continue') }}</span>
          <svg class="action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <button 
          v-else 
          type="button" 
          class="primary-action-btn get-started-btn"
          @click="goToLogin"
        >
          <span>{{ t('Get Started') }}</span>
          <svg class="action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

// Direct asset imports so Vite/Nuxt resolves and bundles them reliably
import slide1 from '~/assets/images/onboarding/slide-1.jpg';
import slide2 from '~/assets/images/onboarding/slide-2.jpg';
import slide3 from '~/assets/images/onboarding/slide-3.jpg';

const router = useRouter();
const { t, isRtl } = useI18n();

const currentSlide = ref(0);

// The 3 exact slides matching the user's design & uploaded images
const slides = [
  {
    image: slide1,
    titleKey: 'Elite Doctors & Specialists',
    descKey: 'Connect and book consultations in-person or telehealth with top medical consultants across all specialties.',
  },
  {
    image: slide2,
    titleKey: 'Latest Medical Technologies & Diagnostics',
    descKey: 'Accurate diagnostics, immediate lab tests, and advanced imaging ensure the highest standards of safety.',
  },
  {
    image: slide3,
    titleKey: 'Exclusive Health Packages & Special Discounts',
    descKey: 'Save with comprehensive checkup packages and discount cards tailored to you and your family with the highest standards of care.',
  },
];

const nextSlide = () => {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++;
  } else {
    goToLogin();
  }
};

const goToLogin = () => {
  router.push('/auth/login');
};

// Touch swipe gestures
let touchStartX = 0;

const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
};

const onTouchEnd = (e: TouchEvent) => {
  const touchEndX = e.changedTouches[0].clientX;
  const diffX = touchEndX - touchStartX;

  if (Math.abs(diffX) > 40) {
    if (isRtl.value) {
      if (diffX < 0 && currentSlide.value > 0) currentSlide.value--;
      else if (diffX > 0 && currentSlide.value < slides.length - 1) currentSlide.value++;
    } else {
      if (diffX < 0 && currentSlide.value < slides.length - 1) currentSlide.value++;
      else if (diffX > 0 && currentSlide.value > 0) currentSlide.value--;
    }
  }
};
</script>

<style scoped lang="scss">
.onboarding-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 20;
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
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.15) 0%,
        rgba(0, 0, 0, 0.05) 30%,
        rgba(0, 0, 0, 0.40) 58%,
        rgba(0, 0, 0, 0.85) 78%,
        rgba(0, 0, 0, 0.98) 92%,
        #000000 100%
      );
    }
  }
}

// Bottom Card Content
.onboarding-bottom-card {
  position: relative;
  z-index: 10;
  padding: 0 20px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 18px;

  .slide-text-block {
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .slide-title {
      color: #ffffff;
      font-size: 1.55rem;
      font-weight: 700;
      margin: 0 0 12px;
      line-height: 1.35;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
    }

    .slide-subtitle {
      color: rgba(255, 255, 255, 0.78);
      font-size: 0.90rem;
      font-weight: 400;
      line-height: 1.6;
      margin: 0 auto;
      max-width: 330px;
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
      background: #4b5563;
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
          color: #9ca3af;
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
