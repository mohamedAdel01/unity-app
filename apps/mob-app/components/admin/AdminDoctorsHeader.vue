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

    <!-- 4. Filter Pills Bar (Clinics from Backend) -->
    <div class="filter-pills-row">
      <div class="pills-scroll-container">
        <button 
          v-for="pill in clinicFilters" 
          :key="pill.key"
          type="button"
          class="filter-pill"
          :class="{ 'active': activeClinic === pill.key }"
          @click="selectClinic(pill.key)"
        >
          <span>{{ pill.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import AdminTopHeader from './AdminTopHeader.vue';

interface ClinicOption {
  id: string | number;
  name: string;
}

const props = withDefaults(
  defineProps<{
    totalCount?: number;
    clinics?: ClinicOption[];
  }>(),
  {
    totalCount: 0,
    clinics: () => [],
  }
);

const emit = defineEmits<{
  (e: 'search', q: string): void;
  (e: 'filter', key: string): void;
  (e: 'new-doctor'): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)
const searchQuery = ref('');
const activeClinic = ref('all');
let debounceTimer: any = null;

// 3. Computed (computed properties)
const clinicFilters = computed(() => {
  const list = [
    { key: 'all', label: `${t('All')} (${props.totalCount})` },
  ];

  if (props.clinics && props.clinics.length > 0) {
    props.clinics.forEach((c) => {
      list.push({
        key: String(c.id),
        label: c.name,
      });
    });
  }

  return list;
});

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

const selectClinic = (key: string) => {
  activeClinic.value = key;
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

    .title-action-card .title-texts {
      text-align: left;
    }
  }

  // 2. Title Row with Button (Clean & Borderless)
  .title-action-card {
    background: transparent;
    border: none;
    padding: 4px 2px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title-texts {
      display: flex;
      flex-direction: column;
      text-align: right;

      h3 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      p {
        margin: 2px 0 0;
        font-size: 0.74rem;
        color: var(--unity-text-dim);
      }
    }

    .btn-new-doctor {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 20px;
      background: var(--unity-primary);
      color: #ffffff;
      border: none;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);
      transition: all 0.2s;

      i {
        font-size: 0.9rem;
      }

      &:active {
        transform: scale(0.96);
      }
    }
  }

  // 3. Search Bar
  .search-input-box {
    position: relative;
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

  // 4. Filter Pills Row
  .filter-pills-row {
    display: flex;
    align-items: center;
    width: 100%;

    .pills-scroll-container {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 2px;

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
        flex-shrink: 0;

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
  }
}
</style>
