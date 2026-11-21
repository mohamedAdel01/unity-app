<template>
  <div class="catalog-container">
    <!-- Switcher Tabs (عيادات وأطباء / خدمات طبية) -->
    <div class="view-tabs-switch">
      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'doctors' }"
        @click="switchTab('doctors')"
      >
        <i class="pi pi-building"></i>
        <span>{{ t('Clinics & Doctors') }}</span>
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
        <span>{{ t('Services') }}</span>
      </button>
    </div>

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
      <!-- Search Active Info Bar -->
      <div v-if="searchQuery" class="search-results-bar">
        <div class="results-meta">
          <i class="pi pi-search"></i>
          <span>{{ filteredServices.length }} {{ t('Services found') }}</span>
        </div>
        <button type="button" class="reset-search-btn" @click="searchQuery = ''">
          <i class="pi pi-times"></i>
          <span>{{ t('Clear search') }}</span>
        </button>
      </div>

      <!-- 1. Categories Section (Stacked Cards under each other) -->
      <div v-if="!searchQuery" class="categories-selection-view">
        <div class="categories-section-head">
          <div class="section-title-wrap">
            <h4>{{ t('Select Category') }}</h4>
            <p>{{ t('Browse by department') }}</p>
          </div>
          <span v-if="effectiveCategories.length > 0" class="categories-count-badge">
            {{ effectiveCategories.length }} {{ t('Categories') }}
          </span>
        </div>

        <!-- Vertical Stack of Category Cards -->
        <div class="categories-cards-stack">
          <!-- All Categories Card -->
          <div 
            class="category-stack-card"
            :class="{ 'is-selected': !selectedCategoryId }"
            @click="clearCategory"
          >
            <div class="cat-card-left">
              <div class="cat-icon-bubble">
                <i class="pi pi-th-large"></i>
              </div>
              <div class="cat-card-info">
                <h5 class="cat-name">{{ t('All Services') }}</h5>
                <div class="cat-meta-sub">
                  <span class="cat-count-pill">{{ allAvailableServices.length }} {{ t('Services') }}</span>
                  <span class="cat-desc-hint">{{ t('Browse all available medical tests and examinations') }}</span>
                </div>
              </div>
            </div>
            <div class="cat-card-right">
              <div v-if="!selectedCategoryId" class="selected-check-badge">
                <i class="pi pi-check"></i>
              </div>
              <i v-else :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="cat-card-arrow"></i>
            </div>
          </div>

          <!-- Individual Category Cards -->
          <div 
            v-for="cat in effectiveCategories" 
            :key="cat.id" 
            class="category-stack-card"
            :class="{ 'is-selected': selectedCategoryId === cat.id }"
            @click="selectCategory(cat.id)"
          >
            <div class="cat-card-left">
              <div class="cat-icon-bubble">
                <i :class="cat.icon || 'pi pi-heart'"></i>
              </div>
              <div class="cat-card-info">
                <h5 class="cat-name">{{ getLocalizedName(cat) }}</h5>
                <div class="cat-meta-sub">
                  <span class="cat-count-pill">{{ getCategoryCount(cat) }} {{ t('Services') }}</span>
                  <span class="cat-desc-hint">{{ t('Browse specialized services') }}</span>
                </div>
              </div>
            </div>
            <div class="cat-card-right">
              <div v-if="selectedCategoryId === cat.id" class="selected-check-badge">
                <i class="pi pi-check"></i>
              </div>
              <i v-else :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="cat-card-arrow"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Services List View (ALWAYS displayed directly below categories!) -->
      <div class="services-list-section">
        <!-- Section Header for Services -->
        <div class="services-section-head">
          <div class="section-title-wrap">
            <h4>{{ selectedCategoryId ? selectedCategoryName : t('Available Services') }}</h4>
            <p>{{ selectedCategoryId ? t('Filtered by selected category') : t('Browse all available medical tests and examinations') }}</p>
          </div>
          <div class="head-actions">
            <button 
              v-if="selectedCategoryId" 
              type="button" 
              class="clear-filter-btn" 
              @click="clearCategory"
            >
              <i class="pi pi-times"></i>
              <span>{{ t('Clear Filter') }}</span>
            </button>
            <span class="services-count-pill">
              {{ filteredServices.length }} {{ t('Services') }}
            </span>
          </div>
        </div>

        <!-- Services List with Virtual Windowing -->
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
                    {{ isRtl ? (service.category?.name_ar || service.category?.name || service.category?.name_en) : (service.category?.name_en || service.category?.name || service.category?.name_ar) }}
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
              <h5>{{ selectedCategoryId ? t('No services in this category') : t('No services available') }}</h5>
            </div>
          </template>
        </AppVirtualList>
      </div>
    </div>

    <!-- Content: Doctors Tab -->
    <div v-else class="tab-content-area">
      <!-- 1. Clinics Grid View (Displayed first when no clinic selected and no search) -->
      <div v-if="!selectedClinicId && !searchQuery" class="categories-selection-view">
        <div class="categories-section-head">
          <div class="section-title-wrap">
            <h4>{{ t('Select Clinic') }}</h4>
            <p>{{ t('Browse our specialized clinics & departments') }}</p>
          </div>
          <span v-if="clinics.length > 0" class="categories-count-badge">
            {{ clinics.length }} {{ t('Clinics') }}
          </span>
        </div>

        <div v-if="clinics.length > 0" class="categories-cards-stack">
          <div 
            v-for="clinic in clinics" 
            :key="clinic.id" 
            class="category-stack-card clinic-stack-card"
            @click="selectClinic(clinic.id)"
          >
            <div class="cat-card-left">
              <div class="cat-icon-bubble clinic-icon-bubble">
                <i class="pi pi-building"></i>
              </div>
              <div class="cat-card-info">
                <h5 class="cat-name">{{ getLocalizedName(clinic) }}</h5>
                <div class="cat-meta-sub">
                  <span class="cat-count-pill">{{ getClinicDoctorsCount(clinic) }} {{ t('Doctors') }}</span>
                  <span class="cat-desc-hint">{{ t('Browse specialized doctors & appointments') }}</span>
                </div>
              </div>
            </div>
            <div class="cat-card-right">
              <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="cat-card-arrow"></i>
            </div>
          </div>
        </div>

        <div v-else-if="clinicsLoading || globalStore.loading.includes('clinics')" class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          <span>{{ t('Loading...') }}</span>
        </div>

        <div v-else class="empty-catalog-state">
          <i class="pi pi-building"></i>
          <h5>{{ t('No clinics available') }}</h5>
        </div>
      </div>

      <!-- 2. Doctors Drilldown View (When clinic chosen or search query active) -->
      <div v-else class="services-drilldown-view">
        <!-- Search Active Info Bar -->
        <div v-if="searchQuery" class="search-results-bar">
          <div class="results-meta">
            <i class="pi pi-search"></i>
            <span>{{ filteredDoctors.length }} {{ t('Doctors found') }}</span>
          </div>
          <button type="button" class="reset-search-btn" @click="searchQuery = ''">
            <i class="pi pi-times"></i>
            <span>{{ t('Clear search') }}</span>
          </button>
        </div>

        <!-- Active Clinic Header Bar (With Back to Clinics button) -->
        <div v-else class="category-active-bar">
          <button type="button" class="back-to-cats-btn" @click="clearClinic">
            <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
            <span>{{ t('Back to Clinics') }}</span>
          </button>
          <div class="active-cat-meta">
            <h4>{{ activeClinicName }}</h4>
            <span class="cat-badge-count">{{ filteredDoctors.length }} {{ t('Doctors') }}</span>
          </div>
        </div>

        <!-- Consultation Type Filter Chips (In drilldown view) -->
        <div class="categories-chips-scroll consultation-chips-bar">
          <button 
            type="button" 
            class="cat-chip" 
            :class="{ 'active': !selectedConsultationType || selectedConsultationType === 'all' }"
            @click="selectConsultationType('all')"
          >
            <i class="pi pi-users"></i>
            <span>{{ t('All Doctors') }}</span>
          </button>

          <button 
            type="button" 
            class="cat-chip" 
            :class="{ 'active': selectedConsultationType === 'clinic' }"
            @click="selectConsultationType('clinic')"
          >
            <i class="pi pi-building"></i>
            <span>{{ t('In-Clinic Visit') }}</span>
          </button>

          <button 
            type="button" 
            class="cat-chip" 
            :class="{ 'active': selectedConsultationType === 'online' }"
            @click="selectConsultationType('online')"
          >
            <i class="pi pi-video"></i>
            <span>{{ t('Online Video') }}</span>
          </button>

          <button 
            type="button" 
            class="cat-chip" 
            :class="{ 'active': selectedConsultationType === 'home' }"
            @click="selectConsultationType('home')"
          >
            <i class="pi pi-home"></i>
            <span>{{ t('Home Visit') }}</span>
          </button>
        </div>

        <!-- Doctors Virtual List -->
        <AppVirtualList
          :items="filteredDoctors"
          :has-more="doctorsHasMore"
          :loading="doctorsLoading || globalStore.loading.includes('doctors')"
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
const activeTab = ref<'services' | 'doctors'>('doctors');
const searchQuery = ref('');

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

const defaultSampleServices = [
  {
    id: 'srv-cbc',
    name_ar: 'تحليل صورة دم كاملة (CBC)',
    name_en: 'Complete Blood Count (CBC)',
    price: 150,
    duration: 15,
    description_ar: 'فحص شامل لخلايا الدم ومستوى الهيموجلوبين ومكونات الدم',
    description_en: 'Comprehensive blood cell count and hemoglobin evaluation',
    category_id: 'cmwl2k0rt000boy1cnqwob03f',
    category: { id: 'cmwl2k0rt000boy1cnqwob03f', name_ar: 'تحاليل الدم', name_en: 'Blood tests', icon: 'pi pi-chart-line' },
  },
  {
    id: 'srv-derma-1',
    name_ar: 'جلسة تنظيف وتقشير البشرة الطبي',
    name_en: 'Medical Skin Cleansing & Peeling',
    price: 350,
    duration: 30,
    description_ar: 'جلسة عناية طبية متخصصة بالبشرة وإزالة الرؤوس السوداء والشوائب',
    description_en: 'Specialized medical skincare and impurity removal',
    category_id: 'cmwif5sr70002o21cfzslo896',
    category: { id: 'cmwif5sr70002o21cfzslo896', name_ar: 'خدمات الجلدية', name_en: 'Dermatology Services', icon: 'pi pi-heart' },
  },
  {
    id: 'srv-derma-2',
    name_ar: 'جلسة ليزر كربوني للوجه',
    name_en: 'Carbon Laser Facial Session',
    price: 450,
    duration: 25,
    description_ar: 'جلسة ليزر كربوني لنضارة وتفتيح البشرة وتقليص المسام',
    description_en: 'Carbon laser rejuvenation for glowing skin and pore tightening',
    category_id: 'cmwif5sr70002o21cfzslo896',
    category: { id: 'cmwif5sr70002o21cfzslo896', name_ar: 'خدمات الجلدية', name_en: 'Dermatology Services', icon: 'pi pi-heart' },
  },
  {
    id: 'srv-xray',
    name_ar: 'أشعة سينية عادية على الصدر (Chest X-Ray)',
    name_en: 'Chest X-Ray',
    price: 250,
    duration: 20,
    description_ar: 'تصوير إشعاعي تشخيصي دقيق لمنطقة الصدر والرئتين',
    description_en: 'Accurate radiographic chest and lungs diagnostic imaging',
    category_id: 'cmwl2k0rt000boy1cnqwob03f',
    category: { id: 'cmwl2k0rt000boy1cnqwob03f', name_ar: 'تحاليل وأشعة', name_en: 'Radiology & Labs', icon: 'pi pi-chart-line' },
  },
  {
    id: 'srv-ecg',
    name_ar: 'تخطيط كهربية القلب (ECG)',
    name_en: 'Electrocardiogram (ECG)',
    price: 200,
    duration: 15,
    description_ar: 'رسم وتخطيط لنبضات القلب وفحص النشاط الكهربائي بدقة',
    description_en: 'Heart rhythm and electrical activity recording',
    category_id: 'cmwl2k0rt000boy1cnqwob03f',
    category: { id: 'cmwl2k0rt000boy1cnqwob03f', name_ar: 'تحاليل وفحوصات', name_en: 'Tests & Labs', icon: 'pi pi-chart-line' },
  },
];

const allAvailableServices = computed(() => {
  return services.value.length > 0 ? services.value : defaultSampleServices;
});

const effectiveCategories = computed(() => {
  if (categories.value.length > 0) return categories.value;
  // Fallback: extract categories from loaded services
  const map = new Map<string, any>();
  for (const s of allAvailableServices.value) {
    const cat = s.category;
    if (cat && cat.id && !map.has(cat.id)) {
      map.set(cat.id, cat);
    } else if (s.category_id && !map.has(s.category_id)) {
      map.set(s.category_id, {
        id: s.category_id,
        name_ar: s.category_name_ar || s.category_name || s.name_ar || 'خدمات عامة',
        name_en: s.category_name_en || s.category_name || s.name_en || 'General Services',
        icon: 'pi pi-folder',
      });
    }
  }
  if (map.size === 0) {
    return [
      { id: 'cmwif5sr70002o21cfzslo896', name_ar: 'خدمات الجلدية', name_en: 'Dermatology Services', icon: 'pi pi-heart' },
      { id: 'cmwl2k0rt000boy1cnqwob03f', name_ar: 'تحاليل الدم', name_en: 'Blood tests', icon: 'pi pi-chart-line' },
    ];
  }
  return Array.from(map.values());
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
  if (typeof cat?.examinations_count === 'number' && cat.examinations_count > 0) return cat.examinations_count;
  const directMatch = allAvailableServices.value.filter((s: any) => String(s.category_id || s.category?.id) === String(cat?.id)).length;
  if (directMatch > 0) return directMatch;
  const catName = ((cat.name_ar || cat.name || cat.name_en || '') + '').toLowerCase();
  return allAvailableServices.value.filter((s: any) => {
    const sName = ((s.name_ar || s.name || s.name_en || '') + '').toLowerCase();
    const sDesc = ((s.description_ar || s.description || s.description_en || '') + '').toLowerCase();
    if (catName.includes('دم') || catName.includes('تحاليل') || catName.includes('blood')) {
      return sName.includes('دم') || sName.includes('cbc') || sDesc.includes('دم') || sName.includes('أشعة') || sName.includes('قلب');
    }
    if (catName.includes('جلد') || catName.includes('derma')) {
      return sName.includes('جلد') || sDesc.includes('جلد') || sName.includes('بشرة') || sName.includes('ليزر');
    }
    return false;
  }).length;
};

const filteredServices = computed(() => {
  let list = allAvailableServices.value;
  if (selectedCategoryId.value) {
    const cat = effectiveCategories.value.find(c => String(c.id) === String(selectedCategoryId.value));
    const catName = ((cat?.name_ar || cat?.name || cat?.name_en || '') + '').toLowerCase();
    list = list.filter((s: any) => {
      if (String(s.category_id || s.category?.id) === String(selectedCategoryId.value)) return true;
      if (Array.isArray(cat?.examinations) && cat.examinations.some((e: any) => String(e.id) === String(s.id))) return true;
      const sName = ((s.name_ar || s.name || s.name_en || '') + '').toLowerCase();
      const sDesc = ((s.description_ar || s.description || s.description_en || '') + '').toLowerCase();
      if (catName.includes('دم') || catName.includes('تحاليل') || catName.includes('blood')) {
        return sName.includes('دم') || sName.includes('cbc') || sDesc.includes('دم') || sName.includes('أشعة') || sName.includes('قلب');
      }
      if (catName.includes('جلد') || catName.includes('derma')) {
        return sName.includes('جلد') || sDesc.includes('جلد') || sName.includes('بشرة') || sName.includes('ليزر');
      }
      return false;
    });
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
  if (selectedConsultationType.value === 'online') {
    list = list.filter(d => Boolean(d.online_consultation_status || d.doctor?.online_consultation_status));
  } else if (selectedConsultationType.value === 'home') {
    list = list.filter(d => Boolean(d.home_consultation_status || d.doctor?.home_consultation_status));
  }
  if (selectedClinicId.value && selectedClinicId.value !== 'all') {
    list = list.filter(d => String(d.clinic_id || d.clinic?.id) === String(selectedClinicId.value));
  }
  if (!searchQuery.value) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter(d => 
    (d.name || '').toLowerCase().includes(q) || 
    (d.clinic?.name || '').toLowerCase().includes(q) ||
    (d.clinic?.name_ar || '').toLowerCase().includes(q) ||
    (d.clinic?.name_en || '').toLowerCase().includes(q)
  );
});

// 4. Methods (functions, handlers)
const selectConsultationType = (type: string) => {
  selectedConsultationType.value = type;
  router.replace({ query: { ...route.query, type: type === 'all' ? undefined : type } });
};

const switchTab = (tab: 'services' | 'doctors') => {
  activeTab.value = tab;
  router.replace({ query: { ...route.query, tab } });
};

const selectClinic = (clinicId: string | null) => {
  selectedClinicId.value = clinicId;
  searchQuery.value = '';
  router.replace({ query: { ...route.query, clinic_id: clinicId || undefined } });
  DOCTORS(1);
};

const clearClinic = () => {
  selectedClinicId.value = null;
  searchQuery.value = '';
  router.replace({ query: { ...route.query, clinic_id: undefined } });
  DOCTORS(1);
};

const selectCategory = (categoryId: string) => {
  if (selectedCategoryId.value === categoryId) {
    selectedCategoryId.value = null;
  } else {
    selectedCategoryId.value = categoryId;
  }
  searchQuery.value = '';
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
    const filter: any = { page, limit: 10 };
    if (selectedCategoryId.value) {
      filter.category_id = selectedCategoryId.value;
    }
    const res = await api.apiRequest({ 
      service: 'SERVICES',
      filter,
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
    const filter: any = { page, limit: 10 };
    if (selectedClinicId.value && selectedClinicId.value !== 'all') {
      filter.clinic_id = selectedClinicId.value;
    }
    const res = await api.apiRequest({ 
      service: 'DOCTORS',
      filter,
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
      totalDoctorsCount.value = res?.pagination?.total || items.length;
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
    consultationType: selectedDoctorType.value === 'online' ? 'online' : (selectedDoctorType.value === 'home' ? 'home' : 'clinic')
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
  }
}, { immediate: true });

watch(() => [route.query.type, route.query.consultation], ([newType, newConsultation]) => {
  const target = (newType as string) || (newConsultation as string);
  if (target && typeof target === 'string') {
    selectedConsultationType.value = target;
  }
}, { immediate: true });

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  CLINICS();
  SERVICES(1);
  EXAMINATION_CATEGORIES();
  DOCTORS(1);
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
  background: var(--unity-surface-muted, #f1f5f9);
  border: 1px solid var(--unity-border);
  border-radius: 12px;
  padding: 3px;
  gap: 4px;

  .tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border-radius: 9px;
    border: none;
    background: transparent;
    color: var(--unity-text-muted);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    .tab-icon-svg {
      width: 15px;
      height: 15px;
      transition: all 0.2s;
    }

    i {
      font-size: 0.82rem;
    }

    &.active {
      background: var(--unity-surface, #ffffff);
      color: var(--unity-primary);
      font-weight: 700;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

      .tab-icon-svg {
        color: var(--unity-primary);
      }
    }
  }
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
    font-size: 0.80rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    i {
      font-size: 0.85rem;
    }

    &:hover {
      border-color: var(--unity-primary);
      color: var(--unity-primary);
    }

    &.active {
      background: var(--unity-primary-light, #ecfdf5);
      border: 1.5px solid var(--unity-primary);
      color: var(--unity-primary);
      font-weight: 700;
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

// Categories Vertical Cards Stack (Stacked under each other)
.categories-cards-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-stack-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  &:hover {
    border-color: var(--unity-primary);
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(4, 120, 87, 0.09);
  }

  &:active {
    transform: scale(0.99);
  }

  &.is-selected {
    border-color: var(--unity-primary);
    background: var(--unity-primary-light, #ecfdf5);
    box-shadow: 0 4px 16px rgba(4, 120, 87, 0.12);

    .cat-icon-bubble {
      background: var(--unity-primary);
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(4, 120, 87, 0.25);
    }

    .cat-name {
      color: var(--unity-primary);
    }

    .cat-card-arrow {
      color: var(--unity-primary);
    }
  }

  .cat-card-left {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
    min-width: 0;
  }

  .cat-icon-bubble {
    width: 46px;
    height: 46px;
    border-radius: 13px;
    background: var(--unity-primary-light, #ecfdf5);
    color: var(--unity-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .cat-card-info {
    flex: 1;
    min-width: 0;

    .cat-name {
      margin: 0;
      font-size: 0.94rem;
      font-weight: 700;
      color: var(--unity-text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.2s;
    }

    .cat-meta-sub {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 3px;

      .cat-count-pill {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 9999px;
        background: rgba(4, 120, 87, 0.08);
        color: var(--unity-primary);
        font-size: 0.72rem;
        font-weight: 600;
      }

      .cat-desc-hint {
        font-size: 0.76rem;
        color: var(--unity-text-dim);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .cat-card-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .selected-check-badge {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--unity-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
    }

    .cat-card-arrow {
      color: var(--unity-text-dim);
      font-size: 0.82rem;
      transition: color 0.2s, transform 0.2s;
    }
  }
}

.services-list-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
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
      background: var(--unity-primary-light, #ecfdf5);
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
    background: var(--unity-primary-light, #ecfdf5);
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
    box-shadow: 0 6px 16px rgba(4, 120, 87, 0.08);
  }

  &:active {
    transform: scale(0.98);
  }

  .cat-icon-bubble {
    width: 44px;
    height: 44px;
    border-radius: 13px;
    background: var(--unity-primary-light, #ecfdf5);
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
    background: var(--unity-primary-light, #ecfdf5);
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
      background: var(--unity-primary-light, #ecfdf5);
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
          color: var(--unity-text-main, #334155);
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
              color: var(--unity-border-dark, #cbd5e1);
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
        background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
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
    border-top: 1px solid var(--unity-border-light, #f1f5f9);
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
          color: var(--unity-text-dim, #64748b);
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
      box-shadow: 0 2px 6px rgba(4, 120, 87, 0.2);
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
