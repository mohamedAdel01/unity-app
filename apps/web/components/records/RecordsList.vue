<template>
  <div class="records-list-wrapper">
    <AppVirtualList
      :items="items"
      :has-more="hasMore"
      :loading="loading"
      :page-size="10"
      @load-more="$emit('load-more')"
    >
      <template #item="{ item }">
        <div class="record-card">
          <div class="card-header">
            <div class="record-meta">
              <span class="record-type-badge">{{ item.badge || t('Visit Reports') }}</span>
              <span class="record-date">{{ item.date }}</span>
            </div>
            <span class="record-status" :class="item.status">{{ item.statusLabel }}</span>
          </div>

          <div class="card-body">
            <h4 class="record-title">{{ item.title }}</h4>
            <p class="record-doctor" v-if="item.doctor">
              <i class="pi pi-user-md"></i>
              <span>{{ item.doctor }}</span>
            </p>
            <p class="record-summary">{{ item.summary }}</p>
          </div>

          <div class="card-footer">
            <button class="action-btn book-action-btn" @click="$emit('book', item)">
              <i class="pi pi-calendar-plus"></i>
              <span>{{ t('Book Consultation from Result') }}</span>
            </button>
            <button class="action-btn outline-btn" @click="$emit('download', item)">
              <i class="pi pi-download"></i>
              <span>{{ t('Download Report (PDF)') }}</span>
            </button>
            <button class="action-btn primary-btn" v-if="item.hasDetails" @click="$emit('view', item)">
              <i class="pi pi-eye"></i>
              <span>{{ t('View Report') }}</span>
            </button>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-folder-open"></i>
          </div>
          <h3 class="empty-title">{{ t('No medical records found') }}</h3>
          <p class="empty-sub">{{ t('Your medical visit reports, lab diagnostics and doctor prescriptions will appear here.') }}</p>
        </div>
      </template>
    </AppVirtualList>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';
import AppVirtualList from '../common/AppVirtualList.vue';

interface RecordItem {
  id: string;
  title: string;
  doctor?: string;
  date: string;
  summary: string;
  badge?: string;
  status: string;
  statusLabel: string;
  hasDetails?: boolean;
}

const props = withDefaults(
  defineProps<{
    items: RecordItem[];
    loading?: boolean;
    hasMore?: boolean;
  }>(),
  {
    items: () => [],
    loading: false,
    hasMore: false,
  }
);

defineEmits<{
  (e: 'download', item: RecordItem): void;
  (e: 'view', item: RecordItem): void;
  (e: 'book', item: RecordItem): void;
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
.records-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .skeleton-card {
    height: 120px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 16px;
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: var(--unity-surface);
  border-radius: 20px;
  border: 1px dashed var(--unity-border);

  .empty-icon {
    font-size: 2.2rem;
    color: var(--unity-text-muted);
    margin-bottom: 12px;
  }

  .empty-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--unity-text);
    margin: 0 0 6px;
  }

  .empty-sub {
    font-size: 0.8rem;
    color: var(--unity-text-muted);
    line-height: 1.5;
    margin: 0;
  }
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 18px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--unity-primary-light);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .record-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .record-type-badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--unity-primary-light);
      color: var(--unity-primary);
    }

    .record-date {
      font-size: 0.72rem;
      color: var(--unity-text-muted);
    }

    .record-status {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 999px;

      &.ready,
      &.completed {
        background: #ecfdf5;
        color: #059669;
      }
    }
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .record-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--unity-text);
      margin: 0;
    }

    .record-doctor {
      font-size: 0.78rem;
      color: var(--unity-text-muted);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 6px;

      i {
        font-size: 0.85rem;
        color: var(--unity-primary);
      }
    }

    .record-summary {
      font-size: 0.78rem;
      color: var(--unity-text);
      line-height: 1.4;
      margin: 4px 0 0;
      background: var(--unity-surface-muted, #f8fafc);
      padding: 8px 10px;
      border-radius: 8px;
    }
  }

  .card-footer {
    display: flex;
    gap: 8px;
    padding-top: 6px;
    border-top: 1px solid var(--unity-border);

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 0.76rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;

      &.book-action-btn {
        background: rgba(16, 185, 129, 0.12);
        color: #047857;
        border: 1px solid rgba(16, 185, 129, 0.35);

        &:hover {
          background: #047857;
          color: #ffffff;
        }
      }

      &.outline-btn {
        background: var(--unity-surface);
        border: 1px solid var(--unity-border);
        color: var(--unity-text);

        &:hover {
          border-color: var(--unity-primary);
          color: var(--unity-primary);
        }
      }

      &.primary-btn {
        background: var(--unity-primary);
        color: #ffffff;

        &:hover {
          background: var(--unity-primary-dark);
        }
      }
    }
  }
}
</style>
