<template>
  <div class="admin-clinics-list">
    <AppVirtualList
      :items="clinics"
      :has-more="hasMore"
      :loading="loading"
      :page-size="10"
      @load-more="emit('load-more')"
    >
      <template #item="{ item }">
        <AdminClinicCard 
          :clinic="item" 
          @toggle-status="emit('toggle-status', $event)"
          @edit="emit('edit', $event)"
        />
      </template>

      <template #empty>
        <div class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18"/>
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
            <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/>
            <path d="M10 9h4"/>
            <path d="M12 7v4"/>
          </svg>
          <h5>{{ t('No clinics registered yet') }}</h5>
          <p>{{ t('Add specialized clinics to start assigning doctors and services.') }}</p>
        </div>
      </template>
    </AppVirtualList>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';
import AdminClinicCard from './AdminClinicCard.vue';
import AppVirtualList from '../common/AppVirtualList.vue';

interface Clinic {
  id: string | number;
  name: string;
  doctors_count: number;
  is_active: boolean;
}

const props = withDefaults(
  defineProps<{
    clinics?: Clinic[];
    hasMore?: boolean;
    loading?: boolean;
  }>(),
  {
    clinics: () => [],
    hasMore: false,
    loading: false,
  }
);

const emit = defineEmits<{
  (e: 'toggle-status', clinic: Clinic): void;
  (e: 'edit', clinic: Clinic): void;
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
.admin-clinics-list {
  display: flex;
  flex-direction: column;
  width: 100%;

  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

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

