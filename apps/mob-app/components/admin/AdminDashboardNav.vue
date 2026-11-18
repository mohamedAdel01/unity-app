<template>
  <div class="admin-nav-section">
    <h5>{{ t('Hospital Management Sections') }}</h5>
    <div class="nav-tiles-grid">
      <NuxtLink to="/admin/patients" class="nav-tile">
        <div class="tile-icon"><i class="pi pi-id-card"></i></div>
        <div class="tile-info">
          <strong>{{ t('Patients Records') }}</strong>
          <small>{{ t('Manage patient medical histories') }}</small>
        </div>
        <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'tile-arrow']"></i>
      </NuxtLink>

      <NuxtLink to="/admin/doctors" class="nav-tile">
        <div class="tile-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4.5 3v5a6.5 6.5 0 0 0 13 0V3"/>
            <path d="M3 3h3"/>
            <path d="M16 3h3"/>
            <path d="M11 14.5V18a3 3 0 0 0 6 0v-2"/>
            <circle cx="17" cy="16" r="2"/>
          </svg>
        </div>
        <div class="tile-info">
          <strong>{{ t('Clinics & Doctors') }}</strong>
          <small>{{ t('Manage clinics, doctors & schedules') }}</small>
        </div>
        <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'tile-arrow']"></i>
      </NuxtLink>

      <NuxtLink to="/admin/services" class="nav-tile">
        <div class="tile-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 18h8"/>
            <path d="M3 22h18"/>
            <path d="M14 22a7 7 0 1 0 0-14h-1"/>
            <path d="M9 14h2"/>
            <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/>
            <path d="M12 6V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/>
          </svg>
        </div>
        <div class="tile-info">
          <strong>{{ t('Services & Examinations') }}</strong>
          <small>{{ t('Medical tests, packages & categories') }}</small>
        </div>
        <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'tile-arrow']"></i>
      </NuxtLink>

      <NuxtLink to="/admin/appointments" class="nav-tile">
        <div class="tile-icon"><i class="pi pi-calendar"></i></div>
        <div class="tile-info">
          <strong>{{ t('Bookings') }}</strong>
          <small>{{ t('Live bookings & appointment schedule') }}</small>
        </div>
        <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'tile-arrow']"></i>
      </NuxtLink>

      <NuxtLink to="/admin/promotions" class="nav-tile">
        <div class="tile-icon promo-icon"><i class="pi pi-tag"></i></div>
        <div class="tile-info">
          <strong>{{ t('Offers & Promocodes') }}</strong>
          <small>{{ t('Manage deals, discounts & coupons') }}</small>
        </div>
        <i :class="[isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right', 'tile-arrow']"></i>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-nav-section {
  display: flex;
  flex-direction: column;
  gap: 12px;

  h5 {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 800;
    color: var(--unity-text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .nav-tiles-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;

    @media (min-width: 640px) {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .nav-tile {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      background: var(--unity-surface);
      border: 1px solid var(--unity-border-subtle);
      border-radius: 18px;
      text-decoration: none;
      transition: transform 0.15s, border-color 0.15s;

      &:active {
        transform: scale(0.99);
      }

      .tile-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--unity-primary);
        font-size: 1.1rem;

        &.promo-icon {
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.2);
        }
      }

      .tile-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        strong {
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--unity-text-main);
        }

        small {
          font-size: 0.72rem;
          color: var(--unity-text-dim);
          margin-top: 1px;
        }
      }

      .tile-arrow {
        font-size: 0.8rem;
        color: var(--unity-text-dim);
      }
    }
  }
}
</style>

