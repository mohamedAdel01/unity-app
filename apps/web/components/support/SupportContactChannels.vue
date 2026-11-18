<template>
  <section class="support-channels-section">
    <div class="section-title-box">
      <h3 class="section-title">{{ t('Direct Communication Channels') }}</h3>
      <p class="section-subtitle">{{ t('Choose the most convenient way to reach our support team') }}</p>
    </div>

    <div class="channels-grid">
      <!-- Channel 1: WhatsApp -->
      <a 
        :href="whatsappUrl" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="channel-card whatsapp"
      >
        <div class="channel-icon-shell">
          <i class="pi pi-whatsapp"></i>
        </div>
        <div class="channel-details">
          <span class="channel-name">{{ t('WhatsApp Chat') }}</span>
          <span class="channel-status">{{ t('Instant response within minutes') }}</span>
        </div>
        <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'channel-arrow']"></i>
      </a>

      <!-- Channel 2: Phone Hotline -->
      <a 
        :href="`tel:${hotlinePhone}`" 
        class="channel-card phone"
      >
        <div class="channel-icon-shell">
          <i class="pi pi-phone"></i>
        </div>
        <div class="channel-details">
          <span class="channel-name">{{ t('Direct Hotline') }}</span>
          <span class="channel-status">{{ hotlinePhone }} • {{ t('Available 24 Hours') }}</span>
        </div>
        <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'channel-arrow']"></i>
      </a>

      <!-- Channel 3: Submit Support Ticket -->
      <button 
        type="button" 
        class="channel-card ticket" 
        @click="emit('open-ticket')"
      >
        <div class="channel-icon-shell">
          <i class="pi pi-ticket"></i>
        </div>
        <div class="channel-details">
          <span class="channel-name">{{ t('Open Support Ticket') }}</span>
          <span class="channel-status">{{ t('Submit detailed inquiry or issue report') }}</span>
        </div>
        <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'channel-arrow']"></i>
      </button>

      <!-- Channel 4: Email -->
      <a 
        :href="`mailto:${supportEmail}?subject=${encodeURIComponent(t('Support Request'))}`" 
        class="channel-card email"
      >
        <div class="channel-icon-shell">
          <i class="pi pi-envelope"></i>
        </div>
        <div class="channel-details">
          <span class="channel-name">{{ t('Email Support') }}</span>
          <span class="channel-status">{{ supportEmail }}</span>
        </div>
        <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'channel-arrow']"></i>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

const emit = defineEmits<{
  (e: 'open-ticket'): void;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)
const hotlinePhone = '19011';
const whatsappUrl = 'https://wa.me/201000000000';
const supportEmail = 'support@unity-health.app';

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.support-channels-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;

  .section-title-box {
    .section-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--unity-text-main, #0f172a);
      margin: 0;
    }

    .section-subtitle {
      font-size: 0.76rem;
      color: var(--unity-text-secondary, #64748b);
      margin: 3px 0 0;
    }
  }

  .channels-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .channel-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--unity-surface, #ffffff);
    border: 1px solid var(--unity-border, #e2e8f0);
    border-radius: 16px;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    text-align: inherit;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;

    &:active {
      transform: scale(0.98);
      background: var(--unity-surface-muted, #f8fafc);
    }

    .channel-icon-shell {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    &.whatsapp {
      .channel-icon-shell {
        background: rgba(37, 211, 102, 0.12);
        color: #16a34a;
      }
      &:hover {
        border-color: rgba(37, 211, 102, 0.4);
      }
    }

    &.phone {
      .channel-icon-shell {
        background: rgba(14, 165, 233, 0.12);
        color: #0284c7;
      }
      &:hover {
        border-color: rgba(14, 165, 233, 0.4);
      }
    }

    &.ticket {
      .channel-icon-shell {
        background: rgba(16, 185, 129, 0.12);
        color: #059669;
      }
      &:hover {
        border-color: rgba(16, 185, 129, 0.4);
      }
    }

    &.email {
      .channel-icon-shell {
        background: rgba(99, 102, 241, 0.12);
        color: #4f46e5;
      }
      &:hover {
        border-color: rgba(99, 102, 241, 0.4);
      }
    }

    .channel-details {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;

      .channel-name {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--unity-text-main, #0f172a);
      }

      .channel-status {
        font-size: 0.74rem;
        color: var(--unity-text-secondary, #64748b);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .channel-arrow {
      font-size: 0.82rem;
      color: var(--unity-text-secondary, #94a3b8);
      flex-shrink: 0;
    }
  }
}
</style>

