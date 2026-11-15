<template>
  <div class="admin-services-page">
    <AdminServicesHeader
      :active-tab="activeTab"
      :total-count="servicesTotal || services.length"
      :categories-count="categories.length"
      @tab-change="onTabChange"
      @search="onSearch"
      @new-examination="openNewExaminationModal"
      @new-category="openNewCategoryModal"
    />

    <!-- 1. When activeTab === 'services': Modular Examinations Virtual List (10 by 10) -->
    <AdminExaminationsList
      v-if="activeTab === 'services'"
      :examinations="services"
      :categories="categories"
      :search-query="searchQuery"
      :has-more="servicesHasMore"
      :loading="servicesLoading"
      @toggle-status="toggleServiceStatus"
      @edit="openEditExaminationModal"
      @load-more="loadMoreExaminations"
      @new-category="openNewCategoryModal"
      @edit-category="openEditCategoryModal"
      @category-deleted="onCategoryDeleted"
    />

    <!-- 2. When activeTab === 'categories': Modular Categories List -->
    <AdminCategoriesList
      v-else-if="activeTab === 'categories'"
      :categories="categories"
      :loading="servicesLoading"
      @edit="openEditCategoryModal"
      @deleted="onCategoryDeleted"
      @new-category="openNewCategoryModal"
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

    <!-- Generous bottom clearance spacer ensuring content completely clears floating navbar -->
    <div class="page-bottom-spacer" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AdminServicesHeader from '../../components/admin/AdminServicesHeader.vue';
import AdminExaminationsList from '../../components/admin/AdminExaminationsList.vue';
import AdminCategoriesList from '../../components/admin/AdminCategoriesList.vue';
import AdminExaminationModal from '../../components/admin/AdminExaminationModal.vue';
import AdminExaminationCategoryModal from '../../components/admin/AdminExaminationCategoryModal.vue';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const router = useRouter();
const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const activeTab = ref<'services' | 'categories'>('services');
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

// 4. Methods (functions, handlers)
const onTabChange = (tab: 'services' | 'categories') => {
  activeTab.value = tab;
  router.replace({ query: { ...route.query, tab } });
};

const onSearch = (q: string) => {
  searchQuery.value = q;
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
  try {
    servicesLoading.value = true;
    const res = await api.apiRequest({
      service: 'ADMIN_EXAMINATIONS',
      filter: { page: targetPage, limit: 10 },
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

const onCategorySaved = () => {
  ADMIN_EXAMINATION_CATEGORIES();
  ADMIN_EXAMINATIONS(1);
};

const onCategoryDeleted = () => {
  ADMIN_EXAMINATION_CATEGORIES();
  ADMIN_EXAMINATIONS(1);
};

const onExaminationSaved = () => {
  ADMIN_EXAMINATION_CATEGORIES();
  ADMIN_EXAMINATIONS(1);
};

// Debounced Service Status Toggle (Instant 0ms UI response + 500ms background debounce)
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
watch(() => route.query.tab, (newTab) => {
  if (newTab === 'services' || newTab === 'categories') {
    activeTab.value = newTab;
  }
});

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  if (route.query.tab === 'categories') {
    activeTab.value = 'categories';
  } else if (route.query.tab === 'services') {
    activeTab.value = 'services';
  }
  ADMIN_EXAMINATION_CATEGORIES();
  ADMIN_EXAMINATIONS(1);
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-services-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding-bottom: 24px;
}

.page-bottom-spacer {
  height: 90px;
  flex-shrink: 0;
}
</style>
