<template>
  <div class="admin-examinations-list">
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
            <h5>{{ selectedCategoryId ? t('No services in this category') : t('No medical examinations registered yet') }}</h5>
            <p>{{ selectedCategoryId ? t('Add services to this category or clear filter to view other services.') : t('Add medical examinations to enable appointments and patient bookings.') }}</p>
            <button
              v-if="selectedCategoryId"
              type="button"
              class="btn-empty-clear"
              @click="onSelectCategory('')"
            >
              <span>{{ t('Clear Filter') }}</span>
            </button>
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
  description_ar?: string | null;
  description_en?: string | null;
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
  (e: 'edit-category', category: any): void;
  (e: 'new-category'): void;
  (e: 'load-more'): void;
  (e: 'category-change', categoryId: string | number): void;
  (e: 'clear-category'): void;
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

const selectedCategory = computed(() => {
  if (!selectedCategoryId.value || selectedCategoryId.value === 'all') return null;
  return uniqueCategories.value.find((c: any) => String(c.id) === String(selectedCategoryId.value)) || null;
});

const selectedCategoryName = computed(() => {
  if (selectedCategoryId.value === 'all') return t('All Services');
  if (!selectedCategory.value) return '';
  return getCategoryDisplayName(selectedCategory.value);
});

const filteredExaminations = computed(() => {
  let list = props.examinations;

  if (selectedCategoryId.value && selectedCategoryId.value !== 'all') {
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

const getCategoryDisplayDesc = (cat: any) => {
  if (!cat) return '';
  const isAr = Boolean(isRtl?.value);
  if (isAr) {
    return cat.description_ar || cat.description || cat.description_en || '';
  }
  return cat.description_en || cat.description || cat.description_ar || '';
};

const getCategoryIcon = (cat: any) => {
  if (cat?.icon) return cat.icon;
  const name = ((cat?.name_ar || cat?.name || cat?.name_en || '') + '').toLowerCase();
  if (name.includes('جلد') || name.includes('derma') || name.includes('skin')) return 'pi pi-heart';
  if (name.includes('دم') || name.includes('تحاليل') || name.includes('blood') || name.includes('lab')) return 'pi pi-chart-line';
  if (name.includes('أشعة') || name.includes('xray') || name.includes('scan')) return 'pi pi-eye';
  if (name.includes('قلب') || name.includes('cardio')) return 'pi pi-heart-fill';
  if (name.includes('أسنان') || name.includes('dental')) return 'pi pi-star';
  return 'pi pi-folder';
};

const getCategoryServicesCount = (cat: any) => {
  if (typeof cat?.examinations_count === 'number' && cat.examinations_count >= 0) {
    return cat.examinations_count;
  }
  if (Array.isArray(cat?.examinations)) return cat.examinations.length;
  return props.examinations.filter((e: any) => String(e.category_id || e.category?.id) === String(cat?.id)).length;
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
  gap: 16px;
  width: 100%;

  /* 1. Categories Section */
  .categories-section {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .categories-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 0 2px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .sec-title {
          margin: 0;
          font-size: 0.94rem;
          font-weight: 800;
          color: var(--unity-text-main);
          display: flex;
          align-items: center;
          gap: 6px;

          i {
            color: var(--unity-primary);
            font-size: 0.92rem;
          }
        }

        .count-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(65, 91, 46, 0.08);
          color: var(--unity-primary);
        }
      }

      .btn-new-cat {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 12px;
        border-radius: 10px;
        background: var(--unity-primary);
        color: #ffffff;
        font-size: 0.76rem;
        font-weight: 700;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }
      }
    }

    .categories-cards-stack {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .category-stack-card {
        background: var(--unity-surface);
        border: 1.5px solid var(--unity-border);
        border-radius: 14px;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        cursor: pointer;
        transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

        &:hover {
          border-color: var(--unity-primary);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        &.is-selected {
          border-color: var(--unity-primary);
          background: linear-gradient(135deg, rgba(65, 91, 46, 0.04) 0%, rgba(65, 91, 46, 0.01) 100%), var(--unity-surface);
          box-shadow: 0 4px 14px rgba(65, 91, 46, 0.10);

          .cat-icon-bubble {
            background: var(--unity-primary);
            color: #ffffff;
          }

          .cat-name {
            color: var(--unity-primary);
          }

          .selected-check-badge {
            background: var(--unity-primary);
            color: #ffffff;
          }
        }

        .cat-card-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;

          .cat-icon-bubble {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: rgba(65, 91, 46, 0.08);
            color: var(--unity-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            flex-shrink: 0;
            transition: all 0.2s ease;

            &.all-bubble {
              background: rgba(65, 91, 46, 0.12);
              color: var(--unity-primary);
            }
          }

          .cat-card-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;

            .cat-name {
              margin: 0;
              font-size: 0.88rem;
              font-weight: 700;
              color: var(--unity-text-main);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .cat-meta-sub {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 0.74rem;
              color: var(--unity-text-muted);

              .cat-count-pill {
                font-weight: 600;
                color: var(--unity-primary);
              }

              .cat-desc-hint {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                opacity: 0.75;
              }
            }
          }
        }

        .cat-card-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;

          .btn-card-cat-edit {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            background: var(--unity-bg);
            border: 1px solid var(--unity-border);
            color: var(--unity-text-muted);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.76rem;
            cursor: pointer;
            transition: all 0.18s ease;

            &:hover {
              background: rgba(65, 91, 46, 0.1);
              color: var(--unity-primary);
              border-color: var(--unity-primary);
            }
          }

          .selected-check-badge {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--unity-primary);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.72rem;
            font-weight: 700;
          }

          .cat-card-arrow {
            font-size: 0.78rem;
            color: var(--unity-text-dim);
            transition: transform 0.2s ease;
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
    padding: 36px 20px;
    background: var(--unity-surface);
    border: 1px dashed var(--unity-border);
    border-radius: 18px;
    color: var(--unity-text-muted);

    svg {
      width: 44px;
      height: 44px;
      color: var(--unity-text-dim);
      margin-bottom: 12px;
    }

    h5 {
      font-size: 0.96rem;
      font-weight: 700;
      color: var(--unity-text-main);
      margin: 0 0 6px;
    }

    p {
      font-size: 0.78rem;
      max-width: 280px;
      margin: 0 0 12px;
      line-height: 1.4;
    }

    .btn-empty-clear {
      padding: 6px 14px;
      border-radius: 10px;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-primary);
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--unity-primary);
        color: #ffffff;
      }
    }
  }
}
</style>
