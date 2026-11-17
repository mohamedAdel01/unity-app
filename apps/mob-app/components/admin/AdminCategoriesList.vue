<template>
  <div class="admin-categories-list">
    <div v-if="categories && categories.length > 0" class="categories-grid">
      <div v-for="cat in categories" :key="cat.id" class="category-card">
        <div class="card-main">
          <div class="category-icon-box">
            <i class="pi pi-folder"></i>
          </div>
          <div class="category-info">
            <div class="title-row">
              <h4 class="name-ar">{{ isRtl ? (cat.name_ar || cat.name) : (cat.name_en || cat.name || cat.name_ar) }}</h4>
            </div>
            <span v-if="!isRtl && cat.name_en" class="name-en" dir="ltr">{{ cat.name_en }}</span>
            <p v-if="cat.description_ar || cat.description" class="category-desc">
              {{ isRtl ? (cat.description_ar || cat.description) : (cat.description || cat.description_ar) }}
            </p>
          </div>
        </div>

        <!-- Bottom Row: Count Badge + Large Bottom Action Buttons -->
        <div class="card-bottom-row">
          <span class="count-badge" @click="emit('select-category', cat)">
            <i class="pi pi-file"></i>
            <span>{{ cat.examinations_count ?? 0 }} {{ t('Services') }}</span>
          </span>

          <div class="card-actions-cell">
            <button
              type="button"
              class="btn-action-icon btn-edit"
              :title="t('Edit')"
              :aria-label="t('Edit')"
              @click.stop="emit('edit', cat)"
            >
              <i class="pi pi-pencil"></i>
            </button>
            <button
              type="button"
              class="btn-action-icon btn-delete"
              :class="{ 'is-disabled': (cat.examinations_count ?? 0) > 0 }"
              :disabled="(cat.examinations_count ?? 0) > 0"
              :title="(cat.examinations_count ?? 0) > 0 ? t('Cannot delete category with linked services') : t('Delete')"
              :aria-label="(cat.examinations_count ?? 0) > 0 ? t('Cannot delete category with linked services') : t('Delete')"
              @click.stop="confirmDeleteCategory(cat)"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state-box">
      <div class="empty-icon"><i class="pi pi-folder-open"></i></div>
      <h4>{{ t('No categories registered yet') }}</h4>
      <p>{{ t('Add categories to group and organize medical examinations') }}</p>
      <button type="button" class="btn-new-empty" @click="emit('new-category')">
        <i class="pi pi-plus"></i>
        <span>{{ t('New Category') }}</span>
      </button>
    </div>

    <!-- Confirm Delete Category Modal -->
    <AppConfirmModal
      :is-open="!!categoryToDelete"
      :title="t('Delete Category')"
      :message="t('Are you sure you want to delete this category?')"
      :confirm-text="t('Delete')"
      :cancel-text="t('Cancel')"
      :loading="deleting"
      danger
      @close="categoryToDelete = null"
      @confirm="executeDeleteCategory"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AppConfirmModal from '../common/AppConfirmModal.vue';

interface Category {
  id: string | number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description?: string;
  description_ar?: string;
  examinations_count?: number;
}

const props = withDefaults(
  defineProps<{
    categories?: Category[];
    loading?: boolean;
  }>(),
  {
    categories: () => [],
    loading: false,
  }
);

const emit = defineEmits<{
  (e: 'edit', cat: Category): void;
  (e: 'deleted', id?: string | number): void;
  (e: 'new-category'): void;
  (e: 'select-category', cat: Category): void;
}>();

const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const categoryToDelete = ref<any | null>(null);
const deleting = ref(false);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const confirmDeleteCategory = (cat: any) => {
  if (cat.examinations_count && cat.examinations_count > 0) {
    toast.show({
      title: t('Cannot delete category with linked services'),
      type: 'warning',
    });
    return;
  }
  categoryToDelete.value = cat;
};

const executeDeleteCategory = async () => {
  if (!categoryToDelete.value || deleting.value) return;
  const cat = categoryToDelete.value;
  if (cat.examinations_count && cat.examinations_count > 0) {
    toast.show({
      title: t('Cannot delete category with linked services'),
      type: 'warning',
    });
    categoryToDelete.value = null;
    return;
  }
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
    categoryToDelete.value = null;
    emit('deleted', cat.id);
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
.admin-categories-list {
  display: flex;
  flex-direction: column;
  width: 100%;

  .categories-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .category-card {
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    border-radius: 16px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    transition: all 0.2s ease;

    .card-main {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      .category-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(4, 120, 87, 0.08);
        color: var(--unity-primary, #047857);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
        flex-shrink: 0;
      }

      .category-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;

        .title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;

          .name-ar {
            margin: 0;
            font-size: 0.94rem;
            font-weight: 800;
            color: var(--unity-text-main);
          }
        }

        .name-en {
          font-size: 0.74rem;
          color: #64748b;
          font-weight: 600;
        }

        .category-desc {
          margin: 4px 0 0;
          font-size: 0.75rem;
          color: var(--unity-text-muted);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }

    .card-bottom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
      border-top: 1px dashed var(--unity-border);

      .count-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #f1f5f9;
        color: #475569;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;

        i {
          font-size: 0.70rem;
          color: var(--unity-primary);
        }

        &:hover {
          background: rgba(4, 120, 87, 0.08);
          color: var(--unity-primary);
        }
      }

      .card-actions-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        .btn-action-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1.5px solid transparent;
          padding: 0;

          i {
            font-size: 1.15rem;
          }

          &.btn-edit {
            background: #ecfdf5;
            color: #047857;
            border-color: #a7f3d0;

            &:hover {
              background: #d1fae5;
              border-color: #6ee7b7;
              color: #065f46;
              transform: translateY(-1px);
            }
          }

          &.btn-delete {
            background: #fef2f2;
            color: #ef4444;
            border-color: #fee2e2;

            &:hover:not(:disabled) {
              background: #fee2e2;
              border-color: #fca5a5;
              transform: translateY(-1px);
            }

            &:disabled,
            &.is-disabled {
              opacity: 0.45;
              cursor: not-allowed;
              pointer-events: none;
              background: var(--unity-surface-muted, #f1f5f9);
              color: var(--unity-text-dim, #94a3b8);
              border-color: var(--unity-border, #e2e8f0);
            }
          }

          &:active {
            transform: scale(0.96);
          }
        }
      }
    }
  }

  .empty-state-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
    text-align: center;
    background: var(--unity-surface);
    border: 1.5px dashed var(--unity-border);
    border-radius: 20px;
    gap: 8px;

    .empty-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 4px;
    }

    h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    p {
      margin: 0;
      font-size: 0.78rem;
      color: var(--unity-text-muted);
      max-width: 280px;
      line-height: 1.4;
    }

    .btn-new-empty {
      margin-top: 8px;
      height: 40px;
      padding: 0 16px;
      background: var(--unity-primary);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 0.82rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.2);
    }
  }
}
</style>
