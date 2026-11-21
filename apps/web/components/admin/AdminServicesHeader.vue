<template>
  <div class="admin-services-header">
    <!-- 1. Top Header with Short Title & Add Button -->
    <AdminTopHeader
      :title="selectedCategoryId ? t('Services') : t('Categories')"
      :icon="selectedCategoryId ? 'pi pi-file-edit' : 'pi pi-folder'"
      :action-text="selectedCategoryId ? t('New Examination') : t('New Category')"
      action-icon="pi pi-plus"
      :show-back="Boolean(selectedCategoryId)"
      :back-text="t('Return')"
      @action="handleTopAction"
      @back="emit('back-to-categories')"
    />

    <!-- 2. Search Bar -->
    <div class="search-input-box">
      <i class="pi pi-search search-icon"></i>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="selectedCategoryId ? t('Search examinations...') : t('Search category name...')"
        @input="onSearchInput"
      />
      <button v-if="searchQuery" type="button" class="clear-search-btn" @click="clearSearch">
        <i class="pi pi-times"></i>
      </button>
    </div>

    <!-- 3. Filter Pills - Only shown when in services view -->
    <div v-if="selectedCategoryId" class="filter-pills-row">
      <div class="pills-scroll-container">
        <button
          v-for="pill in categoryFilters"
          :key="pill.key"
          type="button"
          class="filter-pill"
          :class="{ 'active': activeCategory === pill.key }"
          @click="selectCategory(pill.key)"
        >
          <span>{{ pill.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';
import AdminTopHeader from './AdminTopHeader.vue';

interface CategoryOption {
  id: string | number;
  name?: string;
  name_ar?: string;
  name_en?: string;
  examinations_count?: number;
}

const props = withDefaults(
  defineProps<{
    selectedCategoryId?: string | number;
    selectedCategoryName?: string;
    servicesCount?: number;
    categoriesCount?: number;
    categories?: CategoryOption[];
    activeFilter?: string;
    totalCount?: number;
  }>(),
  {
    selectedCategoryId: '',
    selectedCategoryName: '',
    servicesCount: 0,
    categoriesCount: 0,
    categories: () => [],
    activeFilter: 'all',
    totalCount: 0,
  }
);

const emit = defineEmits<{
  (e: 'search', q: string): void;
  (e: 'filter', key: string): void;
  (e: 'back-to-categories'): void;
  (e: 'new-examination'): void;
  (e: 'new-category'): void;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)
const searchQuery = ref('');
const activeCategory = ref(props.activeFilter || 'all');
let debounceTimer: any = null;

// 3. Computed (computed properties)
const categoryFilters = computed(() => {
  const list = [
    { key: 'all', label: `${t('All')} (${props.servicesCount})` },
  ];

  if (props.categories && props.categories.length > 0) {
    props.categories.forEach((c) => {
      const name = isRtl.value ? (c.name_ar || c.name || '') : (c.name_en || c.name || '');
      const countStr = c.examinations_count !== undefined ? ` (${c.examinations_count})` : '';
      list.push({
        key: String(c.id),
        label: `${name}${countStr}`,
      });
    });
  }

  return list;
});

// 4. Methods (functions, handlers)
const handleTopAction = () => {
  if (props.selectedCategoryId) {
    emit('new-examination');
  } else {
    emit('new-category');
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

const selectCategory = (key: string) => {
  activeCategory.value = key;
  emit('filter', key);
};

// 5. Watches (watch, watchEffect)
watch(() => props.activeFilter, (newVal) => {
  if (newVal) {
    activeCategory.value = newVal;
  }
});

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-services-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

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
        color: #ef4444;
      }
    }
  }

  .filter-pills-row {
    display: flex;
    align-items: center;
    width: 100%;

    .pills-scroll-container {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 2px;

      &::-webkit-scrollbar {
        display: none;
      }

      .filter-pill {
        white-space: nowrap;
        height: 28px;
        padding: 0 11px;
        border-radius: 9999px;
        background: var(--unity-surface);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-muted);
        font-size: 0.74rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        flex-shrink: 0;

        &:hover {
          border-color: var(--unity-primary);
          color: var(--unity-primary);
        }

        &.active {
          background: var(--unity-primary);
          color: #ffffff;
          border-color: var(--unity-primary);
          font-weight: 700;
        }
      }
    }
  }
}
</style>
