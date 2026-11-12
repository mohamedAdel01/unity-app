<template>
  <header class="admin-promotions-header">
    <div class="top-row">
      <NuxtLink to="/admin" class="back-btn" :aria-label="t('Back')">
        <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
      </NuxtLink>
      <div class="title-group">
        <h2>{{ t('Offers & Promocodes') }}</h2>
        <span class="sub-label">{{ t('Manage deals, discounts & coupons') }}</span>
      </div>
      <button 
        type="button" 
        class="create-btn" 
        @click="activeTab === 'offers' ? emit('open-new-offer') : emit('open-new-promocode')"
      >
        <i class="pi pi-plus"></i>
        <span>{{ activeTab === 'offers' ? t('Add New Offer') : t('Add New Promocode') }}</span>
      </button>
    </div>

    <!-- Segmented Tab Switcher -->
    <div class="segmented-control">
      <button
        type="button"
        class="segment-pill"
        :class="{ 'active': activeTab === 'offers' }"
        @click="emit('update:active-tab', 'offers')"
      >
        <i class="pi pi-gift"></i>
        <span>{{ t('Special Offers') }}</span>
      </button>
      <button
        type="button"
        class="segment-pill"
        :class="{ 'active': activeTab === 'promocodes' }"
        @click="emit('update:active-tab', 'promocodes')"
      >
        <i class="pi pi-percentage"></i>
        <span>{{ t('Promocodes') }}</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

defineProps<{
  activeTab: 'offers' | 'promocodes';
}>();

const emit = defineEmits<{
  (e: 'update:active-tab', tab: 'offers' | 'promocodes'): void;
  (e: 'open-new-offer'): void;
  (e: 'open-new-promocode'): void;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-promotions-header {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 6px;

  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    .back-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      flex-shrink: 0;
      transition: all 0.2s ease;

      &:hover {
        background: var(--unity-border-light);
      }
    }

    .title-group {
      flex: 1;
      min-width: 0;

      h2 {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--unity-text-main);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .sub-label {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
        display: block;
        margin-top: 1px;
      }
    }

    .create-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 38px;
      padding: 0 14px;
      border-radius: 12px;
      background: var(--unity-primary);
      color: #fff;
      border: none;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(18, 93, 73, 0.2);
      transition: all 0.2s ease;

      &:hover {
        background: var(--unity-primary-dark);
        transform: translateY(-1px);
      }
    }
  }

  .segmented-control {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    border-radius: 14px;
    padding: 3px;
    gap: 4px;

    .segment-pill {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 38px;
      border: none;
      background: transparent;
      border-radius: 11px;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--unity-text-muted);
      cursor: pointer;
      transition: all 0.2s ease;

      &.active {
        background: var(--unity-surface);
        color: var(--unity-primary);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }
    }
  }
}
</style>

