<template>
  <div class="admin-doctors-header">
    <!-- 1. Top Supervisor Identity Bar with Add Button -->
    <AdminTopHeader
      :title="selectedClinicId || activeTab === 'doctors' ? t('Doctors') : t('Clinics')"
      :icon="selectedClinicId || activeTab === 'doctors' ? 'pi pi-user' : 'pi pi-building'"
      :action-text="selectedClinicId || activeTab === 'doctors' ? t('New Doctor') : t('New Clinic')"
      action-icon="pi pi-plus"
      :show-back="Boolean(selectedClinicId)"
      :back-text="t('Return')"
      @action="handleTopAction"
      @back="emit('back-to-clinics')"
    />

    <!-- 2. Search Bar -->
    <div class="search-input-box">
      <i class="pi pi-search search-icon"></i>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="selectedClinicId || activeTab === 'doctors' ? t('Search doctor or clinic room...') : t('Search doctor or clinic name...')"
        @input="onSearchInput"
      />
      <button v-if="searchQuery" type="button" class="clear-search-btn" @click="clearSearch">
        <i class="pi pi-times"></i>
      </button>
    </div>

    <!-- 4. Filter Pills - Only shown when in doctor view -->
    <div v-if="selectedClinicId || activeTab === 'doctors'" class="filter-pills-row">
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
  name?: string;
  name_ar?: string;
  name_en?: string;
}

const props = withDefaults(
  defineProps<{
    activeTab?: 'doctors' | 'clinics';
    showTabs?: boolean;
    selectedClinicId?: string | number;
    selectedClinicName?: string;
    doctorsCount?: number;
    clinicsCount?: number;
    clinics?: ClinicOption[];
    activeFilter?: string;
  }>(),
  {
    activeTab: 'doctors',
    showTabs: true,
    selectedClinicId: '',
    selectedClinicName: '',
    doctorsCount: 0,
    clinicsCount: 0,
    clinics: () => [],
    activeFilter: 'all',
  }
);

const emit = defineEmits<{
  (e: 'tab-change', tab: 'doctors' | 'clinics'): void;
  (e: 'search', q: string): void;
  (e: 'filter', key: string): void;
  (e: 'back-to-clinics'): void;
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
      const name = isRtl.value ? (c.name_ar || c.name || '') : (c.name_en || c.name || '');
      const countStr = c.doctors_count !== undefined ? ` (${c.doctors_count})` : '';
      list.push({
        key: String(c.id),
        label: `${name}${countStr}`,
      });
    });
  }

  return list;
});

// 4. Methods (functions, handlers)
const handleTopAction = () => {
  if (!props.showTabs || props.activeTab === 'clinics') {
    emit('new-clinic');
  } else {
    emit('new-doctor');
  }
};

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
watch(() => props.activeFilter, (newVal) => {
  activeClinic.value = newVal || 'all';
});

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-doctors-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;


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
        height: 28px;
        padding: 0 11px;
        border-radius: 9999px;
        background: var(--unity-surface);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-muted);
        font-size: 0.74rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
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
        }
      }
    }
  }
}
</style>
