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

          <div class="card-controls" @click.stop>
            <button
              type="button"
              class="btn-action-icon btn-edit"
              :title="t('Edit')"
              :aria-label="t('Edit')"
              @click.stop="emit('edit', cat)"
            >
              <i class="pi pi-pencil"></i>
            </button>
          </div>
        </div>

        <!-- Bottom Row: Count Badge -->
        <div class="card-bottom-row">
          <span class="count-badge" @click="emit('select-category', cat)">
            <i class="pi pi-file"></i>
            <span>{{ cat.examinations_count ?? 0 }} {{ t('Services') }}</span>
          </span>
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
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

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

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

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
      .card-controls {
        display: flex;
        align-items: center;
        flex-shrink: 0;

        .btn-action-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1.5px solid #a7f3d0;
          background: #ecfdf5;
          color: #047857;
          padding: 0;

          i {
            font-size: 1.05rem;
            color: #047857;
          }

          &:hover {
            background: #d1fae5;
            border-color: #6ee7b7;
            color: #065f46;
            transform: translateY(-1px);

            i {
              color: #065f46;
            }
          }

          &:active {
            transform: scale(0.96);
          }
        }
      }
    }

    .card-bottom-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
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
