<template>
  <div class="catalog-container">
    <!-- Switcher Tabs (خدمات وفحوصات / أطباء واستشاريين) -->
    <div class="view-tabs-switch">
      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'services' }"
        @click="switchTab('services')"
      >
        <i class="pi pi-heart-fill"></i>
        <span>{{ t('servicesCatalog.tabServices') }}</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'doctors' }"
        @click="switchTab('doctors')"
      >
        <i class="pi pi-user-plus"></i>
        <span>{{ t('servicesCatalog.tabDoctors') }}</span>
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="search-box">
      <i class="pi pi-search"></i>
      <input 
        v-model="searchQuery" 
        type="text" 
        :placeholder="activeTab === 'services' ? t('servicesCatalog.searchServicesPlaceholder') : t('servicesCatalog.searchDoctorsPlaceholder')" 
      />
    </div>

    <!-- Content: Services Tab -->
    <div v-if="activeTab === 'services'" class="tab-content-area">
      <div v-if="globalStore.loading.includes('services')" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else class="services-grid">
        <div 
          v-for="service in filteredServices" 
          :key="service.id" 
          class="service-item-card"
        >
          <div class="card-side-icon">
            <i class="pi pi-shield"></i>
          </div>
          <div class="card-details">
            <div class="details-top">
              <h5>{{ service.name }}</h5>
              <span class="price-tag">{{ service.price }} <small>{{ t('common.currency') }}</small></span>
            </div>
            <p>{{ service.description || (isRtl ? 'خدمة طبية ورعاية شاملة معتمدة' : 'Comprehensive certified healthcare service') }}</p>
            <div class="card-meta">
              <span><i class="pi pi-clock"></i> {{ service.duration || 30 }} {{ t('common.minute') }}</span>
              <span><i class="pi pi-check"></i> {{ t('servicesCatalog.availableNow') }}</span>
            </div>
            <button class="book-service-btn" @click="bookService(service)">
              <span>{{ t('servicesCatalog.bookThisService') }}</span>
              <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content: Doctors Tab -->
    <div v-else class="tab-content-area">
      <div v-if="globalStore.loading.includes('doctors')" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else class="doctors-grid">
        <div 
          v-for="doc in filteredDoctors" 
          :key="doc.id" 
          class="doctor-catalog-card"
        >
          <div class="doc-main-row">
            <div class="doc-img-wrap">
              <img :src="doc.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80'" :alt="doc.name" />
              <span class="star-pill">⭐ {{ doc.rating || '4.9' }}</span>
            </div>
            <div class="doc-info-block">
              <h5>{{ doc.name }}</h5>
              <p class="specialty-title">{{ doc.specialty || doc.clinic?.name || (isRtl ? 'استشاري متخصص' : 'Specialist Consultant') }}</p>
              <span class="clinic-location"><i class="pi pi-map-marker"></i> {{ doc.clinic?.name || (isRtl ? 'مجمع الرياض الطبي' : 'Riyadh Medical Complex') }}</span>
              <div class="fee-badge">
                {{ t('servicesCatalog.consultationPrice') }} <strong>{{ doc.consultation_fee || 250 }} {{ t('common.currency') }}</strong>
              </div>
            </div>
          </div>
          <button class="doc-book-btn" @click="bookDoctor(doc)">
            {{ t('servicesCatalog.bookConsultation') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';
import { useGlobalStore } from '../../stores/global';

const router = useRouter();
const route = useRoute();
const api = useUnityApi();
const { t, isRtl } = useI18n();
const bookingModal = useBookingModal();
const globalStore = useGlobalStore();

const activeTab = ref<'services' | 'doctors'>('services');
const searchQuery = ref('');

const services = ref<any[]>([]);
const doctors = ref<any[]>([]);

const switchTab = (tab: 'services' | 'doctors') => {
  activeTab.value = tab;
  router.replace({ query: { tab } });
};

const loadServices = async () => {
  try {
    globalStore.setLoading(['services', true]);
    const res = await api.getServices();
    if (res.status && Array.isArray(res.data) && res.data.length > 0) {
      services.value = res.data;
    } else {
      services.value = [
        { id: 'srv-1', name: isRtl.value ? 'كشف استشاري عام' : 'General Consultant Checkup', price: 250, duration: 30, description: isRtl.value ? 'كشفية شاملة وفحص سريري مع تقرير طبي متكامل' : 'Comprehensive consultation with full report' },
        { id: 'srv-2', name: isRtl.value ? 'باقة الفيتامينات الشاملة' : 'Vitamin Profile Package', price: 350, duration: 15, description: isRtl.value ? 'فحص مخبري شامل لفيتامين د، ب12، ومخزون الحديد' : 'Comprehensive lab work including Vitamin D, B12, Iron' },
        { id: 'srv-3', name: isRtl.value ? 'جلسة علاج طبيعي وتأهيل' : 'Physiotherapy & Rehab', price: 180, duration: 45, description: isRtl.value ? 'تأهيل حركي وعلاج لآلام الظهر والمفاصل' : 'Motor rehabilitation and joint relief therapy' },
        { id: 'srv-4', name: isRtl.value ? 'أشعة سينية رقمية X-Ray' : 'Digital X-Ray Scan', price: 150, duration: 20, description: isRtl.value ? 'تصوير إشعاعي تشخيصي مع تقرير استشاري خلال ساعة' : 'Diagnostic scan with report within 1 hour' },
      ];
    }
  } catch (e) {
    // Keep fallback list
  } finally {
    globalStore.setLoading(['services', false]);
  }
};

const loadDoctors = async () => {
  try {
    globalStore.setLoading(['doctors', true]);
    const res = await api.getDoctors();
    if (res.status && Array.isArray(res.data) && res.data.length > 0) {
      doctors.value = res.data.map((d: any) => ({
        id: d.id,
        name: d.user?.name || d.name,
        specialty: d.clinic?.name || (isRtl.value ? 'استشاري متخصص' : 'Specialist Consultant'),
        clinic: d.clinic,
        rating: '4.9',
        avatar: d.user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        consultation_fee: d.consultation_fee || 250,
      }));
    } else {
      doctors.value = [
        {
          id: 'doc-1',
          name: isRtl.value ? 'د. خالد السبيعي' : 'Dr. Khaled Al-Subaie',
          specialty: isRtl.value ? 'استشاري أمراض القلب والقسطرة' : 'Cardiology Consultant',
          clinic: { name: isRtl.value ? 'مجمع الرياض الطبي الاستشاري' : 'Riyadh Medical Complex' },
          rating: '4.9',
          avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
          consultation_fee: 250,
        },
        {
          id: 'doc-2',
          name: isRtl.value ? 'د. سارة المنصور' : 'Dr. Sarah Al-Mansour',
          specialty: isRtl.value ? 'استشارية جراحة الفم وزراعة الأسنان' : 'Oral Surgery Consultant',
          clinic: { name: isRtl.value ? 'عيادات النخبة التخصصية - العليا' : 'Elite Specialized Clinics' },
          rating: '4.8',
          avatar: 'https://images.unsplash.com/photo-1594824813583-097262f01f1f?w=150&auto=format&fit=crop&q=80',
          consultation_fee: 200,
        },
      ];
    }
  } catch (e) {
    // Keep fallback list
  } finally {
    globalStore.setLoading(['doctors', false]);
  }
};

const filteredServices = computed(() => {
  if (!searchQuery.value) return services.value;
  const q = searchQuery.value.toLowerCase();
  return services.value.filter(s => 
    s.name.toLowerCase().includes(q) || 
    s.description?.toLowerCase().includes(q)
  );
});

const filteredDoctors = computed(() => {
  if (!searchQuery.value) return doctors.value;
  const q = searchQuery.value.toLowerCase();
  return doctors.value.filter(d => 
    d.name.toLowerCase().includes(q) || 
    d.specialty?.toLowerCase().includes(q)
  );
});

const bookService = (service: any) => {
  bookingModal.openBookingFlow({
    service,
    doctor: doctors.value[0],
  });
};

const bookDoctor = (doctor: any) => {
  bookingModal.openBookingFlow({ doctor });
};

watch(() => route.query.tab, (newTab) => {
  if (newTab === 'doctors' || newTab === 'services') {
    activeTab.value = newTab;
  }
}, { immediate: true });

onMounted(() => {
  loadServices();
  loadDoctors();
});
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
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s;

    &.active {
      background: var(--unity-primary-dark);
      color: #fff;
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);
    }
  }
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 16px;
  padding: 10px 14px;

  i {
    color: var(--unity-text-dim);
    font-size: 1rem;
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 0.85rem;
    color: var(--unity-text-main);
    font-family: inherit;
    font-weight: 400;

    &::placeholder {
      font-family: inherit;
      font-weight: 400;
      color: var(--unity-text-dim);
    }
  }
}

.tab-content-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.services-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.service-item-card {
  display: flex;
  gap: 14px;
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--unity-shadow-subtle);
  transition: all 0.2s;

  &:hover {
    border-color: var(--unity-primary);
  }

  .card-side-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: var(--unity-primary-light);
    color: var(--unity-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .card-details {
    flex: 1;

    .details-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;

      h5 {
        font-size: 0.98rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      .price-tag {
        font-size: 1rem;
        font-weight: 900;
        color: var(--unity-primary);

        small {
          font-size: 0.7rem;
        }
      }
    }

    p {
      font-size: 0.78rem;
      color: var(--unity-text-muted);
      line-height: 1.4;
      margin-bottom: 10px;
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 0.72rem;
      color: var(--unity-text-dim);
      margin-bottom: 12px;

      span {
        display: flex;
        align-items: center;
        gap: 4px;

        i {
          color: var(--unity-primary);
        }
      }
    }

    .book-service-btn {
      width: 100%;
      padding: 9px;
      border-radius: 12px;
      background: var(--unity-primary-dark);
      color: #fff;
      border: none;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;

      &:hover {
        background: #022c22;
      }
    }
  }
}

.doctors-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doctor-catalog-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--unity-shadow-subtle);

  .doc-main-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 14px;

    .doc-img-wrap {
      position: relative;
      width: 62px;
      height: 62px;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        border-radius: 18px;
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

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
  color: var(--unity-text-muted);
}
</style>

