<template>
  <div class="settings-card">
    <div class="settings-head">
      <div class="head-icon icon-blue"><i class="pi pi-wallet"></i></div>
      <div class="head-text">
        <h5>{{ t('profile.invoicesTitle') }}</h5>
        <small>{{ t('profile.invoicesSub') }}</small>
      </div>
    </div>

    <div v-if="globalStore.loading.includes('invoices')" class="loading-box">
      <i class="pi pi-spin pi-spinner"></i> {{ t('common.loading') }}
    </div>

    <div v-else-if="invoices.length === 0" class="empty-invoices">
      <p>{{ t('profile.emptyInvoices') }}</p>
    </div>

    <div v-else class="invoices-list">
      <div 
        v-for="inv in invoices" 
        :key="inv.id" 
        class="invoice-mini-card"
      >
        <div class="inv-top">
          <span class="inv-num">#{{ inv.id?.slice(0, 8) || 'INV-1092' }}</span>
          <span class="inv-status" :class="inv.status === 'paid' ? 'paid' : 'pending'">
            {{ inv.status === 'paid' ? t('appointments.statusCompleted') : t('appointments.statusPending') }}
          </span>
        </div>
        <div class="inv-bottom">
          <span class="inv-method"><i class="pi pi-credit-card"></i> {{ inv.payment_method || 'Paymob Online' }}</span>
          <strong class="inv-total">{{ inv.total || 200 }} {{ t('common.currency') }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useGlobalStore } from '../../stores/global';

const api = useUnityApi();
const { t } = useI18n();
const globalStore = useGlobalStore();

const invoices = ref<any[]>([]);

const loadInvoices = async () => {
  try {
    globalStore.setLoading(['invoices', true]);
    const res = await api.getInvoices();
    if (res.status && Array.isArray(res.data)) {
      invoices.value = res.data;
    } else {
      invoices.value = [];
    }
  } catch (e) {
    invoices.value = [];
  } finally {
    globalStore.setLoading(['invoices', false]);
  }
};

onMounted(() => {
  loadInvoices();
});
</script>

<style scoped lang="scss">
.settings-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--unity-shadow-subtle);

  .settings-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;

    .head-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;

      &.icon-blue { background: #e0f2fe; color: #0369a1; }
    }

    .head-text {
      h5 {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--unity-text-main);
      }
      small {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
      }
    }
  }
}

.invoices-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .invoice-mini-card {
    background: var(--unity-bg);
    border-radius: 12px;
    padding: 10px 12px;

    .inv-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;

      .inv-num {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      .inv-status {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 6px;

        &.paid { background: #dcfce7; color: #15803d; }
        &.pending { background: #fef3c7; color: #b45309; }
      }
    }

    .inv-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .inv-method {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
      }

      .inv-total {
        font-size: 0.85rem;
        color: var(--unity-primary);
        font-weight: 800;
      }
    }
  }
}

.loading-box, .empty-invoices {
  padding: 20px;
  text-align: center;
  color: var(--unity-text-muted);
  font-size: 0.82rem;
}
</style>

