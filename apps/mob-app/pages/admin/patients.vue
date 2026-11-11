<template>
  <div class="admin-patients-page">
    <!-- Admin Header with Switch to Patient Mode & Search & Filters -->
    <AdminPatientsHeader 
      :total-count="filterCounts.all" 
      :today-count="filterCounts.today"
      :recent-count="filterCounts.recent"
      :under-review-count="filterCounts.under_review"
      :active-filter="activeFilter"
      @search="onSearch"
      @filter="onFilter"
      @new-patient="openNewPatientModal"
    />

    <!-- Modular Patients Virtual List (10 by 10) -->
    <AdminPatientsList
      :patients="patients"
      :has-more="patientsHasMore"
      :loading="patientsLoading"
      @view-file="onViewMedicalFile"
      @book="onBookAppointment"
      @edit="onEditPatient"
      @load-more="loadMorePatients"
      @reset="resetFilters"
    />

    <!-- Modal: Add / Edit Patient -->
    <AdminPatientModal
      :is-open="isPatientModalOpen"
      :patient="selectedPatientToEdit"
      @close="isPatientModalOpen = false"
      @created="ADMIN_PATIENTS()"
      @updated="ADMIN_PATIENTS()"
    />

    <!-- Modal: View Medical File -->
    <AdminPatientFileModal 
      :is-open="isMedicalFileModalOpen" 
      :patient="selectedPatientForFile"
      @close="isMedicalFileModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import { useBookingModal } from '../../composables/useBookingModal';
import AdminPatientsHeader from '../../components/admin/AdminPatientsHeader.vue';
import AdminPatientsList from '../../components/admin/AdminPatientsList.vue';
import AdminPatientModal from '../../components/admin/AdminPatientModal.vue';
import AdminPatientFileModal from '../../components/admin/AdminPatientFileModal.vue';

definePageMeta({
  layout: 'admin',
});

const { t } = useI18n();

const api = useUnityApi();

const toast = useAppToast();

const bookingModal = useBookingModal();

// 2. Data (refs, reactive state)
const searchQuery = ref('');

const activeFilter = ref('all');

const isPatientModalOpen = ref(false);

const isMedicalFileModalOpen = ref(false);

const selectedPatientForFile = ref<any>(null);
const selectedPatientToEdit = ref<any>(null);

const patients = ref<any[]>([]);
const patientsPage = ref(1);
const patientsHasMore = ref(false);
const patientsLoading = ref(false);

const filterCounts = ref({
  all: 0,
  today: 0,
  recent: 0,
  under_review: 0,
});

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
// Load backend patients (10 by 10) with server-side search and filters
const ADMIN_PATIENTS = async (page: any = 1) => {
  const targetPage = typeof page === 'number' ? page : 1;
  try {
    patientsLoading.value = true;
    const filterParams: any = { page: targetPage, limit: 10 };
    if (activeFilter.value && activeFilter.value !== 'all') {
      filterParams.filter = activeFilter.value;
    }
    if (searchQuery.value) {
      filterParams.search = searchQuery.value;
    }

    const res = await api.apiRequest({ 
      service: 'ADMIN_PATIENTS',
      filter: filterParams,
    });
    const raw = res?.data?.patients || (Array.isArray(res?.data) ? res.data : (res?.data?.items || []));
    
    if (res?.data?.counts) {
      filterCounts.value = {
        all: res.data.counts.all ?? 0,
        today: res.data.counts.today ?? 0,
        recent: res.data.counts.recent ?? 0,
        under_review: res.data.counts.under_review ?? 0,
      };
    } else {
      filterCounts.value.all = res?.pagination?.total ?? raw.length;
    }

    const items = raw.map((p: any) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      phone: p.phone,
      mrn: p.mrn || '',
      clinic: p.clinic || '',
      insurance: p.insurance || '',
      badge: p.badge || '',
      national_id: p.national_id || '',
      last_visit: p.last_visit || '',
      next_appointment: p.next_appointment || '',
      diagnosis: p.diagnosis || '',
      is_today: !!p.is_today,
      status: p.status || 'active',
    }));

    if (targetPage === 1) {
      patients.value = items;
    } else {
      patients.value.push(...items);
    }
    patientsPage.value = targetPage;
    patientsHasMore.value = res?.pagination?.hasMore ?? res?.data?.hasMore ?? res?.hasMore ?? (items.length >= 10);
  } catch (err) {
    if (targetPage === 1) {
      patients.value = [];
    }
  } finally {
    patientsLoading.value = false;
  }
};

const loadMorePatients = () => {
  if (patientsHasMore.value && !patientsLoading.value) {
    ADMIN_PATIENTS(patientsPage.value + 1);
  }
};

const onSearch = (q: string) => {
  searchQuery.value = q;
  ADMIN_PATIENTS(1);
};

const onFilter = (key: string) => {
  activeFilter.value = key;
  ADMIN_PATIENTS(1);
};

const resetFilters = () => {
  searchQuery.value = '';
  activeFilter.value = 'all';
  ADMIN_PATIENTS(1);
};

const openNewPatientModal = () => {
  selectedPatientToEdit.value = null;
  isPatientModalOpen.value = true;
};

const onViewMedicalFile = (patient: any) => {
  selectedPatientForFile.value = patient;
  isMedicalFileModalOpen.value = true;
};

const onBookAppointment = (patient: any) => {
  bookingModal.openBookingFlow({
    specialty: patient.clinic || t('Internal Medicine Clinic'),
  });
};

const onEditPatient = (patient: any) => {
  selectedPatientToEdit.value = patient;
  isPatientModalOpen.value = true;
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  ADMIN_PATIENTS();
});

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: computed(() => t('Patients Records — Admin Portal')),
});
</script>

<style scoped lang="scss">
.admin-patients-page {
  padding: 14px 18px 36px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  .patients-accordion-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .empty-patients-state {
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

    .btn-reset-search {
      margin-top: 6px;
      padding: 8px 18px;
      background: var(--unity-primary-light);
      color: var(--unity-primary-dark);
      border: 1px solid var(--unity-primary-tint);
      border-radius: 14px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--unity-primary);
        color: #fff;
      }
    }
  }
}
</style>
