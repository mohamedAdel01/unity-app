<template>
  <div class="services-page">
    <!-- Top Header -->
    <div class="page-top-header">
      <button class="back-btn" @click="router.back()">
        <i class="pi pi-arrow-right"></i>
      </button>
      <h3 class="page-title">الخدمات الطبية والعيادات</h3>
      <div class="placeholder-icon">
        <i class="pi pi-search"></i>
      </div>
    </div>

    <!-- Switcher Tabs (خدمات وفحوصات / أطباء واستشاريين) -->
    <div class="view-tabs-switch">
      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'services' }"
        @click="switchTab('services')"
      >
        <i class="pi pi-heart-fill"></i>
        <span>الخدمات والفحوصات</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'doctors' }"
        @click="switchTab('doctors')"
      >
        <i class="pi pi-user-plus"></i>
        <span>نخبة الأطباء</span>
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="search-box">
      <i class="pi pi-search"></i>
      <input 
        v-model="searchQuery" 
        type="text" 
        :placeholder="activeTab === 'services' ? 'ابحث عن خدمة، تحليل، أو أشعة...' : 'ابحث باسم الطبيب أو التخصص...'" 
      />
    </div>

    <!-- Content: Services Tab -->
    <div v-if="activeTab === 'services'" class="tab-content-area">
      <div v-if="loadingServices" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <span>جاري تحميل قائمة الخدمات...</span>
      </div>

      <div v-else-if="filteredServices.length === 0" class="empty-state">
        <i class="pi pi-search"></i>
        <h4>لا توجد خدمات مطابقة لبحثك</h4>
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
              <span class="price-tag">{{ service.price }} <small>ر.س</small></span>
            </div>
            <p>{{ service.description || 'خدمة طبية ورعاية شاملة معتمدة من نخبة الكوادر الطبية' }}</p>
            <div class="card-meta">
              <span><i class="pi pi-clock"></i> {{ service.duration || 30 }} دقيقة</span>
              <span><i class="pi pi-check"></i> متوفر فوراً</span>
            </div>
            <button class="book-service-btn" @click="bookService(service)">
              <span>احجز هذه الخدمة</span>
              <i class="pi pi-arrow-left"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content: Doctors Tab -->
    <div v-else class="tab-content-area">
      <div v-if="loadingDoctors" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <span>جاري تحميل الأطباء...</span>
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
              <p class="specialty-title">{{ doc.specialty || doc.clinic?.name || 'استشاري متخصص' }}</p>
              <span class="clinic-location"><i class="pi pi-map-marker"></i> {{ doc.clinic?.name || 'مجمع الرياض الطبي' }}</span>
              <div class="fee-badge">
                كشفية: <strong>{{ doc.consultation_fee || 250 }} ر.س</strong>
              </div>
            </div>
          </div>
          <button class="doc-book-btn" @click="bookDoctor(doc)">
            حجز موعد كشف
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUnityApi } from '../composables/useUnityApi';
import { useBookingModal } from '../composables/useBookingModal';

const router = useRouter();
const route = useRoute();
const api = useUnityApi();
const bookingModal = useBookingModal();

const activeTab = ref<'services' | 'doctors'>('services');
const searchQuery = ref('');

const services = ref<any[]>([]);
const doctors = ref<any[]>([]);
const loadingServices = ref(false);
const loadingDoctors = ref(false);

const switchTab = (tab: 'services' | 'doctors') => {
  activeTab.value = tab;
  router.replace({ query: { tab } });
};

const loadServices = async () => {
  try {
    loadingServices.value = true;
    const res = await api.getServices();
    if (res.status && Array.isArray(res.data) && res.data.length > 0) {
      services.value = res.data;
    } else {
      services.value = [
        { id: 'srv-1', name: 'كشف استشاري عام', price: 250, duration: 30, description: 'كشفية شاملة وفحص سريري مع تقرير طبي متكامل' },
        { id: 'srv-2', name: 'باقة الفيتامينات الشاملة', price: 350, duration: 15, description: 'فحص مخبري شامل لفيتامين د، ب12، ومخزون الحديد مع سحب منزلي' },
        { id: 'srv-3', name: 'جلسة علاج طبيعي وتأهيل', price: 180, duration: 45, description: 'تأهيل حركي وعلاج لآلام الظهر والمفاصل' },
        { id: 'srv-4', name: 'أشعة سينية رقمية X-Ray', price: 150, duration: 20, description: 'تصوير إشعاعي تشخيصي مع تقرير استشاري خلال ساعة' },
        { id: 'srv-5', name: 'تنظيف وتلميع الأسنان', price: 200, duration: 40, description: 'إزالة الجير والتصبغات وفحص شامل لصحة اللثة والأسنان' },
      ];
    }
  } catch (e) {
    // Keep fallback list
  } finally {
    loadingServices.value = false;
  }
};

const loadDoctors = async () => {
  try {
    loadingDoctors.value = true;
    const res = await api.getDoctors();
    if (res.status && Array.isArray(res.data) && res.data.length > 0) {
      doctors.value = res.data.map((d: any) => ({
        id: d.id,
        name: d.user?.name || d.name,
        specialty: d.clinic?.name || 'استشاري متخصص',
        clinic: d.clinic,
        rating: '4.9',
        avatar: d.user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        consultation_fee: d.consultation_fee || 250,
      }));
    } else {
      doctors.value = [
        {
          id: 'doc-1',
          name: 'د. خالد السبيعي',
          specialty: 'استشاري أمراض القلب والقسطرة',
          clinic: { name: 'مجمع الرياض الطبي الاستشاري' },
          rating: '4.9',
          avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
          consultation_fee: 250,
        },
        {
          id: 'doc-2',
          name: 'د. سارة المنصور',
          specialty: 'استشارية جراحة الفم وزراعة الأسنان',
          clinic: { name: 'عيادات النخبة التخصصية - العليا' },
          rating: '4.8',
          avatar: 'https://images.unsplash.com/photo-1594824813583-097262f01f1f?w=150&auto=format&fit=crop&q=80',
          consultation_fee: 200,
        },
        {
          id: 'doc-3',
          name: 'د. ريان الشهري',
          specialty: 'استشاري طب الأسرة والمجتمع',
          clinic: { name: 'عيادة افتراضية معتمدة' },
          rating: '5.0',
          avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
          consultation_fee: 180,
        },
      ];
    }
  } catch (e) {
    // Keep fallback list
  } finally {
    loadingDoctors.value = false;
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
.services-page {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .back-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-main);
    cursor: pointer;
  }

  .page-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--unity-text-main);
  }

  .placeholder-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-dim);
  }
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
    font-size: 0.82rem;
    font-weight: 700;
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

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
  color: var(--unity-text-muted);

  i {
    font-size: 2rem;
  }
}
</style>

