<template>
  <div class="admin-services-manage-view">
    <AdminServicesHeader
      :selected-category-id="effectiveCategoryId"
      :selected-category-name="selectedCategoryDisplayName"
      :services-count="filteredServicesCount"
      :categories-count="categories.length"
      :categories="categories"
      :active-filter="effectiveCategoryId"
      @search="onSearch"
      @filter="onFilterPill"
      @back-to-categories="emit('back')"
      @new-examination="openNewExaminationModal"
      @new-category="openNewCategoryModal"
    />

    <AdminExaminationsList
      :examinations="services"
      :categories="categories"
      :active-category-id="effectiveCategoryId"
      :search-query="searchQuery"
      :has-more="servicesHasMore"
      :loading="servicesLoading"
      @toggle-status="toggleServiceStatus"
      @edit="openEditExaminationModal"
      @load-more="loadMoreExaminations"
      @clear-category="emit('back')"
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
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AdminServicesHeader from './AdminServicesHeader.vue';
import AdminExaminationsList from './AdminExaminationsList.vue';
import AdminExaminationModal from './AdminExaminationModal.vue';
import AdminExaminationCategoryModal from './AdminExaminationCategoryModal.vue';

const props = withDefaults(
  defineProps<{
    categoryId?: string | number;
  }>(),
  {
    categoryId: 'all',
  }
);

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'select-category', categoryId: string | number): void;
}>();

const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const searchQuery = ref('');
const services = ref<any[]>([]);
const servicesTotal = ref(0);
const servicesPage = ref(1);
const servicesHasMore = ref(false);
const servicesLoading = ref(false);

const categories = ref<any[]>([]);
const isExaminationModalOpen = ref(false);
const isCategoryModalOpen = ref(false);
const selectedExaminationToEdit = ref<any | null>(null);
const selectedCategoryToEdit = ref<any | null>(null);

// Debounce state tracking for service status toggles
const serviceTimers: Record<string | number, any> = {};
const serviceOriginalStates: Record<string | number, boolean> = {};

// 3. Computed (computed properties)
const effectiveCategoryId = computed(() => {
  return String(props.categoryId || 'all');
});

const selectedCategoryDisplayName = computed(() => {
  if (!effectiveCategoryId.value || effectiveCategoryId.value === 'all') {
    return t('All Services');
  }
  const cat = categories.value.find((c) => String(c.id) === String(effectiveCategoryId.value));
  if (cat) {
    return isRtl.value ? (cat.name_ar || cat.name || cat.name_en) : (cat.name_en || cat.name || cat.name_ar);
  }
  return t('Medical Category');
});

const filteredServicesCount = computed(() => {
  if (!effectiveCategoryId.value || effectiveCategoryId.value === 'all') {
    return servicesTotal.value || services.value.length;
  }
  const cat = categories.value.find((c) => String(c.id) === String(effectiveCategoryId.value));
  if (typeof cat?.examinations_count === 'number') {
    return cat.examinations_count;
  }
  if (Array.isArray(cat?.examinations)) {
    return cat.examinations.length;
  }
  return services.value.filter((s: any) => String(s.category_id || s.category?.id) === String(effectiveCategoryId.value)).length;
});

// 4. Methods (functions, handlers)
const onSearch = (q: string) => {
  searchQuery.value = q;
};

const onFilterPill = (key: string) => {
  emit('select-category', key);
};

const openNewExaminationModal = () => {
  selectedExaminationToEdit.value = null;
  isExaminationModalOpen.value = true;
};

const openEditExaminationModal = async (srv: any) => {
  selectedExaminationToEdit.value = srv;
  isExaminationModalOpen.value = true;
  if (srv?.id) {
    try {
      const res = await api.apiRequest({
        service: 'ADMIN_EXAMINATION_BY_ID',
        filter: { id: srv.id },
      });
      if (res?.data) {
        selectedExaminationToEdit.value = res.data;
      }
    } catch (_) {}
  }
};

const openNewCategoryModal = () => {
  selectedCategoryToEdit.value = null;
  isCategoryModalOpen.value = true;
};

const openEditCategoryModal = (cat: any) => {
  selectedCategoryToEdit.value = cat;
  isCategoryModalOpen.value = true;
};

const ADMIN_EXAMINATIONS = async (page: any = 1) => {
  const targetPage = typeof page === 'number' ? page : 1;
  const currentCat = effectiveCategoryId.value;
  try {
    servicesLoading.value = true;
    const filterParams: any = { page: targetPage, limit: 10 };
    if (currentCat && currentCat !== 'all') {
      filterParams.category_id = currentCat;
    }
    const res = await api.apiRequest({
      service: 'ADMIN_EXAMINATIONS',
      filter: filterParams,
    });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    const isAr = Boolean(isRtl?.value);
    const items = raw.map((s: any) => ({
      id: s.id,
      name_ar: s.name_ar || '',
      name_en: s.name_en || '',
      name: isAr ? (s.name_ar || s.name || s.name_en || '') : (s.name_en || s.name || s.name_ar || ''),
      price: Number(s.price) || 0,
      duration: s.duration || 15,
      description_ar: s.description_ar || '',
      description_en: s.description_en || '',
      description: isAr ? (s.description_ar || s.description || s.description_en || '') : (s.description_en || s.description || s.description_ar || ''),
      category_id: s.category_id || s.category?.id || null,
      category: s.category || null,
      is_active: s.is_active ?? true,
      schedules: s.schedules || [],
    }));

    if (targetPage === 1) {
      services.value = items;
    } else {
      services.value.push(...items);
    }
    servicesPage.value = targetPage;
    servicesTotal.value = res?.pagination?.total ?? res?.total ?? items.length;
    servicesHasMore.value = res?.pagination?.hasMore ?? res?.hasMore ?? (items.length >= 10);
  } catch (_) {
    if (targetPage === 1) services.value = [];
  } finally {
    servicesLoading.value = false;
  }
};

const loadMoreExaminations = () => {
  if (servicesHasMore.value && !servicesLoading.value) {
    ADMIN_EXAMINATIONS(servicesPage.value + 1);
  }
};

const ADMIN_EXAMINATION_CATEGORIES = async () => {
  try {
    const res = await api.apiRequest({
      service: 'ADMIN_EXAMINATION_CATEGORIES',
      filter: { limit: 100 },
    });
    if (res?.data) {
      categories.value = Array.isArray(res.data) ? res.data : (res.data.items || []);
    }
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
  await ADMIN_EXAMINATIONS(1);
};

const onCategoryDeleted = async (deletedId?: any) => {
  if (deletedId) {
    categories.value = categories.value.filter(c => String(c.id) !== String(deletedId));
  }
  await ADMIN_EXAMINATION_CATEGORIES();
  await ADMIN_EXAMINATIONS(1);
};

const onExaminationSaved = () => {
  ADMIN_EXAMINATION_CATEGORIES();
  ADMIN_EXAMINATIONS(1);
};

// Debounced Service Status Toggle
const toggleServiceStatus = (srv: any) => {
  const id = srv.id;

  if (serviceOriginalStates[id] === undefined) {
    serviceOriginalStates[id] = srv.is_active;
  }

  srv.is_active = !srv.is_active;

  if (serviceTimers[id]) {
    clearTimeout(serviceTimers[id]);
  }

  serviceTimers[id] = setTimeout(async () => {
    const targetState = srv.is_active;
    const originalState = serviceOriginalStates[id];
    delete serviceTimers[id];
    delete serviceOriginalStates[id];

    if (targetState === originalState) return;

    try {
      await api.apiRequest({
        service: 'ADMIN_TOGGLE_EXAMINATION',
        payload: { id, is_active: targetState },
      });
      toast.success(targetState ? t('Service activated successfully') : t('Service deactivated successfully'));
    } catch (err: any) {
      srv.is_active = originalState;
      toast.show({
        title: err?.message || t('Failed to update service status'),
        type: 'error',
      });
    }
  }, 500);
};

// 5. Watches (watch, watchEffect)
watch(() => props.categoryId, () => {
  ADMIN_EXAMINATIONS(1);
});

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  ADMIN_EXAMINATION_CATEGORIES();
  ADMIN_EXAMINATIONS(1);
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-services-manage-view {
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