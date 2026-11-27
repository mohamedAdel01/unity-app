<template>
  <section class="web-doctors-section">
    <div class="doctors-container">
      <div class="section-header">
        <div class="section-title-wrap">
          <span class="section-tag">{{ t('Medical Elite') }}</span>
          <h2 class="section-title">{{ t('Senior Consultants & Specialists') }}</h2>
        </div>
        <NuxtLink to="/services" class="view-all-link">
          <span>{{ t('Browse All Doctors') }}</span>
          <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
        </NuxtLink>
      </div>

      <!-- Doctors Grid -->
      <div class="doctors-grid">
        <div 
          v-for="doc in displayDoctors" 
          :key="doc.id" 
          class="doctor-card"
        >
          <div class="doctor-top-row">
            <div class="doctor-avatar-wrap">
              <img 
                v-if="doc.avatar && !avatarErrors.has(doc.id)" 
                :src="resolveAvatar(doc.avatar)" 
                :alt="doc.name" 
                class="doctor-avatar"
                @error="avatarErrors.add(doc.id)"
              />
              <div v-else class="doctor-avatar-fallback">
                <span>{{ (doc.name || 'D').charAt(0).toUpperCase() }}</span>
              </div>
              <span class="rating-badge">⭐ 4.9</span>
            </div>

            <div class="doctor-details">
              <h3 class="doctor-name">{{ doc.name }}</h3>
              <span v-if="doc.clinic" class="clinic-badge">
                <i class="pi pi-building"></i>
                <span>{{ getLocalizedName(doc.clinic) }}</span>
              </span>
              <p class="doctor-bio">{{ doc.description || doc.description_ar || t('Consultant and specialist with extensive clinical experience in patient care.') }}</p>
            </div>
          </div>

          <div class="doctor-card-footer">
            <div class="fee-info">
              <small>{{ t('Examination Fee') }}</small>
              <strong>{{ doc.consultation_fee || 350 }} {{ t('EGP') }}</strong>
            </div>

            <button 
              type="button" 
              class="book-doctor-btn" 
              @click="bookDoctor(doc)"
            >
              <i class="pi pi-calendar-plus"></i>
              <span>{{ t('Book Appointment') }}</span>
            </button>
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
const doctors = ref<any[]>([]);
const avatarErrors = ref(new Set<string | number>());

// 3. Computed (computed properties)
const displayDoctors = computed(() => {
  if (doctors.value.length > 0) return doctors.value.slice(0, 4);
  return [
    { id: 'd1', name: 'د. أحمد محمود الشريف', clinic: { name_ar: 'الباطنة العامة والجهاز الهضمي', name_en: 'Internal Medicine' }, consultation_fee: 400, description: 'استشاري أمراض الجهاز الهضمي والمناظير - زميل الكلية الملكية للأطباء.' },
    { id: 'd2', name: 'د. سارة عادل عبد المنعم', clinic: { name_ar: 'طب الأطفال وحديثي الولادة', name_en: 'Pediatrics' }, consultation_fee: 350, description: 'أخصائية طب الأطفال ومتابعة حديثي الولادة والمبتسرين والتغذية العلاجية.' },
    { id: 'd3', name: 'د. كريم مصطفى النجار', clinic: { name_ar: 'جراحة العظام والمفاصل', name_en: 'Orthopedics' }, consultation_fee: 450, description: 'استشاري جراحة العظام وعلاج خشونة المفاصل والطب الرياضي.' },
    { id: 'd4', name: 'د. رانيا نبيل سليمان', clinic: { name_ar: 'الجلدية والليزر والتجميل', name_en: 'Dermatology' }, consultation_fee: 380, description: 'أخصائية الأمراض الجلدية والعلاج بالليزر وحقن البلازما والميزوثيرابي.' },
  ];
});

const getLocalizedName = (clinic: any) => {
  return resolveI18nText(clinic) || clinic.name_ar || clinic.name || '';
};

const resolveAvatar = (url?: string) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const config = useRuntimeConfig();
  const baseUrl = (config.public?.apiUrl || 'https://api.unity-clinics.cyou').replace(/\/+$/, '');
  return `${baseUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

// 4. Methods (functions, handlers)
const DOCTORS = async () => {
  try {
    const res = await api.apiRequest({ service: 'DOCTORS', filter: { limit: 8 } });
    if (res?.data) {
      doctors.value = Array.isArray(res.data) ? res.data : (res.data.doctors || []);
    }
  } catch (_) {}
};

const bookDoctor = (doctor: any) => {
  bookingModal.openBookingFlow({
    doctor,
  });
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  DOCTORS();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.web-doctors-section {
  padding: 56px 20px;
  background: var(--unity-surface);
  border-top: 1px solid var(--unity-border);
  border-bottom: 1px solid var(--unity-border);
}

.doctors-container {
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

.doctors-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.doctor-card {
  background: var(--unity-bg);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  transition: all 0.25s ease;

  &:hover {
    border-color: var(--unity-primary);
    box-shadow: 0 10px 24px rgba(65, 91, 46, 0.08);
  }

  .doctor-top-row {
    display: flex;
    gap: 16px;
    align-items: flex-start;

    @media (max-width: 500px) {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }

  .doctor-avatar-wrap {
    position: relative;
    width: 72px;
    height: 72px;
    flex-shrink: 0;

    .doctor-avatar {
      width: 100%;
      height: 100%;
      border-radius: 18px;
      object-fit: cover;
      border: 2px solid var(--unity-surface);
    }

    .doctor-avatar-fallback {
      width: 100%;
      height: 100%;
      border-radius: 18px;
      background: rgba(65, 91, 46, 0.12);
      color: var(--unity-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      font-weight: 800;
    }

    .rating-badge {
      position: absolute;
      bottom: -6px;
      inset-inline-end: -6px;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      padding: 1px 6px;
      border-radius: 9999px;
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--unity-text-main);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }
  }

  .doctor-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;

    .doctor-name {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin: 0;
      line-height: 1.3;
    }

    .clinic-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--unity-primary);
    }

    .doctor-bio,
    .doctor-description {
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

  .doctor-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--unity-border);
    padding-top: 14px;
    gap: 12px;

    .fee-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      small {
        font-size: 0.70rem;
        color: var(--unity-text-dim);
      }

      strong {
        font-size: 1rem;
        color: var(--unity-primary);
        font-weight: 800;
      }
    }

    .book-doctor-btn {
      height: 42px;
      padding: 0 20px;
      border-radius: 12px;
      background: var(--unity-primary);
      color: #fff;
      font-size: 0.86rem;
      font-weight: 700;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(65, 91, 46, 0.2);
      transition: all 0.2s ease;

      &:hover {
        background: var(--unity-primary-dark, #364c26);
        transform: translateY(-1px);
      }
    }
  }
}
</style>