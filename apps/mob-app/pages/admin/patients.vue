<template>
  <div class="admin-patients-page" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- Admin Header with Switch to Patient Mode & Search & Filters -->
    <AdminPatientsHeader 
      :total-count="totalDisplayCount" 
      :today-count="todayPatientsCount"
      @search="onSearch"
      @filter="onFilter"
      @new-patient="openNewPatientModal"
    />

    <!-- Patients List -->
    <div v-if="filteredPatients.length > 0" class="patients-accordion-list">
      <AdminPatientCard 
        v-for="(patient, index) in filteredPatients" 
        :key="patient.id || index"
        :patient="patient"
        :initially-expanded="index === 0"
        @view-file="onViewMedicalFile"
        @book="onBookAppointment"
        @edit="onEditPatient"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-patients-state">
      <i class="pi pi-search"></i>
      <h5>{{ t('No matching patients found') }}</h5>
      <p>{{ t('Try searching with a different name, MRN, or National ID.') }}</p>
      <button class="btn-reset-search" @click="resetFilters">
        {{ t('Reset Search') }}
      </button>
    </div>

    <!-- Modal: Add New Patient -->
    <AdminNewPatientModal 
      :is-open="isNewPatientModalOpen" 
      @close="isNewPatientModalOpen = false"
      @created="onPatientCreated"
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
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import { useBookingModal } from '../../composables/useBookingModal';
import AdminPatientsHeader from '../../components/admin/AdminPatientsHeader.vue';
import AdminPatientCard from '../../components/admin/AdminPatientCard.vue';
import AdminNewPatientModal from '../../components/admin/AdminNewPatientModal.vue';
import AdminPatientFileModal from '../../components/admin/AdminPatientFileModal.vue';

definePageMeta({
  title: 'سجلات المرضى — لوحة الإشراف',
});

const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();
const bookingModal = useBookingModal();

const searchQuery = ref('');
const activeFilter = ref('all');
const isNewPatientModalOpen = ref(false);
const isMedicalFileModalOpen = ref(false);
const selectedPatientForFile = ref<any>(null);

const patients = ref<any[]>([]);
const totalDisplayCount = ref(0);
const todayPatientsCount = computed(() => {
  return patients.value.filter(p => p.is_today).length;
});

// Load backend patients if server API is reachable
const loadBackendPatients = async () => {
  try {
    const config = useRuntimeConfig();
    const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
    const res: any = await $fetch(`${baseUrl}/api/v1/admin/patients`, {
      headers: api.token.value ? { Authorization: `Bearer ${api.token.value}` } : {},
    });

    if (res?.status && Array.isArray(res?.data?.patients) && res.data.patients.length > 0) {
      totalDisplayCount.value = res.data.total || res.data.patients.length;
      patients.value = res.data.patients.map((p: any) => ({
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
    } else {
      patients.value = [];
      totalDisplayCount.value = 0;
    }
  } catch (err) {
    patients.value = [];
    totalDisplayCount.value = 0;
  }
};

onMounted(() => {
  loadBackendPatients();
});

// Search and Filter computation
const filteredPatients = computed(() => {
  let list = patients.value;

  // Search filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(q);
      const matchMrn = p.mrn?.includes(q);
      const matchPhone = p.phone?.includes(q);
      const matchNational = p.national_id?.includes(q);
      const matchClinic = p.clinic?.toLowerCase().includes(q);
      return matchName || matchMrn || matchPhone || matchNational || matchClinic;
    });
  }

  // Pill filter
  if (activeFilter.value === 'today') {
    list = list.filter(p => p.is_today);
  } else if (activeFilter.value === 'recent') {
    list = list.slice(0, 3);
  } else if (activeFilter.value === 'under_review') {
    list = list.filter(p => p.status === 'review');
  }

  return list;
});

const onSearch = (q: string) => {
  searchQuery.value = q;
};

const onFilter = (key: string) => {
  activeFilter.value = key;
};

const resetFilters = () => {
  searchQuery.value = '';
  activeFilter.value = 'all';
};

const openNewPatientModal = () => {
  isNewPatientModalOpen.value = true;
};

const onPatientCreated = (newPatient: any) => {
  patients.value.unshift(newPatient);
  totalDisplayCount.value += 1;
  toast.success(isRtl.value ? 'تم تسجيل وإضافة المريض الجديد بنجاح!' : 'New patient registered successfully!', isRtl.value ? 'إدارة المرضى' : 'Patients');
};

const onViewMedicalFile = (patient: any) => {
  selectedPatientForFile.value = patient;
  isMedicalFileModalOpen.value = true;
};

const onBookAppointment = (patient: any) => {
  bookingModal.openBookingFlow({
    specialty: patient.clinic || 'عيادة الباطنية',
  });
};

const onEditPatient = (patient: any) => {
  selectedPatientForFile.value = patient;
  isMedicalFileModalOpen.value = true;
};
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

