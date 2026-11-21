<template>
  <div class="admin-categories-manage-view">
    <AdminServicesHeader
      :selected-category-id="''"
      :services-count="servicesTotal || services.length"
      :categories-count="categories.length"
      @search="onSearch"
      @new-examination="openNewExaminationModal"
      @new-category="openNewCategoryModal"
    />

    <AdminCategoriesList
      :categories="filteredCategories"
      :total-services-count="servicesTotal || services.length"
      :loading="categoriesLoading"
      @toggle-status="toggleCategoryStatus"
      @edit="openEditCategoryModal"
      @deleted="onCategoryDeleted"
      @new-category="openNewCategoryModal"
      @select-category="emit('select-category', $event)"
    />

    <AdminExaminationModal
      :is-open="isExaminationModalOpen"
      :examination="selectedExaminationToEdit"
      @close="isExaminationModalOpen = false"
      @created="onExaminationSaved"
      @updated="onExaminationSaved"
    />

    <AdminExaminationCategoryModal
      :is-open="isCategoryModalOpen"
      :category="selectedCategoryToEdit"
      @close="isCategoryModalOpen = false"
      @saved="onCategorySaved"
      @deleted="onCategoryDeleted"
    />

    <div class="page-bottom-spacer" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AdminServicesHeader from './AdminServicesHeader.vue';
import AdminCategoriesList from './AdminCategoriesList.vue';
import AdminExaminationModal from './AdminExaminationModal.vue';
import AdminExaminationCategoryModal from './AdminExaminationCategoryModal.vue';

const emit = defineEmits<{
  (e: 'select-category', category: any): void;
}>();

const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const searchQuery = ref('');
const categories = ref<any[]>([]);
const categoriesLoading = ref(false);

const services = ref<any[]>([]);
const servicesTotal = ref(0);

const isExaminationModalOpen = ref(false);
const isCategoryModalOpen = ref(false);
const selectedExaminationToEdit = ref<any | null>(null);
const selectedCategoryToEdit = ref<any | null>(null);

// Debounce state tracking for category status toggles
const categoryTimers: Record<string | number, any> = {};
const categoryOriginalStates: Record<string | number, boolean> = {};

// 3. Computed (computed properties)
const filteredCategories = computed(() => {
  let list = categories.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((c: any) => {
      const ar = (c.name_ar || '').toLowerCase();
      const en = (c.name_en || '').toLowerCase();
      const name = (c.name || '').toLowerCase();
      return ar.includes(q) || en.includes(q) || name.includes(q);
    });
  }
  return list;
});

// 4. Methods (functions, handlers)
const onSearch = (q: string) => {
  searchQuery.value = q;
};

const openNewExaminationModal = () => {
  selectedExaminationToEdit.value = null;
  isExaminationModalOpen.value = true;
};

const openNewCategoryModal = () => {
  selectedCategoryToEdit.value = null;
  isCategoryModalOpen.value = true;
};

const openEditCategoryModal = (cat: any) => {
  selectedCategoryToEdit.value = cat;
  isCategoryModalOpen.value = true;
};

const toggleCategoryStatus = (cat: any) => {
  const id = cat.id;

  if (categoryOriginalStates[id] === undefined) {
    categoryOriginalStates[id] = cat.is_active;
  }

  cat.is_active = !cat.is_active;

  if (categoryTimers[id]) {
    clearTimeout(categoryTimers[id]);
  }

  categoryTimers[id] = setTimeout(async () => {
    const targetState = cat.is_active;
    const originalState = categoryOriginalStates[id];
    delete categoryTimers[id];
    delete categoryOriginalStates[id];

    if (targetState === originalState) return;

    try {
      await api.apiRequest({
        service: 'ADMIN_TOGGLE_EXAMINATION_CATEGORY',
        payload: { id, is_active: targetState },
      });
      toast.success(targetState ? t('Category activated successfully') : t('Category deactivated successfully'));
    } catch (err: any) {
      cat.is_active = originalState;
      toast.show({
        title: err?.message || t('Failed to update category status'),
        type: 'error',
      });
    }
  }, 500);
};

const ADMIN_EXAMINATION_CATEGORIES = async () => {
  try {
    categoriesLoading.value = true;
    const res = await api.apiRequest({
      service: 'ADMIN_EXAMINATION_CATEGORIES',
      filter: { limit: 100 },
    });
    if (res?.data) {
      categories.value = Array.isArray(res.data) ? res.data : (res.data.items || []);
    }
  } catch (_) {
  } finally {
    categoriesLoading.value = false;
  }
};

const fetchServicesCount = async () => {
  try {
    const res = await api.apiRequest({
      service: 'ADMIN_EXAMINATIONS',
      filter: { page: 1, limit: 1 },
    });
    servicesTotal.value = res?.pagination?.total ?? res?.total ?? 0;
  } catch (_) {}
};

const onCategorySaved = async (savedCategory?: any) => {
  if (savedCategory && savedCategory.id) {
    const idx = categories.value.findIndex(c => String(c.id) === String(savedCategory.id));
    if (idx !== -1) {
      categories.value[idx] = { ...categories.value[idx], ...savedCategory };
    } else {
      categories.value.unshift(savedCategory);
    }
  }
  await ADMIN_EXAMINATION_CATEGORIES();
  await fetchServicesCount();
};

const onCategoryDeleted = async (deletedId?: any) => {
  if (deletedId) {
    categories.value = categories.value.filter(c => String(c.id) !== String(deletedId));
  }
  await ADMIN_EXAMINATION_CATEGORIES();
  await fetchServicesCount();
};

const onExaminationSaved = () => {
  ADMIN_EXAMINATION_CATEGORIES();
  fetchServicesCount();
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  ADMIN_EXAMINATION_CATEGORIES();
  fetchServicesCount();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-categories-manage-view {
  padding: 14px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
.page-bottom-spacer {
  height: 120px;
  flex-shrink: 0;
}
</style>