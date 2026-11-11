<template>
  <section class="section-container">
    <div class="section-header">
      <div class="title-with-count">
        <h4>{{ t('My Bookings') }}</h4>
        <span v-if="appointmentsList.length > 1" class="count-pill">
          {{ appointmentsList.length }}
        </span>
      </div>
      <NuxtLink to="/appointments" class="see-all-link">
        {{ t('View All') }} 
        <i :class="isRtl ? 'pi pi-angle-left' : 'pi pi-angle-right'"></i>
      </NuxtLink>
    </div>

    <!-- Case A: User has 1 or more bookings today/upcoming -->
    <div v-if="appointmentsList.length > 0" class="bookings-scroll-wrapper" :class="{ 'is-single': appointmentsList.length === 1 }">
      <div 
        v-for="apt in appointmentsList" 
        :key="apt.id" 
        class="compact-booking-card"
        @click="openDetails(apt)"
      >
        <div class="card-left-part">
          <!-- Doctor / Exam Avatar -->
          <div class="avatar-wrap">
            <img 
              v-if="apt.doctor?.avatar || apt.doctor?.user?.avatar"
              :src="apt.doctor?.avatar || apt.doctor?.user?.avatar" 
              alt="Doctor" 
            />
            <div v-else class="initial-box">
              <span>{{ (apt.doctor?.name || apt.doctor?.user?.name || apt.examination?.name || 'D').charAt(0).toUpperCase() }}</span>
            </div>
          </div>

          <!-- Doctor & Time Info -->
          <div class="info-wrap">
            <div class="top-row">
              <h5 class="doc-title">{{ apt.doctor?.name || apt.doctor?.user?.name || apt.examination?.name || apt.offer?.title || t('Medical Appointment') }}</h5>
              <span class="status-chip" :class="apt.status">
                {{ apt.status === 'confirmed' ? t('Confirmed') : t('Pending Confirmation') }}
              </span>
            </div>
            
            <div class="meta-row">
              <span class="time-item">
                <i class="pi pi-clock"></i>
                {{ formatSlotTime(apt.start_time) }}
              </span>
              <span class="bullet-dot">•</span>
              <span class="date-item">
                <i class="pi pi-calendar"></i>
                {{ formatAppointmentDate(apt.date) }}
              </span>
            </div>
          </div>
        </div>

        <div class="card-action-icon">
          <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
        </div>
      </div>
    </div>

    <!-- Case B: No bookings for today (Compact empty state with quick book button) -->
    <div v-else class="empty-today-card" @click="bookingModal.openQuickBook">
      <div class="empty-left">
        <div class="cal-icon-wrap">
          <i class="pi pi-calendar"></i>
        </div>
        <div class="empty-text">
          <h5>{{ t('No bookings for today') }}</h5>
          <p>{{ t('You have no scheduled appointments for today') }}</p>
        </div>
      </div>
      <button class="empty-action-pill" type="button">
        <span>{{ t('Book Now') }}</span>
        <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'"></i>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';

const props = defineProps<{
  appointment?: any | null;
  appointments?: any[];
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const { t, isRtl } = useI18n();
const bookingModal = useBookingModal();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const appointmentsList = computed<any[]>(() => {
  if (Array.isArray(props.appointments) && props.appointments.length > 0) {
    return props.appointments;
  }
  if (props.appointment) {
    return [props.appointment];
  }
  return [];
});

// 4. Methods (functions, handlers)
const formatSlotTime = (timeStr?: string) => {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
  if (/am|pm/i.test(trimmed)) return trimmed;

  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;

  let h = parseInt(parts[0], 10);
  const m = parts[1].slice(0, 2);
  if (isNaN(h)) return trimmed;

  const isPm = h >= 12;
  h = h % 12;
  if (h === 0) h = 12;
  const hPadded = h.toString().padStart(2, '0');
  const period = isPm ? 'PM' : 'AM';
  return `${hPadded}:${m} ${period}`;
};

const formatAppointmentDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
};

const openDetails = (apt: any) => {
  if (apt?.doctor) {
    bookingModal.openBookingFlow({ doctor: apt.doctor });
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.section-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title-with-count {
      display: flex;
      align-items: center;
      gap: 6px;

      h4 {
        font-size: 0.98rem;
        font-weight: 800;
        color: var(--unity-text-main);
        margin: 0;
      }

      .count-pill {
        background: var(--unity-primary);
        color: #fff;
        font-size: 0.68rem;
        font-weight: 800;
        padding: 1px 7px;
        border-radius: 10px;
      }
    }

    .see-all-link {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--unity-primary);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      transition: gap 0.2s;

      &:hover {
        gap: 5px;
      }
    }
  }
}

// Scroll wrapper for 1 or more bookings
.bookings-scroll-wrapper {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  &.is-single {
    .compact-booking-card {
      width: 100%;
      min-width: 100%;
    }
  }
}

.compact-booking-card {
  flex: 0 0 calc(100% - 24px);
  min-width: 280px;
  max-width: 100%;
  scroll-snap-align: start;
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 18px;
  padding: 11px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  box-shadow: var(--unity-shadow-subtle);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--unity-primary);
    box-shadow: var(--unity-shadow-card);
  }

  &:active {
    transform: scale(0.98);
  }

  .card-left-part {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .avatar-wrap {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .initial-box {
      width: 100%;
      height: 100%;
      background: var(--unity-primary-gradient);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 800;
    }
  }

  .info-wrap {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;

    .top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;

      .doc-title {
        font-size: 0.85rem;
        font-weight: 800;
        color: var(--unity-text-main);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .status-chip {
        font-size: 0.62rem;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 8px;
        white-space: nowrap;
        flex-shrink: 0;

        &.confirmed {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
        }

        &.pending {
          background: rgba(245, 158, 11, 0.12);
          color: #d97706;
        }
      }
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.70rem;
      color: var(--unity-text-muted);
      font-weight: 600;

      i {
        font-size: 0.68rem;
        color: var(--unity-primary);
        margin-inline-end: 2px;
      }

      .bullet-dot {
        opacity: 0.5;
        font-size: 0.65rem;
      }
    }
  }

  .card-action-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-dim);
    font-size: 0.72rem;
    flex-shrink: 0;
  }
}

// Compact Empty State Card for Today
.empty-today-card {
  background: var(--unity-surface);
  border: 1.5px dashed var(--unity-border);
  border-radius: 18px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  box-shadow: var(--unity-shadow-subtle);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--unity-primary);
    background: var(--unity-primary-light);
  }

  .empty-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;

    .cal-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: var(--unity-primary-light);
      color: var(--unity-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .empty-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;

      h5 {
        font-size: 0.82rem;
        font-weight: 800;
        color: var(--unity-text-main);
        margin: 0;
        white-space: nowrap;
      }

      p {
        font-size: 0.68rem;
        color: var(--unity-text-muted);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .empty-action-pill {
    background: var(--unity-primary);
    color: #ffffff;
    border: none;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(4, 120, 87, 0.2);
    transition: all 0.2s ease;

    &:hover {
      background: var(--unity-primary-dark);
    }
  }
}
</style>
