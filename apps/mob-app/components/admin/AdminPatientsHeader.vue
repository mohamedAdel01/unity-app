<template>
  <div class="admin-patients-header">
    <!-- Top Header with Short Title & Add Button -->
    <AdminTopHeader 
      :title="t('Patients')"
      icon="pi pi-users"
      :action-text="t('New Patient')"
      action-icon="pi pi-plus"
      @action="emit('new-patient')"
    />

    <!-- Search Input Bar -->
    <div class="search-input-box">
      <i class="pi pi-search search-icon"></i>
      <input 
        v-model="searchQuery" 
        type="text" 
        :placeholder="t('Search by name or phone...')"
        @input="onSearchInput"
      />
      <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';
import AdminTopHeader from './AdminTopHeader.vue';

const props = withDefaults(
  defineProps<{
    totalCount?: number;
  }>(),
  {
    totalCount: 0,
  }
);

const emit = defineEmits<{
  (e: 'search', q: string): void;
  (e: 'new-patient'): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)
const searchQuery = ref('');
let debounceTimer: any = null;

// 3. Computed (computed properties)

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

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-patients-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 4px;

  // Search Bar
  .search-input-box {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;

    .search-icon {
      position: absolute;
      inset-inline-start: 16px;
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
      padding-inline-start: 44px;
      padding-inline-end: 40px;
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
      inset-inline-end: 14px;
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
}
</style>
