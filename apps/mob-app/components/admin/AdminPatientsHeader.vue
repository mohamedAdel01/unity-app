<template>
  <div class="admin-patients-header">
    <!-- Top Supervisor Bar (Unified) -->
    <AdminTopHeader 
      :title="t('Patients Management')"
      :subtitle="t('Unity Clinics • Medical Records')"
      icon="pi pi-users"
    />

    <!-- Page Title & Primary Action -->
    <div class="title-action-row">
      <div class="title-wrap">
        <h2>{{ t('Patients Records') }}</h2>
        <span class="patient-count-caption">
          {{ t('Total') }} {{ totalCount }} {{ t('Registered Patients') }}
        </span>
      </div>

      <button class="btn-new-patient" @click="emit('new-patient')">
        <i class="pi pi-plus"></i>
        <span>{{ t('New Patient') }}</span>
      </button>
    </div>

    <!-- Search Input Bar -->
    <div class="search-input-box">
      <i class="pi pi-search search-icon"></i>
      <input 
        v-model="searchQuery" 
        type="text" 
        :placeholder="t('Search by name, MRN or National ID...')"
        @input="onSearchInput"
      />
      <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">
        <i class="pi pi-times"></i>
      </button>
    </div>

    <!-- Filter Pills Bar -->
    <div class="filter-pills-bar">
      <button 
        v-for="pill in filterOptions" 
        :key="pill.key"
        type="button"
        class="filter-pill"
        :class="{ 'active': activeFilter === pill.key }"
        @click="selectFilter(pill.key)"
      >
        <span>{{ pill.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import AdminTopHeader from './AdminTopHeader.vue';

const props = defineProps<{
  totalCount: number;
  todayCount?: number;
}>();

const emit = defineEmits<{
  (e: 'search', q: string): void;
  (e: 'filter', key: string): void;
  (e: 'new-patient'): void;
}>();

const router = useRouter();

const { t } = useI18n();

// 2. Data (refs, reactive state)
const searchQuery = ref('');

const activeFilter = ref('all');

let debounceTimer: any = null;

// 3. Computed (computed properties)
const filterOptions = computed(() => [
  { key: 'all', label: `${t('All')} (${props.totalCount})` },
  { key: 'today', label: `${t('Today')} (${props.todayCount || 18})` },
  { key: 'recent', label: t('Recently Active') },
  { key: 'under_review', label: t('Under Review') },
]);

// 4. Methods (functions, handlers)
const onSearchInput = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    emit('search', searchQuery.value.trim());
  }, 250);
};

const clearSearch = () => {
  searchQuery.value = '';
  emit('search', '');
};

const selectFilter = (key: string) => {
  activeFilter.value = key;
  emit('filter', key);
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-patients-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 4px;

  // 1. Top Supervisor Bar
  .supervisor-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 4px;

    .admin-identity {
      display: flex;
      align-items: center;
      gap: 10px;

      .admin-avatar-ring {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #ecfdf5;
        border: 2px solid #a7f3d0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #047857;
        font-size: 1.2rem;
      }

      .admin-meta {
        display: flex;
        flex-direction: column;
        text-align: start;

        .name-badge-row {
          display: flex;
          align-items: center;
          gap: 6px;

          .role-title {
            font-size: 0.95rem;
            font-weight: 800;
            color: var(--unity-text-main);
          }

          .supervisor-badge {
            background: #d1fae5;
            color: #065f46;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 20px;
          }
        }

        .facility-subline {
          font-size: 0.72rem;
          color: var(--unity-text-muted);
          margin-top: 1px;
        }
      }
    }

    .switch-patient-mode-btn {
      width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: all 0.2s;

      i {
        font-size: 1rem;
        color: var(--unity-text-muted);
      }

      &:hover {
        background: var(--unity-primary-light);
        border-color: var(--unity-primary);
        color: var(--unity-primary);

        i {
          color: var(--unity-primary);
        }
      }
    }
  }

  // 2. Title & New Patient Action Row
  .title-action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title-wrap {
      display: flex;
      flex-direction: column;
      text-align: start;

      h2 {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--unity-text-main);
        letter-spacing: -0.3px;
      }

      .patient-count-caption {
        font-size: 0.78rem;
        color: var(--unity-text-muted);
        margin-top: 2px;
      }
    }

    .btn-new-patient {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--unity-primary);
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 22px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(4, 120, 87, 0.28);
      transition: all 0.2s;

      i {
        font-size: 0.85rem;
      }

      &:hover {
        background: var(--unity-primary-dark);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  // 3. Search Bar
  .search-input-box {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;

    .search-icon {
      position: absolute;
      inset-inline-end: 16px;
      color: var(--unity-text-dim);
      font-size: 1rem;
      pointer-events: none;
    }

    input {
      width: 100%;
      height: 48px;
      background: var(--unity-surface);
      border: 1.5px solid var(--unity-border);
      border-radius: 24px;
      padding-inline-start: 16px;
      padding-inline-end: 42px;
      font-size: 0.85rem;
      color: var(--unity-text-main);
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: var(--unity-primary);
        box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
      }

      &::placeholder {
        color: var(--unity-text-dim);
        font-size: 0.82rem;
      }
    }

    .clear-search-btn {
      position: absolute;
      inset-inline-start: 14px;
      background: transparent;
      border: none;
      color: var(--unity-text-dim);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;

      &:hover {
        color: var(--unity-text-main);
      }
    }
  }

  // 4. Horizontal Filter Pills Bar
  .filter-pills-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .filter-pill {
      white-space: nowrap;
      padding: 7px 16px;
      border-radius: 20px;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--unity-primary);
        color: var(--unity-primary);
      }

      &.active {
        background: var(--unity-primary-dark);
        color: #ffffff;
        border-color: var(--unity-primary-dark);
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(6, 78, 59, 0.25);
      }
    }
  }
}
</style>
