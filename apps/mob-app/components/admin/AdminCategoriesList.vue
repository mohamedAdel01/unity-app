<template>
  <div class="admin-categories-list">
    <AppVirtualList
      :items="categories"
      :has-more="false"
      :loading="loading"
      :page-size="10"
    >
      <template #item="{ item }">
        <AdminCategoryCard 
          :category="item" 
          @toggle-status="emit('toggle-status', $event)"
          @edit="emit('edit', $event)"
          @select="emit('select-category', $event)"
        />
      </template>

      <template #empty>
        <div class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-folder-open"></i>
          </div>
          <h5>{{ t('No categories registered yet') }}</h5>
          <p>{{ t('Add categories to group and organize medical examinations') }}</p>
        </div>
      </template>
    </AppVirtualList>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';
import AdminCategoryCard from './AdminCategoryCard.vue';
import AppVirtualList from '../common/AppVirtualList.vue';

interface Category {
  id: string | number;
  name?: string;
  name_ar?: string;
  name_en?: string;
  description?: string;
  description_ar?: string;
  description_en?: string;
  icon?: string;
  examinations_count?: number;
  is_active?: boolean;
}

const props = withDefaults(
  defineProps<{
    categories?: Category[];
    totalServicesCount?: number;
    loading?: boolean;
  }>(),
  {
    categories: () => [],
    totalServicesCount: 0,
    loading: false,
  }
);

const emit = defineEmits<{
  (e: 'toggle-status', cat: Category): void;
  (e: 'edit', cat: Category): void;
  (e: 'deleted', id?: string | number): void;
  (e: 'new-category'): void;
  (e: 'select-category', cat: Category): void;
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
.admin-categories-list {
  display: flex;
  flex-direction: column;
  width: 100%;

  .empty-state {
    width: 100%;
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

    .empty-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: var(--unity-primary-light, #ecfdf5);
      color: var(--unity-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 12px;

      i {
        font-size: 1.5rem;
      }
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