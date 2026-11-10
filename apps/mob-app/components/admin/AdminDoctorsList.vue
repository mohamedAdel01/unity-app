<template>
  <div class="admin-doctors-list">
    <AppVirtualList
      :items="doctors"
      :has-more="hasMore"
      :loading="loading"
      :page-size="10"
      @load-more="emit('load-more')"
    >
      <template #item="{ item }">
        <AdminDoctorCard 
          :doctor="item"
          @edit="emit('edit', $event)"
          @edit-schedule="emit('edit-schedule', $event)"
          @view-cases="emit('view-cases', $event)"
          @toggle-status="emit('toggle-status', $event)"
        />
      </template>

      <template #empty>
        <div class="empty-doctors-state">
          <i class="pi pi-search"></i>
          <h5>{{ t('No doctors match your criteria') }}</h5>
          <p>{{ t('Try searching for another name, specialty, or clinic room.') }}</p>
          <button type="button" class="btn-reset" @click="emit('reset')">{{ t('Reset') }}</button>
        </div>
      </template>
    </AppVirtualList>

    <!-- Bottom Auto-Sync Strip -->
    <div class="bottom-sync-notice">
      <i class="pi pi-sync spin-hover"></i>
      <span>{{ t('Doctor schedules auto-sync with booking calendar') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';
import AdminDoctorCard from './AdminDoctorCard.vue';
import AppVirtualList from '../common/AppVirtualList.vue';

interface Doctor {
  id: string | number;
  name: string;
  avatar?: string;
  specialty?: string;
  room?: string;
  category?: string;
  status_badge?: string;
  schedule_time?: string;
  cases_count?: number;
  is_active: boolean;
  is_evening?: boolean;
  primary_action?: boolean;
}

const props = withDefaults(
  defineProps<{
    doctors?: Doctor[];
    hasMore?: boolean;
    loading?: boolean;
  }>(),
  {
    doctors: () => [],
    hasMore: false,
    loading: false,
  }
);

const emit = defineEmits<{
  (e: 'edit', doctor: Doctor): void;
  (e: 'edit-schedule', doctor: Doctor): void;
  (e: 'view-cases', doctor: Doctor): void;
  (e: 'toggle-status', doctor: Doctor): void;
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
.admin-doctors-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  .empty-doctors-state {
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

    .btn-reset {
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

  .bottom-sync-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(0, 118, 99, 0.05);
    border: 1px dashed rgba(0, 118, 99, 0.2);
    border-radius: 14px;
    color: var(--unity-primary);
    font-size: 0.78rem;
    font-weight: 600;

    .spin-hover {
      font-size: 0.85rem;
      transition: transform 0.5s ease;
    }

    &:hover .spin-hover {
      transform: rotate(180deg);
    }
  }
}
</style>

