<template>
  <div class="admin-examinations-list">
    <!-- Pure Categories Filter Bar (Filter Only) -->
    <div v-if="uniqueCategories.length > 0" class="categories-filter-bar">
      <div class="chips-scroll">
        <!-- 1. All Categories Chip -->
        <button
          type="button"
          class="category-chip"
          :class="{ 'active': !selectedCategoryId }"
          @click="onSelectCategory('')"
        >
          <i class="pi pi-th-large"></i>
          <span>{{ t('All Categories') }}</span>
          <span class="chip-count">{{ examinations.length }}</span>
        </button>

        <!-- 2. Dynamic Categories Chips (Filter Only) -->
        <button
          v-for="cat in uniqueCategories"
          :key="cat.id"
          type="button"
          class="category-chip"
          :class="{ 'active': String(selectedCategoryId) === String(cat.id) }"
          @click="onSelectCategory(cat.id)"
        >
          <span>{{ getCategoryDisplayName(cat) }}</span>
          <span v-if="cat.examinations_count !== undefined" class="chip-count">{{ cat.examinations_count }}</span>
        </button>
      </div>
    </div>

    <!-- Examination Virtual List (10 by 10) -->
    <AppVirtualList
      :items="filteredExaminations"
      :has-more="hasMore"
      :loading="loading"
      :page-size="10"
      @load-more="emit('load-more')"
    >
      <template #item="{ item }">
        <AdminExaminationCard
          :examination="item"
          @toggle-status="emit('toggle-status', $event)"
          @edit="emit('edit', $event)"
        />
      </template>

      <template #empty>
        <div class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 18h8"/>
            <path d="M3 22h18"/>
            <path d="M14 22a7 7 0 1 0 0-14h-1"/>
            <path d="M9 14h2"/>
            <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/>
            <path d="M12 6V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/>
          </svg>
          <h5>{{ t('No medical examinations registered yet') }}</h5>
          <p>{{ t('Add medical examinations to enable appointments and patient bookings.') }}</p>
        </div>
      </template>
    </AppVirtualList>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';
import AdminExaminationCard from './AdminExaminationCard.vue';
import AppVirtualList from '../common/AppVirtualList.vue';

interface Examination {
  id: string | number;
  name: string;
  name_ar?: string;
  name_en?: string;
  price: number;
  duration?: number;
  description?: string | null;
  category_id?: string | number | null;
  category?: any;
  is_active: boolean;
}

const props = withDefaults(
  defineProps<{
    examinations?: Examination[];
    categories?: any[];
    searchQuery?: string;
    hasMore?: boolean;
    loading?: boolean;
    activeCategoryId?: string | number;
  }>(),
  {
    examinations: () => [],
    categories: () => [],
    searchQuery: '',
    hasMore: false,
    loading: false,
    activeCategoryId: '',
  }
);

const emit = defineEmits<{
  (e: 'toggle-status', examination: Examination): void;
  (e: 'edit', examination: Examination): void;
  (e: 'load-more'): void;
  (e: 'category-change', categoryId: string | number): void;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)
const selectedCategoryId = ref<string | number>('');

// 3. Computed (computed properties)
const uniqueCategories = computed(() => {
  const seen = new Set();
  return props.categories.filter((cat: any) => {
    if (!cat || !cat.id) return false;
    if (seen.has(cat.id)) return false;
    seen.add(cat.id);
    return true;
  });
});

const filteredExaminations = computed(() => {
  let list = props.examinations;

  if (selectedCategoryId.value) {
    list = list.filter((e: any) => String(e.category_id || e.category?.id) === String(selectedCategoryId.value));
  }

  if (props.searchQuery) {
    const q = props.searchQuery.toLowerCase();
    list = list.filter((e: any) => {
      const matchAr = e.name_ar?.toLowerCase().includes(q);
      const matchEn = e.name_en?.toLowerCase().includes(q);
      const matchName = e.name?.toLowerCase().includes(q);
      const matchDescAr = e.description_ar?.toLowerCase().includes(q);
      const matchDescEn = e.description_en?.toLowerCase().includes(q);
      return matchAr || matchEn || matchName || matchDescAr || matchDescEn;
    });
  }

  return list;
});

// 4. Methods (functions, handlers)
const getCategoryDisplayName = (cat: any) => {
  if (!cat) return '';
  const isAr = Boolean(isRtl?.value);
  if (isAr) {
    if (cat.name_ar && cat.name_ar.trim()) return cat.name_ar.trim();
    const raw = (cat.name || cat.name_en || '').trim();
    if (raw && t(raw) !== raw) return t(raw);
    const lower = raw.toLowerCase();
    if (lower === 'skin' || lower === 'dermatology') return 'جلدية';
    return raw;
  }
  if (cat.name_en && cat.name_en.trim()) return cat.name_en.trim();
  const raw = (cat.name || cat.name_ar || '').trim();
  const lower = raw.toLowerCase();
  if (lower === 'جلدية') return 'Dermatology';
  return raw;
};

const onSelectCategory = (id: string | number) => {
  if (selectedCategoryId.value === id) {
    selectedCategoryId.value = '';
    emit('category-change', '');
  } else {
    selectedCategoryId.value = id;
    emit('category-change', id);
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.activeCategoryId,
  (val) => {
    if (val !== undefined && val !== null) {
      selectedCategoryId.value = val;
    }
  },
  { immediate: true }
);

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-examinations-list {
  display: flex;
  flex-direction: column;
  width: 100%;

  .categories-filter-bar {
    margin-bottom: 8px;
    width: 100%;
    overflow: hidden;

    .chips-scroll {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      padding: 2px 2px 8px;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .category-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 38px;
      padding: 0 12px;
      border-radius: 12px;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      font-size: 0.80rem;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      i {
        font-size: 0.85rem;
      }

      .chip-count {
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-dim);
        font-size: 0.68rem;
        padding: 1px 6px;
        border-radius: 10px;
        font-weight: 800;
      }

      &:hover {
        border-color: var(--unity-primary);
        color: var(--unity-primary);
      }

      &.active {
        background: var(--unity-primary-light);
        border-color: var(--unity-primary);
        color: var(--unity-primary);

        .chip-count {
          background: var(--unity-primary);
          border-color: var(--unity-primary);
          color: #ffffff;
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 20px;
    background: var(--unity-surface);
    border: 1px dashed var(--unity-border);
    border-radius: 20px;
    color: var(--unity-text-muted);

    svg {
      width: 44px;
      height: 44px;
      color: var(--unity-text-dim);
      margin-bottom: 12px;
    }

    h5 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--unity-text-main);
      margin: 0 0 6px;
    }

    p {
      font-size: 0.78rem;
      max-width: 280px;
      margin: 0;
      line-height: 1.4;
    }
  }
}
</style>
