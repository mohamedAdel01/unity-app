<template>
  <div class="profile-menu-groups">
    <!-- Group 1: الرعاية الصحية والعائلة -->
    <div class="menu-group">
      <span class="group-title">{{ t('Health Care & Family') }}</span>
      <div class="group-card">
        <!-- Item 1: أفراد الأسرة -->
        <button class="menu-item-row" @click="emit('action', 'family')">
          <div class="item-icon-box mint">
            <i class="pi pi-users"></i>
          </div>
          <div class="item-text-box">
            <h6>{{ t('Family Members Management') }}</h6>
            <small>{{ t('Add or manage dependents health profiles') }}</small>
          </div>
          <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="item-chevron"></i>
        </button>

        <div class="item-divider"></div>

        <!-- Item 2: بطاقة التأمين -->
        <button class="menu-item-row" @click="emit('action', 'insurance')">
          <div class="item-icon-box teal">
            <i class="pi pi-credit-card"></i>
          </div>
          <div class="item-text-box">
            <h6>{{ t('Health Insurance Card') }}</h6>
            <small>{{ t('View & update insurance and claim submissions') }}</small>
          </div>
          <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="item-chevron"></i>
        </button>

        <div class="item-divider"></div>

        <!-- Item 3: تنبيهات المواعيد والأدوية -->
        <button class="menu-item-row" @click="emit('action', 'reminders')">
          <div class="item-icon-box green">
            <i class="pi pi-bell"></i>
          </div>
          <div class="item-text-box">
            <h6>{{ t('Appointments & Medication Alerts') }}</h6>
            <small>{{ t('Customize notifications & dosage reminders') }}</small>
          </div>
          <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="item-chevron"></i>
        </button>
      </div>
    </div>

    <!-- Group 2: المدفوعات والأمان -->
    <div class="menu-group">
      <span class="group-title">{{ t('Payments & Security') }}</span>
      <div class="group-card">
        <!-- Item 1: طرق الدفع والمحفظة -->
        <button class="menu-item-row" @click="emit('action', 'wallet')">
          <div class="item-icon-box emerald">
            <i class="pi pi-wallet"></i>
          </div>
          <div class="item-text-box">
            <h6>{{ t('Payment Methods & Wallet') }}</h6>
            <small>{{ t('Saved cards & cashback balance') }}</small>
          </div>
          <span class="balance-pill">{{ t('140 SAR') }}</span>
          <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="item-chevron"></i>
        </button>

        <div class="item-divider"></div>

        <!-- Item 2: الخصوصية والأمان -->
        <button class="menu-item-row" @click="emit('action', 'privacy')">
          <div class="item-icon-box cyan">
            <i class="pi pi-lock"></i>
          </div>
          <div class="item-text-box">
            <h6>{{ t('Privacy & Security') }}</h6>
            <small>{{ t('Face ID / Quick access & change password') }}</small>
          </div>
          <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="item-chevron"></i>
        </button>
      </div>
    </div>

    <!-- Group 3: المساعدة والمعلومات القانونية -->
    <div class="menu-group">
      <span class="group-title">{{ t('Help & Legal Information') }}</span>
      <div class="group-card">
        <!-- Item 1: الدعم الفني -->
        <button class="menu-item-row" @click="emit('action', 'support')">
          <div class="item-icon-box light-green">
            <i class="pi pi-headphones"></i>
          </div>
          <div class="item-text-box">
            <div class="title-with-online">
              <span class="live-dot"></span>
              <h6>{{ t('Help & Technical Support') }}</h6>
            </div>
            <small>{{ t('Instant chat with customer care 24/7') }}</small>
          </div>
          <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="item-chevron"></i>
        </button>

        <div class="item-divider"></div>

        <!-- Item 2: الشروط والسياسات -->
        <button class="menu-item-row" @click="emit('action', 'terms')">
          <div class="item-icon-box slate">
            <i class="pi pi-shield"></i>
          </div>
          <div class="item-text-box">
            <h6>{{ t('Terms & Medical Use Policies') }}</h6>
            <small>{{ t('Data protection & health records privacy') }}</small>
          </div>
          <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="item-chevron"></i>
        </button>

        <div class="item-divider"></div>

        <!-- Item 3: لوحة تحكم الإشراف (سجلات المرضى) -->
        <button class="menu-item-row" @click="emit('action', 'admin')">
          <div class="item-icon-box green">
            <i class="pi pi-users"></i>
          </div>
          <div class="item-text-box">
            <h6>{{ isRtl ? 'لوحة المشرف • سجلات المرضى' : 'Admin Panel • Patient Records' }}</h6>
            <small>{{ isRtl ? 'إدارة سجلات المرضى والملفات الطبية' : 'Manage patients records and files' }}</small>
          </div>
          <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="item-chevron"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';

const emit = defineEmits<{
  (e: 'action', key: string): void;
}>();

const { t, isRtl } = useI18n();
</script>

<style scoped lang="scss">
.profile-menu-groups {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.menu-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .group-title {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--unity-text-muted);
    padding: 0 4px;
  }

  .group-card {
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    border-radius: 22px;
    overflow: hidden;
    box-shadow: var(--unity-shadow-subtle);
  }
}

.menu-item-row {
  width: 100%;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: start;
  transition: background 0.15s ease;

  &:hover {
    background: var(--unity-bg);
  }

  .item-icon-box {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    flex-shrink: 0;

    &.mint { background: #ecfdf5; color: #047857; }
    &.teal { background: #f0fdfa; color: #0f766e; }
    &.green { background: #dcfce7; color: #15803d; }
    &.emerald { background: #ecfdf5; color: #059669; }
    &.cyan { background: #e0f2fe; color: #0284c7; }
    &.light-green { background: #f0fdf4; color: #16a34a; }
    &.slate { background: #f1f5f9; color: #475569; }
  }

  .item-text-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;

    .title-with-online {
      display: flex;
      align-items: center;
      gap: 6px;

      .live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #10b981;
      }
    }

    h6 {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--unity-text-main);
    }

    small {
      font-size: 0.72rem;
      color: var(--unity-text-muted);
      line-height: 1.3;
    }
  }

  .balance-pill {
    padding: 3px 8px;
    border-radius: 10px;
    background: #ecfdf5;
    color: #047857;
    font-size: 0.75rem;
    font-weight: 600;
    margin-inline-end: 4px;
  }

  .item-chevron {
    font-size: 0.78rem;
    color: var(--unity-text-dim);
  }
}

.item-divider {
  height: 1px;
  background: var(--unity-border-light);
  margin-inline-start: 68px;
}
</style>

