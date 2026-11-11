<template>
  <div class="admin-doctors-page">
    <!-- 1. Header with search, clinic filters & stats -->
    <AdminDoctorsHeader 
      :total-count="totalDoctorsCount"
      :clinics="clinics"
      @search="onSearch"
      @filter="onFilter"
      @new-doctor="openNewDoctorModal"
    />

    <!-- 2. Modular Doctors Virtual List (10 by 10) -->
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
      @close="isDoctorModalOpen = false"
      @created="onDoctorCreated"
      @updated="ADMIN_DOCTORS(1)"
    />

    <!-- Modal: Doctor Cases & Consultations Virtual List -->
    <AdminDoctorCasesModal 
      :is-open="isDoctorCasesModalOpen"
      :doctor="selectedDoctorForCases"
      @close="isDoctorCasesModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AdminDoctorsHeader from '../../components/admin/AdminDoctorsHeader.vue';
import AdminDoctorsList from '../../components/admin/AdminDoctorsList.vue';
import AdminEditScheduleModal from '../../components/admin/AdminEditScheduleModal.vue';
import AdminDoctorModal from '../../components/admin/AdminDoctorModal.vue';
import AdminDoctorCasesModal from '../../components/admin/AdminDoctorCasesModal.vue';

definePageMeta({
  layout: 'admin',
});

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const searchQuery = ref('');
const activeFilter = ref('all');

const isEditScheduleModalOpen = ref(false);
const isDoctorModalOpen = ref(false);
const isDoctorCasesModalOpen = ref(false);

const selectedDoctorForSchedule = ref<any>(null);
const selectedDoctorToEdit = ref<any>(null);
const selectedDoctorForCases = ref<any>(null);

const doctors = ref<any[]>([]);
const totalDoctorsCount = ref(0);
const doctorsPage = ref(1);
const doctorsHasMore = ref(false);
const doctorsLoading = ref(false);

const clinics = ref<any[]>([]);

// 3. Computed (computed properties)
const filteredDoctors = computed(() => {
  let list = doctors.value;

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((d) => {
      const matchName = d.name?.toLowerCase().includes(q);
      const matchSpec = d.specialty?.toLowerCase().includes(q);
      const matchRoom = d.room?.toLowerCase().includes(q);
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
// Load backend doctors (10 by 10)
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
    const items = raw.map((d: any) => ({
      id: d.id,
      user_id: d.user_id || d.user?.id,
      name: d.user?.name || d.name,
      phone: d.phone || d.user?.phone || '',
      avatar: d.user?.avatar || d.avatar,
      clinic_id: d.clinic_id || d.clinic?.id,
      clinic: d.clinic,
      specialty: d.clinic?.name || d.specialty || '',
      room: d.room || '',
      status_badge: (d.user?.status === 'active' || d.status === 'active') ? t('Open Clinic') : t('Unavailable'),
      schedule_time: '',
      cases_count: d._count?.appointments ?? d.cases_count ?? 0,
      is_active: d.user?.status === 'active' || d.status === 'active',
      is_evening: false,
      primary_action: false,
      schedules: d.user?.doctor_schedules || d.schedules || [],
      consultation_fee: d.consultation_fee ?? 0,
      follow_up_fee: d.follow_up_fee ?? 0,
      slot_duration: d.slot_duration ?? 15,
      bio: d.bio ?? '',
    }));

    if (targetPage === 1) {
      doctors.value = items;
      totalDoctorsCount.value = res?.pagination?.total ?? items.length;
    } else {
      doctors.value.push(...items);
    }
    doctorsPage.value = targetPage;
    doctorsHasMore.value = res?.pagination?.hasMore ?? res?.hasMore ?? (items.length >= 10);
  } catch (err) {
    if (targetPage === 1) doctors.value = [];
  } finally {
    doctorsLoading.value = false;
  }
};

// Load clinics from backend for filter pills
const ADMIN_CLINICS = async () => {
  try {
    const res = await api.apiRequest({
      service: 'ADMIN_CLINICS',
      filter: { limit: 100 },
    });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    clinics.value = raw.map((c: any) => ({
      id: c.id,
      name: c.name,
    }));
  } catch (err) {}
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

const onFilter = (clinicId: string) => {
  activeFilter.value = clinicId;
  ADMIN_DOCTORS(1);
};

const resetFilters = () => {
  searchQuery.value = '';
  activeFilter.value = 'all';
  ADMIN_DOCTORS(1);
};

const onDoctorCreated = (newDoc?: any) => {
  searchQuery.value = '';
  if (activeFilter.value !== 'all' && newDoc?.clinic_id && String(activeFilter.value) !== String(newDoc.clinic_id)) {
    activeFilter.value = 'all';
  }
  ADMIN_DOCTORS(1);
};

const openEditSchedule = (doc: any) => {
  selectedDoctorForSchedule.value = doc;
  isEditScheduleModalOpen.value = true;
};

const onScheduleUpdated = async (_payload: any) => {
  ADMIN_DOCTORS(1);
};

const openNewDoctorModal = () => {
  selectedDoctorToEdit.value = null;
  isDoctorModalOpen.value = true;
};

const openEditDoctor = (doc: any) => {
  selectedDoctorToEdit.value = doc;
  isDoctorModalOpen.value = true;
};

const onViewCases = (doc: any) => {
  selectedDoctorForCases.value = doc;
  isDoctorCasesModalOpen.value = true;
};

// Debounce state tracking
const doctorTimers: Record<string | number, any> = {};
const doctorOriginalStates: Record<string | number, boolean> = {};

const onToggleDoctorStatus = (doc: any) => {
  const id = doc.id;

  if (doctorOriginalStates[id] === undefined) {
    doctorOriginalStates[id] = doc.is_active;
  }

  // Instant optimistic UI update
  doc.is_active = !doc.is_active;
  doc.status_badge = doc.is_active ? t('Open Clinic') : t('Unavailable');

  if (doctorTimers[id]) {
    clearTimeout(doctorTimers[id]);
  }

  doctorTimers[id] = setTimeout(async () => {
    const targetState = doc.is_active;
    const originalState = doctorOriginalStates[id];
    delete doctorTimers[id];
    delete doctorOriginalStates[id];

    if (targetState === originalState) return;

    try {
      await api.apiRequest({
        service: 'ADMIN_UPDATE_DOCTOR',
        payload: { id, is_active: targetState },
      });
      toast.success(targetState ? t('Doctor marked active') : t('Doctor marked inactive'));
    } catch (err: any) {
      doc.is_active = originalState;
      doc.status_badge = originalState ? t('Open Clinic') : t('Unavailable');
      toast.error(err.message || t('Failed to update doctor'));
    }
  }, 500);
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  ADMIN_DOCTORS();
  ADMIN_CLINICS();
});

onBeforeUnmount(() => {
  Object.values(doctorTimers).forEach(clearTimeout);
});

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: computed(() => t('Doctors Management — Admin Portal')),
});
</script>

<style scoped lang="scss">
.admin-doctors-page {
  padding: 14px 18px 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  .doctors-cards-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .empty-doctors-state {
    background: var(--unity-surface);
    border: 1.5px dashed var(--unity-border);
    border-radius: 20px;
    padding: 36px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
    margin-top: 10px;

    i {
      font-size: 2.2rem;
      color: var(--unity-text-dim);
    }

    h5 {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    p {
      font-size: 0.8rem;
      color: var(--unity-text-muted);
      max-width: 280px;
      line-height: 1.5;
    }

    .btn-reset {
      margin-top: 6px;
      padding: 8px 18px;
      background: var(--unity-primary-light);
      color: var(--unity-primary-dark);
      border: 1px solid var(--unity-primary-tint);
      border-radius: 14px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
    }
  }

  .bottom-sync-notice {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: var(--unity-surface);
    border-radius: 16px;
    border: 1px solid var(--unity-border-subtle);
    font-size: 0.78rem;
    color: var(--unity-text-muted);
    font-weight: 600;

    i {
      color: var(--unity-primary);
    }
  }
}
</style>
