<template>
  <div class="page-top-header">
    <button class="back-btn" :aria-label="t('Back')" @click="handleBack">
      <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
    </button>
    <h3 class="page-title">{{ pageTitle }}</h3>
    <div class="placeholder-spacer" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

const router = useRouter();
const route = useRoute();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const pageTitle = computed(() => {
  if (route.query.tab === 'services') {
    return t('Medical Services');
  }
  return t('Clinics & Doctors');
});

// 4. Methods (functions, handlers)
const handleBack = () => {
  if (route.query.clinic_id || route.query.category_id) {
    router.replace({ query: { ...route.query, clinic_id: undefined, category_id: undefined } });
  } else {
    router.back();
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.page-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .back-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-main);
    cursor: pointer;
  }

  .page-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--unity-text-main);
  }

  .placeholder-spacer {
    width: 36px;
    height: 36px;
  }
}
</style>
