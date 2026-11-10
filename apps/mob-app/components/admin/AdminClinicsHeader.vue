<template>
  <div class="admin-clinics-header">
    <!-- 1. Top Supervisor Bar (Unified) -->
    <AdminTopHeader 
      :title="activeTab === 'clinics' ? t('Clinics Management') : t('Examinations Management')"
      :subtitle="t('Unity Clinics • Admin Portal')"
      :icon="activeTab === 'clinics' ? 'pi pi-building' : 'pi pi-file-edit'"
    />

    <!-- 2. Dual Mode Selector Tabs (Clinics vs Examinations) -->
    <div class="clinics-mode-tabs">
      <button 
        type="button" 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'clinics' }"
        @click="emit('tab-change', 'clinics')"
      >
        <svg viewBox="0 0 24 24" class="tab-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/>
          <path d="M9 21v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
          <path d="M10 8h4"/>
          <path d="M12 6v4"/>
        </svg>
        <span>{{ t('Clinics') }}</span>
        <span class="count-pill">{{ clinicsCount }}</span>
      </button>

      <button 
        type="button" 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'services' }"
        @click="emit('tab-change', 'services')"
      >
        <svg viewBox="0 0 24 24" class="tab-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 18h8"/>
          <path d="M3 22h18"/>
          <path d="M14 22a7 7 0 1 0 0-14h-1"/>
          <path d="M9 14h2"/>
          <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/>
          <path d="M12 6V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/>
        </svg>
        <span>{{ t('Examinations') }}</span>
        <span class="count-pill">{{ examinationsCount }}</span>
      </button>
    </div>

    <!-- 3. Page Title & Action Row -->
    <div class="page-title-row">
      <div v-if="activeTab === 'clinics'" class="title-wrap">
        <h3>{{ t('Clinics') }}</h3>
        <p>{{ t('Capacity, rooms & active staff') }}</p>
      </div>
      <div v-else class="title-wrap">
        <h3>{{ t('Medical Examinations & Tests') }}</h3>
        <p>{{ t('Pricing, durations & availability') }}</p>
      </div>

      <button 
        v-if="activeTab === 'clinics'" 
        type="button"
        class="btn-new-item" 
        @click="emit('new-clinic')"
      >
        <i class="pi pi-plus"></i>
        <span>{{ t('New Clinic') }}</span>
      </button>
      <button 
        v-else 
        type="button"
        class="btn-new-item" 
        @click="emit('new-examination')"
      >
        <i class="pi pi-plus"></i>
        <span>{{ t('New Examination') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';
import AdminTopHeader from './AdminTopHeader.vue';

const props = withDefaults(
  defineProps<{
    activeTab?: 'clinics' | 'services';
    clinicsCount?: number;
    examinationsCount?: number;
  }>(),
  {
    activeTab: 'clinics',
    clinicsCount: 0,
    examinationsCount: 0,
  }
);

const emit = defineEmits<{
  (e: 'tab-change', tab: 'clinics' | 'services'): void;
  (e: 'new-clinic'): void;
  (e: 'new-examination'): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-clinics-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  .clinics-mode-tabs {
    display: flex;
    gap: 8px;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    padding: 6px;
    border-radius: 18px;
    width: 100%;

    .tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 14px;
      border: none;
      background: transparent;
      color: var(--unity-text-muted);
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s ease;

      .tab-svg {
        width: 18px;
        height: 18px;
      }

      .count-pill {
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-muted);
        font-size: 0.68rem;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 12px;
      }

      &.active {
        background: var(--unity-primary);
        color: #fff;
        box-shadow: 0 4px 12px rgba(4, 120, 87, 0.2);

        .count-pill {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.3);
          color: #fff;
        }
      }
    }
  }

  .page-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: right;

    .title-wrap {
      h3 {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--unity-text-main);
        margin: 0;
      }

      p {
        font-size: 0.75rem;
        color: var(--unity-text-muted);
        margin: 2px 0 0;
      }
    }

    .btn-new-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--unity-primary);
      color: #fff;
      border: none;
      padding: 9px 16px;
      border-radius: 14px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);
      transition: all 0.2s;

      &:hover {
        background: var(--unity-primary-dark);
      }
    }
  }
}
</style>

