<template>
  <div class="admin-promotions-page">
    <AdminPromotionsHeader
      :active-tab="activeTab"
      @update:active-tab="onTabChange"
      @open-new-offer="openCreateOfferModal"
      @open-new-promocode="openCreatePromoModal"
    />

    <AdminPromotionsTabs
      :active-tab="activeTab"
      :offers="offers"
      :promocodes="promocodes"
      :offers-loading="offersLoading"
      :promos-loading="promosLoading"
      :offers-has-more="offersHasMore"
      :promos-has-more="promosHasMore"
      @load-more-offers="loadMoreOffers"
      @load-more-promos="loadMorePromos"
      @edit-offer="openEditOfferModal"
      @toggle-offer="handleToggleOffer"
      @delete-offer="promptDeleteOffer"
      @edit-promocode="openEditPromoModal"
      @toggle-promocode="handleTogglePromocode"
      @delete-promocode="promptDeletePromocode"
    />

    <AdminOfferModal
      :is-open="isOfferModalOpen"
      :offer="selectedOffer"
      @close="closeOfferModal"
      @saved="ADMIN_OFFERS(1)"
    />

    <AdminPromocodeModal
      :is-open="isPromoModalOpen"
      :promocode="selectedPromo"
      @close="closePromoModal"
      @saved="ADMIN_PROMOCODES(1)"
    />

    <!-- Delete Confirmation Modal -->
    <AppConfirmModal
      v-model="showDeleteModal"
      type="danger"
      :title="deleteType === 'offer' ? t('Delete Offer') : t('Delete Promocode')"
      :message="t('Are you sure you want to delete this item? This action cannot be undone.')"
      :confirm-text="t('Yes, Delete')"
      :cancel-text="t('Cancel')"
      :loading="deleting"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import AdminPromotionsHeader from '../../components/admin/AdminPromotionsHeader.vue';
import AdminPromotionsTabs from '../../components/admin/AdminPromotionsTabs.vue';
import AdminOfferModal from '../../components/admin/AdminOfferModal.vue';
import AdminPromocodeModal from '../../components/admin/AdminPromocodeModal.vue';
import AppConfirmModal from '../../components/common/AppConfirmModal.vue';

definePageMeta({
  layout: 'admin',
});

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();

// 2. Data (refs, reactive state)
const activeTab = ref<'offers' | 'promocodes'>('offers');

// Offers Data
const offers = ref<any[]>([]);
const offersPage = ref(1);
const offersHasMore = ref(false);
const offersLoading = ref(false);

// Promocodes Data
const promocodes = ref<any[]>([]);
const promosPage = ref(1);
const promosHasMore = ref(false);
const promosLoading = ref(false);

// Modals State
const isOfferModalOpen = ref(false);
const selectedOffer = ref<any | null>(null);

const isPromoModalOpen = ref(false);
const selectedPromo = ref<any | null>(null);

// Delete Modal State
const showDeleteModal = ref(false);
const deleteType = ref<'offer' | 'promocode'>('offer');
const itemToDelete = ref<any | null>(null);
const deleting = ref(false);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
// Service-Name Function Binding: ADMIN_OFFERS
const ADMIN_OFFERS = async (page = 1) => {
  try {
    offersLoading.value = true;
    const res = await api.apiRequest({
      service: 'ADMIN_OFFERS',
      filter: { page, limit: 10 },
    });

    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    if (page === 1) {
      offers.value = raw;
    } else {
      offers.value.push(...raw);
    }
    offersPage.value = page;
    offersHasMore.value = res?.pagination?.hasMore ?? res?.hasMore ?? (raw.length >= 10);
  } catch (err: any) {
    if (page === 1) offers.value = [];
  } finally {
    offersLoading.value = false;
  }
};

// Service-Name Function Binding: ADMIN_PROMOCODES
const ADMIN_PROMOCODES = async (page = 1) => {
  try {
    promosLoading.value = true;
    const res = await api.apiRequest({
      service: 'ADMIN_PROMOCODES',
      filter: { page, limit: 10 },
    });

    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    if (page === 1) {
      promocodes.value = raw;
    } else {
      promocodes.value.push(...raw);
    }
    promosPage.value = page;
    promosHasMore.value = res?.pagination?.hasMore ?? res?.hasMore ?? (raw.length >= 10);
  } catch (err: any) {
    if (page === 1) promocodes.value = [];
  } finally {
    promosLoading.value = false;
  }
};

const onTabChange = (tab: 'offers' | 'promocodes') => {
  activeTab.value = tab;
  if (tab === 'offers' && offers.value.length === 0) {
    ADMIN_OFFERS(1);
  } else if (tab === 'promocodes' && promocodes.value.length === 0) {
    ADMIN_PROMOCODES(1);
  }
};

const loadMoreOffers = () => {
  if (offersHasMore.value && !offersLoading.value) {
    ADMIN_OFFERS(offersPage.value + 1);
  }
};

const loadMorePromos = () => {
  if (promosHasMore.value && !promosLoading.value) {
    ADMIN_PROMOCODES(promosPage.value + 1);
  }
};

const openCreateOfferModal = () => {
  selectedOffer.value = null;
  isOfferModalOpen.value = true;
};

const openEditOfferModal = (offer: any) => {
  selectedOffer.value = offer;
  isOfferModalOpen.value = true;
};

const closeOfferModal = () => {
  isOfferModalOpen.value = false;
  selectedOffer.value = null;
};

const openCreatePromoModal = () => {
  selectedPromo.value = null;
  isPromoModalOpen.value = true;
};

const openEditPromoModal = (promo: any) => {
  selectedPromo.value = promo;
  isPromoModalOpen.value = true;
};

const closePromoModal = () => {
  isPromoModalOpen.value = false;
  selectedPromo.value = null;
};

const handleToggleOffer = async (offer: any) => {
  try {
    await api.apiRequest({
      service: 'ADMIN_TOGGLE_OFFER',
      payload: { id: offer.id },
    });
    offer.is_active = !offer.is_active;
    toast.success(offer.is_active ? t('Offer activated successfully!') : t('Offer deactivated successfully!'));
  } catch (err: any) {
    toast.error(err?.message || t('Failed to update offer status'));
  }
};

const handleTogglePromocode = async (promo: any) => {
  try {
    await api.apiRequest({
      service: 'ADMIN_TOGGLE_PROMOCODE',
      payload: { id: promo.id },
    });
    promo.is_active = !promo.is_active;
    toast.success(promo.is_active ? t('Promocode activated successfully!') : t('Promocode deactivated successfully!'));
  } catch (err: any) {
    toast.error(err?.message || t('Failed to update promocode status'));
  }
};

const promptDeleteOffer = (offer: any) => {
  deleteType.value = 'offer';
  itemToDelete.value = offer;
  showDeleteModal.value = true;
};

const promptDeletePromocode = (promo: any) => {
  deleteType.value = 'promocode';
  itemToDelete.value = promo;
  showDeleteModal.value = true;
};

const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return;

  try {
    deleting.value = true;
    if (deleteType.value === 'offer') {
      await api.apiRequest({
        service: 'ADMIN_DELETE_OFFER',
        payload: { id: itemToDelete.value.id },
      });
      offers.value = offers.value.filter((o) => o.id !== itemToDelete.value.id);
      toast.success(t('Offer deleted successfully!'));
    } else {
      await api.apiRequest({
        service: 'ADMIN_DELETE_PROMOCODE',
        payload: { id: itemToDelete.value.id },
      });
      promocodes.value = promocodes.value.filter((p) => p.id !== itemToDelete.value.id);
      toast.success(t('Promocode deleted successfully!'));
    }
    showDeleteModal.value = false;
    itemToDelete.value = null;
  } catch (err: any) {
    toast.error(err?.message || t('Failed to delete item'));
  } finally {
    deleting.value = false;
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  ADMIN_OFFERS(1);
});

// 7. Meta (useHead, useSeoMeta)
useHead({
  title: computed(() => t('Offers & Promocodes — Admin Portal')),
});
</script>

<style scoped lang="scss">
.admin-promotions-page {
  padding: 14px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>

