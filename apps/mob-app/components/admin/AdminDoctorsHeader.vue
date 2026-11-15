<template>
  <div class="admin-doctors-header">
    <!-- 1. Top Supervisor Identity Bar (Unified) -->
    <AdminTopHeader
      :title="activeTab === 'clinics' ? t('Clinics Management') : t('Doctors Management')"
      :subtitle="t('Unity Clinics • Admin Portal')"
      :icon="activeTab === 'clinics' ? 'pi pi-building' : 'pi pi-user'"
    />

    <!-- 2. Dual Mode Selector Tabs (Clinics vs Doctors) -->
    <div class="clinics-doctors-tabs">
      <button
        type="button"
        class="tab-btn"
        :class="{ 'active': activeTab === 'clinics' }"
        @click="emit('tab-change', 'clinics')"
      >
        <svg viewBox="0 0 24 24" class="tab-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/>
          <path d="M9 21v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
          <path d="M10 8h4"/>
          <path d="M12 6v4"/>
        </svg>
        <span>{{ t('Clinics') }}</span>
        <span class="count-pill">{{ clinicsCount }}</span>
      </button>

      <button
        type="button"
        class="tab-btn"
        :class="{ 'active': activeTab === 'doctors' }"
        @click="emit('tab-change', 'doctors')"
      >
        <svg viewBox="0 0 24 24" class="tab-svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4.5 3v5a6.5 6.5 0 0 0 13 0V3"/>
          <path d="M3 3h3"/>
          <path d="M16 3h3"/>
          <path d="M11 14.5V18a3 3 0 0 0 6 0v-2"/>
          <circle cx="17" cy="16" r="2"/>
        </svg>
        <span>{{ t('Doctors') }}</span>
        <span class="count-pill">{{ doctorsCount }}</span>
      </button>
    </div>

    <!-- 3. Page Title Card with Action Button -->
    <div class="title-action-card">
      <div v-if="activeTab === 'doctors'" class="title-texts">
        <h3>{{ t('Certified Medical Staff') }}</h3>
        <p>{{ t('Manage schedules, availability & clinics') }}</p>
      </div>
      <div v-else class="title-texts">
        <h3>{{ t('Clinics & Departments') }}</h3>
        <p>{{ t('Capacity, rooms & active staff') }}</p>
      </div>

      <button
        v-if="activeTab === 'doctors'"
        type="button"
        class="btn-new-item"
        @click="emit('new-doctor')"
      >
        <i class="pi pi-user-plus"></i>
        <span>{{ t('New Doctor') }}</span>
      </button>
      <button
        v-else
        type="button"
        class="btn-new-item"
        @click="emit('new-clinic')"
      >
        <i class="pi pi-plus"></i>
        <span>{{ t('New Clinic') }}</span>
      </button>
    </div>

    <!-- 4. Doctors Search Bar & Clinic Filter (Visible when Doctors tab is active) -->
    <template v-if="activeTab === 'doctors'">
      <div class="search-input-box">
        <i class="pi pi-search search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('Search doctor, specialty, or clinic room...')"
          @input="onSearchInput"
        />
        <button v-if="searchQuery" type="button" class="clear-search-btn" @click="clearSearch">
          <i class="pi pi-times"></i>
        </button>
      </div>

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
    </template>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import AdminTopHeader from './AdminTopHeader.vue';

interface ClinicOption {
  id: string | number;
  name?: string;
  name_ar?: string;
  name_en?: string;
}

const props = withDefaults(
  defineProps<{
    activeTab?: 'doctors' | 'clinics';
    doctorsCount?: number;
    clinicsCount?: number;
    clinics?: ClinicOption[];
  }>(),
  {
    activeTab: 'doctors',
    doctorsCount: 0,
    clinicsCount: 0,
    clinics: () => [],
  }
);

const emit = defineEmits<{
  (e: 'tab-change', tab: 'doctors' | 'clinics'): void;
  (e: 'search', q: string): void;
  (e: 'filter', key: string): void;
  (e: 'new-doctor'): void;
  (e: 'new-clinic'): void;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)
const searchQuery = ref('');
const activeClinic = ref('all');
let debounceTimer: any = null;

// 3. Computed (computed properties)
const clinicFilters = computed(() => {
  const list = [
    { key: 'all', label: `${t('All')} (${props.doctorsCount})` },
  ];

  if (props.clinics && props.clinics.length > 0) {
    props.clinics.forEach((c) => {
      list.push({
        key: String(c.id),
        label: isRtl.value ? (c.name_ar || c.name || '') : (c.name_en || c.name || ''),
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
  gap: 12px;
  width: 100%;

  .clinics-doctors-tabs {
    display: flex;
    gap: 10px;
    width: 100%;

    .tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 46px;
      border: 1.5px solid var(--unity-border);
      background: var(--unity-surface);
      border-radius: 14px;
      font-size: 0.90rem;
      font-weight: 800;
      color: var(--unity-text-main);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);

      .tab-svg {
        width: 18px;
        height: 18px;
        color: var(--unity-text-muted);
      }

      .count-pill {
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-dim);
        font-size: 0.72rem;
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: 800;
        min-width: 20px;
        text-align: center;
      }

      &:hover {
        border-color: var(--unity-primary-light, #a7f3d0);
      }

      &.active {
        background: var(--unity-primary);
        border-color: var(--unity-primary);
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);

        .tab-svg {
          color: #ffffff;
        }

        .count-pill {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.35);
          color: #ffffff;
        }
      }
    }
  }

  .title-action-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    border-radius: 16px;
    box-shadow: var(--unity-card-shadow, 0 2px 8px rgba(0, 0, 0, 0.04));

    .title-texts {
      h3 {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      p {
        margin: 2px 0 0;
        font-size: 0.74rem;
        color: var(--unity-text-muted);
      }
    }

    .btn-new-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 14px;
      height: 38px;
      background: var(--unity-primary);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(4, 120, 87, 0.25);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      flex-shrink: 0;

      &:hover {
        background: var(--unity-primary-dark);
        transform: translateY(-1px);
      }

      &:active {
        transform: scale(0.98);
      }

      i {
        font-size: 0.85rem;
      }
    }
  }

  .search-input-box {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;

    .search-icon {
      position: absolute;
      inset-inline-start: 14px;
      color: var(--unity-text-dim);
      font-size: 0.90rem;
      pointer-events: none;
    }

    input {
      width: 100%;
      height: 44px;
      padding: 0 38px;
      border: 1.5px solid var(--unity-border);
      border-radius: 12px;
      background: var(--unity-surface);
      color: var(--unity-text-main);
      font-size: 0.86rem;
      outline: none;
      transition: all 0.2s;

      &::placeholder {
        color: var(--unity-text-dim);
        font-size: 0.82rem;
      }

      &:focus {
        border-color: var(--unity-primary);
        box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
      }
    }

    .clear-search-btn {
      position: absolute;
      inset-inline-end: 10px;
      background: transparent;
      border: none;
      color: var(--unity-text-dim);
      font-size: 0.85rem;
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--unity-text-main);
      }
    }
  }

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
          background: var(--unity-primary);
          color: #ffffff;
          border-color: var(--unity-primary);
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(4, 120, 87, 0.25);
        }
      }
    }
  }
}
</style>
