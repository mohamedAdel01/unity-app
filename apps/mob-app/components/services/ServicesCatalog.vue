<template>
  <div class="catalog-container">
    <!-- Search Bar -->
    <div class="search-box">
      <i class="pi pi-search"></i>
      <input 
        v-model="searchQuery" 
        type="text" 
        :placeholder="activeTab === 'services' 
          ? (selectedCategoryId ? t('Search service, lab test, or radiology...') : t('Search service or category...'))
          : (selectedClinicId ? t('Search by doctor name...') : t('Search doctor or clinic name...'))" 
      />
      <button v-if="searchQuery" type="button" class="clear-search-btn" @click="searchQuery = ''">
        <i class="pi pi-times"></i>
      </button>
    </div>

    <!-- Content: Services Tab -->
    <div v-if="activeTab === 'services'" class="tab-content-area">
      <!-- 1. Categories Grid/Stack View (Displayed first when no category selected) -->
      <div v-if="!selectedCategoryId" class="categories-selection-view">
        <div class="categories-section-head">
          <div class="section-title-wrap">
            <h4>{{ t('Select Category') }}</h4>
          </div>
          <span v-if="filteredCategories.length > 0" class="categories-count-badge">
            {{ filteredCategories.length }} {{ t('Categories') }}
          </span>
        </div>

        <!-- Vertical Stack of Category Cards (Matching Admin Design) -->
        <div v-if="filteredCategories.length > 0" class="categories-cards-stack">
          <div 
            v-for="cat in filteredCategories" 
            :key="cat.id" 
            class="entity-stack-card category-stack-card"
            @click="selectCategory(cat.id)"
          >
            <div class="card-top">
              <div class="icon-box category">
                <i :class="getCategoryIcon(cat)"></i>
              </div>
              <div class="entity-info">
                <h4>{{ getLocalizedName(cat) }}</h4>
                <p v-if="getLocalizedDesc(cat)" class="entity-desc">{{ getLocalizedDesc(cat) }}</p>
              </div>
              <div class="card-arrow-wrap">
                <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
              </div>
            </div>

            <div class="card-footer">
              <span class="capacity-text">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="service-icon">
                  <path d="M6 18h8"/>
                  <path d="M3 22h18"/>
                  <path d="M14 22a7 7 0 1 0 0-14h-1"/>
                  <path d="M9 14h2"/>
                  <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/>
                  <path d="M12 6V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/>
                </svg>
                <span>{{ getCategoryCount(cat) }} {{ t('Services') }}</span>
              </span>

              <div class="view-action-btn">
                <span>{{ t('View Services') }}</span>
                <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="isServicesLoading" class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          <span>{{ t('Loading...') }}</span>
        </div>

        <div v-else class="empty-catalog-state">
          <i :class="searchQuery ? 'pi pi-search' : 'pi pi-folder-open'"></i>
          <h5>{{ searchQuery ? t('No categories found matching your search') : t('No categories available') }}</h5>
        </div>
      </div>

      <!-- 2. Services Drilldown View (When category chosen) -->
      <div v-else class="services-drilldown-view">
        <!-- Search Active Info Bar -->
        <div v-if="searchQuery" class="search-results-bar">
          <div class="results-meta">
            <i class="pi pi-search"></i>
            <span v-if="isServicesLoading">{{ t('Searching...') }}</span>
            <span v-else>{{ filteredServices.length }} {{ t('Services found') }}</span>
          </div>
          <button type="button" class="reset-search-btn" @click="searchQuery = ''">
            <i class="pi pi-times"></i>
            <span>{{ t('Clear search') }}</span>
          </button>
        </div>

        <!-- Categories Filter Pills (Matching Admin Services Pills) -->
        <div class="categories-chips-scroll category-pills-bar">
          <button 
            type="button" 
            class="cat-chip" 
            :class="{ 'active': !selectedCategoryId || selectedCategoryId === 'all' }"
            @click="selectCategory('all')"
          >
            <span>{{ t('All') }} ({{ allAvailableServices.length }})</span>
          </button>

          <button 
            v-for="cat in effectiveCategories" 
            :key="cat.id" 
            type="button" 
            class="cat-chip" 
            :class="{ 'active': String(selectedCategoryId) === String(cat.id) }"
            @click="selectCategory(cat.id)"
          >
            <span>{{ getLocalizedName(cat) }}</span>
            <span v-if="getCategoryCount(cat) !== undefined" class="chip-count">({{ getCategoryCount(cat) }})</span>
          </button>
        </div>

        <!-- Services Virtual List with Virtual Windowing -->
        <AppVirtualList
          :items="filteredServices"
          :has-more="servicesHasMore"
          :loading="isServicesLoading"
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
                  <p v-if="getLocalizedDesc(service)">{{ getLocalizedDesc(service) }}</p>
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
              <h5>{{ searchQuery ? t('No services found matching your search') : (selectedCategoryId ? t('No services in this category') : t('No services available')) }}</h5>
            </div>
          </template>
        </AppVirtualList>
      </div>
    </div>

    <!-- Content: Doctors Tab -->
    <div v-else class="tab-content-area">
      <!-- 1. Clinics Grid View (Displayed first when no clinic selected) -->
      <div v-if="!selectedClinicId" class="categories-selection-view">
        <div class="categories-section-head">
          <div class="section-title-wrap">
            <h4>{{ t('Select Clinic') }}</h4>
          </div>
          <span v-if="filteredClinics.length > 0" class="categories-count-badge">
            {{ filteredClinics.length }} {{ t('Clinics') }}
          </span>
        </div>

        <div v-if="filteredClinics.length > 0" class="categories-cards-stack">
          <div 
            v-for="clinic in filteredClinics" 
            :key="clinic.id" 
            class="entity-stack-card clinic-stack-card"
            @click="selectClinic(clinic.id)"
          >
            <div class="card-top">
              <div class="icon-box clinic">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/>
                  <path d="M9 21v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>
                  <path d="M10 8h4"/>
                  <path d="M12 6v4"/>
                </svg>
              </div>
              <div class="entity-info">
                <h4>{{ getLocalizedName(clinic) }}</h4>
                <p v-if="getLocalizedDesc(clinic)" class="entity-desc">{{ getLocalizedDesc(clinic) }}</p>
              </div>
              <div class="card-arrow-wrap">
                <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
              </div>
            </div>

            <div class="card-footer">
              <span class="capacity-text">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="stethoscope-icon">
                  <path d="M4.5 3v5a6.5 6.5 0 0 0 13 0V3"/>
                  <path d="M3 3h3"/>
                  <path d="M16 3h3"/>
                  <path d="M11 14.5V18a3 3 0 0 0 6 0v-2"/>
                  <circle cx="17" cy="16" r="2"/>
                </svg>
                <span>{{ getClinicDoctorsCount(clinic) }} {{ t('Doctors') }}</span>
              </span>

              <div class="view-action-btn">
                <span>{{ t('View Doctors') }}</span>
                <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="isClinicsLoading" class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          <span>{{ t('Loading...') }}</span>
        </div>

        <div v-else class="empty-catalog-state">
          <i :class="searchQuery ? 'pi pi-search' : 'pi pi-building'"></i>
          <h5>{{ searchQuery ? t('No clinics found matching your search') : t('No clinics available') }}</h5>
        </div>
      </div>

      <!-- 2. Doctors Drilldown View (When clinic chosen) -->
      <div v-else class="services-drilldown-view">
        <!-- Search Active Info Bar -->
        <div v-if="searchQuery" class="search-results-bar">
          <div class="results-meta">
            <i class="pi pi-search"></i>
            <span v-if="isDoctorsLoading">{{ t('Searching...') }}</span>
            <span v-else>{{ filteredDoctors.length }} {{ t('Doctors found') }}</span>
          </div>
          <button type="button" class="reset-search-btn" @click="searchQuery = ''">
            <i class="pi pi-times"></i>
            <span>{{ t('Clear search') }}</span>
          </button>
        </div>

        <!-- Clinics Filter Pills (Matching Admin Doctors Pills) -->
        <div class="categories-chips-scroll clinic-pills-bar">
          <button 
            type="button" 
            class="cat-chip" 
            :class="{ 'active': !selectedClinicId || selectedClinicId === 'all' }"
            @click="selectClinic('all')"
          >
            <span>{{ t('All') }} ({{ totalDoctorsCount || doctors.length }})</span>
          </button>

          <button 
            v-for="c in clinics" 
            :key="c.id" 
            type="button" 
            class="cat-chip" 
            :class="{ 'active': String(selectedClinicId) === String(c.id) }"
            @click="selectClinic(c.id)"
          >
            <span>{{ getLocalizedName(c) }}</span>
            <span v-if="getClinicDoctorsCount(c) !== undefined" class="chip-count">({{ getClinicDoctorsCount(c) }})</span>
          </button>
        </div>

        <!-- Doctors Virtual List -->
        <AppVirtualList
          :items="filteredDoctors"
          :has-more="doctorsHasMore"
          :loading="isDoctorsLoading"
          :page-size="10"
          @load-more="loadMoreDoctors"
        >
          <template #item="{ item: doc }">
            <div class="doctor-catalog-card">
              <div class="doc-card-header" :title="t('View Doctor Profile')" @click="openDoctorPreview(doc)">
                <div class="doc-avatar-group">
                  <img 
                    v-if="doc.avatar && !failedAvatars.has(doc.id)" 
                    :src="resolveDoctorAvatar(doc.avatar)" 
                    :alt="doc.name" 
                    class="clickable-doc-avatar"
                    @error="failedAvatars.add(doc.id)"
                  />
                  <div v-else class="doc-initial-avatar clickable-doc-avatar">
                    <span>{{ (doc.name || 'D').charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="doc-texts">
                    <h5>{{ doc.name }}</h5>
                    <div class="doc-sub-line">
                      <span v-if="getLocalizedName(doc.clinic)" class="doc-clinic-name">
                        <i class="pi pi-building"></i>
                        <span>{{ getLocalizedName(doc.clinic) }}</span>
                      </span>
                      <span v-if="doc.consultation_fee" class="doc-fee-inline">
                        <span class="dot-sep">•</span>
                        <span>{{ doc.consultation_fee }} {{ t('EGP') }}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div v-if="doc.rating" class="doc-rating-badge">
                  <span>⭐ {{ doc.rating }}</span>
                </div>
              </div>

              <div class="doc-card-footer">
                <div class="doc-availability" :class="{ 'not-today': !doc.isAvailableToday }">
                  <i :class="doc.isAvailableToday ? 'pi pi-calendar-plus' : 'pi pi-calendar'"></i>
                  <span>{{ doc.availabilityText }}</span>
                </div>
                <button class="book-appointment-btn" @click.stop="bookDoctor(doc)">
                  {{ t('Book Slot') }}
                </button>
              </div>
            </div>
          </template>

          <template #empty>
            <div class="empty-catalog-state">
              <i class="pi pi-users"></i>
              <h5>{{ t('No doctors found') }}</h5>
            </div>
          </template>
        </AppVirtualList>
      </div>
    </div>

    <!-- Doctor Profile & Full Image Preview Modal -->
    <DoctorPreviewModal
      :is-open="isDoctorPreviewOpen"
      :doctor="selectedDoctorForPreview"
      @close="isDoctorPreviewOpen = false"
      @book="bookDoctor"
    />
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
import DoctorPreviewModal from '../doctor/DoctorPreviewModal.vue';

const router = useRouter();
const route = useRoute();
const api = useUnityApi();
const { t, isRtl } = useI18n();
const bookingModal = useBookingModal();
const globalStore = useGlobalStore();

// 2. Data (refs, reactive state)
const activeTab = ref<'services' | 'doctors'>((route.query.tab as string) === 'services' ? 'services' : 'doctors');
const searchQuery = ref('');
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const clinics = ref<any[]>([]);
const selectedClinicId = ref<string | null>((route.query.clinic_id as string) || null);
const clinicsLoading = ref(false);

const services = ref<any[]>([]);
const servicesPage = ref(1);
const servicesHasMore = ref(false);
const servicesLoading = ref(false);

const categories = ref<any[]>([]);
const selectedCategoryId = ref<string | null>((route.query.category_id as string) || null);

const doctors = ref<any[]>([]);
const selectedConsultationType = ref<string>((route.query.type as string) || (route.query.consultation as string) || 'all');
const doctorsPage = ref(1);
const doctorsHasMore = ref(false);
const doctorsLoading = ref(false);
const totalDoctorsCount = ref(0);
const isDoctorPreviewOpen = ref(false);
const selectedDoctorForPreview = ref<any>(null);
const failedAvatars = ref(new Set<string | number>());

// 3. Computed (computed properties)
const config = useRuntimeConfig();
const runtimeBaseUrl = computed(() => {
  return (config.public?.apiUrl || config.public?.API_URL || 'https://api.unity-clinics.cyou').replace(/\/+$/, '');
});

const resolveDoctorAvatar = (url?: string) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image/')) return trimmed;
  const baseUrl = runtimeBaseUrl.value;
  if (trimmed.includes('localhost:4000')) {
    const path = trimmed.split('localhost:4000')[1];
    return `${baseUrl}${path}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${baseUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};
const getLocalizedName = (item: any): string => {
  if (!item) return '';
  return isRtl.value
    ? (item.name_ar || item.name || item.name_en || '')
    : (item.name_en || item.name || item.name_ar || '');
};

const getLocalizedDesc = (item: any): string => {
  if (!item) return '';
  return isRtl.value
    ? (item.description_ar || item.description || item.description_en || '')
    : (item.description_en || item.description || item.description_ar || '');
};

const getCategoryIcon = (cat: any): string => {
  if (cat?.icon) return cat.icon;
  const name = ((cat?.name_ar || cat?.name || cat?.name_en || '') + '').toLowerCase();
  if (name.includes('دم') || name.includes('تحاليل') || name.includes('blood') || name.includes('lab')) return 'pi pi-chart-line';
  if (name.includes('جلد') || name.includes('derma') || name.includes('بشرة')) return 'pi pi-heart';
  if (name.includes('قلب') || name.includes('cardio')) return 'pi pi-heart-fill';
  if (name.includes('أشعة') || name.includes('x-ray') || name.includes('scan')) return 'pi pi-camera';
  if (name.includes('أسنان') || name.includes('dental')) return 'pi pi-shield';
  if (name.includes('أطفال') || name.includes('pediatric')) return 'pi pi-user';
  return 'pi pi-folder';
};

const activeClinicName = computed(() => {
  if (!selectedClinicId.value) return '';
  const c = clinics.value.find(cl => String(cl.id) === String(selectedClinicId.value));
  return c ? getLocalizedName(c) : '';
});

const getClinicDoctorsCount = (clinic: any) => {
  if (clinic.doctors_count !== undefined && clinic.doctors_count !== null) {
    return clinic.doctors_count;
  }
  if (Array.isArray(clinic.doctors)) {
    return clinic.doctors.length;
  }
  return doctors.value.filter((d: any) => String(d.clinic_id || d.clinic?.id) === String(clinic.id)).length;
};

const allAvailableServices = computed(() => {
  return services.value;
});

const effectiveCategories = computed(() => {
  return categories.value;
});

const selectedCategory = computed(() => {
  if (!selectedCategoryId.value) return null;
  return effectiveCategories.value.find(c => String(c.id) === String(selectedCategoryId.value)) || null;
});

const selectedCategoryName = computed(() => {
  if (!selectedCategory.value) return '';
  return getLocalizedName(selectedCategory.value);
});

const getCategoryCount = (cat: any) => {
  if (Array.isArray(cat?.examinations) && cat.examinations.length > 0) return cat.examinations.length;
  if (typeof cat?.examinations_count === 'number') return cat.examinations_count;
  return services.value.filter((s: any) => String(s.category_id || s.examination_category_id || s.category?.id) === String(cat?.id)).length;
};

const filteredServices = computed(() => {
  let list = services.value;
  if (selectedCategoryId.value && selectedCategoryId.value !== 'all') {
    list = list.filter((s: any) => String(s.category_id || s.examination_category_id || s.category?.id) === String(selectedCategoryId.value));
  }
  return list;
});

const isDoctorsLoading = computed(() => {
  return doctorsLoading.value || globalStore.loading.includes('DOCTORS') || globalStore.loading.includes('doctors');
});

const isClinicsLoading = computed(() => {
  return clinicsLoading.value || globalStore.loading.includes('CLINICS') || globalStore.loading.includes('clinics');
});

const isServicesLoading = computed(() => {
  return servicesLoading.value || globalStore.loading.includes('SERVICES') || globalStore.loading.includes('services') || globalStore.loading.includes('EXAMINATION_CATEGORIES');
});

const filteredClinics = computed(() => {
  if (!searchQuery.value) return clinics.value;
  const q = searchQuery.value.toLowerCase().trim();
  return clinics.value.filter(c => {
    const name = (c.name || '').toLowerCase();
    const nameAr = (c.name_ar || '').toLowerCase();
    const nameEn = (c.name_en || '').toLowerCase();
    const descAr = (c.description_ar || '').toLowerCase();
    const descEn = (c.description_en || '').toLowerCase();
    return name.includes(q) || nameAr.includes(q) || nameEn.includes(q) || descAr.includes(q) || descEn.includes(q);
  });
});

const filteredCategories = computed(() => {
  if (!searchQuery.value) return effectiveCategories.value;
  const q = searchQuery.value.toLowerCase().trim();
  return effectiveCategories.value.filter(cat => {
    const name = (cat.name || '').toLowerCase();
    const nameAr = (cat.name_ar || '').toLowerCase();
    const nameEn = (cat.name_en || '').toLowerCase();
    const descAr = (cat.description_ar || '').toLowerCase();
    const descEn = (cat.description_en || '').toLowerCase();
    return name.includes(q) || nameAr.includes(q) || nameEn.includes(q) || descAr.includes(q) || descEn.includes(q);
  });
});

const filteredDoctors = computed(() => {
  let list = doctors.value;
  if (selectedConsultationType.value === 'online') {
    list = list.filter(d => Boolean(d.online_consultation_status || d.doctor?.online_consultation_status));
  } else if (selectedConsultationType.value === 'home') {
    list = list.filter(d => Boolean(d.home_consultation_status || d.doctor?.home_consultation_status));
  }
  if (selectedClinicId.value && selectedClinicId.value !== 'all') {
    list = list.filter(d => String(d.clinic_id || d.clinic?.id) === String(selectedClinicId.value));
  }
  return list;
});

// 4. Methods (functions, handlers)
const selectConsultationType = (type: string) => {
  selectedConsultationType.value = type;
  router.replace({ query: { ...route.query, type: type === 'all' ? undefined : type } });
};

const selectClinic = (clinicId: string | null) => {
  selectedClinicId.value = clinicId;
  searchQuery.value = '';
  router.replace({ query: { ...route.query, clinic_id: clinicId && clinicId !== 'all' ? clinicId : undefined } });
  DOCTORS(1);
};

const clearClinic = () => {
  selectedClinicId.value = null;
  searchQuery.value = '';
  router.replace({ query: { ...route.query, clinic_id: undefined } });
  DOCTORS(1);
};

const selectCategory = (categoryId: string | null) => {
  selectedCategoryId.value = categoryId;
  searchQuery.value = '';
  router.replace({ query: { ...route.query, category_id: categoryId && categoryId !== 'all' ? categoryId : undefined } });
  if (categoryId) {
    SERVICES(1);
  }
};

const clearCategory = () => {
  selectedCategoryId.value = null;
  searchQuery.value = '';
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
    globalStore.setLoading(['SERVICES', true]);
    globalStore.setLoading(['services', true]);

    const filter: any = { page, limit: 10 };
    if (selectedCategoryId.value && selectedCategoryId.value !== 'all') {
      filter.category_id = selectedCategoryId.value;
    }
    const search = searchQuery.value.trim();
    if (search) {
      filter.search = search;
    }
    const res = await api.apiRequest({ 
      service: 'SERVICES',
      filter,
      bypassCache: !!search,
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
    globalStore.setLoading(['SERVICES', false]);
    globalStore.setLoading(['services', false]);
  }
};

const loadMoreServices = () => {
  if (servicesHasMore.value && !servicesLoading.value) {
    SERVICES(servicesPage.value + 1);
  }
};

const timeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 0;
  const str = String(timeStr).trim().toUpperCase();
  const isPM = str.includes('PM');
  const isAM = str.includes('AM');
  const clean = str.replace(/[^0-9:]/g, '');
  const parts = clean.split(':');
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
};

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const computeDoctorAvailability = (doctor: any): { text: string; isToday: boolean } => {
  const isDoctorActive = doctor.status !== false && doctor.is_active !== false;
  if (!isDoctorActive) {
    return {
      text: t('Not available currently'),
      isToday: false,
    };
  }

  const rawSchedules = doctor.schedules;
  const schedules = Array.isArray(rawSchedules) ? rawSchedules.filter((s: any) => s.is_active !== false) : [];

  if (schedules.length === 0) {
    return {
      text: t('Not available currently'),
      isToday: false,
    };
  }

  const dayNamesMap: Record<string, string> = {
    sunday: t('Sunday'),
    monday: t('Monday'),
    tuesday: t('Tuesday'),
    wednesday: t('Wednesday'),
    thursday: t('Thursday'),
    friday: t('Friday'),
    saturday: t('Saturday'),
  };

  const schedulesByDay = new Map<string, any[]>();
  schedules.forEach((s: any) => {
    if (s.day_of_week) {
      const key = String(s.day_of_week).toLowerCase().trim();
      if (!schedulesByDay.has(key)) schedulesByDay.set(key, []);
      schedulesByDay.get(key)!.push(s);
    }
  });

  const now = new Date();
  const currentDayIndex = now.getDay();
  const todayKey = DAY_NAMES[currentDayIndex];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (schedulesByDay.has(todayKey)) {
    const todayShifts = schedulesByDay.get(todayKey)!;
    const hasActiveShift = todayShifts.some((s: any) => {
      const endMins = timeToMinutes(s.end_time);
      return endMins > 0 ? endMins > currentMinutes : false;
    });

    if (hasActiveShift) {
      return {
        text: t('Available Today'),
        isToday: true,
      };
    }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const nextIndex = (currentDayIndex + offset) % 7;
    const nextKey = DAY_NAMES[nextIndex];
    if (schedulesByDay.has(nextKey)) {
      if (offset === 1) {
        return {
          text: t('Available Tomorrow'),
          isToday: false,
        };
      }
      const dayLabel = dayNamesMap[nextKey] || nextKey;
      return {
        text: `${t('Available')} ${dayLabel}`,
        isToday: false,
      };
    }
  }

  return {
    text: t('Not available currently'),
    isToday: false,
  };
};

const DOCTORS = async (page = 1) => {
  try {
    doctorsLoading.value = true;
    globalStore.setLoading(['DOCTORS', true]);
    globalStore.setLoading(['doctors', true]);

    const filter: any = { page, limit: 10 };
    if (selectedClinicId.value && selectedClinicId.value !== 'all') {
      filter.clinic_id = selectedClinicId.value;
    }
    const search = searchQuery.value.trim();
    if (search) {
      filter.search = search;
    }

    const res = await api.apiRequest({ 
      service: 'DOCTORS',
      filter,
      bypassCache: !!search,
    });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);

    let enriched = raw;
    const missingSchedules = raw.some((d: any) => !d.schedules || !Array.isArray(d.schedules) || d.schedules.length === 0);
    if (missingSchedules) {
      enriched = await Promise.all(
        raw.map(async (doc: any) => {
          if (doc.schedules && Array.isArray(doc.schedules) && doc.schedules.length > 0) return doc;
          try {
            const single = await api.apiRequest({ service: 'DOCTOR_BY_ID', filter: { id: doc.id } });
            return { ...doc, schedules: single?.data?.schedules || [] };
          } catch {
            return doc;
          }
        })
      );
    }

    const items = enriched.map((d: any) => {
      const avail = computeDoctorAvailability(d);
      return {
        ...d,
        id: d.id,
        name: isRtl.value ? (d.name_ar || d.name || d.name_en) : (d.name_en || d.name || d.name_ar),
        clinic: d.clinic,
        clinic_id: d.clinic_id || d.clinic?.id,
        rating: d.rating || null,
        avatar: d.avatar || d.user?.avatar || '',
        consultation_fee: d.consultation_fee || 250,
        follow_up_fee: d.follow_up_fee || 150,
        slot_duration: d.slot_duration || 15,
        description: d.description,
        description_ar: d.description_ar,
        description_en: d.description_en,
        schedules: d.schedules || [],
        isAvailableToday: avail.isToday,
        availabilityText: avail.text,
      };
    });

    if (page === 1) {
      doctors.value = items;
      totalDoctorsCount.value = res?.pagination?.total ?? res?.total ?? items.length;
    } else {
      doctors.value.push(...items);
    }
    doctorsPage.value = page;
    doctorsHasMore.value = res?.pagination?.hasMore ?? res?.hasMore ?? (items.length >= 10);
  } catch (e) {
    console.error('DOCTORS fetch error:', e);
    if (page === 1) doctors.value = [];
  } finally {
    doctorsLoading.value = false;
    globalStore.setLoading(['DOCTORS', false]);
    globalStore.setLoading(['doctors', false]);
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
  bookingModal.openBookingFlow({ 
    doctor, 
    type: 'consultation',
    consultationType: selectedConsultationType.value === 'online' ? 'online' : (selectedConsultationType.value === 'home' ? 'home' : 'clinic')
  });
};

const openDoctorPreview = (doctor: any) => {
  selectedDoctorForPreview.value = doctor;
  isDoctorPreviewOpen.value = true;
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
    if (newTab === 'doctors') {
      if (clinics.value.length === 0) {
        CLINICS();
      }
      if (selectedClinicId.value && doctors.value.length === 0) {
        DOCTORS(1);
      }
    } else if (newTab === 'services') {
      if (categories.value.length === 0) {
        EXAMINATION_CATEGORIES();
      }
      if (selectedCategoryId.value && services.value.length === 0) {
        SERVICES(1);
      }
    }
  }
});

watch(() => [route.query.type, route.query.consultation], ([newType, newConsultation]) => {
  const target = (newType as string) || (newConsultation as string);
  if (target && typeof target === 'string') {
    selectedConsultationType.value = target;
  }
}, { immediate: true });

watch(() => route.query.clinic_id, (newClinicId) => {
  selectedClinicId.value = (newClinicId as string) || null;
});

watch(() => route.query.category_id, (newCategoryId) => {
  selectedCategoryId.value = (newCategoryId as string) || null;
});

watch(searchQuery, () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  // 1. Doctors Tab Drilldown (When viewing doctors in a clinic)
  if (activeTab.value === 'doctors' && selectedClinicId.value) {
    globalStore.setLoading(['DOCTORS', true]);
    globalStore.setLoading(['doctors', true]);
    doctorsLoading.value = true;

    searchDebounceTimer = setTimeout(() => {
      DOCTORS(1);
    }, 500);
  }

  // 2. Services Tab Drilldown (When viewing examinations in a category)
  if (activeTab.value === 'services' && selectedCategoryId.value) {
    globalStore.setLoading(['SERVICES', true]);
    globalStore.setLoading(['services', true]);
    servicesLoading.value = true;

    searchDebounceTimer = setTimeout(() => {
      SERVICES(1);
    }, 500);
  }
});

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  if (activeTab.value === 'doctors') {
    CLINICS();
    if (selectedClinicId.value) {
      DOCTORS(1);
    }
  } else if (activeTab.value === 'services') {
    EXAMINATION_CATEGORIES();
    if (selectedCategoryId.value) {
      SERVICES(1);
    }
  }
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.catalog-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-box {
  .clear-search-btn {
    position: absolute;
    inset-inline-end: 12px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #f1f5f9;
    border: 1.5px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    cursor: pointer;

    i {
      position: static !important;
      font-size: 0.7rem !important;
      color: inherit !important;
    }
  }
  position: relative;
  display: flex;
  align-items: center;

  i {
    position: absolute;
    inset-inline-start: 14px;
    color: var(--unity-text-dim);
    font-size: 0.95rem;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding-inline-start: 42px;
    padding-inline-end: 14px;
    padding-block: 12px;
    border-radius: 14px;
    border: 1.5px solid var(--unity-border);
    background: var(--unity-surface);
    color: var(--unity-text-main);
    font-size: 0.84rem;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: var(--unity-primary);
      box-shadow: 0 0 0 3px rgba(var(--unity-primary-rgb), 0.12);
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 34px;
    padding: 0 14px;
    border-radius: 9999px;
    border: 1px solid var(--unity-border);
    background: var(--unity-surface);
    color: var(--unity-text-muted);
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    .chip-count {
      font-size: 0.72rem;
      opacity: 0.88;
    }

    i {
      font-size: 0.85rem;
    }

    &:hover {
      border-color: var(--unity-primary);
      color: var(--unity-primary);
    }

    &.active {
      background: var(--unity-primary);
      border-color: var(--unity-primary);
      color: #ffffff;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(var(--unity-primary-rgb), 0.22);

      .chip-count {
        color: #ffffff;
      }
    }
  }
}

.tab-content-area {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

// Categories Selection View & Grid
.categories-selection-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

// Entity Vertical Cards Stack (Categories & Clinics - Exactly matching Admin card design)
.categories-cards-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entity-stack-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: var(--unity-primary);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(var(--unity-primary-rgb), 0.08);

    .view-action-btn {
      opacity: 0.9;
    }

    .card-arrow-wrap {
      color: var(--unity-primary);
    }
  }

  &:active {
    transform: scale(0.99);
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-box {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;

      i {
        font-size: 1.2rem;
      }

      &.category {
        background: var(--unity-primary-light);
        color: var(--unity-primary);
        border: 1px solid var(--unity-primary-tint);

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          background: rgba(var(--unity-accent-rgb), 0.14);
          border-color: rgba(var(--unity-accent-rgb), 0.28);
          color: var(--unity-accent-light);
        }
      }

      &.clinic {
        background: var(--unity-primary-light);
        color: var(--unity-primary);
        border: 1px solid var(--unity-primary-tint);

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          background: rgba(var(--unity-accent-rgb), 0.14);
          border-color: rgba(var(--unity-accent-rgb), 0.28);
          color: var(--unity-accent-light);
        }

        svg {
          width: 22px;
          height: 22px;
          color: var(--unity-primary);

          :global([data-theme='dark']) &,
          :global(html.dark) & {
            color: var(--unity-accent-light);
          }
        }
      }
    }

    .entity-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      text-align: start;

      h4 {
        font-size: 0.96rem;
        font-weight: 700;
        color: var(--unity-text-main);
        margin: 0;
      }

      .entity-desc {
        font-size: 0.78rem;
        color: var(--unity-text-dim);
        margin: 0;
        line-height: 1.35;
      }
    }

    .card-arrow-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--unity-text-dim);
      font-size: 0.82rem;
      flex-shrink: 0;
      transition: color 0.2s ease, transform 0.2s ease;
    }
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--unity-border);
    padding-top: 10px;

    .capacity-text {
      font-size: 0.76rem;
      color: var(--unity-text-muted);
      display: inline-flex;
      align-items: center;
      gap: 6px;

      svg,
      i {
        color: var(--unity-primary);
        flex-shrink: 0;
      }
    }

    .view-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--unity-primary);
      transition: all 0.2s ease;

      i {
        font-size: 0.70rem;
      }
    }
  }
}

.services-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 2px;
  gap: 8px;

  .section-title-wrap {
    h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }
    p {
      margin: 2px 0 0;
      font-size: 0.76rem;
      color: var(--unity-text-dim);
    }
  }

  .head-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .clear-filter-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 8px;
      border: 1px solid var(--unity-border);
      background: var(--unity-surface);
      color: var(--unity-text-dim);
      font-size: 0.74rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #ef4444;
        color: #ef4444;
      }
    }

    .services-count-pill {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 9999px;
      background: var(--unity-primary-light);
      color: var(--unity-primary);
    }
  }
}

.categories-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 2px;

  .section-title-wrap {
    h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }
    p {
      margin: 2px 0 0;
      font-size: 0.78rem;
      color: var(--unity-text-dim);
    }
  }

  .categories-count-badge {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 9999px;
    background: var(--unity-primary-light);
    color: var(--unity-primary);
  }
}

.categories-selection-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
}

.category-selection-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: var(--unity-primary);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(var(--unity-primary-rgb), 0.08);
  }

  &:active {
    transform: scale(0.98);
  }

  .cat-icon-bubble {
    width: 44px;
    height: 44px;
    border-radius: 13px;
    background: var(--unity-primary-light);
    color: var(--unity-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    flex-shrink: 0;
    transition: all 0.2s;
  }

  .cat-card-info {
    flex: 1;
    min-width: 0;

    .cat-name {
      margin: 0;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--unity-text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cat-count-sub {
      display: block;
      font-size: 0.74rem;
      font-weight: 500;
      color: var(--unity-text-dim);
      margin-top: 2px;
    }
  }

  .cat-card-arrow {
    color: var(--unity-text-dim);
    font-size: 0.75rem;
    transition: transform 0.2s;
  }

  &:hover .cat-card-arrow {
    color: var(--unity-primary);
  }
}

.services-drilldown-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-active-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 14px;
  gap: 10px;

  .back-to-cats-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 10px;
    border: 1.5px solid var(--unity-primary);
    background: var(--unity-primary-light);
    color: var(--unity-primary);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    i {
      font-size: 0.75rem;
    }

    &:hover {
      background: var(--unity-primary);
      color: #fff;
    }
  }

  .active-cat-meta {
    display: flex;
    align-items: center;
    gap: 8px;

    h4 {
      margin: 0;
      font-size: 0.88rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    .cat-badge-count {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      background: var(--unity-primary-light);
      color: var(--unity-primary);
    }
  }
}

.search-results-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 14px;

  .results-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--unity-text-main);

    i {
      color: var(--unity-primary);
      font-size: 0.85rem;
    }
  }

  .reset-search-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: none;
    color: var(--unity-text-dim);
    font-size: 0.76rem;
    cursor: pointer;

    &:hover {
      color: #ef4444;
    }
  }
}

.selected-clinic-flow {
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

    &.btn-back-chip {
      background: var(--unity-primary-light);
      border-color: var(--unity-primary);
      color: var(--unity-primary);

      i {
        color: var(--unity-primary);
      }
    }

    .count-bubble {
      font-size: 0.65rem;
      background: var(--unity-primary-light);
      color: var(--unity-primary);
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
        box-shadow: 0 6px 16px rgba(var(--unity-primary-rgb), 0.12);
      }

      .card-icon-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .clinic-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--unity-primary-light);
          color: var(--unity-primary);
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
  background: var(--unity-primary-light);
  border: 1px solid var(--unity-primary-tint);
  border-radius: 14px;
  padding: 10px 14px;

  .filter-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    color: var(--unity-primary-hover);

    i {
      color: var(--unity-primary);
    }

    strong {
      font-weight: 800;
    }
  }

  .btn-clear-clinic {
    background: #fff;
    border: 1px solid var(--unity-primary-border);
    color: var(--unity-primary);
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

// Doctor Catalog Card (matches the sleek home top doctors card)
.doctor-catalog-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--unity-shadow-subtle);
  transition: all 0.2s ease;

  .doc-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      opacity: 0.94;

      .clickable-doc-avatar {
        transform: scale(1.05);
      }
    }

    .doc-rating-badge {
      background: var(--unity-primary-light);
      color: var(--unity-primary);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .doc-avatar-group {
      display: flex;
      align-items: center;
      gap: 12px;

      .doc-texts {
        text-align: start;

        h5 {
          font-size: 0.94rem;
          font-weight: 700;
          color: var(--unity-text-main);
          margin: 0;
        }

        .doc-sub-line {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          flex-wrap: wrap;

          .doc-clinic-name {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 0.68rem;
            color: var(--unity-text-dim);

            i {
              font-size: 0.7rem;
            }
          }

          .doc-fee-inline {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 0.68rem;
            font-weight: 600;
            color: var(--unity-primary);

            .dot-sep {
              color: var(--unity-border-dark);
            }
          }
        }
      }

      img, .doc-initial-avatar {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
        transition: transform 0.2s ease;
      }

      .doc-initial-avatar {
        background: linear-gradient(135deg, var(--unity-primary) 0%, var(--unity-primary-hover) 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        font-weight: 700;
      }
    }
  }

  .doc-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--unity-border-light);
    padding-top: 12px;

    .doc-availability {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.76rem;
      color: var(--unity-primary);
      font-weight: 700;

      i {
        font-size: 0.85rem;
        color: var(--unity-primary);
      }

      &.not-today {
        color: var(--unity-text-muted);
        font-weight: 600;

        i {
          color: var(--unity-text-dim);
        }
      }
    }

    .book-appointment-btn {
      background: var(--unity-primary);
      color: #fff;
      border: none;
      padding: 8px 18px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(var(--unity-primary-rgb), 0.2);
      transition: all 0.2s;

      &:hover {
        background: var(--unity-primary-dark);
        transform: translateY(-1px);
      }
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
      background: var(--unity-primary-light);
      color: var(--unity-primary);
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
  background: linear-gradient(135deg, var(--unity-primary) 0%, var(--unity-primary-hover) 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 800;
  flex-shrink: 0;
}
</style>
