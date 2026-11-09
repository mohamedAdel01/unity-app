<template>
  <div class="search-section">
    <div class="search-input-wrapper">
      <i class="pi pi-search search-icon"></i>
      <input 
        v-model="searchQuery" 
        type="text" 
        :placeholder="t('home.searchPlaceholder')" 
        @input="emit('search', searchQuery)"
      />
      <button class="filter-btn" @click="activeCategory = 'all'">
        <i class="pi pi-sliders-h"></i>
      </button>
    </div>

    <!-- Quick Filter Pills -->
    <div class="filter-pills-scroll">
      <button 
        v-for="pill in filterPills" 
        :key="pill.id"
        class="filter-pill"
        :class="{ 'active': activeCategory === pill.id }"
        @click="selectFilter(pill.id)"
      >
        {{ pill.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';

const emit = defineEmits<{
  (e: 'search', q: string): void;
  (e: 'filter', cat: string): void;
}>();

const { t, isRtl } = useI18n();

const searchQuery = ref('');
const activeCategory = ref('all');

const filterPills = computed(() => [
  { id: 'all', name: isRtl.value ? 'الكل' : 'All' },
  { id: 'consultant', name: isRtl.value ? 'استشاري' : 'Consultant' },
  { id: 'lab', name: isRtl.value ? 'فحص ومختبر' : 'Labs' },
  { id: 'general', name: isRtl.value ? 'طبيب عام' : 'GP' },
  { id: 'physio', name: isRtl.value ? 'علاج طبيعي' : 'Physio' },
  { id: 'xray', name: isRtl.value ? 'أشعة ورنين' : 'X-Ray' },
]);

const selectFilter = (id: string) => {
  activeCategory.value = id;
  emit('filter', id);
};
</script>

<style scoped lang="scss">
.search-section {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--unity-surface);
    border: 1.5px solid var(--unity-border);
    border-radius: 20px;
    padding: 6px 14px;
    box-shadow: var(--unity-shadow-subtle);

    .search-icon {
      font-size: 1.1rem;
      color: var(--unity-text-dim);
      margin-inline-end: 10px;
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.85rem;
      color: var(--unity-text-main);
      font-family: inherit;

      &::placeholder {
        color: var(--unity-text-dim);
      }
    }

    .filter-btn {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: #ecfdf5;
      border: none;
      color: #047857;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }

  .filter-pills-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .filter-pill {
      white-space: nowrap;
      padding: 7px 18px;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 700;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      cursor: pointer;
      transition: all 0.2s;

      &.active {
        background: var(--unity-primary-dark);
        color: #fff;
        border-color: var(--unity-primary-dark);
        box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);
      }
    }
  }
}
</style>
