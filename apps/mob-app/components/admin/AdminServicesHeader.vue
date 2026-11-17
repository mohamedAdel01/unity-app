<template>
  <div class="admin-services-header">
    <!-- 1. Top Header with Short Title & Add Button -->
    <AdminTopHeader
      :title="activeTab === 'categories' ? t('Categories') : t('Services')"
      :icon="activeTab === 'categories' ? 'pi pi-folder' : 'pi pi-file-edit'"
      :action-text="activeTab === 'categories' ? t('New Category') : t('New Examination')"
      action-icon="pi pi-plus"
      @action="handleTopAction"
    />

    <!-- 2. Dual Mode Selector Tabs (Categories vs Services) -->
    <div class="services-categories-tabs">
      <button
        type="button"
        class="tab-btn"
        :class="{ 'active': activeTab === 'categories' }"
        @click="emit('tab-change', 'categories')"
      >
        <i class="pi pi-folder tab-icon"></i>
        <span>{{ t('Categories') }}</span>
        <span class="count-pill">({{ categoriesCount }})</span>
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
        <span>{{ t('Services') }}</span>
        <span class="count-pill">({{ totalCount }})</span>
      </button>
    </div>

    <!-- 3. Search Bar (when in Services mode) -->
    <div v-if="activeTab === 'services'" class="search-input-box">
      <i class="pi pi-search search-icon"></i>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('Search examinations...')"
        @input="onSearchInput"
      />
      <button v-if="searchQuery" type="button" class="clear-search-btn" @click="clearSearch">
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';
import AdminTopHeader from './AdminTopHeader.vue';

const props = withDefaults(
  defineProps<{
    activeTab?: 'services' | 'categories';
    totalCount?: number;
    categoriesCount?: number;
  }>(),
  {
    activeTab: 'services',
    totalCount: 0,
    categoriesCount: 0,
  }
);

const emit = defineEmits<{
  (e: 'tab-change', tab: 'services' | 'categories'): void;
  (e: 'search', q: string): void;
  (e: 'new-examination'): void;
  (e: 'new-category'): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)
const searchQuery = ref('');
let debounceTimer: any = null;

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const handleTopAction = () => {
  if (props.activeTab === 'categories') {
    emit('new-category');
  } else {
    emit('new-examination');
  }
};

const onSearchInput = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    emit('search', searchQuery.value.trim());
  }, 250);
};

const clearSearch = () => {
  searchQuery.value = '';
  emit('search', '');
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-services-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  .services-categories-tabs {
    display: flex;
    gap: 10px;
    width: 100%;

    .tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 42px;
      border: 1px solid var(--unity-border);
      background: var(--unity-surface);
      border-radius: 12px;
      font-size: 0.86rem;
      font-weight: 700;
      color: var(--unity-text-main);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      .tab-svg, .tab-icon {
        width: 17px;
        height: 17px;
        font-size: 0.95rem;
        color: var(--unity-text-muted);
      }

      .count-pill {
        background: transparent;
        border: none;
        color: var(--unity-text-dim);
        font-size: 0.78rem;
        font-weight: 600;
        opacity: 0.8;
        padding: 0;
      }

      &:hover {
        border-color: var(--unity-primary-light, #a7f3d0);
      }

      &.active {
        background: var(--unity-primary-light, #ecfdf5);
        border: 1.5px solid var(--unity-primary);
        color: var(--unity-primary);

        .tab-svg, .tab-icon {
          color: var(--unity-primary);
        }

        .count-pill {
          color: var(--unity-primary);
          opacity: 0.9;
        }
      }
    }
  }

  .title-action-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    border-radius: 16px;
    box-shadow: var(--unity-card-shadow, 0 2px 8px rgba(0, 0, 0, 0.04));

    .title-texts {
      h3 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      p {
        margin: 2px 0 0;
        font-size: 0.74rem;
        color: var(--unity-text-muted);
      }
    }

    .btn-new-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 14px;
      height: 38px;
      background: var(--unity-primary);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(4, 120, 87, 0.25);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      flex-shrink: 0;

      &:hover {
        background: var(--unity-primary-dark);
        transform: translateY(-1px);
      }

      &:active {
        transform: scale(0.98);
      }

      i {
        font-size: 0.85rem;
      }
    }
  }

  .search-input-box {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;

    .search-icon {
      position: absolute;
      inset-inline-start: 14px;
      color: var(--unity-text-dim);
      font-size: 0.90rem;
      pointer-events: none;
    }

    input {
      width: 100%;
      height: 44px;
      padding: 0 38px;
      border: 1.5px solid var(--unity-border);
      border-radius: 12px;
      background: var(--unity-surface);
      color: var(--unity-text-main);
      font-size: 0.86rem;
      outline: none;
      transition: all 0.2s;

      &::placeholder {
        color: var(--unity-text-dim);
        font-size: 0.82rem;
      }

      &:focus {
        border-color: var(--unity-primary);
        box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
      }
    }

    .clear-search-btn {
      position: absolute;
      inset-inline-end: 10px;
      background: transparent;
      border: none;
      color: var(--unity-text-dim);
      font-size: 0.85rem;
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--unity-text-main);
      }
    }
  }
}
</style>
