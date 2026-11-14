<template>
  <div class="catalog-container">
    <!-- Switcher Tabs (أطباء واستشاريين / خدمات وفحوصات) -->
    <div class="view-tabs-switch">
      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'doctors' }"
        @click="switchTab('doctors')"
      >
        <i class="pi pi-user-plus"></i>
        <span>{{ t('Top Specialists') }}</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'services' }"
        @click="switchTab('services')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tab-icon-svg">
          <path d="M10 2v7.31L4.35 18.5A2 2 0 0 0 6.07 22h11.86a2 2 0 0 0 1.72-3.5L14 9.31V2"/>
          <path d="M8.5 2h7"/>
          <path d="M7 16h10"/>
        </svg>
        <span>{{ t('Services & Labs') }}</span>
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="search-box">
      <i class="pi pi-search"></i>
      <input 
        v-model="searchQuery" 
        type="text" 
        :placeholder="activeTab === 'services' ? t('Search service, lab test, or radiology...') : t('Search by doctor name or specialty...')" 
      />
    </div>

    <!-- Categories Filter Chips for Services/Examinations -->
    <div v-if="activeTab === 'services' && categories.length > 0" class="categories-chips-scroll">
      <button 
        type="button" 
        class="cat-chip" 
        :class="{ 'active': selectedCategoryId === 'all' }"
        @click="selectedCategoryId = 'all'"
      >
        <i class="pi pi-th-large"></i>
        <span>{{ t('All Examinations') }}</span>
      </button>

      <button 
        v-for="cat in categories" 
        :key="cat.id" 
        type="button" 
        class="cat-chip" 
        :class="{ 'active': String(selectedCategoryId) === String(cat.id) }"
        @click="selectedCategoryId = cat.id"
      >
        <i :class="cat.icon || 'pi pi-folder'"></i>
        <span>{{ isRtl ? (cat.name_ar || cat.name) : (cat.name_en || cat.name) }}</span>
      </button>
    </div>

    <!-- Content: Services Tab -->
    <div v-if="activeTab === 'services'" class="tab-content-area">
      <AppVirtualList
        :items="filteredServices"
        :has-more="servicesHasMore"
        :loading="servicesLoading || globalStore.loading.includes('services')"
        :page-size="10"
        @load-more="loadMoreServices"
      >
        <template #item="{ item: service }">
          <div class="service-item-card">
            <div class="service-main-row">
              <div class="card-side-icon">
                <AppExamIcon :size="22" />
              </div>
              <div class="card-details">
                <div class="details-top">
                  <h5>{{ getLocalizedName(service) }}</h5>
                  <span class="price-tag">{{ service.price }} <small>{{ t('EGP') }}</small></span>
                </div>
                <span v-if="service.category" class="service-cat-pill">
                  <i :class="service.category?.icon || 'pi pi-folder'"></i>
                  {{ isRtl ? (service.category?.name_ar || service.category?.name) : (service.category?.name_en || service.category?.name) }}
                </span>
                <p v-if="getLocalizedDesc(service)">{{ getLocalizedDesc(service) }}</p>
                <div class="card-meta">
                  <span v-if="service.duration"><i class="pi pi-clock"></i> {{ service.duration }} {{ t('mins') }}</span>
                  <span><i class="pi pi-check"></i> {{ t('Available now') }}</span>
                </div>
              </div>
            </div>
            <button class="book-service-btn" @click="bookService(service)">
              <span>{{ t('Book This Service') }}</span>
              <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
            </button>
          </div>
        </template>

        <template #empty>
          <div class="empty-catalog-state">
            <i class="pi pi-inbox"></i>
            <h5>{{ t('No services available') }}</h5>
          </div>
        </template>
      </AppVirtualList>
    </div>

    <!-- Content: Doctors Tab -->
    <div v-else class="tab-content-area">
      <!-- 1. Horizontal Clinic Tabs -->
      <div v-if="clinics.length > 0" class="clinic-tabs-nav">
        <button 
          class="clinic-tab-chip" 
          :class="{ 'active': selectedClinicId === 'all' }"
          @click="selectClinic('all')"
        >
          <i class="pi pi-th-large"></i>
          <span>{{ t('All Clinics') }}</span>
        </button>

        <button 
          v-for="clinic in clinics" 
          :key="clinic.id" 
          class="clinic-tab-chip" 
          :class="{ 'active': selectedClinicId === clinic.id }"
          @click="selectClinic(clinic.id)"
        >
          <i class="pi pi-building"></i>
          <span>{{ getLocalizedName(clinic) }}</span>
          <span v-if="clinic._count?.doctors" class="count-bubble">{{ clinic._count.doctors }}</span>
        </button>
      </div>

      <!-- 2. Clinic Cards Overview (Shown when 'all' is selected) -->
      <div v-if="selectedClinicId === 'all' && clinics.length > 0 && !searchQuery" class="clinics-overview-block">
        <div class="block-header">
          <div class="title-wrap">
            <i class="pi pi-th-large"></i>
            <h5>{{ t('Specialized Clinics & Departments') }}</h5>
          </div>
          <span class="sub-hint">{{ t('Select a clinic to view its doctors') }}</span>
        </div>

        <div class="clinics-cards-grid">
          <div 
            v-for="clinic in clinics" 
            :key="clinic.id" 
            class="clinic-card-item"
            @click="selectClinic(clinic.id)"
          >
            <div class="card-icon-row">
              <div class="clinic-icon-box">
                <i class="pi pi-building"></i>
              </div>
              <span class="doc-badge">
                <i class="pi pi-users"></i>
                <span>{{ clinic._count?.doctors || 1 }} {{ t('Doctors') }}</span>
              </span>
            </div>
            <h6 class="clinic-title">{{ getLocalizedName(clinic) }}</h6>
            <div class="card-action-row">
              <span class="action-text">{{ t('View Doctors') }}</span>
              <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
            </div>
          </div>
        </div>

        <!-- Section divider for all doctors list -->
        <div class="all-docs-subhead">
          <i class="pi pi-users"></i>
          <h5>{{ t('All Doctors') }}</h5>
        </div>
      </div>

      <!-- 3. Active Clinic Filter Banner (when a specific clinic is chosen) -->
      <div v-else-if="selectedClinicId !== 'all'" class="active-clinic-filter-bar">
        <div class="filter-info">
          <i class="pi pi-filter"></i>
          <span>{{ t('Showing doctors for:') }} <strong>{{ activeClinicName }}</strong></span>
        </div>
        <button class="btn-clear-clinic" @click="selectClinic('all')">
          <i class="pi pi-times"></i>
          <span>{{ t('Show All') }}</span>
        </button>
      </div>

      <!-- 4. Doctors Virtual List -->
      <AppVirtualList
        :items="filteredDoctors"
        :has-more="doctorsHasMore"
        :loading="doctorsLoading || globalStore.loading.includes('doctors')"
        :page-size="10"
        @load-more="loadMoreDoctors"
      >
        <template #item="{ item: doc }">
          <div class="doctor-catalog-card">
            <div class="doc-main-row">
              <div class="doc-img-wrap">
                <img v-if="doc.avatar" :src="doc.avatar" :alt="doc.name" />
                <div v-else class="doc-initial-badge">
                  <span>{{ (doc.name || 'D').charAt(0).toUpperCase() }}</span>
                </div>
                <span v-if="doc.rating" class="star-pill">⭐ {{ doc.rating }}</span>
              </div>
              <div class="doc-info-block">
                <h5>{{ doc.name }}</h5>
                <p v-if="doc.specialty && doc.specialty !== doc.clinic?.name" class="specialty-title">{{ doc.specialty }}</p>
                <span v-if="doc.clinic?.name" class="clinic-location"><i class="pi pi-building"></i> {{ getLocalizedName(doc.clinic) }}</span>
                <div v-if="doc.consultation_fee" class="fee-badge">
                  {{ t('Examination Fee:') }} <strong>{{ doc.consultation_fee }} {{ t('EGP') }}</strong>
                </div>
              </div>
            </div>
            <button class="doc-book-btn" @click="bookDoctor(doc)">
              {{ t('Book Examination') }}
            </button>
          </div>
        </template>

        <template #empty>
          <div class="empty-catalog-state">
            <i class="pi pi-users"></i>
            <h5>{{ selectedClinicId !== 'all' ? t('No doctors found for this clinic') : t('No doctors available') }}</h5>
          </div>
        </template>
      </AppVirtualList>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';
import { useGlobalStore } from '../../stores/global';
import AppVirtualList from '../common/AppVirtualList.vue';
import AppExamIcon from '../common/AppExamIcon.vue';

const router = useRouter();
const route = useRoute();
const api = useUnityApi();
const { t, isRtl } = useI18n();
const bookingModal = useBookingModal();
const globalStore = useGlobalStore();

// 2. Data (refs, reactive state)
const activeTab = ref<'services' | 'doctors'>('doctors');
const searchQuery = ref('');

const clinics = ref<any[]>([]);
const selectedClinicId = ref<string>('all');
const clinicsLoading = ref(false);

const services = ref<any[]>([]);
const servicesPage = ref(1);
const servicesHasMore = ref(false);
const servicesLoading = ref(false);

const categories = ref<any[]>([]);
const selectedCategoryId = ref<string>('all');

const doctors = ref<any[]>([]);
const doctorsPage = ref(1);
const doctorsHasMore = ref(false);
const doctorsLoading = ref(false);

// 3. Computed (computed properties)
const getLocalizedName = (item: any): string => {
  if (!item) return '';
  if (isRtl.value && item.name_ar) return item.name_ar;
  if (!isRtl.value && item.name_en) return item.name_en;
  if (typeof item.name === 'string') {
    try {
      const p = JSON.parse(item.name);
      if (p && typeof p === 'object') {
        return isRtl.value ? (p.ar || p.en || '') : (p.en || p.ar || '');
      }
    } catch (_) {}
    return item.name;
  }
  return '';
};

const getLocalizedDesc = (item: any): string => {
  if (!item) return '';
  if (isRtl.value && item.description_ar) return item.description_ar;
  if (!isRtl.value && item.description_en) return item.description_en;
  if (typeof item.description === 'string') {
    try {
      const p = JSON.parse(item.description);
      if (p && typeof p === 'object') {
        return isRtl.value ? (p.ar || p.en || '') : (p.en || p.ar || '');
      }
    } catch (_) {}
    return item.description;
  }
  return '';
};

const activeClinicName = computed(() => {
  if (selectedClinicId.value === 'all') return t('All Clinics');
  const c = clinics.value.find(cl => cl.id === selectedClinicId.value);
  return c ? getLocalizedName(c) : '';
});

const filteredServices = computed(() => {
  let list = services.value;
  if (selectedCategoryId.value && selectedCategoryId.value !== 'all') {
    list = list.filter((s: any) => String(s.category_id || s.category?.id) === String(selectedCategoryId.value));
  }
  if (!searchQuery.value) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter((s: any) => {
    const name = (getLocalizedName(s) || s.name || '').toLowerCase();
    const desc = (getLocalizedDesc(s) || s.description || '').toLowerCase();
    return name.includes(q) || desc.includes(q);
  });
});

const filteredDoctors = computed(() => {
  let list = doctors.value;
  if (selectedClinicId.value && selectedClinicId.value !== 'all') {
    list = list.filter(d => d.clinic_id === selectedClinicId.value || d.clinic?.id === selectedClinicId.value);
  }
  if (!searchQuery.value) return list;
  const q = searchQuery.value.toLowerCase();
  return list.filter(d => 
    d.name.toLowerCase().includes(q) || 
    d.specialty?.toLowerCase().includes(q) ||
    d.clinic?.name?.toLowerCase().includes(q)
  );
});

// 4. Methods (functions, handlers)
const switchTab = (tab: 'services' | 'doctors') => {
  activeTab.value = tab;
  router.replace({ query: { ...route.query, tab } });
};

const selectClinic = (clinicId: string) => {
  selectedClinicId.value = clinicId;
  DOCTORS(1);
};

const CLINICS = async () => {
  try {
    clinicsLoading.value = true;
    const res = await api.apiRequest({ service: 'CLINICS' });
    if (res?.data && Array.isArray(res.data)) {
      clinics.value = res.data;
    }
  } catch (e) {
    clinics.value = [];
  } finally {
    clinicsLoading.value = false;
  }
};

const SERVICES = async (page = 1) => {
  try {
    servicesLoading.value = true;
    const res = await api.apiRequest({ 
      service: 'SERVICES',
      filter: { page, limit: 10 },
    });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    if (page === 1) {
      services.value = raw;
    } else {
      services.value.push(...raw);
    }
    servicesPage.value = page;
    servicesHasMore.value = res?.pagination?.hasMore ?? res?.hasMore ?? (raw.length >= 10);
  } catch (e) {
    if (page === 1) services.value = [];
  } finally {
    servicesLoading.value = false;
  }
};

const loadMoreServices = () => {
  if (servicesHasMore.value && !servicesLoading.value) {
    SERVICES(servicesPage.value + 1);
  }
};

const DOCTORS = async (page = 1) => {
  try {
    doctorsLoading.value = true;
    const filter: any = { page, limit: 10 };
    if (selectedClinicId.value && selectedClinicId.value !== 'all') {
      filter.clinic_id = selectedClinicId.value;
    }
    const res = await api.apiRequest({ 
      service: 'DOCTORS',
      filter,
    });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    const items = raw.map((d: any) => ({
      id: d.id,
      name: d.user?.name || d.name,
      specialty: d.specialty || '',
      clinic: d.clinic,
      clinic_id: d.clinic_id || d.clinic?.id,
      rating: d.rating || null,
      avatar: d.user?.avatar || d.avatar || '',
      consultation_fee: d.consultation_fee || 250,
      follow_up_fee: d.follow_up_fee || 150,
    }));

    if (page === 1) {
      doctors.value = items;
    } else {
      doctors.value.push(...items);
    }
    doctorsPage.value = page;
    doctorsHasMore.value = res?.pagination?.hasMore ?? res?.hasMore ?? (items.length >= 10);
  } catch (e) {
    if (page === 1) doctors.value = [];
  } finally {
    doctorsLoading.value = false;
  }
};

const loadMoreDoctors = () => {
  if (doctorsHasMore.value && !doctorsLoading.value) {
    DOCTORS(doctorsPage.value + 1);
  }
};

const bookService = (service: any) => {
  bookingModal.openBookingFlow({
    service,
    doctor: null,
    type: 'examination' as any,
  });
};

const bookDoctor = (doctor: any) => {
  bookingModal.openBookingFlow({ doctor, type: 'consultation' });
};

const EXAMINATION_CATEGORIES = async () => {
  try {
    const res = await api.apiRequest({ service: 'EXAMINATION_CATEGORIES' });
    if (res?.data && Array.isArray(res.data)) {
      categories.value = res.data;
    }
  } catch (_) {
    categories.value = [];
  }
};

// 5. Watches (watch, watchEffect)
watch(() => route.query.tab, (newTab) => {
  if (newTab === 'doctors' || newTab === 'services') {
    activeTab.value = newTab;
  }
}, { immediate: true });

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  CLINICS();
  SERVICES();
  DOCTORS();
  EXAMINATION_CATEGORIES();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.catalog-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.view-tabs-switch {
  display: flex;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 16px;
  padding: 4px;
  gap: 6px;

  .tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: var(--unity-text-muted);
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    .tab-icon-svg {
      transition: all 0.2s;
    }

    &.active {
      background: var(--unity-primary-dark);
      color: #fff;
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);
    }
  }
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;

  i {
    position: absolute;
    inset-inline-start: 14px;
    color: var(--unity-text-dim);
    font-size: 0.95rem;
  }

  input {
    width: 100%;
    padding: 12px 14px 12px 42px;
    border-radius: 14px;
    border: 1.5px solid var(--unity-border);
    background: var(--unity-surface);
    color: var(--unity-text-main);
    font-size: 0.84rem;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: var(--unity-primary);
      box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
    }
  }
}

// Categories Chips Bar
.categories-chips-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }

  .cat-chip {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 13px;
    border-radius: 12px;
    border: 1.5px solid var(--unity-border);
    background: var(--unity-surface);
    color: var(--unity-text-muted);
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    i {
      font-size: 0.88rem;
    }

    &:hover {
      border-color: var(--unity-primary);
      color: var(--unity-primary);
    }

    &.active {
      background: var(--unity-primary-light);
      border-color: var(--unity-primary);
      color: var(--unity-primary);
    }
  }
}

.tab-content-area {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

// Clinic Tabs Bar
.clinic-tabs-nav {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }

  .clinic-tab-chip {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 14px;
    border: 1.5px solid var(--unity-border);
    background: var(--unity-surface);
    color: var(--unity-text-muted);
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    i {
      font-size: 0.85rem;
      color: var(--unity-text-dim);
    }

    .count-bubble {
      font-size: 0.65rem;
      background: #ecfdf5;
      color: #047857;
      padding: 1px 6px;
      border-radius: 8px;
      font-weight: 800;
    }

    &.active {
      background: var(--unity-primary-dark);
      border-color: var(--unity-primary-dark);
      color: #fff;

      i {
        color: #fff;
      }

      .count-bubble {
        background: rgba(255, 255, 255, 0.25);
        color: #fff;
      }
    }
  }
}

// Clinics Overview Block (Cards when 'all' is chosen)
.clinics-overview-block {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .block-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px;

    .title-wrap {
      display: flex;
      align-items: center;
      gap: 6px;

      i {
        color: var(--unity-primary);
        font-size: 0.95rem;
      }

      h5 {
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }
    }

    .sub-hint {
      font-size: 0.7rem;
      color: var(--unity-text-dim);
    }
  }

  .clinics-cards-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;

    .clinic-card-item {
      background: var(--unity-surface);
      border: 1.5px solid var(--unity-border);
      border-radius: 18px;
      padding: 14px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 10px;
      transition: all 0.2s;
      box-shadow: var(--unity-shadow-subtle);

      &:hover {
        border-color: var(--unity-primary);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(4, 120, 87, 0.12);
      }

      .card-icon-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .clinic-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #ecfdf5;
          color: #047857;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .doc-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          color: var(--unity-text-muted);
          background: var(--unity-bg);
          padding: 3px 8px;
          border-radius: 8px;
          font-weight: 700;

          i {
            font-size: 0.65rem;
            color: var(--unity-primary);
          }
        }
      }

      .clinic-title {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--unity-text-main);
        line-height: 1.3;
      }

      .card-action-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--unity-primary);
        border-top: 1px solid var(--unity-border-light);
        padding-top: 8px;
      }
    }
  }

  .all-docs-subhead {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;

    i {
      color: var(--unity-primary);
      font-size: 0.95rem;
    }

    h5 {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--unity-text-main);
    }
  }
}

// Active Clinic Filter Bar
.active-clinic-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ecfdf5;
  border: 1px solid #d1fae5;
  border-radius: 14px;
  padding: 10px 14px;

  .filter-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    color: #065f46;

    i {
      color: var(--unity-primary);
    }

    strong {
      font-weight: 800;
    }
  }

  .btn-clear-clinic {
    background: #fff;
    border: 1px solid #a7f3d0;
    color: #047857;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;

    &:hover {
      background: #f0fdf4;
    }
  }
}

// Doctor Catalog Card
.doctor-catalog-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--unity-shadow-subtle);

  .doc-main-row {
    display: flex;
    align-items: center;
    gap: 14px;

    .doc-img-wrap {
      position: relative;
      width: 58px;
      height: 58px;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      .star-pill {
        position: absolute;
        bottom: -6px;
        right: 50%;
        transform: translateX(50%);
        background: #ecfdf5;
        color: #047857;
        font-size: 0.65rem;
        font-weight: 800;
        padding: 1px 6px;
        border-radius: 8px;
        white-space: nowrap;
        border: 1px solid #d1fae5;
      }
    }

    .doc-info-block {
      flex: 1;

      h5 {
        font-size: 1rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      .specialty-title {
        font-size: 0.78rem;
        color: var(--unity-text-muted);
        margin-top: 2px;
      }

      .clinic-location {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.7rem;
        color: var(--unity-text-dim);
        margin-top: 4px;
      }

      .fee-badge {
        display: inline-block;
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        border-radius: 8px;
        padding: 2px 8px;
        font-size: 0.72rem;
        color: var(--unity-text-main);
        margin-top: 8px;

        strong {
          color: var(--unity-primary);
        }
      }
    }
  }

  .doc-book-btn {
    width: 100%;
    padding: 10px;
    border-radius: 12px;
    background: var(--unity-primary-dark);
    color: #fff;
    border: none;
    font-size: 0.85rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #022c22;
    }
  }
}

// Service Item Card
.service-item-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--unity-shadow-subtle);

  .service-main-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    width: 100%;

    .card-side-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #ecfdf5;
      color: #047857;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .card-details {
      flex: 1;
      min-width: 0;

      .details-top {
        display: flex;
        align-items: center;
        justify-content: space-between;

        h5 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--unity-text-main);
        }

        .price-tag {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--unity-primary);
        }
      }

      .service-cat-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.70rem;
        font-weight: 700;
        color: var(--unity-primary);
        background: var(--unity-primary-light);
        padding: 2px 7px;
        border-radius: 6px;
        width: fit-content;
        margin-top: 3px;
        margin-bottom: 2px;
      }

      p {
        font-size: 0.76rem;
        color: var(--unity-text-muted);
        margin-top: 4px;
        line-height: 1.4;
      }

      .card-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 8px;
        font-size: 0.7rem;
        color: var(--unity-text-dim);

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }

  .book-service-btn {
    width: 100%;
    height: 42px;
    padding: 0 16px;
    border-radius: 12px;
    background: var(--unity-bg);
    border: 1.5px solid var(--unity-border);
    color: var(--unity-text-main);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;

    &:hover {
      background: var(--unity-primary-dark);
      color: #fff;
      border-color: var(--unity-primary-dark);
    }
  }
}

.empty-catalog-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  gap: 12px;
  text-align: center;
  color: var(--unity-text-muted);

  i {
    font-size: 2.2rem;
    color: var(--unity-text-dim);
  }

  h5 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
  }
}

.doc-initial-badge {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 800;
  flex-shrink: 0;
}
</style>
