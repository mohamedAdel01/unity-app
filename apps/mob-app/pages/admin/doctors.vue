<template>
  <div class="admin-doctors-page" :dir="isRtl ? 'rtl' : 'ltr'">
    <!-- 1. Header with search, filters & stats -->
    <AdminDoctorsHeader 
      :total-count="doctors.length"
      :active-count="activeDoctorsCount"
      @search="onSearch"
      @filter="onFilter"
      @new-doctor="isNewDoctorModalOpen = true"
    />

    <!-- 2. Doctors List -->
    <div v-if="filteredDoctors.length > 0" class="doctors-cards-list">
      <AdminDoctorCard 
        v-for="doc in filteredDoctors" 
        :key="doc.id"
        :doctor="doc"
        @edit-schedule="openEditSchedule"
        @view-cases="onViewCases"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-doctors-state">
      <i class="pi pi-search"></i>
      <h5>{{ t('No doctors match your criteria') }}</h5>
      <p>{{ t('Try searching for another name, specialty, or clinic room.') }}</p>
      <button class="btn-reset" @click="resetFilters">{{ t('Reset') }}</button>
    </div>

    <!-- 3. Bottom Auto-Sync Strip -->
    <div class="bottom-sync-notice">
      <i class="pi pi-sync spin-hover"></i>
      <span>{{ t('Doctor schedules auto-sync with booking calendar') }}</span>
    </div>

    <!-- Modal: Edit Schedule -->
    <AdminEditScheduleModal 
      :is-open="isEditScheduleModalOpen"
      :doctor="selectedDoctorForSchedule"
      @close="isEditScheduleModalOpen = false"
      @updated="onScheduleUpdated"
    />

    <!-- Modal: Add New Doctor -->
    <AdminNewDoctorModal 
      :is-open="isNewDoctorModalOpen"
      @close="isNewDoctorModalOpen = false"
      @created="onDoctorCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AdminDoctorsHeader from '../../components/admin/AdminDoctorsHeader.vue';
import AdminDoctorCard from '../../components/admin/AdminDoctorCard.vue';
import AdminEditScheduleModal from '../../components/admin/AdminEditScheduleModal.vue';
import AdminNewDoctorModal from '../../components/admin/AdminNewDoctorModal.vue';

definePageMeta({
  title: 'إدارة طاقم الأطباء — لوحة المشرف',
});

const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

const searchQuery = ref('');
const activeFilter = ref('all');
const isEditScheduleModalOpen = ref(false);
const isNewDoctorModalOpen = ref(false);
const selectedDoctorForSchedule = ref<any>(null);

const doctors = ref<any[]>([]);

const activeDoctorsCount = computed(() => {
  return doctors.value.filter(d => d.is_active).length;
});

// Load backend doctors if available
const loadBackendDoctors = async () => {
  try {
    const config = useRuntimeConfig();
    const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
    const res: any = await $fetch(`${baseUrl}/api/v1/admin/doctors`, {
      headers: api.token.value ? { Authorization: `Bearer ${api.token.value}` } : {},
    });

    if (res?.status && Array.isArray(res?.data) && res.data.length > 0) {
      doctors.value = res.data.map((d: any) => ({
        id: d.id,
        name: d.user?.name || d.name,
        avatar: d.user?.avatar || d.avatar,
        specialty: d.clinic?.name || d.specialty || '',
        room: d.room || '',
        category: 'cardio_internal',
        status_badge: d.user?.status === 'active' ? 'عيادة مفتوحة' : 'غير متاح',
        schedule_time: '',
        cases_count: d._count?.appointments || 0,
        is_active: d.user?.status === 'active',
        is_evening: false,
        primary_action: false,
      }));
    } else {
      doctors.value = [];
    }
  } catch (err) {
    doctors.value = [];
  }
};

onMounted(() => {
  loadBackendDoctors();
});

const filteredDoctors = computed(() => {
  let list = doctors.value;

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((d) => {
      const matchName = d.name?.toLowerCase().includes(q);
      const matchSpec = d.specialty?.toLowerCase().includes(q);
      const matchRoom = d.room?.includes(q);
      return matchName || matchSpec || matchRoom;
    });
  }

  if (activeFilter.value !== 'all') {
    list = list.filter(d => d.category === activeFilter.value);
  }

  return list;
});

const onSearch = (q: string) => {
  searchQuery.value = q;
};

const onFilter = (cat: string) => {
  activeFilter.value = cat;
};

const resetFilters = () => {
  searchQuery.value = '';
  activeFilter.value = 'all';
};

const openEditSchedule = (doc: any) => {
  selectedDoctorForSchedule.value = doc;
  isEditScheduleModalOpen.value = true;
};

const onScheduleUpdated = (payload: any) => {
  const target = doctors.value.find(d => d.id === payload.doctorId);
  if (target) {
    target.room = payload.room;
    target.is_active = payload.is_active;
    target.is_evening = payload.shift === 'evening';
    target.schedule_time = payload.shift === 'evening'
      ? `الفترة المسائية: ${payload.start_time} - ${payload.end_time}`
      : `اليوم: ${payload.start_time} - ${payload.end_time}`;
    target.status_badge = payload.is_active ? 'عيادة مفتوحة' : 'غير متاح حالياً';
  }
  toast.success(isRtl.value ? 'تم تحديث جدول وتوافر الطبيب بنجاح!' : 'Doctor schedule updated successfully!');
};

const onDoctorCreated = (newDoc: any) => {
  doctors.value.unshift(newDoc);
  toast.success(isRtl.value ? 'تم إضافة الطبيب الجديد بنجاح!' : 'New doctor added successfully!');
};

const onViewCases = (doc: any) => {
  toast.info(isRtl.value ? `جاري فتح ملف الحالات والمواعيد للطبيب (${doc.name})` : `Viewing cases for ${doc.name}`);
};
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
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--unity-text-muted);
    text-align: center;

    i {
      font-size: 0.85rem;
      color: var(--unity-text-dim);
    }

    .spin-hover:hover {
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>

