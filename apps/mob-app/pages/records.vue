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
      @load-more="loadMoreRecords"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useGlobalStore } from '../stores/global';
import { useUnityApi } from '../composables/useUnityApi';
import { useAppToast } from '../composables/useAppToast';
import RecordsHeader from '../components/records/RecordsHeader.vue';
import RecordsTabs from '../components/records/RecordsTabs.vue';
import RecordsList from '../components/records/RecordsList.vue';

definePageMeta({
  middleware: ['auth', 'patient'],
});

const globalStore = useGlobalStore();

const api = useUnityApi();

const toast = useAppToast();

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
const PATIENT_RECORDS = async (page = 1) => {
  try {
    recordsLoading.value = true;
    const res = await api.apiRequest({ 
      service: 'PATIENT_RECORDS',
      filter: { page, limit: 10 },
    });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    const newReports = raw.filter((r: any) => r.type === 'report');
    const newLabs = raw.filter((r: any) => r.type === 'lab');
    const newPresc = raw.filter((r: any) => r.type === 'prescription');

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
    recordsHasMore.value = res?.pagination?.hasMore ?? res?.hasMore ?? (raw.length >= 10);
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
  // Simulates opening detailed medical view
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
  padding: 14px 18px 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
