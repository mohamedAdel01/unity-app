<template>
  <div class="admin-doctors-header">
    <!-- 1. Top Supervisor Identity Bar (Unified) -->
    <AdminTopHeader 
      :title="t('Doctors Management')"
      :subtitle="t('Unity Clinics • Admin Portal')"
      icon="pi pi-user"
    />

    <!-- 2. Page Title Card with Add Doctor Action -->
    <div class="title-action-card">
      <div class="title-texts">
        <h3>{{ t('Certified Medical Staff') }}</h3>
        <p>{{ t('Manage schedules, availability & clinics') }}</p>
      </div>

      <button class="btn-new-doctor" @click="emit('new-doctor')">
        <i class="pi pi-user-plus"></i>
        <span>{{ t('New Doctor') }}</span>
      </button>
    </div>

    <!-- 3. Search Bar -->
    <div class="search-input-box">
      <i class="pi pi-search search-icon"></i>
      <input 
        v-model="searchQuery" 
        type="text" 
        :placeholder="t('Search doctor, specialty, or clinic room...')"
        @input="onSearchInput"
      />
      <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">
        <i class="pi pi-times"></i>
      </button>
    </div>

    <!-- 4. Filter Pills Bar with Active Count Indicator -->
    <div class="filter-pills-row">
      <div class="pills-scroll-container">
        <button 
          v-for="pill in specialtyFilters" 
          :key="pill.key"
          type="button"
          class="filter-pill"
          :class="{ 'active': activeSpecialty === pill.key }"
          @click="selectSpecialty(pill.key)"
        >
          <span>{{ pill.label }}</span>
        </button>
      </div>

      <!-- Active Doctors Now Indicator -->
      <div class="active-now-tag">
        <span class="pulse-green-dot"></span>
        <span>{{ activeCount }} {{ t('Active Now') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import AdminTopHeader from './AdminTopHeader.vue';

const props = withDefaults(
  defineProps<{
    totalCount?: number;
    activeCount?: number;
  }>(),
  {
    totalCount: 18,
    activeCount: 12,
  }
);

const emit = defineEmits<{
  (e: 'search', q: string): void;
  (e: 'filter', key: string): void;
  (e: 'new-doctor'): void;
}>();

const router = useRouter();

const { t } = useI18n();

// 2. Data (refs, reactive state)
const searchQuery = ref('');

const activeSpecialty = ref('all');

let debounceTimer: any = null;

// 3. Computed (computed properties)
const specialtyFilters = computed(() => [
  { key: 'all', label: `${t('All')} (${props.totalCount})` },
  { key: 'cardio_internal', label: t('Internal & Cardio') },
  { key: 'pediatrics', label: t('Pediatrics') },
  { key: 'surgery', label: t('Surgery') },
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

const selectSpecialty = (key: string) => {
  activeSpecialty.value = key;
  emit('filter', key);
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-doctors-header {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 2px;
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .supervisor-top-bar .admin-identity .admin-meta,
    .title-action-card .title-texts {
      text-align: left;
    }
  }

  // 1. Top Supervisor Bar
  .supervisor-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;

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
        font-size: 1.15rem;
      }

      .admin-meta {
        display: flex;
        flex-direction: column;
        text-align: right;

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

  // 2. Title Card with Button
  .title-action-card {
    background: #f8fafc;
    border: 1px solid var(--unity-border);
    border-radius: 20px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title-texts {
      display: flex;
      flex-direction: column;
      text-align: right;

      h3 {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--unity-text-main);
        letter-spacing: -0.2px;
      }

      p {
        font-size: 0.74rem;
        color: var(--unity-text-muted);
        margin-top: 2px;
      }
    }

    .btn-new-doctor {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--unity-primary);
      color: #ffffff;
      border: none;
      padding: 9px 16px;
      border-radius: 20px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 3px 12px rgba(4, 120, 87, 0.28);
      transition: all 0.2s;

      i {
        font-size: 0.85rem;
      }

      &:hover {
        background: var(--unity-primary-dark);
        transform: translateY(-1px);
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
      font-size: 0.84rem;
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
      font-size: 0.85rem;

      &:hover {
        color: var(--unity-text-main);
      }
    }
  }

  // 4. Filter Pills Row with Active Count
  .filter-pills-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    .pills-scroll-container {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }

      .filter-pill {
        white-space: nowrap;
        padding: 6px 14px;
        border-radius: 20px;
        background: var(--unity-surface);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-muted);
        font-size: 0.76rem;
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
          box-shadow: 0 2px 6px rgba(6, 78, 59, 0.2);
        }
      }
    }

    .active-now-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--unity-primary);

      .pulse-green-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
      }
    }
  }
}
</style>
