<template>
  <div class="admin-clinics-page">
    <AdminClinicsHeader
      :active-tab="activeTab"
      :clinics-count="clinicsTotal || clinics.length"
      :examinations-count="servicesTotal || services.length"
      @tab-change="onTabChange"
      @new-clinic="openNewClinicModal"
      @new-examination="openNewExaminationModal"
    />

    <AdminClinicsList
      v-if="activeTab === 'clinics'"
      :clinics="clinics"
      :has-more="clinicsHasMore"
      :loading="clinicsLoading"
      @toggle-status="toggleClinicStatus"
      @edit="openEditClinicModal"
      @load-more="loadMoreClinics"
    />

    <AdminExaminationsList
      v-else-if="activeTab === 'services'"
      :examinations="services"
      :categories="categories"
      :has-more="servicesHasMore"
      :loading="servicesLoading"
      @toggle-status="toggleServiceStatus"
      @edit="openEditExaminationModal"
      @load-more="loadMoreExaminations"
      @new-category="isCategoryModalOpen = true"
    />

    <AdminClinicModal
      :is-open="isClinicModalOpen"
      :clinic="selectedClinicToEdit"
      @close="isClinicModalOpen = false"
      @created="ADMIN_CLINICS()"
      @updated="ADMIN_CLINICS()"
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
      @close="isCategoryModalOpen = false"
      @saved="onCategorySaved"
    />

    <!-- Generous bottom clearance spacer ensuring content completely clears floating navbar -->
    <div class="page-bottom-spacer" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAuthStore } from '../../stores/auth';
import { useAppToast } from '../../composables/useAppToast';
import AdminClinicsHeader from '../../components/admin/AdminClinicsHeader.vue';
import AdminClinicsList from '../../components/admin/AdminClinicsList.vue';
import AdminExaminationsList from '../../components/admin/AdminExaminationsList.vue';
import AdminClinicModal from '../../components/admin/AdminClinicModal.vue';
import AdminExaminationModal from '../../components/admin/AdminExaminationModal.vue';
import AdminExaminationCategoryModal from '../../components/admin/AdminExaminationCategoryModal.vue';

definePageMeta({
  layout: 'admin',
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const api = useUnityApi();
const toast = useAppToast();
const authStore = useAuthStore();

// 2. Data (refs, reactive state)
const activeTab = ref<'clinics' | 'services'>('clinics');
const clinics = ref<any[]>([]);
const services = ref<any[]>([]);
const clinicsTotal = ref(0);
const servicesTotal = ref(0);
const clinicsPage = ref(1);
const clinicsHasMore = ref(false);
const clinicsLoading = ref(false);
const clinicsLoaded = ref(false);
const servicesPage = ref(1);
const servicesHasMore = ref(false);
const servicesLoading = ref(false);
const servicesLoaded = ref(false);
const isClinicModalOpen = ref(false);
const isExaminationModalOpen = ref(false);
const isCategoryModalOpen = ref(false);
const categories = ref<any[]>([]);
const selectedClinicToEdit = ref<any | null>(null);
const selectedExaminationToEdit = ref<any | null>(null);

// Debounce state tracking
const clinicTimers: Record<string | number, any> = {};
const clinicOriginalStates: Record<string | number, boolean> = {};

const serviceTimers: Record<string | number, any> = {};
const serviceOriginalStates: Record<string | number, boolean> = {};

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const onTabChange = (tab: 'clinics' | 'services') => {
  activeTab.value = tab;
  if (tab === 'clinics' && !clinicsLoaded.value) {
    ADMIN_CLINICS();
  } else if (tab === 'services' && !servicesLoaded.value) {
    ADMIN_EXAMINATIONS();
  }
};

const openNewClinicModal = () => {
  selectedClinicToEdit.value = null;
  isClinicModalOpen.value = true;
};

const openEditClinicModal = (clinic: any) => {
  selectedClinicToEdit.value = clinic;
  isClinicModalOpen.value = true;
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
    } catch (e) {}
  }
};

const ADMIN_CLINICS = async (page: any = 1) => {
  const targetPage = typeof page === 'number' ? page : 1;
  try {
    clinicsLoading.value = true;
    const res = await api.apiRequest({ 
      service: 'ADMIN_CLINICS',
      filter: { page: targetPage, limit: 10 },
    });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    const items = raw.map((c: any) => ({
      id: c.id,
      name: c.name,
      doctors_count: c._count?.doctors || 0,
      is_active: c.is_active ?? true,
    }));

    if (targetPage === 1) {
      clinics.value = items;
    } else {
      clinics.value.push(...items);
    }
    clinicsPage.value = targetPage;
    clinicsTotal.value = res?.pagination?.total ?? res?.total ?? items.length;
    clinicsHasMore.value = res?.pagination?.hasMore ?? res?.hasMore ?? (items.length >= 10);
    clinicsLoaded.value = true;
  } catch (err) {
    if (targetPage === 1) clinics.value = [];
  } finally {
    clinicsLoading.value = false;
  }
};

const loadMoreClinics = () => {
  if (clinicsHasMore.value && !clinicsLoading.value) {
    ADMIN_CLINICS(clinicsPage.value + 1);
  }
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
    const items = raw.map((s: any) => ({
      id: s.id,
      name: s.name,
      name_ar: s.name_ar,
      name_en: s.name_en,
      price: s.price,
      duration: s.duration,
      description: s.description,
      description_ar: s.description_ar,
      description_en: s.description_en,
      category_id: s.category_id,
      category: s.category,
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
    servicesLoaded.value = true;
  } catch (err) {
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

const onExaminationSaved = () => {
  ADMIN_EXAMINATION_CATEGORIES();
  ADMIN_EXAMINATIONS(1);
};

// Debounced Clinic Status Toggle (Instant 0ms UI response + 500ms background debounce)
const toggleClinicStatus = (clinic: any) => {
  const id = clinic.id;

  // 1. Remember initial confirmed state before rapid toggles begin
  if (clinicOriginalStates[id] === undefined) {
    clinicOriginalStates[id] = clinic.is_active;
  }

  // 2. Instant optimistic UI switch (smooth & zero lag)
  clinic.is_active = !clinic.is_active;

  // 3. Reset existing debounce timer for this item
  if (clinicTimers[id]) {
    clearTimeout(clinicTimers[id]);
  }

  // 4. Fire background request 500ms after the LAST selection
  clinicTimers[id] = setTimeout(async () => {
    const targetState = clinic.is_active;
    const originalState = clinicOriginalStates[id];
    delete clinicTimers[id];
    delete clinicOriginalStates[id];

    // If final selection ended up being identical to starting state, no request needed
    if (targetState === originalState) return;

    try {
      await api.apiRequest({
        service: 'ADMIN_TOGGLE_CLINIC',
        payload: { id, is_active: targetState },
      });
      toast.success(targetState ? t('Clinic activated successfully') : t('Clinic deactivated successfully'));
    } catch (err: any) {
      // Revert UI on failure
      clinic.is_active = originalState;
      toast.error(err.message || t('Failed to update clinic'));
    }
  }, 500);
};

// Debounced Examination Status Toggle (Instant 0ms UI response + 500ms background debounce)
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
      toast.success(targetState ? t('Examination activated successfully') : t('Examination deactivated successfully'));
    } catch (err: any) {
      srv.is_active = originalState;
      toast.error(err.message || t('Failed to update examination'));
    }
  }, 500);
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  if (authStore.isReceptionist) {
    router.replace('/admin/appointments');
    return;
  }
  ADMIN_EXAMINATION_CATEGORIES();
  if (route.query.tab === 'services') {
    activeTab.value = 'services';
    ADMIN_EXAMINATIONS();
  } else {
    ADMIN_CLINICS();
  }
});

onBeforeUnmount(() => {
  Object.values(clinicTimers).forEach(clearTimeout);
  Object.values(serviceTimers).forEach(clearTimeout);
});

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: computed(() => t('Clinics & Examinations Management — Admin Portal')),
});
</script>

<style scoped lang="scss">
.admin-clinics-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 16px 28px;
  direction: rtl;
}
</style>

