<template>
  <div class="settings-card">
    <div class="settings-head">
      <div class="head-icon icon-emerald"><i class="pi pi-palette"></i></div>
      <div class="head-text">
        <h5>{{ t('profile.themeTitle') }}</h5>
        <small>{{ t('profile.themeSub') }}</small>
      </div>
    </div>

    <div class="theme-options-grid">
      <button 
        class="theme-opt-btn opt-emerald" 
        :class="{ 'selected': theme.currentTheme.value === 'emerald' }"
        @click="theme.applyTheme('emerald')"
      >
        <span class="color-circle bg-emerald"></span>
        <span>{{ t('profile.themeEmerald') }}</span>
      </button>

      <button 
        class="theme-opt-btn opt-teal" 
        :class="{ 'selected': theme.currentTheme.value === 'teal' }"
        @click="theme.applyTheme('teal')"
      >
        <span class="color-circle bg-teal"></span>
        <span>{{ t('profile.themeTeal') }}</span>
      </button>

      <button 
        class="theme-opt-btn opt-dark" 
        :class="{ 'selected': theme.currentTheme.value === 'dark' }"
        @click="theme.applyTheme('dark')"
      >
        <span class="color-circle bg-dark"></span>
        <span>{{ t('profile.themeDark') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../../composables/useTheme';
import { useI18n } from '../../composables/useI18n';

const theme = useTheme();
const { t } = useI18n();
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

      &.icon-emerald { background: #ecfdf5; color: #047857; }
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

.theme-options-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .theme-opt-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 14px;
    background: var(--unity-bg);
    border: 1.5px solid var(--unity-border);
    color: var(--unity-text-main);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    .color-circle {
      width: 16px;
      height: 16px;
      border-radius: 50%;

      &.bg-emerald { background: #047857; }
      &.bg-teal { background: #0f766e; }
      &.bg-dark { background: #111827; border: 1px solid #4b5563; }
    }

    &.selected {
      border-color: var(--unity-primary);
      background: var(--unity-primary-light);
      color: var(--unity-primary-dark);
    }
  }
}
</style>

