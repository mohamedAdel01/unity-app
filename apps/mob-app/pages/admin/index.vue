<template>
  <div class="admin-dashboard-page">
    <AdminTopHeader 
      :title="t('Executive Administration')"
      :subtitle="t('Unity Hospital & Clinics System')"
      icon="pi pi-shield"
    />

    <AdminDashboardMetrics :kpis="kpis" />

    <AdminDashboardNav />

    <AdminBroadcastBanner @broadcast-sent="ADMIN_DASHBOARD" />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAuthStore } from '../../stores/auth';
import AdminTopHeader from '../../components/admin/AdminTopHeader.vue';
import AdminDashboardMetrics from '../../components/admin/AdminDashboardMetrics.vue';
import AdminDashboardNav from '../../components/admin/AdminDashboardNav.vue';
import AdminBroadcastBanner from '../../components/admin/AdminBroadcastBanner.vue';

definePageMeta({
  layout: 'admin',
});

const { t } = useI18n();
const api = useUnityApi();
const router = useRouter();
const authStore = useAuthStore();

// 2. Data (refs, reactive state)
const kpis = ref({
  total_patients: 0,
  total_doctors: 0,
  total_clinics: 0,
  total_services: 0,
  today_appointments: 0,
  pending_appointments: 0,
  completed_appointments: 0,
  today_revenue: 0,
  total_revenue: 0,
  date: '',
});

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const ADMIN_DASHBOARD = async () => {
  try {
    const res = await api.apiRequest({ service: 'ADMIN_DASHBOARD' });
    if (res?.status && res?.data?.kpis) {
      kpis.value = {
        total_patients: res.data.kpis.total_patients || 0,
        total_doctors: res.data.kpis.total_doctors || 0,
        total_clinics: res.data.kpis.total_clinics || 0,
        total_services: res.data.kpis.total_services || 0,
        today_appointments: res.data.kpis.today_appointments || 0,
        pending_appointments: res.data.kpis.pending_appointments || 0,
        completed_appointments: res.data.kpis.completed_appointments || 0,
        today_revenue: res.data.kpis.today_revenue !== undefined ? res.data.kpis.today_revenue : (res.data.kpis.total_revenue || 0),
        total_revenue: res.data.kpis.total_revenue || 0,
        date: res.data.kpis.date || '',
      };
    }
  } catch (err) {}
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  if (authStore.isReceptionist) {
    router.replace('/admin/appointments');
    return;
  }
  ADMIN_DASHBOARD();
});

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: computed(() => t('Executive Administration — Admin Portal')),
});
</script>

<style scoped lang="scss">
.admin-dashboard-page {
  padding: 14px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
