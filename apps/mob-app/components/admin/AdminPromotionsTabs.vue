<template>
  <div class="admin-promotions-tabs">
    <!-- ============================================== -->
    <!-- 1. OFFERS TAB                                  -->
    <!-- ============================================== -->
    <div v-if="activeTab === 'offers'" class="offers-panel">
      <AppVirtualList
        :items="offers"
        :has-more="offersHasMore"
        :loading="offersLoading"
        :page-size="10"
        @load-more="emit('load-more-offers')"
      >
        <template #item="{ item: offer }">
          <div class="promotion-item-card offer-card" :class="{ 'is-inactive': !offer.is_active }">
            <div class="card-main">
              <!-- Offer Media / Icon -->
              <div class="media-thumb">
                <img 
                  v-if="offer.image && !failedImages.has(offer.id)" 
                  :src="resolveImageUrl(offer.image)" 
                  :alt="offer.title" 
                  class="thumb-img" 
                  @error="failedImages.add(offer.id)"
                />
                <div v-else class="thumb-placeholder">
                  <i class="pi pi-gift"></i>
                </div>
                <span v-if="getDiscountPercentage(offer)" class="discount-badge">
                  -{{ getDiscountPercentage(offer) }}%
                </span>
              </div>

              <!-- Offer Info -->
              <div class="info-cell">
                <div class="title-row">
                  <h4 class="title-ar">{{ offer.title_ar || offer.title }}</h4>
                  <button 
                    type="button"
                    class="unity-switch-toggle" 
                    :class="{ 'active': offer.is_active }"
                    :aria-checked="offer.is_active"
                    role="switch"
                    :title="offer.is_active ? t('Active') : t('Inactive')"
                    @click.stop="emit('toggle-offer', offer)"
                  >
                    <span class="switch-slider"></span>
                  </button>
                </div>

                <div v-if="offer.title_en && offer.title_en !== offer.title_ar" class="title-en-tag" dir="ltr">
                  <small>EN:</small> <span>{{ offer.title_en }}</span>
                </div>

                <p v-if="offer.description_ar || offer.description" class="desc-line">
                  {{ offer.description_ar || offer.description }}
                </p>

                <div class="meta-tags-row">
                  <div class="price-pill">
                    <strong class="current-price">{{ offer.price }} {{ t('EGP') }}</strong>
                    <span v-if="offer.original_price" class="old-price">{{ offer.original_price }} {{ t('EGP') }}</span>
                  </div>
                  <span v-if="offer.duration" class="duration-simple">
                    <span class="dot-sep">•</span>
                    <i class="pi pi-clock"></i>
                    <span>{{ offer.duration }} {{ t('mins') }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Actions Bar -->
            <div class="card-actions-bar">
              <button 
                type="button" 
                class="action-pill edit-btn" 
                :title="t('Edit')"
                :aria-label="t('Edit')"
                @click="emit('edit-offer', offer)"
              >
                <i class="pi pi-pencil"></i>
              </button>

              <button 
                type="button" 
                class="action-pill delete-btn" 
                :title="t('Delete')"
                :aria-label="t('Delete')"
                @click="emit('delete-offer', offer)"
              >
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>
        </template>

        <template #empty>
          <div class="empty-state-box">
            <i class="pi pi-gift"></i>
            <h5>{{ t('No offers registered yet') }}</h5>
            <p>{{ t('Create promotional offers to attract patients') }}</p>
          </div>
        </template>
      </AppVirtualList>
    </div>

    <!-- ============================================== -->
    <!-- 2. PROMOCODES TAB                              -->
    <!-- ============================================== -->
    <div v-else class="promocodes-panel">
      <AppVirtualList
        :items="promocodes"
        :has-more="promosHasMore"
        :loading="promosLoading"
        :page-size="10"
        @load-more="emit('load-more-promos')"
      >
        <template #item="{ item: promo }">
          <div class="promotion-item-card promo-card" :class="{ 'is-inactive': !promo.is_active }">
            <div class="card-main">
              <!-- Code Icon Bubble -->
              <div class="promo-code-bubble">
                <i class="pi pi-ticket"></i>
              </div>

              <!-- Promo Details -->
              <div class="info-cell">
                <div class="title-row">
                  <strong class="code-title" dir="ltr">{{ promo.code }}</strong>
                  <button 
                    type="button"
                    class="unity-switch-toggle" 
                    :class="{ 'active': promo.is_active }"
                    :aria-checked="promo.is_active"
                    role="switch"
                    :title="promo.is_active ? t('Active') : t('Inactive')"
                    @click.stop="emit('toggle-promocode', promo)"
                  >
                    <span class="switch-slider"></span>
                  </button>
                </div>

                <div class="discount-display">
                  <span class="value-highlight">
                    {{ promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `${promo.discount_value} ${t('EGP')}` }}
                  </span>
                  <span class="discount-kind-text">
                    {{ promo.discount_type === 'percentage' ? t('Percentage Discount') : t('Fixed Discount') }}
                  </span>
                </div>

                <div class="meta-tags-row">
                  <span class="tag-pill">
                    <i class="pi pi-user"></i>
                    <span>{{ promo.usage_limit ? `${promo.usage_limit} ${t('Per User')}` : t('Unlimited usage') }}</span>
                  </span>
                  <span v-if="promo.used_count" class="tag-pill">
                    <i class="pi pi-check-circle"></i>
                    <span>{{ t('Total Uses') }}: {{ promo.used_count }}</span>
                  </span>
                  <span v-if="promo.min_spend" class="tag-pill">
                    <span>{{ t('Min Spend') }}: {{ promo.min_spend }} {{ t('EGP') }}</span>
                  </span>
                  <span v-if="promo.max_discount && promo.discount_type === 'percentage'" class="tag-pill">
                    <span>{{ t('Max') }}: {{ promo.max_discount }} {{ t('EGP') }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Actions Bar -->
            <div class="card-actions-bar">
              <button 
                type="button" 
                class="action-pill edit-btn" 
                :title="t('Edit')"
                :aria-label="t('Edit')"
                @click="emit('edit-promocode', promo)"
              >
                <i class="pi pi-pencil"></i>
              </button>

              <button 
                type="button" 
                class="action-pill delete-btn" 
                :title="t('Delete')"
                :aria-label="t('Delete')"
                @click="emit('delete-promocode', promo)"
              >
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>
        </template>

        <template #empty>
          <div class="empty-state-box">
            <i class="pi pi-percentage"></i>
            <h5>{{ t('No promocodes created yet') }}</h5>
            <p>{{ t('Add discount coupons to offer discounts on appointments') }}</p>
          </div>
        </template>
      </AppVirtualList>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';
import AppVirtualList from '../common/AppVirtualList.vue';

defineProps<{
  activeTab: 'offers' | 'promocodes';
  offers: any[];
  promocodes: any[];
  offersLoading: boolean;
  promosLoading: boolean;
  offersHasMore: boolean;
  promosHasMore: boolean;
}>();

const emit = defineEmits<{
  (e: 'load-more-offers'): void;
  (e: 'load-more-promos'): void;
  (e: 'edit-offer', offer: any): void;
  (e: 'toggle-offer', offer: any): void;
  (e: 'delete-offer', offer: any): void;
  (e: 'edit-promocode', promo: any): void;
  (e: 'toggle-promocode', promo: any): void;
  (e: 'delete-promocode', promo: any): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)
const failedImages = ref(new Set<string | number>());

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const getDiscountPercentage = (offer: any) => {
  if (offer.original_price && Number(offer.original_price) > Number(offer.price)) {
    return Math.round(((Number(offer.original_price) - Number(offer.price)) / Number(offer.original_price)) * 100);
  }
  return null;
};

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

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-promotions-tabs {
  display: flex;
  flex-direction: column;
  width: 100%;

  .promotion-item-card {
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    border-radius: 18px;
    padding: 14px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

    &.is-inactive {
      opacity: 0.72;
      background: var(--unity-surface);
      border-color: var(--unity-border);

      &:hover {
        transform: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      }
    }

    .card-main {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      .media-thumb {
        position: relative;
        width: 64px;
        height: 64px;
        border-radius: 14px;
        overflow: hidden;
        background: #f0fdf4;
        border: 1px solid #dcfce7;
        flex-shrink: 0;

        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumb-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--unity-primary);
          font-size: 1.5rem;
        }

        .discount-badge {
          position: absolute;
          bottom: 2px;
          inset-inline-start: 2px;
          background: #ef4444;
          color: #fff;
          font-size: 0.62rem;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 6px;
        }
      }

      .promo-code-bubble {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: #ecfdf5;
        border: 1.5px dashed #059669;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        i {
          font-size: 1.25rem;
          color: #059669;
        }
      }

      .info-cell {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;

          .code-title {
            font-size: 1rem;
            font-weight: 800;
            color: var(--unity-text-main);
            letter-spacing: 0.5px;
          }

          .title-ar {
            margin: 0;
            font-size: 0.95rem;
            font-weight: 800;
            color: var(--unity-text-main);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .unity-switch-toggle {
            position: relative;
            width: 44px;
            height: 24px;
            border-radius: 9999px;
            background: var(--unity-border, #cbd5e1);
            border: none;
            padding: 2px;
            cursor: pointer;
            outline: none;
            display: inline-flex;
            align-items: center;
            transition: background-color 0.25s ease;
            flex-shrink: 0;
            direction: ltr;

            .switch-slider {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #ffffff;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
              transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
              display: block;
            }

            &.active {
              background: var(--unity-primary, #047857);

              .switch-slider {
                transform: translateX(20px);
              }
            }

            &:active .switch-slider {
              width: 22px;
            }
          }
        }

        .discount-display {
          display: flex;
          align-items: baseline;
          gap: 6px;

          .value-highlight {
            font-size: 0.98rem;
            font-weight: 800;
            color: var(--unity-primary);
          }

          .discount-kind-text {
            font-size: 0.74rem;
            font-weight: 600;
            color: var(--unity-text-muted);
          }
        }

        .title-en-tag {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;

          small {
            color: #94a3b8;
            font-weight: 800;
          }
        }

        .desc-line {
          margin: 0;
          font-size: 0.76rem;
          color: var(--unity-text-muted);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .meta-tags-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;

          .price-pill {
            display: inline-flex;
            align-items: baseline;
            gap: 6px;

            .current-price {
              font-size: 0.95rem;
              font-weight: 800;
              color: var(--unity-primary);
            }

            .old-price {
              font-size: 0.72rem;
              color: #94a3b8;
              text-decoration: line-through;
            }
          }

          .duration-simple {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 0.76rem;
            color: var(--unity-text-muted, #64748b);
            font-weight: 600;

            .dot-sep {
              color: var(--unity-border, #cbd5e1);
              margin-inline-end: 2px;
            }

            i {
              font-size: 0.72rem;
              color: var(--unity-text-dim, #94a3b8);
            }
          }

          .tag-pill {
            font-size: 0.7rem;
            font-weight: 600;
            color: #475569;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 2px 7px;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            gap: 4px;

            i {
              font-size: 0.68rem;
              color: #64748b;
            }
          }
        }
      }
    }

    .card-actions-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 10px;
      border-top: 1px dashed var(--unity-border);

      .action-pill {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 0;

        i {
          font-size: 1.15rem;
        }

        &.edit-btn {
          background: #ecfdf5;
          color: #047857;
          border: 1.5px solid #a7f3d0;

          &:hover {
            background: #d1fae5;
            border-color: #6ee7b7;
            color: #065f46;
            transform: translateY(-1px);
          }
        }

        &.delete-btn {
          background: #fef2f2;
          color: #ef4444;
          border: 1.5px solid #fee2e2;

          &:hover:not(:disabled) {
            background: #fee2e2;
            border-color: #fca5a5;
            transform: translateY(-1px);
          }

          &:disabled,
          &.is-disabled {
            opacity: 0.45;
            cursor: not-allowed;
            pointer-events: none;
            background: var(--unity-surface-muted, #f1f5f9);
            color: var(--unity-text-dim, #94a3b8);
            border-color: var(--unity-border, #e2e8f0);
          }
        }

        &:active {
          transform: scale(0.96);
        }
      }
    }
  }

  .empty-state-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    text-align: center;
    color: var(--unity-text-muted);

    i {
      font-size: 2.2rem;
      color: var(--unity-border);
      margin-bottom: 12px;
    }

    h5 {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    p {
      margin: 6px 0 0;
      font-size: 0.8rem;
    }
  }
}
</style>

