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
const activeTab = ref<'reports' | 'labs' | 'prescriptions'>('reports');

const isLoading = computed(() => globalStore.loading.includes('records'));

const reportsData = ref<any[]>([]);
const labsData = ref<any[]>([]);
const prescriptionsData = ref<any[]>([]);

const loadRecords = async () => {
  try {
    globalStore.setLoading(['records', true]);
    const res = await api.getPatientRecords();
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
  } finally {
    globalStore.setLoading(['records', false]);
  }
};

onMounted(() => {
  loadRecords();
});

const currentItems = computed(() => {
  if (activeTab.value === 'reports') return reportsData.value;
  if (activeTab.value === 'labs') return labsData.value;
  return prescriptionsData.value;
});

const onDownload = (item: any) => {
  toast.success(`جاري تحميل مستند: ${item.title}`, 'السجلات الطبية');
};

const onView = (item: any) => {
  // Simulates opening detailed medical view
};
</script>

<style scoped>
.records-page {
  padding: 14px 18px 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

