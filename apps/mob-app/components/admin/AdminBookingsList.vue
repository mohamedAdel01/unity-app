<template>
  <div class="admin-bookings-list">
    <!-- Modular Virtual Windowed Bookings List (10 by 10 Standard) -->
    <AppVirtualList
      :items="bookings"
      :has-more="hasMore"
      :loading="loading"
      :page-size="10"
      @load-more="emit('load-more')"
    >
      <template #item="{ item, index }">
        <AdminBookingCard 
          :booking="item"
          :initially-expanded="index === 0"
          @reschedule="emit('reschedule', $event)"
          @approve="emit('approve', $event)"
          @cancel="emit('cancel', $event)"
        />
      </template>

      <template #empty>
        <div class="empty-bookings-state">
          <i class="pi pi-calendar-times"></i>
          <h5>{{ t('No bookings in this period') }}</h5>
          <p>{{ t('Try selecting another time range or clear filters.') }}</p>
        </div>
      </template>
    </AppVirtualList>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';
import AdminBookingCard from './AdminBookingCard.vue';
import AppVirtualList from '../common/AppVirtualList.vue';

const props = withDefaults(
  defineProps<{
    bookings?: any[];
    hasMore?: boolean;
    loading?: boolean;
  }>(),
  {
    bookings: () => [],
    hasMore: false,
    loading: false,
  }
);

const emit = defineEmits<{
  (e: 'reschedule', booking: any): void;
  (e: 'approve', booking: any): void;
  (e: 'cancel', booking: any): void;
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
.admin-bookings-list {
  display: flex;
  flex-direction: column;
  width: 100%;

  .empty-bookings-state {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 44px 20px;
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
      font-size: 0.98rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin: 0;
    }

    p {
      font-size: 0.84rem;
      color: var(--unity-text-muted);
      margin: 0;
      max-width: 280px;
      line-height: 1.5;
    }
  }
}
</style>
