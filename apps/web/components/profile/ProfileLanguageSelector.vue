<template>
  <div class="settings-card">
    <div class="settings-head">
      <div class="head-icon icon-cyan"><i class="pi pi-globe"></i></div>
      <div class="head-text">
        <h5>{{ t('Language') }}</h5>
        <small>{{ t('Switch between Arabic and English') }}</small>
      </div>
    </div>

    <div class="lang-options-grid">
      <button 
        class="lang-opt-btn" 
        :class="{ 'selected': locale === 'ar' }"
        @click="setLocale('ar')"
      >
        <img src="/flags/sa.svg" alt="SA" class="flag-svg" />
        <span>{{ t('profile.langArabic', 'العربية (Arabic)') }}</span>
        <i v-if="locale === 'ar'" class="pi pi-check check-mark"></i>
      </button>

      <button 
        class="lang-opt-btn" 
        :class="{ 'selected': locale === 'en' }"
        @click="setLocale('en')"
      >
        <img src="/flags/gb.svg" alt="GB" class="flag-svg" />
        <span>{{ t('profile.langEnglish', 'English (English)') }}</span>
        <i v-if="locale === 'en'" class="pi pi-check check-mark"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

const { t, locale, setLocale } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.settings-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--unity-shadow-subtle);

  .settings-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;

    .head-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;

      &.icon-cyan { background: #f0fdfa; color: #0d9488; }
    }

    .head-text {
      h5 {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--unity-text-main);
      }
      small {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
      }
    }
  }
}

.lang-options-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .lang-opt-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    background: var(--unity-bg);
    border: 1.5px solid var(--unity-border);
    color: var(--unity-text-main);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    .flag-svg {
      width: 24px;
      height: 16px;
      object-fit: cover;
      border-radius: 3px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      flex-shrink: 0;
    }

    .check-mark {
      margin-inline-start: auto;
      color: var(--unity-primary);
      font-weight: 800;
    }

    &.selected {
      border-color: var(--unity-primary);
      background: var(--unity-primary-light);
      color: var(--unity-primary-dark);
    }
  }
}
</style>
