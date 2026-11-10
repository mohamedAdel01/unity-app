<template>
  <div class="app-virtual-list">
    <!-- 1. Items List (Windowed 10 by 10) -->
    <div v-if="items.length > 0" class="virtual-items-stack">
      <div 
        v-for="(item, index) in items" 
        :key="getItemKey(item, index)"
        class="virtual-item-wrapper"
      >
        <slot name="item" :item="item" :index="index" />
      </div>

      <!-- 2. Infinite Scroll Sentinel / Load More Row -->
      <div ref="sentinelRef" class="virtual-sentinel">
        <!-- Loading State for Next Batch -->
        <div v-if="loading" class="loading-more-pill">
          <i class="pi pi-spin pi-spinner"></i>
          <span>{{ t('Loading more items...') }}</span>
        </div>

        <!-- Manual Load More fallback if hasMore and not loading -->
        <button 
          v-else-if="hasMore" 
          type="button" 
          class="btn-load-more" 
          @click="onTriggerLoadMore"
        >
          <i class="pi pi-angle-down"></i>
          <span>{{ t('Load 10 More') }}</span>
        </button>

        <!-- End of List Pill -->
        <div v-else-if="items.length >= 10" class="end-of-list-pill">
          <i class="pi pi-check-circle"></i>
          <span>{{ t('Showing all') }} {{ items.length }} {{ t('items') }}</span>
        </div>
      </div>
    </div>

    <!-- 3. Empty State (Slot or Default) -->
    <div v-else-if="!loading" class="virtual-empty-state">
      <slot name="empty">
        <div class="default-empty-card">
          <i class="pi pi-inbox empty-icon"></i>
          <h5>{{ emptyTitle || t('No items found') }}</h5>
          <p>{{ emptySubtitle || t('There are currently no items to display.') }}</p>
        </div>
      </slot>
    </div>

    <!-- 4. Initial Loading State -->
    <div v-else class="virtual-initial-loading">
      <i class="pi pi-spin pi-spinner initial-spinner"></i>
      <span>{{ t('Loading...') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from '../../composables/useI18n';

const props = withDefaults(
  defineProps<{
    items?: any[];
    hasMore?: boolean;
    loading?: boolean;
    pageSize?: number;
    totalCount?: number;
    emptyTitle?: string;
    emptySubtitle?: string;
  }>(),
  {
    items: () => [],
    hasMore: false,
    loading: false,
    pageSize: 10,
    totalCount: 0,
    emptyTitle: '',
    emptySubtitle: '',
  }
);

const emit = defineEmits<{
  (e: 'load-more'): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)
const sentinelRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
let isThrottled = false;

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const getItemKey = (item: any, fallbackIndex: number) => {
  return item?.id || item?._id || item?.key || `v-item-${fallbackIndex}`;
};

const onTriggerLoadMore = () => {
  if (props.loading || !props.hasMore || isThrottled) return;
  isThrottled = true;
  emit('load-more');
  setTimeout(() => {
    isThrottled = false;
  }, 400);
};

const setupObserver = () => {
  if (typeof IntersectionObserver === 'undefined') return;
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const first = entries[0];
      if (first && first.isIntersecting) {
        onTriggerLoadMore();
      }
    },
    {
      root: null,
      rootMargin: '120px',
      threshold: 0.1,
    }
  );

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value);
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  setupObserver();
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.app-virtual-list {
  display: flex;
  flex-direction: column;
  width: 100%;

  .virtual-items-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .virtual-item-wrapper {
    width: 100%;
  }

  .virtual-sentinel {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px 0 6px;
    width: 100%;

    .loading-more-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 9999px;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-primary);
      font-size: 0.78rem;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

      i {
        font-size: 0.85rem;
      }
    }

    .btn-load-more {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 18px;
      border-radius: 12px;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-main);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      i {
        font-size: 0.85rem;
        color: var(--unity-primary);
      }

      &:hover {
        background: var(--unity-primary-light);
        border-color: var(--unity-primary);
        color: var(--unity-primary);
      }
    }

    .end-of-list-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: var(--unity-bg);
      color: var(--unity-text-muted);
      font-size: 0.72rem;
      font-weight: 600;

      i {
        font-size: 0.75rem;
        color: #10b981;
      }
    }
  }

  .virtual-empty-state {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    padding: 10px 0;

    .default-empty-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 36px 20px;
      background: var(--unity-surface);
      border: 1px dashed var(--unity-border);
      border-radius: 20px;
      width: 100%;
      max-width: 420px;

      .empty-icon {
        font-size: 2.2rem;
        color: var(--unity-text-muted);
        opacity: 0.5;
        margin-bottom: 12px;
      }

      h5 {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--unity-text-main);
        margin: 0 0 6px;
      }

      p {
        font-size: 0.78rem;
        color: var(--unity-text-muted);
        margin: 0;
        line-height: 1.5;
      }
    }
  }

  .virtual-initial-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    gap: 10px;
    color: var(--unity-text-muted);
    font-size: 0.82rem;
    font-weight: 600;

    .initial-spinner {
      font-size: 1.8rem;
      color: var(--unity-primary);
    }
  }
}
</style>

