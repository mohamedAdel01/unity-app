<template>
  <section class="web-clinics-section">
    <div class="clinics-container">
      <div class="section-header">
        <div class="section-title-wrap">
          <span class="section-tag">{{ t('Specialized Clinics') }}</span>
          <h2 class="section-title">{{ t('Comprehensive Medical Specialties') }}</h2>
        </div>
        <NuxtLink to="/services" class="view-all-link">
          <span>{{ t('View All Clinics & Services') }}</span>
          <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
        </NuxtLink>
      </div>

      <!-- Clinics Grid -->
      <div class="clinics-grid">
        <div 
          v-for="clinic in displayClinics" 
          :key="clinic.id" 
          class="clinic-card"
          @click="selectClinicForBooking(clinic)"
        >
          <div class="clinic-icon-badge">
            <i :class="getClinicIcon(clinic)"></i>
          </div>
          <div class="clinic-body">
            <h3 class="clinic-name">{{ getLocalizedName(clinic) }}</h3>
            <p class="clinic-desc">{{ getLocalizedDesc(clinic) }}</p>
          </div>
          <div class="clinic-footer">
            <span class="doctors-count">
              <i class="pi pi-users"></i>
              <span>{{ clinic.doctors_count || (clinic.doctors ? clinic.doctors.length : 0) }} {{ t('Doctors') }}</span>
            </span>
            <span class="book-pill">
              <span>{{ t('Book Now') }}</span>
              <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useI18n, resolveI18nText } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';
import { useUnityApi } from '../../composables/useUnityApi';

const { t, isRtl } = useI18n();
const bookingModal = useBookingModal();
const api = useUnityApi();

// 2. Data (refs, reactive state)
const clinics = ref<any[]>([]);

// 3. Computed (computed properties)
const displayClinics = computed(() => {
  if (clinics.value.length > 0) return clinics.value.slice(0, 8);
  // Elegant fallback list if API is fetching
  return [
    { id: 'c1', name_ar: 'عيادة الباطنة والجهاز الهضمي', name_en: 'Internal Medicine & Gastroenterology', desc_ar: 'تشخيص وعلاج أمراض الباطنة، السكري والكبد', desc_en: 'Diagnostic and treatment of internal diseases', icon: 'pi pi-heart' },
    { id: 'c2', name_ar: 'عيادة طب الأطفال', name_en: 'Pediatrics & Neonatology', desc_ar: 'متابعة نمو الطفل وتطعيماته والأمراض التنفسية', desc_en: 'Child healthcare and immunizations', icon: 'pi pi-face-smile' },
    { id: 'c3', name_ar: 'عيادة العظام والمفاصل', name_en: 'Orthopedics & Joint Surgery', desc_ar: 'علاج خشونة المفاصل والعمود الفقري والإصابات', desc_en: 'Bone, joint and spine specialized treatment', icon: 'pi pi-shield' },
    { id: 'c4', name_ar: 'عيادة القلب والأوعية الدموية', name_en: 'Cardiology', desc_ar: 'رسم القلب، متابعة الضغط وتصلب الشرايين', desc_en: 'Cardiac monitoring and hypertension care', icon: 'pi pi-heart-fill' },
    { id: 'c5', name_ar: 'عيادة الأسنان وجراحة الفم', name_en: 'Dental & Oral Surgery', desc_ar: 'تجميل، زراعة وعلاج جذور الأسنان بأحدث الأجهزة', desc_en: 'Cosmetic dentistry and root canal care', icon: 'pi pi-sparkles' },
    { id: 'c6', name_ar: 'عيادة الجلدية والليزر', name_en: 'Dermatology & Laser', desc_ar: 'علاج الأمراض الجلدية والعناية بالبشرة والليزر', desc_en: 'Advanced skincare and medical laser', icon: 'pi pi-sun' },
    { id: 'c7', name_ar: 'عيادة النساء والتوليد', name_en: 'Obstetrics & Gynecology', desc_ar: 'متابعة الحمل وموجات السونار والصحة الإنجابية', desc_en: 'Maternity and reproductive health', icon: 'pi pi-user' },
    { id: 'c8', name_ar: 'المختبر والتحاليل الطبية', name_en: 'Laboratory & Diagnostic Services', desc_ar: 'خدمات شاملة وتحاليل دم بأعلى درجات الدقة', desc_en: 'Comprehensive diagnostic blood testing', icon: 'pi pi-check' },
  ];
});

const getLocalizedName = (clinic: any) => {
  return resolveI18nText(clinic) || clinic.name_ar || clinic.name || '';
};

const getLocalizedDesc = (clinic: any) => {
  const desc = clinic.description_ar || clinic.desc_ar || clinic.description || clinic.desc_en || '';
  return typeof desc === 'object' ? resolveI18nText(desc) : desc;
};

const getClinicIcon = (clinic: any) => {
  if (clinic.icon) return clinic.icon;
  const name = (clinic.name_ar || clinic.name || '').toLowerCase();
  if (name.includes('قلب')) return 'pi pi-heart-fill';
  if (name.includes('طفل') || name.includes('أطفال')) return 'pi pi-face-smile';
  if (name.includes('عظام')) return 'pi pi-shield';
  if (name.includes('أسنان')) return 'pi pi-sparkles';
  if (name.includes('جلد')) return 'pi pi-sun';
  if (name.includes('مختبر') || name.includes('تحاليل')) return 'pi pi-check';
  return 'pi pi-building';
};

// 4. Methods (functions, handlers)
const CLINICS = async () => {
  try {
    const res = await api.apiRequest({ service: 'CLINICS' });
    if (res?.data) {
      clinics.value = Array.isArray(res.data) ? res.data : (res.data.clinics || []);
    }
  } catch (_) {}
};

const selectClinicForBooking = (clinic: any) => {
  bookingModal.openBookingFlow({
    service: clinic,
  });
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  CLINICS();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.web-clinics-section {
  padding: 56px 20px;
  background: var(--unity-bg);
}

.clinics-container {
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  .section-title-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .section-tag {
      font-size: 0.80rem;
      font-weight: 700;
      color: var(--unity-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-title {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin: 0;

      @media (max-width: 640px) {
        font-size: 1.45rem;
      }
    }
  }

  .view-all-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--unity-primary);
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      text-decoration: underline;
    }
  }
}

.clinics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.clinic-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--unity-primary);
    box-shadow: 0 12px 28px rgba(65, 91, 46, 0.08);

    .clinic-icon-badge {
      background: var(--unity-primary);
      color: #fff;
    }

    .book-pill {
      color: var(--unity-primary);
    }
  }

  .clinic-icon-badge {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(65, 91, 46, 0.08);
    color: var(--unity-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    transition: all 0.2s ease;
  }

  .clinic-body {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .clinic-name {
      font-size: 1rem;
      font-weight: 700;
      color: var(--unity-text-main);
      margin: 0;
      line-height: 1.35;
    }

    .clinic-desc {
      font-size: 0.80rem;
      color: var(--unity-text-muted);
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .clinic-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--unity-border);
    padding-top: 12px;
    font-size: 0.78rem;

    .doctors-count {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--unity-text-dim);
      font-weight: 600;

      i {
        font-size: 0.82rem;
      }
    }

    .book-pill {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--unity-text-muted);
      font-weight: 700;
      transition: color 0.2s;
    }
  }
}
</style>