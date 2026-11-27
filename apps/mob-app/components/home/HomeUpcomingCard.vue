<template>
  <section class="section-container">
    <div class="section-header">
      <div class="title-with-count">
        <h4>{{ t("Today's Appointments") }}</h4>
        <span v-if="appointmentsList.length > 1" class="count-pill">
          {{ appointmentsList.length }}
        </span>
      </div>
      <NuxtLink to="/appointments" class="see-all-link">
        <span>{{ t('View All') }}</span>
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
          <!-- Doctor / Exam / Offer Avatar -->
          <div class="avatar-wrap">
            <img 
              v-if="getAvatarUrl(apt)"
              :src="getAvatarUrl(apt)" 
              alt=""
              @error="(e: any) => e.target.style.display = 'none'" 
            />
            <div v-else class="initial-box" :class="{ 'is-offer': Boolean(apt.offer) }">
              <i v-if="apt.offer" class="pi pi-tag"></i>
              <span v-else>{{ getAppointmentInitial(apt) }}</span>
            </div>
          </div>

          <!-- Doctor & Time Info -->
          <div class="info-wrap">
            <div class="top-row">
              <h5 class="doc-title">{{ getCardTitle(apt) }}</h5>
              <span class="status-chip" :class="apt.status">
                {{ apt.status === 'confirmed' ? t('Confirmed') : t('Under Review') }}
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
              <template v-if="apt.offer">
                <span class="bullet-dot">•</span>
                <span class="offer-pill-tag">
                  <i class="pi pi-tag"></i>
                  {{ t('Special Offer') }}
                </span>
              </template>
            </div>
          </div>
        </div>

        <div class="card-action-icon">
          <a 
            v-if="apt.meeting_link" 
            :href="apt.meeting_link" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="home-join-meet-btn"
            :title="t('Join Google Meet')"
            @click.stop
          >
            <i class="pi pi-video"></i>
            <span>{{ t('Join Meet') }}</span>
          </a>
          <i v-else :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
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
          <h5 class="empty-single-title">{{ t('You have no appointments today') }}</h5>
        </div>
      </div>
      <button class="empty-action-pill" type="button">
        <span>{{ t('Book Now') }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';

const props = defineProps<{
  appointment?: any | null;
  appointments?: any[];
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const router = useRouter();
const { t, isRtl, resolveI18n } = useI18n();
const bookingModal = useBookingModal();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const appointmentsList = computed<any[]>(() => {
  const rawList = Array.isArray(props.appointments) && props.appointments.length > 0
    ? props.appointments
    : (props.appointment ? [props.appointment] : []);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Filter only today's active appointments
  return rawList.filter((a: any) => {
    if (a.status !== 'confirmed' && a.status !== 'pending') return false;
    if (!a.date) return false;
    const aptDateStr = typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0];
    return aptDateStr === todayStr;
  });
});

// 4. Methods (functions, handlers)
const getAvatarUrl = (apt: any) => {
  const raw = apt?.offer?.image || apt?.doctor?.avatar || apt?.doctor?.user?.avatar;
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  const config = useRuntimeConfig();
  const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
  return `${baseUrl}${trimmed}`;
};

const getAppointmentInitial = (apt: any) => {
  const title = getCardTitle(apt);
  return title ? title.charAt(0).toUpperCase() : 'M';
};

const getCardTitle = (apt: any) => {
  if (!apt) return '';
  if (apt.offer) {
    const title = !isRtl.value && apt.offer.title_en ? apt.offer.title_en : (apt.offer.title_ar || apt.offer.title);
    if (title) return resolveI18n(title);
  }
  if (apt.examination) {
    const name = !isRtl.value && apt.examination.name_en ? apt.examination.name_en : (apt.examination.name_ar || apt.examination.name);
    if (name) return resolveI18n(name);
  }
  if (apt.doctor) {
    const name = !isRtl.value && apt.doctor.name_en ? apt.doctor.name_en : (apt.doctor.name_ar || apt.doctor.name);
    if (name) return resolveI18n(name);
  }
  if (apt.notes && apt.notes.includes(':')) {
    const after = apt.notes.split(':')[1]?.trim();
    if (after) return resolveI18n(after);
  }
  return t('Booked Service');
};
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
  if (apt?.status === 'pending') {
    bookingModal.openBookingFlow({
      appointment: apt,
      doctor: apt.doctor,
      service: apt.examination || apt.offer || null,
      examination: apt.examination || null,
      date: apt.date ? new Date(apt.date).toISOString().split('T')[0] : '',
      slot: apt.start_time ? { start_time: apt.start_time, end_time: apt.end_time } : null,
      type: apt.type || (apt.offer ? 'examination' : (apt.examination ? 'examination' : 'consultation')),
    });
  } else {
    router.push('/appointments');
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
        font-size: 0.86rem;
        font-weight: 700;
        color: var(--unity-text-main, #334155);
        opacity: 0.9;
        margin: 0;
        line-height: 1.3;
      }

      .count-pill {
        background: rgba(65, 91, 46, 0.15);
        color: var(--unity-primary);
        font-size: 0.65rem;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 10px;
      }
    }

    .see-all-link {
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--unity-primary);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      opacity: 0.88;
      padding: 2px 4px;
      border-radius: 6px;
      transition: all 0.2s;

      i {
        font-size: 0.58rem;
      }

      &:hover {
        opacity: 1;
        background: var(--unity-primary-light);
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

  @media (min-width: 640px) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    overflow-x: visible;

    .compact-booking-card {
      flex: 1 1 100%;
      min-width: 0;
      width: 100%;
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

      &.is-offer {
        background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
        font-size: 0.95rem;
      }
    }
  }

  .offer-pill-tag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: rgba(245, 158, 11, 0.12);
    color: #d97706;
    font-size: 0.60rem;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 6px;

    i {
      font-size: 0.55rem;
      color: #d97706;
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
          background: rgba(92, 128, 66, 0.12);
          color: #364c26;
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
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-dim);
    font-size: 0.72rem;
    flex-shrink: 0;

    .home-join-meet-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #0284c7;
      color: #ffffff;
      border-radius: 12px;
      font-size: 0.74rem;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
      transition: all 0.2s ease;

      &:hover {
        background: #0369a1;
        transform: translateY(-1px);
      }

      i {
        font-size: 0.78rem;
      }
    }
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
      align-items: center;
      min-width: 0;

      .empty-single-title {
        font-size: 0.80rem;
        font-weight: 600;
        color: var(--unity-text-main, #334155);
        margin: 0;
        white-space: nowrap;
      }
    }
  }

  .empty-action-pill {
    background: var(--unity-primary-light, #f2f6ee);
    color: var(--unity-primary, #415b2e);
    border: 1px solid rgba(65, 91, 46, 0.2);
    padding: 5px 12px;
    border-radius: 12px;
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    box-shadow: none;
    transition: all 0.2s ease;

    :global([data-theme='dark']) &,
    :global(html.dark) & {
      background: rgba(92, 128, 66, 0.16);
      color: #8ab36b;
      border-color: rgba(92, 128, 66, 0.3);
    }

    &:hover {
      background: rgba(65, 91, 46, 0.12);
      border-color: rgba(65, 91, 46, 0.35);
    }
  }
}
</style>
