<template>
  <div class="admin-clinics-page">
    <AdminClinicsHeader
      :active-tab="activeTab"
      :clinics-count="clinics.length"
      :examinations-count="services.length"
      @tab-change="activeTab = $event"
      @new-clinic="openNewClinicModal"
      @new-examination="openNewExaminationModal"
    />

    <AdminClinicsList
      v-if="activeTab === 'clinics'"
      :clinics="clinics"
      @toggle-status="toggleClinicStatus"
      @edit="openEditClinicModal"
    />

    <AdminExaminationsList
      v-else-if="activeTab === 'services'"
      :examinations="services"
      @toggle-status="toggleServiceStatus"
      @edit="openEditExaminationModal"
    />

    <AdminNewClinicModal
      :is-open="isNewClinicModalOpen"
      :clinic="selectedClinicToEdit"
      @close="isNewClinicModalOpen = false"
      @created="onClinicCreated"
      @updated="onClinicUpdated"
    />

    <AdminNewExaminationModal
      :is-open="isNewServiceModalOpen"
      :examination="selectedExaminationToEdit"
      @close="isNewServiceModalOpen = false"
      @created="onExaminationCreated"
      @updated="onExaminationUpdated"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AdminClinicsHeader from '../../components/admin/AdminClinicsHeader.vue';
import AdminClinicsList from '../../components/admin/AdminClinicsList.vue';
import AdminExaminationsList from '../../components/admin/AdminExaminationsList.vue';
import AdminNewClinicModal from '../../components/admin/AdminNewClinicModal.vue';
import AdminNewExaminationModal from '../../components/admin/AdminNewExaminationModal.vue';

definePageMeta({
  layout: 'admin',
});

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const activeTab = ref<'clinics' | 'services'>('clinics');
const clinics = ref<any[]>([]);
const services = ref<any[]>([]);
const isNewClinicModalOpen = ref(false);
const isNewServiceModalOpen = ref(false);
const selectedClinicToEdit = ref<any | null>(null);
const selectedExaminationToEdit = ref<any | null>(null);

// Debounce state tracking
const clinicTimers: Record<string | number, any> = {};
const clinicOriginalStates: Record<string | number, boolean> = {};

const serviceTimers: Record<string | number, any> = {};
const serviceOriginalStates: Record<string | number, boolean> = {};

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const openNewClinicModal = () => {
  selectedClinicToEdit.value = null;
  isNewClinicModalOpen.value = true;
};

const openEditClinicModal = (clinic: any) => {
  selectedClinicToEdit.value = clinic;
  isNewClinicModalOpen.value = true;
};

const onClinicCreated = (newClinic: any) => {
  clinics.value.push(newClinic);
};

const onClinicUpdated = (updatedClinic: any) => {
  const index = clinics.value.findIndex((c) => c.id === updatedClinic.id);
  if (index !== -1) {
    clinics.value[index] = { ...clinics.value[index], ...updatedClinic };
  }
};

const openNewExaminationModal = () => {
  selectedExaminationToEdit.value = null;
  isNewServiceModalOpen.value = true;
};

const openEditExaminationModal = (srv: any) => {
  selectedExaminationToEdit.value = srv;
  isNewServiceModalOpen.value = true;
};

const onExaminationCreated = (newExam: any) => {
  services.value.unshift(newExam);
};

const onExaminationUpdated = (updatedExam: any) => {
  const index = services.value.findIndex((s) => s.id === updatedExam.id);
  if (index !== -1) {
    services.value[index] = { ...services.value[index], ...updatedExam };
  }
};

const loadBackendClinics = async () => {
  try {
    const res = await api.apiRequest({ service: 'ADMIN_CLINICS' });
    if (res?.data && Array.isArray(res.data)) {
      clinics.value = res.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        doctors_count: c._count?.doctors || 0,
        is_active: c.is_active ?? true,
      }));
    }
  } catch (err) {
    clinics.value = [];
  }
};

const loadBackendServices = async () => {
  try {
    const res = await api.apiRequest({ service: 'ADMIN_EXAMINATIONS' });
    if (res?.data && Array.isArray(res.data)) {
      services.value = res.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration,
        description: s.description,
        is_active: s.is_active ?? true,
      }));
    }
  } catch (err) {
    services.value = [];
  }
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
  loadBackendClinics();
  loadBackendServices();
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
