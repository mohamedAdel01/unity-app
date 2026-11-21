<template>
  <div class="admin-clinics-manage-view">
    <AdminDoctorsHeader 
      active-tab="clinics"
      :selected-clinic-id="''"
      :doctors-count="totalDoctorsCount"
      :clinics-count="clinicsTotal || clinics.length"
      :clinics="clinics"
      @search="onSearch"
      @new-clinic="openNewClinicModal"
      @tab-change="onTabChange"
    />

    <AdminClinicsList
      :clinics="filteredClinics"
      :has-more="clinicsHasMore"
      :loading="clinicsLoading"
      @toggle-status="toggleClinicStatus"
      @edit="openEditClinicModal"
      @select="emit('select-clinic', $event)"
      @load-more="loadMoreClinics"
    />

    <AdminClinicModal
      :is-open="isClinicModalOpen"
      :clinic="selectedClinicToEdit"
      @close="isClinicModalOpen = false"
      @created="onClinicSaved"
      @updated="onClinicSaved"
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
import AdminDoctorsHeader from './AdminDoctorsHeader.vue';
import AdminClinicsList from './AdminClinicsList.vue';
import AdminClinicModal from './AdminClinicModal.vue';

const emit = defineEmits<{
  (e: 'select-clinic', clinic: any): void;
  (e: 'select-all-doctors'): void;
}>();

const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const searchQuery = ref('');
const clinics = ref<any[]>([]);
const clinicsTotal = ref(0);
const clinicsPage = ref(1);
const clinicsHasMore = ref(false);
const clinicsLoading = ref(false);
const totalDoctorsCount = ref(0);

const isClinicModalOpen = ref(false);
const selectedClinicToEdit = ref<any>(null);

const clinicTimers: Record<string | number, any> = {};
const clinicOriginalStates: Record<string | number, boolean> = {};

// 3. Computed (computed properties)
const filteredClinics = computed(() => {
  let list = clinics.value;
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

const onTabChange = (tab: 'doctors' | 'clinics') => {
  if (tab === 'doctors') {
    emit('select-all-doctors');
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
      name_ar: c.name_ar,
      name_en: c.name_en,
      name: isRtl.value ? (c.name_ar || c.name) : (c.name_en || c.name),
      doctors_count: Number(c.doctors_count || c._count?.doctors || 0),
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
  } catch (_) {
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

const fetchDoctorStats = async () => {
  try {
    const res = await api.apiRequest({
      service: 'ADMIN_DOCTORS',
      filter: { page: 1, limit: 1 },
    });
    totalDoctorsCount.value = res?.pagination?.total ?? res?.total ?? 0;
  } catch (_) {}
};

const onClinicSaved = () => {
  ADMIN_CLINICS(1);
  fetchDoctorStats();
};

const toggleClinicStatus = (clinic: any) => {
  const id = clinic.id;
  if (clinicOriginalStates[id] === undefined) {
    clinicOriginalStates[id] = clinic.is_active;
  }
  clinic.is_active = !clinic.is_active;
  if (clinicTimers[id]) clearTimeout(clinicTimers[id]);
  clinicTimers[id] = setTimeout(async () => {
    const targetState = clinic.is_active;
    const originalState = clinicOriginalStates[id];
    delete clinicTimers[id];
    delete clinicOriginalStates[id];
    if (targetState === originalState) return;
    try {
      await api.apiRequest({
        service: 'ADMIN_TOGGLE_CLINIC',
        payload: { id, is_active: targetState },
      });
      toast.success(targetState ? t('Clinic activated successfully') : t('Clinic deactivated successfully'));
    } catch (err: any) {
      clinic.is_active = originalState;
      toast.show({
        title: err?.message || t('Failed to update clinic status'),
        type: 'error',
      });
    }
  }, 500);
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  ADMIN_CLINICS(1);
  fetchDoctorStats();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-clinics-manage-view {
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
