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
                <img v-if="offer.image" :src="resolveImageUrl(offer.image)" :alt="offer.title" class="thumb-img" />
                <div v-else class="thumb-placeholder">
                  <i class="pi pi-gift"></i>
                </div>
                <span v-if="offer.discount_percentage" class="discount-badge">
                  -{{ offer.discount_percentage }}%
                </span>
              </div>

              <!-- Offer Info -->
              <div class="info-cell">
                <div class="title-row">
                  <h4 class="title-ar">{{ offer.title_ar || offer.title }}</h4>
                  <span class="status-indicator" :class="offer.is_active ? 'active' : 'inactive'">
                    {{ offer.is_active ? t('Active') : t('Inactive') }}
                  </span>
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
                  <span v-if="offer.duration" class="tag-pill">
                    <i class="pi pi-clock"></i> {{ offer.duration }} {{ t('mins') }}
                  </span>
                  <span class="tag-pill bookings-count">
                    <i class="pi pi-calendar"></i> {{ offer.bookings_count || 0 }} {{ t('Bookings') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Actions Bar -->
            <div class="card-actions-bar">
              <button 
                type="button" 
                class="action-pill toggle-btn"
                :class="offer.is_active ? 'btn-deactivate' : 'btn-activate'"
                @click="emit('toggle-offer', offer)"
              >
                <i :class="offer.is_active ? 'pi pi-ban' : 'pi pi-check'"></i>
                <span>{{ offer.is_active ? t('Deactivate') : t('Activate') }}</span>
              </button>

              <button 
                type="button" 
                class="action-pill edit-btn" 
                @click="emit('edit-offer', offer)"
              >
                <i class="pi pi-pencil"></i>
                <span>{{ t('Edit') }}</span>
              </button>

              <button 
                type="button" 
                class="action-pill delete-btn" 
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
              <!-- Code Monospace Banner -->
              <div class="promo-code-bubble">
                <i class="pi pi-ticket"></i>
                <strong class="code-text" dir="ltr">{{ promo.code }}</strong>
              </div>

              <!-- Promo Details -->
              <div class="info-cell">
                <div class="title-row">
                  <div class="discount-display">
                    <span class="value-highlight">
                      {{ promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `${promo.discount_value} ${t('EGP')}` }}
                    </span>
                    <span class="discount-kind-text">
                      {{ promo.discount_type === 'percentage' ? t('Percentage Discount') : t('Fixed Discount') }}
                    </span>
                  </div>
                  <span class="status-indicator" :class="promo.is_active ? 'active' : 'inactive'">
                    {{ promo.is_active ? t('Active') : t('Inactive') }}
                  </span>
                </div>

                <div class="meta-tags-row">
                  <span class="tag-pill">
                    <i class="pi pi-users"></i> {{ t('Used') }}: {{ promo.used_count || 0 }}{{ promo.usage_limit ? ` / ${promo.usage_limit}` : '' }}
                  </span>
                  <span v-if="promo.min_spend" class="tag-pill">
                    {{ t('Min Spend') }}: {{ promo.min_spend }} {{ t('EGP') }}
                  </span>
                  <span v-if="promo.max_discount && promo.discount_type === 'percentage'" class="tag-pill">
                    {{ t('Max') }}: {{ promo.max_discount }} {{ t('EGP') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Actions Bar -->
            <div class="card-actions-bar">
              <button 
                type="button" 
                class="action-pill toggle-btn"
                :class="promo.is_active ? 'btn-deactivate' : 'btn-activate'"
                @click="emit('toggle-promocode', promo)"
              >
                <i :class="promo.is_active ? 'pi pi-ban' : 'pi pi-check'"></i>
                <span>{{ promo.is_active ? t('Deactivate') : t('Activate') }}</span>
              </button>

              <button 
                type="button" 
                class="action-pill edit-btn" 
                @click="emit('edit-promocode', promo)"
              >
                <i class="pi pi-pencil"></i>
                <span>{{ t('Edit') }}</span>
              </button>

              <button 
                type="button" 
                class="action-pill delete-btn" 
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

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const resolveImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
    return url;
  }
  const config = useRuntimeConfig();
  const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
  return `${baseUrl}${url}`;
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
      opacity: 0.65;
      background: var(--unity-bg);
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
        width: 72px;
        height: 64px;
        border-radius: 14px;
        background: #ecfdf5;
        border: 1.5px dashed #059669;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        flex-shrink: 0;

        i {
          font-size: 0.95rem;
          color: #059669;
        }

        .code-text {
          font-size: 0.76rem;
          font-weight: 800;
          color: #065f46;
          letter-spacing: 0.5px;
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

          .title-ar {
            margin: 0;
            font-size: 0.95rem;
            font-weight: 800;
            color: var(--unity-text-main);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .discount-display {
            display: flex;
            align-items: baseline;
            gap: 6px;

            .value-highlight {
              font-size: 1.05rem;
              font-weight: 800;
              color: var(--unity-primary);
            }

            .discount-kind-text {
              font-size: 0.72rem;
              font-weight: 600;
              color: var(--unity-text-muted);
            }
          }

          .status-indicator {
            font-size: 0.68rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 8px;
            flex-shrink: 0;

            &.active {
              background: #ecfdf5;
              color: #047857;
              border: 1px solid #a7f3d0;
            }

            &.inactive {
              background: #f1f5f9;
              color: #64748b;
              border: 1px solid #cbd5e1;
            }
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
              font-size: 0.92rem;
              font-weight: 800;
              color: var(--unity-primary);
            }

            .old-price {
              font-size: 0.72rem;
              color: #94a3b8;
              text-decoration: line-through;
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

            &.bookings-count {
              color: #047857;
              background: #ecfdf5;
              border-color: #a7f3d0;
            }
          }
        }
      }
    }

    .card-actions-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-top: 10px;
      border-top: 1px dashed var(--unity-border);

      .action-pill {
        height: 34px;
        border-radius: 10px;
        font-size: 0.74rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        cursor: pointer;
        padding: 0 12px;
        transition: all 0.2s ease;

        &.edit-btn {
          background: #f1f5f9;
          color: #1e293b;
          border: 1px solid #cbd5e1;
          flex: 1;

          &:hover {
            background: #e2e8f0;
          }
        }

        &.toggle-btn {
          flex: 1;

          &.btn-deactivate {
            background: #fff7ed;
            color: #c2410c;
            border: 1px solid #fed7aa;
          }

          &.btn-activate {
            background: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
          }
        }

        &.delete-btn {
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fee2e2;
          padding: 0 10px;

          &:hover {
            background: #fee2e2;
          }
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

