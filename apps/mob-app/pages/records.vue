<template>
  <div class="records-page">
    <RecordsHeader />
    <RecordsTabs v-model="activeTab" />
    <RecordsList 
      :items="currentItems" 
      :loading="isLoading" 
      @download="onDownload" 
      @view="onView" 
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

// 3. Computed (computed properties)
const isLoading = computed(() => globalStore.loading.includes('records'));

const currentItems = computed(() => {
  if (activeTab.value === 'reports') return reportsData.value;
  if (activeTab.value === 'labs') return labsData.value;
  return prescriptionsData.value;
});

// 4. Methods (functions, handlers)
const loadRecords = async () => {
  try {
    const res = await api.apiRequest({ service: 'PATIENT_RECORDS' });
    if (res?.status && Array.isArray(res.data)) {
      reportsData.value = res.data.filter((r: any) => r.type === 'report');
      labsData.value = res.data.filter((r: any) => r.type === 'lab');
      prescriptionsData.value = res.data.filter((r: any) => r.type === 'prescription');
    } else {
      reportsData.value = [];
      labsData.value = [];
      prescriptionsData.value = [];
    }
  } catch (e) {
    reportsData.value = [];
    labsData.value = [];
    prescriptionsData.value = [];
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
  loadRecords();
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
