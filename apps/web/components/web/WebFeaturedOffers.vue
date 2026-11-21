<template>
  <section class="web-offers-section">
    <div class="offers-container">
      <div class="section-header">
        <div class="section-title-wrap">
          <span class="section-tag">{{ t('Preventive Healthcare') }}</span>
          <h2 class="section-title">{{ t('Featured Medical Packages & Offers') }}</h2>
        </div>
        <NuxtLink to="/offers" class="view-all-link">
          <span>{{ t('View All Offers') }}</span>
          <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
        </NuxtLink>
      </div>

      <!-- Offers Grid -->
      <div class="offers-grid">
        <div 
          v-for="offer in displayOffers" 
          :key="offer.id" 
          class="offer-card"
        >
          <div class="offer-top-badge">
            <span class="discount-pill">
              <i class="pi pi-bolt"></i>
              <span>{{ t('Special Offer') }}</span>
            </span>
            <span v-if="offer.saving" class="saving-tag">{{ offer.saving }}</span>
          </div>

          <div class="offer-body">
            <h3 class="offer-title">{{ getLocalizedName(offer) }}</h3>
            <p class="offer-desc">{{ getLocalizedDesc(offer) }}</p>

            <ul class="offer-features-list">
              <li v-for="(feat, idx) in getFeatures(offer)" :key="idx">
                <i class="pi pi-check"></i>
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>

          <div class="offer-footer">
            <div class="price-wrap">
              <span v-if="offer.original_price" class="old-price">{{ offer.original_price }} {{ t('EGP') }}</span>
              <div class="current-price">
                <span class="num">{{ offer.price || 499 }}</span>
                <span class="curr">{{ t('EGP') }}</span>
              </div>
            </div>

            <button 
              type="button" 
              class="book-offer-btn" 
              @click="bookOffer(offer)"
            >
              <i class="pi pi-calendar-plus"></i>
              <span>{{ t('Book This Package') }}</span>
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
const offers = ref<any[]>([]);

// 3. Computed (computed properties)
const displayOffers = computed(() => {
  if (offers.value.length > 0) return offers.value.slice(0, 3);
  return [
    {
      id: 'off-1',
      name_ar: 'باقة الخدمات الطبية الشاملة',
      name_en: 'Comprehensive Health Checkup',
      desc_ar: 'خدمة سريرية متكاملة تشمل صورة دم كاملة، وظائف كبد وكلى، سكر، ودهون مع استشارة استشاري باطنة.',
      desc_en: 'Complete screening with full CBC, liver & kidney panels, and doctor consultation.',
      price: 550,
      original_price: 900,
      saving: 'وفر 350 ج.م',
      features: ['صورة دم كاملة CBC', 'تحليل وظائف كلى وكبد', 'رسم قلب واستشارة استشاري'],
    },
    {
      id: 'off-2',
      name_ar: 'باقة صحة الأسنان والابتسامة',
      name_en: 'Dental Hygiene & Smile Care',
      desc_ar: 'كشف أسنان شامل، إزالة الجير والتصبغات وتلميع الأسنان بأحدث أجهزة الموجات الصوتية.',
      desc_en: 'Full dental examination, ultrasonic scaling, and professional polishing.',
      price: 350,
      original_price: 600,
      saving: 'وفر 250 ج.م',
      features: ['كشف وأشعة رقمية متطورة', 'تنظيف جير بالموجات الصوتية', 'تلميع الأسنان وإزالة التصبغات'],
    },
    {
      id: 'off-3',
      name_ar: 'باقة صحة القلب والضغط',
      name_en: 'Cardiovascular Care Package',
      desc_ar: 'تقييم شامل لصحة القلب والشرايين، قياس الكوليسترول ورسم قلب متطور واستشارة استشاري قلب.',
      desc_en: 'Comprehensive cardiovascular assessment, lipid profile, and ECG analysis.',
      price: 650,
      original_price: 1100,
      saving: 'وفر 450 ج.م',
      features: ['رسم قلب إلكتروني ECG', 'تحليل الدهون الثلاثية والكوليسترول', 'كشف ومتابعة استشاري قلب'],
    },
  ];
});

const getLocalizedName = (offer: any) => {
  return resolveI18nText(offer) || offer.name_ar || offer.name || '';
};

const getLocalizedDesc = (offer: any) => {
  const desc = offer.description_ar || offer.desc_ar || offer.description || offer.desc_en || '';
  return typeof desc === 'object' ? resolveI18nText(desc) : desc;
};

const getFeatures = (offer: any) => {
  if (offer.features && Array.isArray(offer.features)) return offer.features;
  return [t('Official Medical Report'), t('Free follow-up within 14 days'), t('Instant Result Archive')];
};

// 4. Methods (functions, handlers)
const OFFERS = async () => {
  try {
    const res = await api.apiRequest({ service: 'OFFERS', filter: { limit: 6 } });
    if (res?.data) {
      offers.value = Array.isArray(res.data) ? res.data : (res.data.offers || []);
    }
  } catch (_) {}
};

const bookOffer = (offer: any) => {
  bookingModal.openBookingFlow({
    service: {
      ...offer,
      is_offer: true,
    },
    type: 'examination',
  });
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  OFFERS();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.web-offers-section {
  padding: 56px 20px;
  background: var(--unity-bg);
}

.offers-container {
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

.offers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.offer-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  position: relative;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--unity-primary);
    box-shadow: 0 12px 30px rgba(4, 120, 87, 0.08);
  }

  .offer-top-badge {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    .discount-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(4, 120, 87, 0.1);
      color: var(--unity-primary);
      font-size: 0.76rem;
      font-weight: 700;
    }

    .saving-tag {
      font-size: 0.74rem;
      font-weight: 700;
      color: #b45309;
      background: rgba(245, 158, 11, 0.12);
      padding: 3px 8px;
      border-radius: 6px;
    }
  }

  .offer-body {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .offer-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin: 0;
      line-height: 1.35;
    }

    .offer-desc {
      font-size: 0.82rem;
      color: var(--unity-text-muted);
      line-height: 1.55;
      margin: 0;
    }

    .offer-features-list {
      list-style: none;
      padding: 0;
      margin: 4px 0 0;
      display: flex;
      flex-direction: column;
      gap: 8px;

      li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.80rem;
        color: var(--unity-text-main);
        font-weight: 600;

        i {
          font-size: 0.75rem;
          color: var(--unity-primary);
        }
      }
    }
  }

  .offer-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--unity-border);
    padding-top: 16px;
    gap: 12px;

    .price-wrap {
      display: flex;
      flex-direction: column;

      .old-price {
        font-size: 0.75rem;
        color: var(--unity-text-dim);
        text-decoration: line-through;
      }

      .current-price {
        display: flex;
        align-items: baseline;
        gap: 4px;

        .num {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--unity-primary);
        }

        .curr {
          font-size: 0.80rem;
          font-weight: 700;
          color: var(--unity-text-muted);
        }
      }
    }

    .book-offer-btn {
      height: 42px;
      padding: 0 18px;
      border-radius: 12px;
      background: var(--unity-primary);
      color: #fff;
      font-size: 0.85rem;
      font-weight: 700;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.2);
      transition: all 0.2s ease;

      &:hover {
        background: var(--unity-primary-dark, #065f46);
        transform: translateY(-1px);
      }
    }
  }
}
</style>