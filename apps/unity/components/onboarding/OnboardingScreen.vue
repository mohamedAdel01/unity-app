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

    <!-- Top Navigation Header -->
    <header class="onboarding-top-bar">
      <div class="brand-badge">
        <div class="brand-cube-icon">
          <i class="pi pi-shield"></i>
        </div>
        <span class="brand-name">{{ t('Unity Medical') }}</span>
      </div>

      <button type="button" class="skip-btn" @click="goToLogin">
        <span>{{ t('Skip') }}</span>
      </button>
    </header>

    <!-- Bottom Content Overlay (Cards, Dots, Buttons) -->
    <div class="onboarding-bottom-card">
      <!-- 3-Dot Pagination Indicator (Elongated active capsule) -->
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

      <!-- Slide Text Information (Animated on slide change) -->
      <transition name="slide-fade" mode="out-in">
        <div :key="currentSlide" class="slide-text-block">
          <h2 class="slide-title">{{ t(slides[currentSlide].titleKey) }}</h2>
          <p class="slide-subtitle">{{ t(slides[currentSlide].descKey) }}</p>
        </div>
      </transition>

      <!-- Bottom Action Button -->
      <div class="action-footer">
        <button 
          v-if="currentSlide < slides.length - 1" 
          type="button" 
          class="primary-action-btn"
          @click="nextSlide"
        >
          <span>{{ t('Next') }}</span>
        </button>

        <button 
          v-else 
          type="button" 
          class="primary-action-btn get-started-btn"
          @click="goToLogin"
        >
          <span>{{ t('Get Started') }}</span>
        </button>

        <!-- Secondary Login / Register Link -->
        <div class="auth-helper-row">
          <NuxtLink to="/auth/login" class="sub-link">
            <span>{{ t('Already have an account?') }} <strong>{{ t('Sign In') }}</strong></span>
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

const router = useRouter();
const { t, isRtl } = useI18n();

const currentSlide = ref(0);

// 3 High-Quality Cinematic Medical Backgrounds matching the mockup aesthetics
const slides = [
  {
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=900&auto=format&fit=crop&q=85',
    titleKey: 'Welcome to Unity Medical',
    descKey: 'Comprehensive healthcare for you and your family with top certified specialists.',
  },
  {
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900&auto=format&fit=crop&q=85',
    titleKey: 'Personalized Medical Care',
    descKey: 'Book instant consultations in-person or telehealth, tailored to your exact needs.',
  },
  {
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=900&auto=format&fit=crop&q=85',
    titleKey: 'Your Complete Health Records',
    descKey: 'Lab results, e-prescriptions, and medical reports available at your fingertips 24/7.',
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

// Touch swipe support
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
  justify-content: space-between;
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
    background-position: center top;
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
        rgba(0, 0, 0, 0.45) 0%,
        rgba(0, 0, 0, 0.15) 30%,
        rgba(0, 0, 0, 0.75) 65%,
        rgba(0, 0, 0, 0.96) 90%,
        #000000 100%
      );
    }
  }
}

// Top Bar
.onboarding-top-bar {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;

  .brand-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    padding: 6px 12px;
    border-radius: 999px;

    .brand-cube-icon {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: #0284c7;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
    }

    .brand-name {
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
  }

  .skip-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.75);
    font-size: 0.85rem;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #ffffff;
    }
  }
}

// Bottom Card Content
.onboarding-bottom-card {
  position: relative;
  z-index: 10;
  padding: 0 24px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 18px;

  // Dots
  .dots-indicator-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 4px;

    .dot-pill {
      height: 4px;
      width: 8px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.28);
      border: none;
      cursor: pointer;
      padding: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &.active {
        width: 24px;
        background: #ffffff;
        border-radius: 4px;
      }
    }
  }

  .slide-text-block {
    min-height: 110px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .slide-title {
      color: #ffffff;
      font-size: 1.55rem;
      font-weight: 700;
      margin: 0 0 10px;
      line-height: 1.3;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    .slide-subtitle {
      color: rgba(255, 255, 255, 0.72);
      font-size: 0.88rem;
      font-weight: 400;
      line-height: 1.55;
      margin: 0;
      max-width: 330px;
    }
  }

  .action-footer {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    margin-top: 6px;

    .primary-action-btn {
      width: 100%;
      height: 52px;
      border-radius: 14px;
      background: #0284c7; // Bright blue matching mockup button
      color: #ffffff;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(2, 132, 199, 0.45);
      transition: all 0.25s ease;

      &:hover {
        background: #0369a1;
        transform: translateY(-1px);
      }

      &:active {
        transform: scale(0.98);
      }
    }

    .auth-helper-row {
      .sub-link {
        color: rgba(255, 255, 255, 0.65);
        font-size: 0.82rem;
        text-decoration: none;
        transition: color 0.2s;

        strong {
          color: #ffffff;
          font-weight: 600;
        }

        &:hover {
          color: #ffffff;
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
