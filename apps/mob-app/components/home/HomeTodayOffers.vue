<template>
  <section v-if="offers.length > 0 || loading" class="today-offers-section">
    <div class="section-header">
      <div class="header-texts">
        <h4>{{ t("Today's Special Offers") }}</h4>
        <p>{{ t('Limited Time Offers') }}</p>
      </div>
      <NuxtLink to="/offers" class="see-all-link">
        {{ t('View All') }}
        <i :class="isRtl ? 'pi pi-angle-left' : 'pi pi-angle-right'"></i>
      </NuxtLink>
    </div>

    <!-- Offers Horizontal Carousel -->
    <div class="offers-carousel">
      <div 
        v-for="offer in offers" 
        :key="offer.id" 
        class="offer-card"
        @click="bookOffer(offer)"
      >
        <!-- Card Image, Soft Veil & Discount Badge -->
        <div class="offer-image-box">
          <img 
            v-if="resolveImageUrl(offer.image) && !failedImages.has(offer.id)"
            :src="resolveImageUrl(offer.image)" 
            :alt="offer.title" 
            class="offer-img" 
            loading="lazy" 
            @error="failedImages.add(offer.id)"
          />
          <div v-else class="offer-img-placeholder">
            <i class="pi pi-gift placeholder-icon"></i>
          </div>
          <div class="image-soft-veil"></div>
          <div v-if="offer.discountPercent" class="discount-tag">
            <span>-{{ offer.discountPercent }}%</span>
          </div>
        </div>

        <!-- Card Content: Title, Description, Prices & Action -->
        <div class="offer-body">
          <div class="offer-info-top">
            <h5>{{ offer.title }}</h5>
            <p v-if="offer.description">{{ offer.description }}</p>
          </div>

          <div class="pricing-row">
            <span class="current-price">{{ offer.price }} {{ t('EGP') }}</span>
            <span v-if="offer.originalPrice" class="original-price">{{ offer.originalPrice }} {{ t('EGP') }}</span>
          </div>

          <button type="button" class="btn-book-offer" @click.stop="bookOffer(offer)">
            <span>{{ t('Book Offer') }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';
import { useUnityApi } from '../../composables/useUnityApi';

const { t, isRtl, resolveI18n } = useI18n();
const bookingModal = useBookingModal();
const api = useUnityApi();

// 2. Data (refs, reactive state)
const offers = ref<any[]>([]);
const loading = ref(false);
const failedImages = ref(new Set<string | number>());

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const resolveImageUrl = (url?: string) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image/')) return trimmed;
  const config = useRuntimeConfig();
  const baseUrl = (config.public?.apiUrl || 'http://localhost:4000').replace(/\/+$/, '');
  if (trimmed.includes('localhost:4000')) {
    const path = trimmed.split('localhost:4000')[1];
    return `${baseUrl}${path}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${baseUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

const OFFERS = async () => {
  try {
    loading.value = true;
    const res = await api.apiRequest({ service: 'OFFERS' });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    if (raw.length > 0) {
      offers.value = raw.map((o: any) => ({
        id: o.id,
        title: isRtl.value ? o.title_ar : o.title_en,
        description: isRtl.value ? o.description_ar : o.description_en,
        image: o.image,
        price: Number(o.price),
        originalPrice: o.original_price ? Number(o.original_price) : null,
        discountPercent: o.original_price && Number(o.original_price) > Number(o.price) ? Math.round(((Number(o.original_price) - Number(o.price)) / Number(o.original_price)) * 100) : null,
      }));
    } else {
      offers.value = [];
    }
  } catch (err) {
    offers.value = [];
  } finally {
    loading.value = false;
  }
};

const bookOffer = (offer: any) => {
  bookingModal.openBookingFlow({
    service: {
      id: offer.id,
      name: offer.title,
      price: offer.price,
      is_offer: true,
    },
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
.today-offers-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin: 6px 0 12px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-texts {
      h4 {
        margin: 0;
        font-size: 0.86rem;
        font-weight: 700;
        color: var(--unity-text-main, #334155);
        opacity: 0.9;
        line-height: 1.3;
      }

      p {
        margin: 1px 0 0;
        font-size: 0.67rem;
        color: var(--unity-text-muted);
      }
    }

    .see-all-link {
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--unity-primary);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      opacity: 0.88;
      padding: 2px 4px;
      border-radius: 6px;
      transition: all 0.2s;

      i {
        font-size: 0.58rem;
      }

      &:hover {
        opacity: 1;
        background: var(--unity-primary-light);
      }
    }
  }

  .offers-carousel {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    margin-inline: -20px;
    padding-inline: 20px;
    padding-block: 4px 10px;

    &::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: 640px) {
      margin-inline: 0;
      padding-inline: 0;
      gap: 16px;
    }

    .offer-card {
      width: 176px;
      flex-shrink: 0;
      scroll-snap-align: start;

      @media (min-width: 640px) {
        width: 220px;
      }
      background: var(--unity-surface);
      border: 1px solid var(--unity-border);
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 14px rgba(0, 0, 0, 0.05);
        border-color: var(--unity-primary-tint);

        .offer-img {
          transform: scale(1.03);
          filter: brightness(1) contrast(0.95) saturate(0.9);
        }
      }

      &:active {
        transform: scale(0.98);
      }

      .offer-image-box {
        position: relative;
        width: 100%;
        height: 76px;
        background: #f1f5f9;
        overflow: hidden;

        .offer-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          /* خفض حدة وتشبع الصورة لتبدو هادئة ومريحة بصرياً */
          filter: brightness(0.96) contrast(0.88) saturate(0.78);
          opacity: 0.92;
          transition: transform 0.35s ease, filter 0.35s ease;
        }

        .offer-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ecfdf5 0%, #e0f2fe 100%);

          .placeholder-icon {
            font-size: 1.8rem;
            color: var(--unity-primary, #047857);
            opacity: 0.75;
          }
        }

        /* طبقة تظليل ناعمة تمزج الصورة بأناقة */
        .image-soft-veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(15, 23, 42, 0.14) 100%);
          pointer-events: none;
        }

        .discount-tag {
          position: absolute;
          top: 6px;
          inset-inline-start: 6px;
          background: #ef4444;
          color: #ffffff;
          font-size: 0.60rem;
          font-weight: 800;
          padding: 1.5px 6px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.25);
          direction: ltr;
        }
      }

      .offer-body {
        padding: 10px;
        display: flex;
        flex-direction: column;
        flex: 1;
        justify-content: space-between;
        gap: 6px;

        .offer-info-top {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-height: 48px;

          h5 {
            margin: 0;
            font-size: 0.80rem;
            font-weight: 700;
            color: var(--unity-text-main, #334155);
            line-height: 1.28;
          }

          p {
            margin: 0;
            font-size: 0.65rem;
            color: var(--unity-text-muted);
            line-height: 1.32;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        .pricing-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-top: 2px;
          padding-top: 6px;
          border-top: 1px dashed var(--unity-border-subtle);

          .current-price {
            font-size: 0.82rem;
            font-weight: 800;
            color: var(--unity-primary);
          }

          .original-price {
            font-size: 0.64rem;
            color: var(--unity-text-dim);
            text-decoration: line-through;
            font-weight: 600;
          }
        }

        .btn-book-offer {
          width: 100%;
          background: var(--unity-primary);
          color: #ffffff;
          border: none;
          padding: 6px 10px;
          border-radius: 10px;
          font-size: 0.70rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(4, 120, 87, 0.16);
          transition: all 0.2s ease;
          margin-top: 2px;

          &:hover {
            background: var(--unity-primary-dark);
          }

          &:active {
            transform: scale(0.97);
          }
        }
      }
    }
  }
}
</style>
