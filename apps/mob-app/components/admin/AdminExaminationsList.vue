<template>
  <div class="admin-examinations-list">
    <!-- Categories Filter & Management Bar -->
    <div class="categories-filter-bar">
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

        <!-- 2. Dynamic Categories -->
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

          <!-- Inline Actions for Active Chip -->
          <span v-if="String(selectedCategoryId) === String(cat.id)" class="chip-inline-actions">
            <span
              class="chip-action-btn edit"
              :title="t('Edit Category')"
              @click.stop="emit('edit-category', cat)"
            >
              <i class="pi pi-pencil"></i>
            </span>
            <span
              class="chip-action-btn delete"
              :title="t('Delete Category')"
              @click.stop="confirmDeleteCategory(cat)"
            >
              <i class="pi pi-trash"></i>
            </span>
          </span>
        </button>

        <!-- 3. Add Category Button -->
        <button
          type="button"
          class="category-chip btn-add-cat"
          :title="t('Add Examination Category')"
          @click="emit('new-category')"
        >
          <i class="pi pi-plus"></i>
          <span>{{ t('New Category') }}</span>
        </button>
      </div>
    </div>

    <!-- Active Category Banner Strip (Category Management Details) -->
    <div v-if="selectedCategory" class="selected-category-strip">
      <div class="strip-info">
        <i class="pi pi-tag"></i>
        <div class="strip-names">
          <strong class="name">{{ getCategoryDisplayName(selectedCategory) }}</strong>
          <span class="count">{{ selectedCategory.examinations_count ?? filteredExaminations.length }} {{ t('Examinations') }}</span>
        </div>
      </div>
      <div class="strip-actions">
        <button
          type="button"
          class="strip-btn edit"
          @click="emit('edit-category', selectedCategory)"
        >
          <i class="pi pi-pencil"></i>
          <span>{{ t('Edit Category') }}</span>
        </button>
        <button
          type="button"
          class="strip-btn delete"
          @click="confirmDeleteCategory(selectedCategory)"
        >
          <i class="pi pi-trash"></i>
          <span>{{ t('Delete Category') }}</span>
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

    <!-- Delete Category Confirmation Modal Dialog -->
    <Teleport to="body">
      <div v-if="categoryToDelete" class="cat-delete-overlay" @click="categoryToDelete = null">
        <div class="cat-delete-dialog" @click.stop>
          <div class="dialog-icon">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <h4>{{ t('Delete Category') }}</h4>
          <p>
            {{ t('Are you sure you want to delete this category?') }}
            <br />
            <strong>{{ getCategoryDisplayName(categoryToDelete) }}</strong>
          </p>
          <div class="dialog-actions">
            <button type="button" class="btn-dialog-cancel" @click="categoryToDelete = null">
              {{ t('Cancel') }}
            </button>
            <button type="button" class="btn-dialog-delete" :disabled="deleting" @click="executeDeleteCategory">
              <i v-if="deleting" class="pi pi-spin pi-spinner"></i>
              <span v-else>{{ t('Delete') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
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
  }>(),
  {
    examinations: () => [],
    categories: () => [],
    searchQuery: '',
    hasMore: false,
    loading: false,
  }
);

const emit = defineEmits<{
  (e: 'toggle-status', examination: Examination): void;
  (e: 'edit', examination: Examination): void;
  (e: 'load-more'): void;
  (e: 'new-category'): void;
  (e: 'edit-category', category: any): void;
  (e: 'category-change', categoryId: string | number): void;
  (e: 'category-deleted', categoryId: string | number): void;
}>();

const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const selectedCategoryId = ref<string | number>('');
const categoryToDelete = ref<any | null>(null);
const deleting = ref(false);

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

const selectedCategory = computed(() => {
  if (!selectedCategoryId.value) return null;
  return uniqueCategories.value.find((c: any) => String(c.id) === String(selectedCategoryId.value)) || null;
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

const confirmDeleteCategory = (cat: any) => {
  categoryToDelete.value = cat;
};

const executeDeleteCategory = async () => {
  if (!categoryToDelete.value || deleting.value) return;
  const cat = categoryToDelete.value;
  try {
    deleting.value = true;
    await api.apiRequest({
      service: 'ADMIN_DELETE_EXAMINATION_CATEGORY',
      payload: { id: cat.id },
    });

    toast.show({
      title: t('Category deleted successfully!'),
      type: 'success',
    });

    if (String(selectedCategoryId.value) === String(cat.id)) {
      selectedCategoryId.value = '';
    }

    emit('category-deleted', cat.id);
    categoryToDelete.value = null;
  } catch (err: any) {
    toast.show({
      title: err?.message || t('Failed to delete category'),
      type: 'error',
    });
  } finally {
    deleting.value = false;
  }
};

// 5. Watches (watch, watchEffect)

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

      .chip-inline-actions {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-inline-start: 4px;

        .chip-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 6px;
          font-size: 0.70rem;
          transition: background 0.15s;

          &.edit {
            background: rgba(4, 120, 87, 0.12);
            color: var(--unity-primary);

            &:hover {
              background: var(--unity-primary);
              color: #ffffff;
            }
          }

          &.delete {
            background: rgba(239, 68, 68, 0.12);
            color: #ef4444;

            &:hover {
              background: #ef4444;
              color: #ffffff;
            }
          }
        }
      }

      &.btn-add-cat {
        background: transparent;
        border: 1.5px dashed var(--unity-primary);
        color: var(--unity-primary);

        &:hover {
          background: var(--unity-primary-light);
        }
      }
    }
  }

  .selected-category-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 12px;
    margin-bottom: 12px;
    background: var(--unity-surface);
    border: 1px solid var(--unity-primary-light, rgba(4, 120, 87, 0.2));
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);

    .strip-info {
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        font-size: 0.90rem;
        color: var(--unity-primary);
      }

      .strip-names {
        display: flex;
        align-items: baseline;
        gap: 6px;

        .name {
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--unity-text-main);
        }

        .count {
          font-size: 0.70rem;
          color: var(--unity-text-dim);
        }
      }
    }

    .strip-actions {
      display: flex;
      align-items: center;
      gap: 6px;

      .strip-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 0.74rem;
        font-weight: 700;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.15s;

        &.edit {
          background: var(--unity-bg);
          border-color: var(--unity-border);
          color: var(--unity-text-main);

          &:hover {
            border-color: var(--unity-primary);
            color: var(--unity-primary);
          }
        }

        &.delete {
          background: #fee2e2;
          border-color: #fecaca;
          color: #ef4444;

          &:hover {
            background: #ef4444;
            color: #ffffff;
          }
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

.cat-delete-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  .cat-delete-dialog {
    width: 100%;
    max-width: 360px;
    background: var(--unity-surface);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    .dialog-icon {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #fee2e2;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      margin-bottom: 12px;
    }

    h4 {
      margin: 0 0 8px;
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    p {
      margin: 0 0 20px;
      font-size: 0.84rem;
      color: var(--unity-text-muted);
      line-height: 1.5;

      strong {
        color: var(--unity-text-main);
      }
    }

    .dialog-actions {
      display: flex;
      gap: 10px;
      width: 100%;

      button {
        flex: 1;
        height: 44px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.86rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .btn-dialog-cancel {
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        color: var(--unity-text-muted);

        &:hover {
          background: var(--unity-border);
          color: var(--unity-text-main);
        }
      }

      .btn-dialog-delete {
        background: #ef4444;
        border: none;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);

        &:hover:not(:disabled) {
          background: #dc2626;
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
