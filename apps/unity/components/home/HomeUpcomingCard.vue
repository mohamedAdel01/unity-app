<template>
  <section v-if="upcomingAppointment" class="section-container">
    <div class="section-header">
      <h4>{{ t('home.upcomingTitle') }}</h4>
      <NuxtLink to="/appointments" class="see-all-link">
        {{ t('common.viewAll') }} 
        <i :class="isRtl ? 'pi pi-angle-left' : 'pi pi-angle-right'"></i>
      </NuxtLink>
    </div>

    <div class="upcoming-appointment-card">
      <div class="card-top">
        <div class="media-type-badge">
          <i class="pi pi-video"></i>
        </div>
        <div class="doc-profile">
          <div class="doc-text">
            <h5>{{ upcomingAppointment.doctor?.name || (isRtl ? 'د. جون كاميرون' : 'Dr. John Cameron') }}</h5>
            <span>{{ upcomingAppointment.doctor?.specialty || (isRtl ? 'استشاري نفسي وسلوكي' : 'Behavioral Consultant') }}</span>
          </div>
          <img 
            :src="upcomingAppointment.doctor?.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=120&auto=format&fit=crop&q=80'" 
            alt="Doctor" 
          />
        </div>
      </div>

      <div class="card-schedule-boxes">
        <div class="schedule-box">
          <i class="pi pi-clock"></i>
          <div>
            <small>{{ isRtl ? 'الوقت' : 'Time' }}</small>
            <strong>{{ upcomingAppointment.start_time || '18:00 - 18:30' }}</strong>
          </div>
        </div>

        <div class="schedule-box">
          <i class="pi pi-calendar"></i>
          <div>
            <small>{{ isRtl ? 'التاريخ' : 'Date' }}</small>
            <strong>{{ upcomingAppointment.date || (isRtl ? '15 مارس، الإثنين' : 'Monday, Mar 15') }}</strong>
          </div>
        </div>
      </div>

      <div class="card-action-buttons">
        <button class="btn-reschedule" @click="openReschedule(upcomingAppointment)">
          {{ t('home.reschedule') }}
        </button>
        <button class="btn-view-profile" @click="viewDoctor(upcomingAppointment.doctor)">
          {{ t('home.viewProfile') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';

const { t, isRtl } = useI18n();
const bookingModal = useBookingModal();

const upcomingAppointment = ref<any>({
  id: 'apt-up-1',
  doctor: {
    id: 'doc-john',
    name: 'د. جون كاميرون',
    specialty: 'استشاري نفسي وسلوكي',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
  },
  date: '15 مارس، الإثنين',
  start_time: '18:00 - 18:30',
});

const openReschedule = (apt: any) => {
  bookingModal.openBookingFlow({ doctor: apt.doctor });
};

const viewDoctor = (doctor: any) => {
  bookingModal.openBookingFlow({ doctor });
};
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

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .media-type-badge {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .doc-profile {
      display: flex;
      align-items: center;
      gap: 12px;

      .doc-text {
        text-align: right;

        h5 {
          font-size: 1rem;
          font-weight: 800;
        }

        span {
          font-size: 0.75rem;
          opacity: 0.85;
        }
      }

      img {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.6);
        object-fit: cover;
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
          font-weight: 700;
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
      font-weight: 700;
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
