<template>
  <div class="records-page">
    <RecordsHeader />
    <RecordsTabs v-model="activeTab" />
    <RecordsList 
      :items="currentItems" 
      :loading="isLoading || recordsLoading" 
      :has-more="recordsHasMore"
      @download="onDownload" 
      @view="onView" 
      @book="onBookRecord"
      @load-more="loadMoreRecords"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useGlobalStore } from '../stores/global';
import { useUnityApi } from '../composables/useUnityApi';
import { useBookingModal } from '../composables/useBookingModal';
import { useAppToast } from '../composables/useAppToast';
import { useI18n } from '../composables/useI18n';
import RecordsHeader from '../components/records/RecordsHeader.vue';
import RecordsTabs from '../components/records/RecordsTabs.vue';
import RecordsList from '../components/records/RecordsList.vue';

definePageMeta({
  middleware: ['auth', 'patient'],
});

const globalStore = useGlobalStore();

const api = useUnityApi();

const bookingModal = useBookingModal();

const toast = useAppToast();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)
const activeTab = ref<'reports' | 'labs' | 'prescriptions'>('reports');

const reportsData = ref<any[]>([]);

const labsData = ref<any[]>([]);

const prescriptionsData = ref<any[]>([]);
const recordsPage = ref(1);
const recordsHasMore = ref(false);
const recordsLoading = ref(false);

// 3. Computed (computed properties)
const isLoading = computed(() => globalStore.loading.includes('records'));

const currentItems = computed(() => {
  if (activeTab.value === 'reports') return reportsData.value;
  if (activeTab.value === 'labs') return labsData.value;
  return prescriptionsData.value;
});

// 4. Methods (functions, handlers)
const mapRecordItem = (item: any, defaultType: 'report' | 'lab' | 'prescription') => {
  const doc = item.doctor;
  const exam = item.examination;
  const isLab = defaultType === 'lab' || Boolean(exam);
  const isPresc = defaultType === 'prescription' || Boolean(item.prescription);

  let title = item.title;
  if (!title) {
    if (isLab) title = exam?.name || t('Certified Laboratory Diagnostics');
    else if (isPresc) title = t('Certified Medical Prescription');
    else title = item.diagnosis ? `${t('Medical Consultation')}: ${item.diagnosis.slice(0, 25)}` : t('Clinical Visit Report');
  }

  const d = item.date ? new Date(item.date) : new Date();
  const dateFormatted = d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return {
    id: item.id || `rec-${Date.now()}`,
    type: item.type || defaultType,
    title,
    doctor: doc?.name || item.doctor_name || '',
    rawDoctor: doc ? {
      id: doc.id,
      user_id: doc.id,
      name: doc.name,
      avatar: doc.avatar,
      clinic: doc.doctor?.clinic,
    } : null,
    clinic: doc?.doctor?.clinic?.name || '',
    examination: exam,
    date: dateFormatted,
    summary: item.summary || item.diagnosis || item.prescription || item.notes || '',
    badge: isLab ? t('Diagnostic Lab Tests') : (isPresc ? t('Prescription') : t('Clinical Consultation')),
    status: item.status || 'completed',
    statusLabel: t('Certified & Documented'),
    hasDetails: true,
  };
};

const PATIENT_RECORDS = async (page = 1) => {
  try {
    recordsLoading.value = true;
    const res = await api.apiRequest({ 
      service: 'PATIENT_RECORDS',
      filter: { page, limit: 10 },
    });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);

    const mapped = raw.map((r: any) => {
      const type = r.type || (r.examination ? 'lab' : (r.prescription ? 'prescription' : 'report'));
      return mapRecordItem(r, type);
    });

    const newReports = mapped.filter((r: any) => r.type === 'report');
    const newLabs = mapped.filter((r: any) => r.type === 'lab');
    const newPresc = mapped.filter((r: any) => r.type === 'prescription');

    if (page === 1) {
      reportsData.value = newReports;
      labsData.value = newLabs;
      prescriptionsData.value = newPresc;
    } else {
      reportsData.value.push(...newReports);
      labsData.value.push(...newLabs);
      prescriptionsData.value.push(...newPresc);
    }
    recordsPage.value = page;
    recordsHasMore.value = res?.pagination?.hasMore ?? res?.hasMore ?? false;
  } catch (e) {
    if (page === 1) {
      reportsData.value = [];
      labsData.value = [];
      prescriptionsData.value = [];
    }
  } finally {
    recordsLoading.value = false;
  }
};

const loadMoreRecords = () => {
  if (recordsHasMore.value && !recordsLoading.value) {
    PATIENT_RECORDS(recordsPage.value + 1);
  }
};

const onDownload = (item: any) => {
  toast.success(`جاري تحميل مستند: ${item.title}`, 'السجلات الطبية');
};

const onView = (item: any) => {
  toast.info(`عرض تفاصيل: ${item.title}`, 'السجل الطبي');
};

const onBookRecord = (item: any) => {
  if (item.examination || item.type === 'lab' || item.type === 'radiology') {
    bookingModal.openBookingFlow({
      service: item.examination || {
        id: item.examination_id || item.id,
        name: item.title,
        price: item.price || 200,
        duration: item.duration || 15,
      },
      doctor: null,
      type: 'examination' as any,
    });
  } else {
    const doc = item.rawDoctor || (item.doctor_id ? { id: item.doctor_id, name: item.doctor, clinic: { name: item.clinic } } : null);
    bookingModal.openBookingFlow({
      doctor: doc,
      type: 'consultation',
    });
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  PATIENT_RECORDS();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.records-page {
  padding: 14px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
