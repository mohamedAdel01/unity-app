<template>
  <div class="admin-patients-list">
    <AppVirtualList
      :items="patients"
      :has-more="hasMore"
      :loading="loading"
      :page-size="10"
      @load-more="emit('load-more')"
    >
      <template #item="{ item, index }">
        <AdminPatientCard 
          :patient="item"
          :initially-expanded="index === 0"
          @view-file="emit('view-file', $event)"
          @book="emit('book', $event)"
          @edit="emit('edit', $event)"
        />
      </template>

      <template #empty>
        <div class="empty-patients-state">
          <i class="pi pi-search"></i>
          <h5>{{ t('No matching patients found') }}</h5>
          <p>{{ t('Try searching with a different name, MRN, or National ID.') }}</p>
          <button type="button" class="btn-reset-search" @click="emit('reset')">
            {{ t('Reset Search') }}
          </button>
        </div>
      </template>
    </AppVirtualList>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';
import AdminPatientCard from './AdminPatientCard.vue';
import AppVirtualList from '../common/AppVirtualList.vue';

const props = withDefaults(
  defineProps<{
    patients?: any[];
    hasMore?: boolean;
    loading?: boolean;
  }>(),
  {
    patients: () => [],
    hasMore: false,
    loading: false,
  }
);

const emit = defineEmits<{
  (e: 'view-file', patient: any): void;
  (e: 'book', patient: any): void;
  (e: 'edit', patient: any): void;
  (e: 'load-more'): void;
  (e: 'reset'): void;
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
.admin-patients-list {
  display: flex;
  flex-direction: column;
  width: 100%;

  .empty-patients-state {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 48px 24px;
    background: var(--unity-surface);
    border: 1px dashed var(--unity-border);
    border-radius: 20px;
    gap: 10px;

    i {
      font-size: 2.2rem;
      color: var(--unity-text-muted);
      opacity: 0.6;
    }

    h5 {
      font-size: 1rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin: 0;
    }

    p {
      font-size: 0.8rem;
      color: var(--unity-text-muted);
      margin: 0 0 8px;
      max-width: 280px;
      line-height: 1.4;
    }

    .btn-reset-search {
      background: var(--unity-primary-light);
      color: var(--unity-primary);
      border: 1px solid var(--unity-primary);
      padding: 8px 18px;
      border-radius: 12px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--unity-primary);
        color: #fff;
      }
    }
  }
}
</style>

