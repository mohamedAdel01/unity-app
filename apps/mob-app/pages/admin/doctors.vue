<template>
  <div class="admin-doctors-page">
    <!-- 1. Header with Mode Tabs, search, clinic filters & stats -->
    <AdminDoctorsHeader 
      :active-tab="activeTab"
      :doctors-count="totalDoctorsCount || doctors.length"
      :clinics-count="clinicsTotal || clinics.length"
      :clinics="clinics"
      :active-filter="activeFilter"
      @tab-change="onTabChange"
      @search="onSearch"
      @filter="onFilter"
      @new-doctor="openNewDoctorModal"
      @new-clinic="openNewClinicModal"
    />

    <!-- 2. When activeTab === 'doctors': Modular Doctors Virtual List (10 by 10) -->
    <AdminDoctorsList
      v-if="activeTab === 'doctors'"
      :doctors="filteredDoctors"
      :has-more="doctorsHasMore"
      :loading="doctorsLoading"
      @edit="openEditDoctor"
      @edit-schedule="openEditSchedule"
      @view-cases="onViewCases"
      @toggle-status="onToggleDoctorStatus"
      @load-more="loadMoreDoctors"
      @reset="resetFilters"
    />

    <!-- 3. When activeTab === 'clinics': Modular Clinics Virtual List (10 by 10) -->
    <AdminClinicsList
      v-else-if="activeTab === 'clinics'"
      :clinics="clinics"
      :has-more="clinicsHasMore"
      :loading="clinicsLoading"
      @toggle-status="toggleClinicStatus"
      @edit="openEditClinicModal"
      @load-more="loadMoreClinics"
    />

    <!-- Modal: Edit Schedule -->
    <AdminEditScheduleModal 
      :is-open="isEditScheduleModalOpen"
      :doctor="selectedDoctorForSchedule"
      @close="isEditScheduleModalOpen = false"
      @updated="onScheduleUpdated"
    />

    <!-- Modal: Add / Edit Doctor -->
    <AdminDoctorModal 
      :is-open="isDoctorModalOpen"
      :doctor="selectedDoctorToEdit"
      :clinics="clinics"
      @close="isDoctorModalOpen = false"
      @created="onDoctorCreated"
      @updated="onDoctorUpdated"
    />

    <!-- Modal: Doctor Cases & Consultations Virtual List -->
    <AdminDoctorCasesModal 
      :is-open="isDoctorCasesModalOpen"
      :doctor="selectedDoctorForCases"
      @close="isDoctorCasesModalOpen = false"
    />

    <!-- Modal: Add / Edit Clinic -->
    <AdminClinicModal
      :is-open="isClinicModalOpen"
      :clinic="selectedClinicToEdit"
      @close="isClinicModalOpen = false"
      @created="onClinicCreated"
      @updated="onClinicUpdated"
    />

    <!-- Generous bottom clearance spacer ensuring content completely clears floating navbar -->
    <div class="page-bottom-spacer" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAuthStore } from '../../stores/auth';
import { useAppToast } from '../../composables/useAppToast';
import AdminDoctorsHeader from '../../components/admin/AdminDoctorsHeader.vue';
import AdminDoctorsList from '../../components/admin/AdminDoctorsList.vue';
import AdminClinicsList from '../../components/admin/AdminClinicsList.vue';
import AdminEditScheduleModal from '../../components/admin/AdminEditScheduleModal.vue';
import AdminDoctorModal from '../../components/admin/AdminDoctorModal.vue';
import AdminDoctorCasesModal from '../../components/admin/AdminDoctorCasesModal.vue';
import AdminClinicModal from '../../components/admin/AdminClinicModal.vue';

definePageMeta({
  layout: 'admin',
});

const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 2. Data (refs, reactive state)
const activeTab = ref<'doctors' | 'clinics'>('doctors');
const searchQuery = ref('');
const activeFilter = ref('all');

// Modals state
const isEditScheduleModalOpen = ref(false);
const isDoctorModalOpen = ref(false);
const isDoctorCasesModalOpen = ref(false);
const isClinicModalOpen = ref(false);

const selectedDoctorForSchedule = ref<any>(null);
const selectedDoctorToEdit = ref<any>(null);
const selectedDoctorForCases = ref<any>(null);
const selectedClinicToEdit = ref<any>(null);

// Doctors state
const doctors = ref<any[]>([]);
const totalDoctorsCount = ref(0);
const doctorsPage = ref(1);
const doctorsHasMore = ref(false);
const doctorsLoading = ref(false);

// Clinics state
const clinics = ref<any[]>([]);
const clinicsTotal = ref(0);
const clinicsPage = ref(1);
const clinicsHasMore = ref(false);
const clinicsLoading = ref(false);
const clinicsLoaded = ref(false);

// Debounce state tracking
const doctorTimers: Record<string | number, any> = {};
const doctorOriginalStates: Record<string | number, boolean> = {};

const clinicTimers: Record<string | number, any> = {};
const clinicOriginalStates: Record<string | number, boolean> = {};

// 3. Computed (computed properties)
const filteredDoctors = computed(() => {
  let list = doctors.value;

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((d) => {
      const matchName = (d.name || d.name_ar || d.name_en || '').toLowerCase().includes(q);
      const matchSpec = (d.specialty || d.specialty_ar || d.specialty_en || '').toLowerCase().includes(q);
      const matchRoom = (d.room || d.room_number || '').toLowerCase().includes(q);
      return matchName || matchSpec || matchRoom;
    });
  }

  if (activeFilter.value && activeFilter.value !== 'all') {
    list = list.filter(d => 
      String(d.clinic_id) === String(activeFilter.value) || 
      String(d.clinic?.id) === String(activeFilter.value)
    );
  }

  return list;
});

// 4. Methods (functions, handlers)
const onTabChange = (tab: 'doctors' | 'clinics') => {
  activeTab.value = tab;
  router.replace({ query: { ...route.query, tab } });
  if (tab === 'clinics' && !clinicsLoaded.value) {
    ADMIN_CLINICS();
  }
};

// Doctors CRUD & Handlers
const ADMIN_DOCTORS = async (page: any = 1) => {
  const targetPage = typeof page === 'number' ? page : 1;
  try {
    doctorsLoading.value = true;
    const filterParams: any = { page: targetPage, limit: 10 };
    if (activeFilter.value && activeFilter.value !== 'all') {
      filterParams.clinic_id = activeFilter.value;
    }
    if (searchQuery.value) {
      filterParams.search = searchQuery.value;
    }

    const res = await api.apiRequest({ 
      service: 'ADMIN_DOCTORS',
      filter: filterParams,
    });

    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    const items = raw.map((d: any) => {
      const arName = d.name_ar;
      const enName = d.name_en;
      const cName = isRtl.value ? d.clinic?.name_ar : d.clinic?.name_en;
      return {
        id: d.id,
        name_ar: arName,
        name_en: enName,
        name: isRtl.value ? (arName || d.name) : (enName || d.name),
        specialty: d.specialty || (isRtl.value ? (d.specialty_ar || d.clinic?.name_ar) : (d.specialty_en || d.clinic?.name_en)) || cName || '',
        specialty_ar: d.specialty_ar || d.specialty || d.clinic?.name_ar,
        specialty_en: d.specialty_en || d.specialty || d.clinic?.name_en,
        title: isRtl.value ? d.title_ar : d.title_en,
        title_ar: d.title_ar,
        title_en: d.title_en,
        clinic: cName || d.clinic,
        clinic_ar: d.clinic?.name_ar,
        clinic_en: d.clinic?.name_en,
        clinic_id: d.clinic_id || d.clinic?.id,
        room: d.room_number ? `${t('Room')} ${d.room_number}` : '',
        room_number: d.room_number,
        rating: Number(d.rating) || 4.9,
        reviews_count: d.reviews_count || 120,
        experience_years: d.experience_years,
        bio: isRtl.value ? (d.description_ar || d.bio_ar || d.bio) : (d.description_en || d.bio_en || d.bio),
        bio_ar: d.description_ar || d.bio_ar || d.bio,
        bio_en: d.description_en || d.bio_en || d.bio,
        description: isRtl.value ? (d.description_ar || d.description || d.bio_ar || d.bio) : (d.description_en || d.description || d.bio_en || d.bio),
        description_ar: d.description_ar || d.bio_ar || d.description,
        description_en: d.description_en || d.bio_en || d.description,
        price: d.consultation_fee,
        consultation_fee: d.consultation_fee,
        is_active: d.is_active ?? (d.status === 'active'),
        avatar: d.avatar || d.avatar_url || '',
        avatar_url: d.avatar_url || d.avatar || '',
        schedules: d.schedules || [],
      };
    });

    if (targetPage === 1) {
      doctors.value = items;
    } else {
      doctors.value.push(...items);
    }
    doctorsPage.value = targetPage;
    totalDoctorsCount.value = res?.pagination?.total ?? res?.total ?? items.length;
    doctorsHasMore.value = res?.pagination?.hasMore ?? res?.hasMore ?? (items.length >= 10);
  } catch (_) {
    if (targetPage === 1) doctors.value = [];
  } finally {
    doctorsLoading.value = false;
  }
};

const loadMoreDoctors = () => {
  if (doctorsHasMore.value && !doctorsLoading.value) {
    ADMIN_DOCTORS(doctorsPage.value + 1);
  }
};

const onSearch = (q: string) => {
  searchQuery.value = q;
  ADMIN_DOCTORS(1);
};

const onFilter = (clinicKey: string) => {
  activeFilter.value = clinicKey;
  ADMIN_DOCTORS(1);
};

const resetFilters = () => {
  searchQuery.value = '';
  activeFilter.value = 'all';
  ADMIN_DOCTORS(1);
};

const openNewDoctorModal = () => {
  selectedDoctorToEdit.value = null;
  isDoctorModalOpen.value = true;
};

const openEditDoctor = async (doc: any) => {
  selectedDoctorToEdit.value = doc;
  isDoctorModalOpen.value = true;
  if (doc?.id) {
    try {
      const res = await api.apiRequest({
        service: 'ADMIN_DOCTOR_BY_ID',
        filter: { id: doc.id },
      });
      if (res?.data) {
        selectedDoctorToEdit.value = res.data;
      }
    } catch (_) {}
  }
};

const openEditSchedule = (doc: any) => {
  selectedDoctorForSchedule.value = doc;
  isEditScheduleModalOpen.value = true;
};

const onViewCases = (doc: any) => {
  selectedDoctorForCases.value = doc;
  isDoctorCasesModalOpen.value = true;
};

const onDoctorCreated = () => {
  ADMIN_DOCTORS(1);
  ADMIN_CLINICS(1);
};

const onDoctorUpdated = (updatedDoc?: any) => {
  if (updatedDoc?.id) {
    const idx = doctors.value.findIndex((d) => String(d.id) === String(updatedDoc.id));
    if (idx !== -1) {
      doctors.value[idx] = {
        ...doctors.value[idx],
        ...updatedDoc,
        avatar: updatedDoc.avatar || doctors.value[idx].avatar,
        avatar_url: updatedDoc.avatar || doctors.value[idx].avatar_url,
      };
    }
  }
  ADMIN_DOCTORS(1);
};

const onScheduleUpdated = () => {
  ADMIN_DOCTORS(1);
};

// Clinics CRUD & Handlers
const ADMIN_CLINICS = async (page: any = 1) => {
  const targetPage = typeof page === 'number' ? page : 1;
  try {
    clinicsLoading.value = true;
    const res = await api.apiRequest({ 
      service: 'ADMIN_CLINICS',
      filter: { page: targetPage, limit: 20 },
    });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    const items = raw.map((c: any) => ({
      id: c.id,
      name_ar: c.name_ar,
      name_en: c.name_en,
      name: isRtl.value ? (c.name_ar || c.name || c.name_en) : (c.name_en || c.name || c.name_ar),
      doctors_count: c._count?.doctors || c.doctors_count || 0,
      is_active: c.is_active ?? true,
    }));

    if (targetPage === 1) {
      clinics.value = items;
    } else {
      clinics.value.push(...items);
    }
    clinicsPage.value = targetPage;
    clinicsTotal.value = res?.pagination?.total ?? res?.total ?? items.length;
    clinicsHasMore.value = res?.pagination?.hasMore ?? res?.hasMore ?? (items.length >= 20);
    clinicsLoaded.value = true;
  } catch (_) {
    if (targetPage === 1) clinics.value = [];
  } finally {
    clinicsLoading.value = false;
  }
};

const onClinicCreated = (newClinic?: any) => {
  ADMIN_CLINICS(1);
  if (newClinic) {
    const exists = clinics.value.some((c) => String(c.id) === String(newClinic.id));
    if (!exists) {
      clinics.value.unshift({
        id: newClinic.id,
        name_ar: newClinic.name_ar,
        name_en: newClinic.name_en,
        name: isRtl.value ? (newClinic.name_ar || newClinic.name_en) : (newClinic.name_en || newClinic.name_ar),
        doctors_count: 0,
        is_active: newClinic.is_active ?? true,
      });
      clinicsTotal.value = (clinicsTotal.value || 0) + 1;
    }
  }
};

const onClinicUpdated = () => {
  ADMIN_CLINICS(1);
};

const loadMoreClinics = () => {
  if (clinicsHasMore.value && !clinicsLoading.value) {
    ADMIN_CLINICS(clinicsPage.value + 1);
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

// Debounced Clinic Status Toggle
const toggleClinicStatus = (clinic: any) => {
  const id = clinic.id;

  if (clinicOriginalStates[id] === undefined) {
    clinicOriginalStates[id] = clinic.is_active;
  }

  clinic.is_active = !clinic.is_active;

  if (clinicTimers[id]) {
    clearTimeout(clinicTimers[id]);
  }

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

// Debounced Doctor Status Toggle
const onToggleDoctorStatus = (doctor: any) => {
  const id = doctor.id;

  if (doctorOriginalStates[id] === undefined) {
    doctorOriginalStates[id] = doctor.is_active;
  }

  doctor.is_active = !doctor.is_active;

  if (doctorTimers[id]) {
    clearTimeout(doctorTimers[id]);
  }

  doctorTimers[id] = setTimeout(async () => {
    const targetState = doctor.is_active;
    const originalState = doctorOriginalStates[id];
    delete doctorTimers[id];
    delete doctorOriginalStates[id];

    if (targetState === originalState) return;

    try {
      await api.apiRequest({
        service: 'ADMIN_TOGGLE_DOCTOR',
        payload: { id, is_active: targetState },
      });
      toast.success(targetState ? t('Doctor activated successfully') : t('Doctor deactivated successfully'));
    } catch (err: any) {
      doctor.is_active = originalState;
      toast.show({
        title: err?.message || t('Failed to update doctor status'),
        type: 'error',
      });
    }
  }, 500);
};

// 5. Watches (watch, watchEffect)
watch(() => route.query.tab, (newTab) => {
  if (newTab === 'clinics' || newTab === 'doctors') {
    activeTab.value = newTab;
    if (newTab === 'clinics' && !clinicsLoaded.value) {
      ADMIN_CLINICS();
    }
  }
});

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  if (route.query.tab === 'clinics') {
    activeTab.value = 'clinics';
  }
  ADMIN_DOCTORS(1);
  ADMIN_CLINICS(1);
});

onBeforeUnmount(() => {
  Object.values(doctorTimers).forEach((timer) => clearTimeout(timer));
  Object.values(clinicTimers).forEach((timer) => clearTimeout(timer));
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-doctors-page {
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
