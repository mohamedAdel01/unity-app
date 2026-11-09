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
import { ref, computed } from 'vue';
import { useGlobalStore } from '../stores/global';
import RecordsHeader from '../components/records/RecordsHeader.vue';
import RecordsTabs from '../components/records/RecordsTabs.vue';
import RecordsList from '../components/records/RecordsList.vue';

definePageMeta({
  middleware: ['auth', 'patient'],
});

const globalStore = useGlobalStore();
const activeTab = ref<'reports' | 'labs' | 'prescriptions'>('reports');

const isLoading = computed(() => globalStore.loading.includes('records'));

const reportsData = [
  {
    id: 'rec-1',
    title: 'كشف استشاري أمراض القلب والقسطرة',
    doctor: 'د. خالد السبيعي',
    date: '٢٢ أكتوبر ٢٠٢٦',
    summary: 'تم إجراء فحص تخطيط القلب السريري. الضغط ١٢٠/٨٠ وحالة الشرايين مستقرة مع التوصية بالمتابعة بعد ٦ أشهر.',
    status: 'completed',
    statusLabel: 'تقرير معتمد',
    badge: 'كشف عيادة',
    hasDetails: true,
  },
  {
    id: 'rec-2',
    title: 'استشارة طب الأسرة والمجتمع',
    doctor: 'د. ريان الشهري',
    date: '١٠ سبتمبر ٢٠٢٦',
    summary: 'فحص دوري عام، تم طلب تحاليل مخبرية لفيتامين د ووظائف الكبد.',
    status: 'completed',
    statusLabel: 'تقرير معتمد',
    badge: 'استشارة فورية',
    hasDetails: true,
  },
];

const labsData = [
  {
    id: 'lab-1',
    title: 'باقة الفيتامينات والمعادن الشاملة',
    doctor: 'مختبرات الرياض الطبية - سحب منزلي',
    date: '١٤ أكتوبر ٢٠٢٦',
    summary: 'جميع المؤشرات ضمن المعدل الطبيعي باستثناء نقص طفيف في فيتامين د (22 ng/mL).',
    status: 'ready',
    statusLabel: 'النتائج جاهزة',
    badge: 'تحليل دم',
    hasDetails: true,
  },
];

const prescriptionsData = [
  {
    id: 'rx-1',
    title: 'وصفة علاجية - فيتامين د ونقص الكالسيوم',
    doctor: 'د. خالد السبيعي',
    date: '٢٢ أكتوبر ٢٠٢٦',
    summary: 'فيتامين د 50,000 وحدة دولية (كبسولة أسبوعياً لمدة ٨ أسابيع) + مكمل كالسيوم يومياً بعد الإفطار.',
    status: 'completed',
    statusLabel: 'وصفة نشطة',
    badge: 'وصفة إلكترونية',
    hasDetails: false,
  },
];

const currentItems = computed(() => {
  if (activeTab.value === 'reports') return reportsData;
  if (activeTab.value === 'labs') return labsData;
  return prescriptionsData;
});

const onDownload = (item: any) => {
  // Simulates medical report download
  alert(`جاري تحميل تقرير: ${item.title}`);
};

const onView = (item: any) => {
  // Simulates opening detailed medical view
};
</script>

<style scoped>
.records-page {
  padding: 14px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

