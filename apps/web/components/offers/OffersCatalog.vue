<template>
  <div class="offers-catalog-container">
    <!-- 1. Search Bar -->
    <div class="offers-search-box">
      <i class="pi pi-search search-icon"></i>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('Search in offers...')"
        @input="onSearchInput"
      />
      <button v-if="searchQuery" type="button" class="clear-search-btn" @click="clearSearch">
        <i class="pi pi-times"></i>
      </button>
    </div>

    <!-- 2. Offers Virtual List (10 by 10 Standard) -->
    <AppVirtualList
      :items="offers"
      :has-more="hasMore"
      :loading="loading || globalStore.loading.includes('offers')"
      :page-size="10"
      @load-more="loadMoreOffers"
    >
      <template #item="{ item: offer }">
        <div class="offer-card" @click="bookOffer(offer)">
          <!-- Top Visual Media Box -->
          <div class="offer-image-box">
            <img 
              v-if="resolveImageUrl(offer.image) && !failedImages.has(offer.id)"
              :src="resolveImageUrl(offer.image)" 
              :alt="getOfferTitle(offer)" 
              class="offer-img" 
              loading="lazy" 
              @error="failedImages.add(offer.id)"
            />
            <div v-else class="offer-img-placeholder">
              <i class="pi pi-tag placeholder-icon"></i>
            </div>
            
            <div class="image-soft-veil"></div>

            <div v-if="getDiscountPercent(offer)" class="discount-tag">
              <i class="pi pi-bolt"></i>
              <span>-{{ getDiscountPercent(offer) }}%</span>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="offer-body">
            <div class="offer-info-top">
              <h4 class="offer-title">{{ getOfferTitle(offer) }}</h4>
              <p v-if="getOfferDesc(offer)" class="offer-desc">{{ getOfferDesc(offer) }}</p>
            </div>

            <div class="offer-footer-row">
              <div class="pricing-wrap">
                <div class="current-price-row">
                  <span class="price-val">{{ offer.price }}</span>
                  <span class="currency-val">{{ t('EGP') }}</span>
                </div>
                <span v-if="offer.original_price && Number(offer.original_price) > Number(offer.price)" class="original-price-val">
                  {{ offer.original_price }} {{ t('EGP') }}
                </span>
              </div>

              <button type="button" class="btn-book-action" @click.stop="bookOffer(offer)">
                <span>{{ t('Book Offer') }}</span>
                <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty State -->
      <template #empty>
        <div v-if="!loading" class="empty-offers-state">
          <div class="empty-icon-ring">
            <i class="pi pi-tag"></i>
          </div>
          <h4>{{ t('No offers registered yet') }}</h4>
          <p>{{ t('Check back soon for exclusive medical packages and discounts.') }}</p>
        </div>
      </template>
    </AppVirtualList>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useBookingModal } from '../../composables/useBookingModal';
import { useGlobalStore } from '../../stores/global';
import AppVirtualList from '../common/AppVirtualList.vue';

const { t, isRtl } = useI18n();
const api = useUnityApi();
const bookingModal = useBookingModal();
const globalStore = useGlobalStore();

// 2. Data (refs, reactive state)
const offers = ref<any[]>([]);
const page = ref(1);
const hasMore = ref(false);
const loading = ref(false);
const searchQuery = ref('');
const failedImages = ref(new Set<string | number>());
let debounceTimer: any = null;

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

const getOfferTitle = (o: any) => {
  if (isRtl.value) {
    return o.title_ar || o.title || o.title_en || '';
  }
  return o.title_en || o.title || o.title_ar || '';
};

const getOfferDesc = (o: any) => {
  if (isRtl.value) {
    return o.description_ar || o.description || o.description_en || '';
  }
  return o.description_en || o.description || o.description_ar || '';
};

const getDiscountPercent = (o: any) => {
  if (o.original_price && Number(o.original_price) > Number(o.price)) {
    return Math.round(((Number(o.original_price) - Number(o.price)) / Number(o.original_price)) * 100);
  }
  return null;
};

const OFFERS = async (targetPage = 1) => {
  try {
    loading.value = true;
    const res = await api.apiRequest({
      service: 'OFFERS',
      filter: {
        page: targetPage,
        limit: 10,
        search: searchQuery.value ? searchQuery.value.trim() : undefined,
      },
    });

    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    if (targetPage === 1) {
      offers.value = raw;
    } else {
      offers.value.push(...raw);
    }

    page.value = targetPage;
    hasMore.value = res?.pagination?.hasMore ?? (raw.length >= 10);
  } catch (err) {
    if (targetPage === 1) offers.value = [];
  } finally {
    loading.value = false;
  }
};

const loadMoreOffers = () => {
  if (hasMore.value && !loading.value) {
    OFFERS(page.value + 1);
  }
};

const onSearchInput = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    OFFERS(1);
  }, 350);
};

const clearSearch = () => {
  searchQuery.value = '';
  OFFERS(1);
};

const bookOffer = (offer: any) => {
  bookingModal.openBookingFlow({
    service: {
      id: offer.id,
      name: getOfferTitle(offer),
      price: offer.price,
      is_offer: true,
    },
  });
};

defineExpose({
  OFFERS,
});

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  OFFERS(1);
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.offers-catalog-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;

  .offers-search-box {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;

    .search-icon {
      position: absolute;
      right: 14px;
      color: var(--unity-text-dim);
      font-size: 0.92rem;
      pointer-events: none;

      :global([dir='ltr']) &,
      :global(html[dir='ltr']) & {
        right: auto;
        left: 14px;
      }
    }

    input {
      width: 100%;
      height: 46px;
      padding: 0 40px;
      background: var(--unity-surface);
      border: 1.5px solid var(--unity-border);
      border-radius: 14px;
      font-size: 0.88rem;
      color: var(--unity-text-main);
      outline: none;
      transition: all 0.2s ease;

      &::placeholder {
        color: var(--unity-text-dim);
        font-size: 0.84rem;
      }

      &:focus {
        border-color: var(--unity-primary);
        box-shadow: 0 0 0 3px rgba(var(--unity-primary-rgb), 0.12);
      }
    }

    .clear-search-btn {
      position: absolute;
      left: 12px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #f1f5f9;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;

      :global([data-theme='dark']) &,
      :global(html.dark) & {
        background: #1f2937;
        color: #9ca3af;
      }

      :global([dir='ltr']) &,
      :global(html[dir='ltr']) & {
        left: auto;
        right: 12px;
      }

      i {
        font-size: 0.7rem;
      }
    }
  }

  .offer-card {
    position: relative;
    background: var(--unity-surface);
    border: 1.5px solid var(--unity-border);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 14px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      border-color: #cbd5e1;
    }

    .offer-image-box {
      position: relative;
      width: 100%;
      height: 160px;
      overflow: hidden;
      background: #f8fafc;

      :global([data-theme='dark']) &,
      :global(html.dark) & {
        background: #090d16;
      }

      .offer-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .offer-img-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--unity-primary-light) 0%, #e0f2fe 100%);

        .placeholder-icon {
          font-size: 2.8rem;
          color: var(--unity-primary);
          opacity: 0.7;
        }

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          background: linear-gradient(135deg, rgba(var(--unity-accent-rgb), 0.12) 0%, rgba(2, 132, 199, 0.15) 100%);
          border-bottom: 1px solid #1f2937;

          .placeholder-icon {
            color: var(--unity-accent-light);
            opacity: 0.85;
          }
        }
      }

      .image-soft-veil {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.45) 100%);
        pointer-events: none;

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(9, 13, 22, 0.5) 100%);
        }
      }

      .discount-tag {
        position: absolute;
        top: 12px;
        right: 12px;
        background: #ef4444;
        color: #ffffff;
        font-size: 0.78rem;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 4px 10px rgba(239, 68, 68, 0.35);

        :global([dir='ltr']) &,
        :global(html[dir='ltr']) & {
          right: auto;
          left: 12px;
        }

        i {
          font-size: 0.72rem;
        }
      }
    }

    .offer-body {
      padding: 14px 16px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .offer-info-top {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .offer-title {
          font-size: 1.02rem;
          font-weight: 800;
          color: var(--unity-text-main);
          margin: 0;
          line-height: 1.35;
        }

        .offer-desc {
          font-size: 0.84rem;
          color: var(--unity-text-muted);
          margin: 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .offer-footer-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 10px;
        border-top: 1px dashed var(--unity-border);

        .pricing-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;

          .current-price-row {
            display: flex;
            align-items: baseline;
            gap: 4px;

            .price-val {
              font-size: 1.25rem;
              font-weight: 900;
              color: var(--unity-primary);
            }

            .currency-val {
              font-size: 0.75rem;
              font-weight: 700;
              color: var(--unity-text-muted);
            }
          }

          .original-price-val {
            font-size: 0.78rem;
            color: #94a3b8;
            text-decoration: line-through;
            font-weight: 600;
          }
        }

        .btn-book-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 16px;
          background: var(--unity-primary);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 3px 10px rgba(var(--unity-primary-rgb), 0.25);

          &:hover {
            background: var(--unity-primary-dark);
            transform: translateY(-1px);
          }

          &:active {
            transform: scale(0.97);
          }

          i {
            font-size: 0.76rem;
            transition: transform 0.2s ease;
          }
        }
      }
    }
  }

  .empty-offers-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 48px 20px;
    gap: 12px;

    .empty-icon-ring {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 1.8rem;

      :global([data-theme='dark']) &,
      :global(html.dark) & {
        background: #1f2937;
        color: #9ca3af;
      }
    }

    h4 {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin: 0;
    }

    p {
      font-size: 0.84rem;
      color: var(--unity-text-muted);
      margin: 0;
      max-width: 260px;
      line-height: 1.5;
    }
  }
}
</style>
