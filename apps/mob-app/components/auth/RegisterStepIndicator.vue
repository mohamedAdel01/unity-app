<template>
  <div class="step-progress-header">
    <div class="step-indicator-row">
      <!-- Step 1 Badge -->
      <div class="step-badge" :class="{ 'active': currentStep === 1, 'completed': currentStep > 1 }">
        <i v-if="currentStep > 1" class="pi pi-check"></i>
        <span v-else>1</span>
      </div>
      <div class="step-connector" :class="{ 'active': currentStep >= 2 }"></div>
      
      <!-- Step 2 Badge -->
      <div class="step-badge" :class="{ 'active': currentStep === 2, 'completed': currentStep > 2 }">
        <i v-if="currentStep > 2" class="pi pi-check"></i>
        <span v-else>2</span>
      </div>
      <div class="step-connector" :class="{ 'active': currentStep >= 3 }"></div>
      
      <!-- Step 3 Badge -->
      <div class="step-badge" :class="{ 'active': currentStep === 3 }">
        <span>3</span>
      </div>
    </div>

    <div class="step-labels">
      <span class="step-title">
        {{ currentStepText }} • {{ currentStepSubTitle }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed } from 'vue';
import { useI18n } from '../../composables/useI18n';

const props = withDefaults(
  defineProps<{
    currentStep: number;
  }>(),
  {
    currentStep: 1,
  }
);

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const currentStepText = computed(() => {
  if (props.currentStep === 1) return t('Step 1 of 3');
  if (props.currentStep === 2) return t('Step 2 of 3');
  return t('Step 3 of 3');
});

const currentStepSubTitle = computed(() => {
  if (props.currentStep === 1) return t('Account Information');
  if (props.currentStep === 2) return t('Mobile Verification');
  return t('Personal Details');
});

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.step-progress-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--unity-border);

  .step-indicator-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 190px;
  }

  .step-badge {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    background: var(--unity-surface-muted);
    color: var(--unity-text-muted);
    transition: all 0.25s ease;
    flex-shrink: 0;

    &.active {
      background: var(--unity-primary);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(var(--unity-primary-rgb), 0.35);
    }

    &.completed {
      background: var(--unity-accent);
      color: #ffffff;
    }
  }

  .step-connector {
    flex: 1;
    height: 3px;
    background: var(--unity-surface-muted);
    border-radius: 2px;
    transition: all 0.25s ease;

    &.active {
      background: var(--unity-accent);
    }
  }

  .step-labels {
    .step-title {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--unity-primary);
    }
  }
}
</style>
