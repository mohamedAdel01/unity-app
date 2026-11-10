<template>
  <div class="admin-examinations-list">
    <AppVirtualList
      :items="examinations"
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
import { useI18n } from '../../composables/useI18n';
import AdminExaminationCard from './AdminExaminationCard.vue';
import AppVirtualList from '../common/AppVirtualList.vue';

interface Examination {
  id: string | number;
  name: string;
  price: number;
  duration?: number;
  description?: string | null;
  is_active: boolean;
}

const props = withDefaults(
  defineProps<{
    examinations?: Examination[];
    hasMore?: boolean;
    loading?: boolean;
  }>(),
  {
    examinations: () => [],
    hasMore: false,
    loading: false,
  }
);

const emit = defineEmits<{
  (e: 'toggle-status', examination: Examination): void;
  (e: 'edit', examination: Examination): void;
  (e: 'load-more'): void;
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
.admin-examinations-list {
  display: flex;
  flex-direction: column;
  width: 100%;

  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
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
      font-size: 2.2rem;
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

