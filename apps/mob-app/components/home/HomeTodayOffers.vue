<template>
  <section v-if="offers.length > 0 || loading" class="today-offers-section">
    <div class="section-header">
      <div class="header-texts">
        <h4>{{ t("Today's Special Offers") }}</h4>
        <p>{{ t('Limited Time Offers') }}</p>
      </div>
      <NuxtLink to="/services?tab=services" class="see-all-link">
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
          <img :src="offer.image" :alt="offer.title" class="offer-img" loading="lazy" />
          <div class="image-soft-veil"></div>
          <div class="discount-tag">
            <span>-{{ offer.discountPercent }}%</span>
          </div>
        </div>

        <!-- Card Content: Title, Description, Prices & Action -->
        <div class="offer-body">
          <h5>{{ offer.title }}</h5>
          <p>{{ offer.description }}</p>

          <div class="pricing-row">
            <div class="prices">
              <span class="current-price">{{ offer.price }} {{ t('EGP') }}</span>
              <span class="original-price">{{ offer.originalPrice }} {{ t('EGP') }}</span>
            </div>

            <button type="button" class="btn-book-offer" @click.stop="bookOffer(offer)">
              <span>{{ t('Book Offer') }}</span>
            </button>
          </div>
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

const { t, isRtl } = useI18n();
const bookingModal = useBookingModal();
const api = useUnityApi();

// 2. Data (refs, reactive state)
const offers = ref<any[]>([]);
const loading = ref(false);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const OFFERS = async () => {
  try {
    loading.value = true;
    const res = await api.apiRequest({ service: 'OFFERS' });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    if (raw.length > 0) {
      offers.value = raw.map((o: any) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        image: o.image,
        price: Number(o.price),
        originalPrice: o.original_price ? Number(o.original_price) : null,
        discountPercent: o.discount_percentage || (o.original_price ? Math.round(((Number(o.original_price) - Number(o.price)) / Number(o.original_price)) * 100) : null),
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
        font-size: 1rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      p {
        margin: 2px 0 0;
        font-size: 0.72rem;
        color: var(--unity-text-muted);
      }
    }

    .see-all-link {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--unity-primary);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      transition: gap 0.2s;

      &:hover {
        gap: 6px;
      }
    }
  }

  .offers-carousel {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scrollbar-width: none;
    padding: 2px 2px 8px;

    &::-webkit-scrollbar {
      display: none;
    }

    .offer-card {
      width: 172px;
      flex-shrink: 0;
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
        padding: 8px 10px 10px;
        display: flex;
        flex-direction: column;
        flex: 1;

        h5 {
          margin: 0;
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--unity-text-main);
          line-height: 1.28;
        }

        p {
          margin: 2px 0 6px;
          font-size: 0.64rem;
          color: var(--unity-text-muted);
          line-height: 1.32;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .pricing-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 5px;
          border-top: 1px dashed var(--unity-border-subtle);

          .prices {
            display: flex;
            flex-direction: column;

            .current-price {
              font-size: 0.80rem;
              font-weight: 800;
              color: var(--unity-primary);
            }

            .original-price {
              font-size: 0.62rem;
              color: var(--unity-text-dim);
              text-decoration: line-through;
              font-weight: 600;
            }
          }

          .btn-book-offer {
            background: var(--unity-primary);
            color: #ffffff;
            border: none;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 0.66rem;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(4, 120, 87, 0.16);
            transition: all 0.2s ease;

            &:hover {
              background: var(--unity-primary-dark);
            }

            &:active {
              transform: scale(0.95);
            }
          }
        }
      }
    }
  }
}
</style>
