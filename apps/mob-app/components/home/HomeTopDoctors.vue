<template>
  <section v-if="filteredDoctors.length > 0 || globalStore.loading.includes('doctors')" class="section-container">
    <div class="section-header">
      <div class="header-with-badge">
        <i class="pi pi-verified verified-icon"></i>
        <h4>{{ t('Our Top Doctors') }}</h4>
      </div>
      <NuxtLink to="/services?tab=doctors" class="see-all-link">
        {{ t('View All') }} 
        <i :class="isRtl ? 'pi pi-angle-left' : 'pi pi-angle-right'"></i>
      </NuxtLink>
    </div>

    <div v-if="globalStore.loading.includes('doctors')" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <span>{{ t('Loading...') }}</span>
    </div>

    <div v-else class="doctors-cards-list">
      <div 
        v-for="doctor in filteredDoctors" 
        :key="doctor.id" 
        class="doctor-item-card"
      >
        <div class="doc-card-header" :title="t('View Doctor Profile')" @click="openDoctorPreview(doctor)">
          <div class="doc-avatar-group">
            <img 
              v-if="doctor.avatar && !failedAvatars.has(doctor.id)"
              :src="resolveDoctorAvatar(doctor.avatar)" 
              :alt="doctor.name"
              class="clickable-doc-avatar"
              @error="failedAvatars.add(doctor.id)" 
            />
            <div v-else class="doc-initial-avatar clickable-doc-avatar">
              <span>{{ (doctor.name || 'D').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="doc-texts">
              <h5>{{ doctor.name }}</h5>
              <div v-if="getClinicName(doctor.clinic)" class="doc-clinic-name">
                <i class="pi pi-building"></i>
                <span>{{ getClinicName(doctor.clinic) }}</span>
              </div>
            </div>
          </div>
          <div v-if="doctor.rating" class="doc-rating-badge">
            <span>⭐ {{ doctor.rating }}</span>
          </div>
        </div>

        <div class="doc-card-footer">
          <div class="doc-availability" :class="{ 'not-today': !doctor.isAvailableToday }">
            <i :class="doctor.isAvailableToday ? 'pi pi-calendar-plus' : 'pi pi-calendar'"></i>
            <span>{{ doctor.availabilityText }}</span>
          </div>
          <button 
            class="book-appointment-btn" 
            @click="bookDoctor(doctor)"
          >
            {{ t('Book Slot') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Doctor Profile & Full Image Preview Modal -->
    <DoctorPreviewModal
      :is-open="isDoctorPreviewOpen"
      :doctor="selectedDoctorForPreview"
      @close="isDoctorPreviewOpen = false"
      @book="bookDoctor"
    />
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';
import { useGlobalStore } from '../../stores/global';
import DoctorPreviewModal from '../doctor/DoctorPreviewModal.vue';

const props = defineProps<{
  searchQuery?: string;
  categoryFilter?: string;
}>();

const api = useUnityApi();

const { t, isRtl, resolveI18n } = useI18n();

const bookingModal = useBookingModal();

const globalStore = useGlobalStore();

// 2. Data (refs, reactive state)
const doctors = ref<any[]>([]);
const failedAvatars = ref(new Set<string | number>());
const isDoctorPreviewOpen = ref(false);
const selectedDoctorForPreview = ref<any>(null);

// 3. Computed (computed properties)
const resolveDoctorAvatar = (url?: string) => {
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
const filteredDoctors = computed(() => {
  if (!props.searchQuery) return doctors.value;
  const q = props.searchQuery.toLowerCase();
  return doctors.value.filter(d => 
    d.name.toLowerCase().includes(q) || 
    getClinicName(d.clinic).toLowerCase().includes(q) ||
    d.clinic?.name?.toLowerCase().includes(q)
  );
});

// 4. Methods (functions, handlers)
const getClinicName = (c: any) => {
  if (!c) return '';
  return isRtl.value ? (c.name_ar || c.name || c.name_en) : (c.name_en || c.name || c.name_ar);
};

const timeToMinutes = (timeStr?: string): number => {
  if (!timeStr) return 0;
  const str = String(timeStr).trim().toUpperCase();
  const isPM = str.includes('PM');
  const isAM = str.includes('AM');
  const clean = str.replace(/[^0-9:]/g, '');
  const parts = clean.split(':');
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
};

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const computeDoctorAvailability = (doctor: any): { text: string; isToday: boolean } => {
  const isDoctorActive = doctor.status !== false && doctor.is_active !== false;
  if (!isDoctorActive) {
    return {
      text: t('Not available currently'),
      isToday: false,
    };
  }

  const rawSchedules = doctor.schedules;
  const schedules = Array.isArray(rawSchedules) ? rawSchedules.filter((s: any) => s.is_active !== false) : [];

  if (schedules.length === 0) {
    return {
      text: t('Not available currently'),
      isToday: false,
    };
  }

  const dayNamesMap: Record<string, string> = {
    sunday: t('Sunday'),
    monday: t('Monday'),
    tuesday: t('Tuesday'),
    wednesday: t('Wednesday'),
    thursday: t('Thursday'),
    friday: t('Friday'),
    saturday: t('Saturday'),
  };

  const schedulesByDay = new Map<string, any[]>();
  schedules.forEach((s: any) => {
    if (s.day_of_week) {
      const key = String(s.day_of_week).toLowerCase().trim();
      if (!schedulesByDay.has(key)) schedulesByDay.set(key, []);
      schedulesByDay.get(key)!.push(s);
    }
  });

  const now = new Date();
  const currentDayIndex = now.getDay();
  const todayKey = DAY_NAMES[currentDayIndex];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 1. Check if doctor works today and has an upcoming/active shift
  if (schedulesByDay.has(todayKey)) {
    const todayShifts = schedulesByDay.get(todayKey)!;
    const hasActiveShift = todayShifts.some((s: any) => {
      const endMins = timeToMinutes(s.end_time);
      return endMins > 0 ? endMins > currentMinutes : false;
    });

    if (hasActiveShift) {
      return {
        text: t('Available Today'),
        isToday: true,
      };
    }
  }

  // 2. Find next upcoming day
  for (let offset = 1; offset <= 7; offset++) {
    const nextIndex = (currentDayIndex + offset) % 7;
    const nextKey = DAY_NAMES[nextIndex];
    if (schedulesByDay.has(nextKey)) {
      if (offset === 1) {
        return {
          text: t('Available Tomorrow'),
          isToday: false,
        };
      }
      const dayLabel = dayNamesMap[nextKey] || nextKey;
      return {
        text: `${t('Available')} ${dayLabel}`,
        isToday: false,
      };
    }
  }

  return {
    text: t('Not available currently'),
    isToday: false,
  };
};

const DOCTORS = async () => {
  try {
    const res = await api.apiRequest({ service: 'DOCTORS' });
    if (res && res.status && Array.isArray(res.data)) {
      const rawList = res.data;
      const needsEnrichment = rawList.some((d: any) => !d.schedules || !Array.isArray(d.schedules) || d.schedules.length === 0);
      let enrichedList = rawList;

      if (needsEnrichment) {
        enrichedList = await Promise.all(
          rawList.map(async (doc: any) => {
            if (doc.schedules && Array.isArray(doc.schedules) && doc.schedules.length > 0) {
              return doc;
            }
            try {
              const single = await api.apiRequest({ service: 'DOCTOR_BY_ID', filter: { id: doc.id } });
              return {
                ...doc,
                schedules: single?.data?.schedules || [],
              };
            } catch {
              return doc;
            }
          })
        );
      }

      doctors.value = enrichedList.map((d: any) => {
        const avail = computeDoctorAvailability(d);
        return {
          ...d,
          id: d.id,
          name: isRtl.value ? (d.name_ar || d.name) : (d.name_en || d.name),
          clinic: d.clinic,
          rating: d.rating || null,
          isAvailableToday: avail.isToday,
          availabilityText: avail.text,
          avatar: d.avatar,
          consultation_fee: d.consultation_fee,
          slot_duration: d.slot_duration,
          description: d.description,
          description_ar: d.description_ar,
          description_en: d.description_en,
        };
      });
    } else {
      doctors.value = [];
    }
  } catch (err) {
    doctors.value = [];
  }
};

const bookDoctor = (doctor: any) => {
  bookingModal.openBookingFlow({ doctor, type: 'consultation' });
};

const openDoctorPreview = (doctor: any) => {
  selectedDoctorForPreview.value = doctor;
  isDoctorPreviewOpen.value = true;
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  DOCTORS();
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.section-container {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h4 {
      font-size: 0.86rem;
      font-weight: 700;
      color: var(--unity-text-main, #334155);
      opacity: 0.9;
      margin: 0;
      line-height: 1.3;
    }

    .header-with-badge {
      display: flex;
      align-items: center;
      gap: 5px;

      .verified-icon {
        color: #5c8042;
        font-size: 0.90rem;
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

.doctors-cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 640px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    align-items: stretch;
  }
}

.doctor-item-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--unity-shadow-subtle);

  .doc-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      opacity: 0.94;

      .clickable-doc-avatar {
        transform: scale(1.05);
      }
    }

    .doc-rating-badge {
      background: var(--unity-primary-light);
      color: var(--unity-primary);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .doc-avatar-group {
      display: flex;
      align-items: center;
      gap: 12px;

      .doc-texts {
        text-align: start;

        h5 {
          font-size: 0.94rem;
          font-weight: 700;
          color: var(--unity-text-main, #334155);
        }

        p {
          font-size: 0.76rem;
          color: var(--unity-text-muted);
          margin-top: 2px;
        }

        .doc-clinic-name {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          color: var(--unity-text-dim);
          margin-top: 4px;

          i {
            font-size: 0.7rem;
          }
        }
      }

      img, .doc-initial-avatar {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .doc-initial-avatar {
        background: linear-gradient(135deg, #415b2e 0%, #364c26 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        font-weight: 700;
      }
    }
  }

  .doc-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--unity-border-light);
    padding-top: 12px;

    .doc-availability {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.76rem;
      color: var(--unity-primary);
      font-weight: 700;

      i {
        font-size: 0.85rem;
        color: var(--unity-primary);
      }

      &.not-today {
        color: var(--unity-text-muted);
        font-weight: 600;

        i {
          color: var(--unity-text-dim, #64748b);
        }
      }
    }

    .book-appointment-btn {
      background: var(--unity-primary);
      color: #fff;
      border: none;
      padding: 8px 18px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(65, 91, 46, 0.2);
      transition: all 0.2s;

      &:hover {
        background: var(--unity-primary-dark);
        transform: translateY(-1px);
      }
    }
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 30px;
  color: var(--unity-text-muted);
  font-size: 0.85rem;
}
</style>
