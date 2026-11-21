<template>
  <div class="admin-doctors-manage-view">
    <AdminDoctorsHeader 
      active-tab="doctors"
      :selected-clinic-id="effectiveClinicId"
      :selected-clinic-name="activeClinicDisplayName"
      :doctors-count="totalDoctorsCount || doctors.length"
      :clinics-count="clinics.length"
      :clinics="clinics"
      :active-filter="effectiveClinicId"
      @search="onSearch"
      @filter="onFilterPill"
      @back-to-clinics="emit('back')"
      @new-doctor="openNewDoctorModal"
      @new-clinic="openNewClinicModal"
    />

    <AdminDoctorsList
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

    <div class="page-bottom-spacer" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AdminDoctorsHeader from './AdminDoctorsHeader.vue';
import AdminDoctorsList from './AdminDoctorsList.vue';
import AdminEditScheduleModal from './AdminEditScheduleModal.vue';
import AdminDoctorModal from './AdminDoctorModal.vue';
import AdminDoctorCasesModal from './AdminDoctorCasesModal.vue';
import AdminClinicModal from './AdminClinicModal.vue';

const props = withDefaults(
  defineProps<{
    clinicId?: string | number;
  }>(),
  {
    clinicId: 'all',
  }
);

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'select-clinic', clinicId: string | number): void;
}>();

const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const searchQuery = ref('');
const doctors = ref<any[]>([]);
const totalDoctorsCount = ref(0);
const doctorsPage = ref(1);
const doctorsHasMore = ref(false);
const doctorsLoading = ref(false);

const clinics = ref<any[]>([]);

// Modals
const isEditScheduleModalOpen = ref(false);
const isDoctorModalOpen = ref(false);
const isDoctorCasesModalOpen = ref(false);
const isClinicModalOpen = ref(false);

const selectedDoctorForSchedule = ref<any>(null);
const selectedDoctorToEdit = ref<any>(null);
const selectedDoctorForCases = ref<any>(null);
const selectedClinicToEdit = ref<any>(null);

// Debounce state tracking
const doctorTimers: Record<string | number, any> = {};
const doctorOriginalStates: Record<string | number, boolean> = {};

// 3. Computed (computed properties)
const effectiveClinicId = computed(() => {
  return String(props.clinicId || 'all');
});

const activeClinicDisplayName = computed(() => {
  if (!effectiveClinicId.value || effectiveClinicId.value === 'all') {
    return t('All Doctors');
  }
  const clinic = clinics.value.find((c) => String(c.id) === String(effectiveClinicId.value));
  if (clinic) {
    return isRtl.value ? (clinic.name_ar || clinic.name || clinic.name_en) : (clinic.name_en || clinic.name || clinic.name_ar);
  }
  return t('Specialized Clinic');
});

const filteredDoctors = computed(() => {
  let list = doctors.value;
  if (effectiveClinicId.value && effectiveClinicId.value !== 'all') {
    list = list.filter((d: any) => String(d.clinic_id || d.clinic?.id) === String(effectiveClinicId.value));
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((d: any) => {
      const arName = (d.name_ar || '').toLowerCase();
      const enName = (d.name_en || '').toLowerCase();
      const directName = (d.name || '').toLowerCase();
      const arClinic = (d.clinic_ar || '').toLowerCase();
      const enClinic = (d.clinic_en || '').toLowerCase();
      const directClinic = (typeof d.clinic === 'string' ? d.clinic : '').toLowerCase();
      const room = String(d.room_number || '').toLowerCase();
      return (
        arName.includes(q) ||
        enName.includes(q) ||
        directName.includes(q) ||
        arClinic.includes(q) ||
        enClinic.includes(q) ||
        directClinic.includes(q) ||
        room.includes(q)
      );
    });
  }
  return list;
});

// 4. Methods (functions, handlers)
const onSearch = (q: string) => {
  searchQuery.value = q;
};

const onFilterPill = (key: string) => {
  emit('select-clinic', key);
};

const resetFilters = () => {
  searchQuery.value = '';
};

const openNewDoctorModal = () => {
  selectedDoctorToEdit.value = null;
  isDoctorModalOpen.value = true;
};

const openEditDoctor = async (doctor: any) => {
  selectedDoctorToEdit.value = doctor;
  isDoctorModalOpen.value = true;
  if (doctor?.id) {
    try {
      const res = await api.apiRequest({
        service: 'ADMIN_DOCTOR_BY_ID',
        filter: { id: doctor.id },
      });
      if (res?.data) {
        selectedDoctorToEdit.value = res.data;
      }
    } catch (_) {}
  }
};

const openEditSchedule = (doctor: any) => {
  selectedDoctorForSchedule.value = doctor;
  isEditScheduleModalOpen.value = true;
};

const onViewCases = (doctor: any) => {
  selectedDoctorForCases.value = doctor;
  isDoctorCasesModalOpen.value = true;
};

const openNewClinicModal = () => {
  selectedClinicToEdit.value = null;
  isClinicModalOpen.value = true;
};

const onScheduleUpdated = () => {
  ADMIN_DOCTORS(1);
};

const onDoctorCreated = () => {
  ADMIN_DOCTORS(1);
  ADMIN_CLINICS();
};

const onDoctorUpdated = () => {
  ADMIN_DOCTORS(1);
  ADMIN_CLINICS();
};

const onClinicCreated = () => {
  ADMIN_CLINICS();
};

const onClinicUpdated = () => {
  ADMIN_CLINICS();
};

const ADMIN_DOCTORS = async (page: any = 1) => {
  const targetPage = typeof page === 'number' ? page : 1;
  try {
    doctorsLoading.value = true;
    const filterParams: any = { page: targetPage, limit: 10 };
    if (effectiveClinicId.value && effectiveClinicId.value !== 'all') {
      filterParams.clinic_id = effectiveClinicId.value;
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
        description: isRtl.value ? (d.description_ar || d.description || '') : (d.description_en || d.description || ''),
        description_ar: d.description_ar || d.description || '',
        description_en: d.description_en || d.description || '',
        price: d.consultation_fee,
        consultation_fee: d.consultation_fee,
        is_active: d.is_active ?? true,
        user_id: d.user_id,
        user: d.user,
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

const ADMIN_CLINICS = async () => {
  try {
    const res = await api.apiRequest({
      service: 'ADMIN_CLINICS',
      filter: { limit: 100 },
    });
    if (res?.data) {
      clinics.value = Array.isArray(res.data) ? res.data : (res.data.items || []);
    }
  } catch (_) {}
};

const onToggleDoctorStatus = (doctor: any) => {
  const id = doctor.id;
  if (doctorOriginalStates[id] === undefined) {
    doctorOriginalStates[id] = doctor.is_active;
  }
  doctor.is_active = !doctor.is_active;
  if (doctorTimers[id]) clearTimeout(doctorTimers[id]);
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
watch(() => props.clinicId, () => {
  ADMIN_DOCTORS(1);
});

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  ADMIN_CLINICS();
  ADMIN_DOCTORS(1);
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-doctors-manage-view {
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
