<template>
  <section v-if="upcomingAppointment" class="section-container">
    <div class="section-header">
      <h4>{{ t('Upcoming Appointments') }}</h4>
      <NuxtLink to="/appointments" class="see-all-link">
        {{ t('View All') }} 
        <i :class="isRtl ? 'pi pi-angle-left' : 'pi pi-angle-right'"></i>
      </NuxtLink>
    </div>

    <div class="upcoming-appointment-card">
      <div class="card-top">
        <div class="doc-profile">
          <img 
            v-if="upcomingAppointment.doctor?.avatar || upcomingAppointment.doctor?.user?.avatar"
            :src="upcomingAppointment.doctor?.avatar || upcomingAppointment.doctor?.user?.avatar" 
            alt="Doctor" 
          />
          <div v-else class="doc-avatar-initial">
            <span>{{ (upcomingAppointment.doctor?.name || upcomingAppointment.doctor?.user?.name || 'D').charAt(0).toUpperCase() }}</span>
          </div>
          <div class="doc-text">
            <h5>{{ upcomingAppointment.doctor?.name || upcomingAppointment.doctor?.user?.name || '' }}</h5>
            <span v-if="upcomingAppointment.doctor?.specialty">{{ upcomingAppointment.doctor?.specialty }}</span>
          </div>
        </div>
      </div>

      <div class="card-schedule-boxes">
        <div v-if="upcomingAppointment.start_time" class="schedule-box">
          <i class="pi pi-clock"></i>
          <div>
            <small>{{ t('Time') }}</small>
            <strong>{{ upcomingAppointment.start_time }} {{ upcomingAppointment.end_time ? '- ' + upcomingAppointment.end_time : '' }}</strong>
          </div>
        </div>

        <div v-if="upcomingAppointment.date" class="schedule-box">
          <i class="pi pi-calendar"></i>
          <div>
            <small>{{ t('Date') }}</small>
            <strong>{{ upcomingAppointment.date }}</strong>
          </div>
        </div>
      </div>

      <div class="card-action-buttons">
        <button class="btn-reschedule" @click="openReschedule(upcomingAppointment)">
          {{ t('Reschedule') }}
        </button>
        <button class="btn-view-profile" @click="viewDoctor(upcomingAppointment.doctor)">
          {{ t('View Profile') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, onMounted } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';

const api = useUnityApi();

const { t, isRtl } = useI18n();

const bookingModal = useBookingModal();

// 2. Data (refs, reactive state)
const upcomingAppointment = ref<any | null>(null);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const loadUpcoming = async () => {
  try {
    const res = await api.apiRequest({ service: 'PATIENT_APPOINTMENTS' });
    if (res && res.status && Array.isArray(res.data) && res.data.length > 0) {
      const active = res.data.find((a: any) => a.status === 'confirmed' || a.status === 'pending');
      upcomingAppointment.value = active || null;
    } else {
      upcomingAppointment.value = null;
    }
  } catch (err) {
    upcomingAppointment.value = null;
  }
};

const openReschedule = (apt: any) => {
  bookingModal.openBookingFlow({ doctor: apt.doctor });
};

const viewDoctor = (doctor: any) => {
  bookingModal.openBookingFlow({ doctor });
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  loadUpcoming();
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
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--unity-text-main);
    }

    .see-all-link {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--unity-primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 2px;
    }
  }
}

.upcoming-appointment-card {
  background: var(--unity-primary-gradient);
  border-radius: 24px;
  padding: 18px;
  color: #fff;
  box-shadow: 0 10px 25px -5px rgba(4, 120, 87, 0.35);
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .card-top .doc-profile .doc-text {
      text-align: left;
    }
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 16px;

    .doc-profile {
      display: flex;
      align-items: center;
      gap: 12px;

      img, .doc-avatar-initial {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.7);
        object-fit: cover;
        flex-shrink: 0;
      }

      .doc-avatar-initial {
        background: rgba(255, 255, 255, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        font-weight: 800;
        color: #ffffff;
      }

      .doc-text {
        text-align: right;

        h5 {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 2px;
        }

        span {
          font-size: 0.78rem;
          opacity: 0.9;
        }
      }
    }
  }

  .card-schedule-boxes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;

    .schedule-box {
      background: rgba(255, 255, 255, 0.14);
      border-radius: 14px;
      padding: 10px;
      display: flex;
      align-items: center;
      gap: 10px;

      i {
        font-size: 1.1rem;
        opacity: 0.9;
      }

      div {
        display: flex;
        flex-direction: column;

        small {
          font-size: 0.65rem;
          opacity: 0.75;
        }

        strong {
          font-size: 0.8rem;
          font-weight: 600;
        }
      }
    }
  }

  .card-action-buttons {
    display: flex;
    gap: 10px;

    button {
      flex: 1;
      padding: 10px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-reschedule {
      background: #fff;
      color: #064e3b;
    }

    .btn-view-profile {
      background: rgba(255, 255, 255, 0.18);
      color: #fff;
    }
  }
}
</style>
