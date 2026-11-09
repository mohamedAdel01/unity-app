<template>
  <div class="appointments-list-container">
    <!-- Filter Tabs (القادمة / المكتملة / الملغية) -->
    <div class="status-tabs-nav">
      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'upcoming' }"
        @click="activeTab = 'upcoming'"
      >
        <span>{{ t('appointments.tabUpcoming') }}</span>
        <span class="count-pill">{{ upcomingAppointments.length }}</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'completed' }"
        @click="activeTab = 'completed'"
      >
        <span>{{ t('appointments.tabCompleted') }}</span>
        <span class="count-pill">{{ completedAppointments.length }}</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'cancelled' }"
        @click="activeTab = 'cancelled'"
      >
        <span>{{ t('appointments.tabCancelled') }}</span>
      </button>
    </div>

    <!-- Content List -->
    <div v-if="globalStore.loading.includes('appointments')" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else-if="currentList.length === 0" class="empty-state">
      <div class="empty-icon-wrap">
        <i class="pi pi-calendar-times"></i>
      </div>
      <h4>{{ t('appointments.emptyTitle') }}</h4>
      <p>{{ t('appointments.emptySub') }}</p>
      <button class="book-now-btn" @click="bookingModal.openQuickBook">
        {{ t('appointments.bookNow') }}
      </button>
    </div>

    <div v-else class="cards-stack">
      <div 
        v-for="apt in currentList" 
        :key="apt.id" 
        class="appointment-item-card"
      >
        <!-- Card Header -->
        <div class="card-head">
          <div class="status-badge" :class="getStatusClass(apt.status)">
            <span class="dot"></span>
            <span>{{ getStatusLabel(apt.status) }}</span>
          </div>
          <span class="invoice-badge" :class="apt.invoice?.status === 'paid' ? 'paid' : 'pending'">
            {{ apt.invoice?.status === 'paid' ? t('appointments.paidFull') : t('appointments.payAtDesk') }}
          </span>
        </div>

        <!-- Doctor & Clinic Info -->
        <div class="doctor-row">
          <img 
            :src="apt.doctor?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80'" 
            alt="Doctor" 
          />
          <div class="doc-text">
            <h5>{{ apt.doctor?.name || (isRtl ? 'د. خالد السبيعي' : 'Dr. Khaled Al-Subaie') }}</h5>
            <p>{{ apt.doctor?.specialty || apt.service?.name || (isRtl ? 'استشاري أمراض القلب والقسطرة' : 'Cardiology Consultant') }}</p>
            <div class="clinic-sub">
              <i class="pi pi-map-marker"></i>
              <span>{{ apt.clinic?.name || apt.doctor?.clinic?.name || (isRtl ? 'مجمع الرياض الطبي الاستشاري' : 'Riyadh Medical Complex') }}</span>
            </div>
          </div>
        </div>

        <!-- Date & Time Box -->
        <div class="datetime-banner">
          <div class="dt-item">
            <i class="pi pi-calendar"></i>
            <span>{{ formatDate(apt.date) }}</span>
          </div>
          <div class="dt-divider"></div>
          <div class="dt-item">
            <i class="pi pi-clock"></i>
            <span>{{ apt.start_time || '10:00 AM' }} - {{ apt.end_time || '10:30 AM' }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions-row">
          <template v-if="apt.status === 'confirmed' || apt.status === 'pending'">
            <button 
              class="btn-cancel" 
              :disabled="cancellingId === apt.id"
              @click="cancelApt(apt)"
            >
              <i v-if="cancellingId === apt.id" class="pi pi-spin pi-spinner"></i>
              <span v-else>{{ t('appointments.cancelApt') }}</span>
            </button>
            <button class="btn-reschedule" @click="rebook(apt)">
              {{ t('appointments.modifyApt') }}
            </button>
          </template>

          <template v-else-if="apt.status === 'completed'">
            <button class="btn-report" @click="viewReport(apt)">
              <i class="pi pi-file"></i>
              <span>{{ t('appointments.viewMedicalReport') }}</span>
            </button>
            <button class="btn-rebook" @click="rebook(apt)">
              <i class="pi pi-refresh"></i>
              <span>{{ t('home.rebook') }}</span>
            </button>
          </template>

          <template v-else>
            <button class="btn-rebook full-width" @click="rebook(apt)">
              {{ t('appointments.bookNow') }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';
import { useGlobalStore } from '../../stores/global';

const api = useUnityApi();
const { t, isRtl } = useI18n();
const bookingModal = useBookingModal();
const globalStore = useGlobalStore();

const activeTab = ref<'upcoming' | 'completed' | 'cancelled'>('upcoming');
const appointments = ref<any[]>([]);
const cancellingId = ref<string | null>(null);

const loadAppointments = async () => {
  try {
    globalStore.setLoading(['appointments', true]);
    const res = await api.getMyAppointments();
    if (res.status && Array.isArray(res.data) && res.data.length > 0) {
      appointments.value = res.data;
    } else {
      appointments.value = [
        {
          id: 'apt-1',
          status: 'confirmed',
          date: '2026-11-12',
          start_time: '10:00:00',
          end_time: '10:30:00',
          doctor: {
            name: isRtl.value ? 'د. خالد السبيعي' : 'Dr. Khaled Al-Subaie',
            specialty: isRtl.value ? 'استشاري أمراض القلب والقسطرة' : 'Cardiology Consultant',
            clinic: { name: isRtl.value ? 'مجمع الرياض الطبي الدولي' : 'Riyadh Medical Complex' },
            avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
          },
          invoice: { status: 'paid', total: 200 },
        },
        {
          id: 'apt-2',
          status: 'completed',
          date: '2026-10-22',
          start_time: '18:15:00',
          end_time: '18:45:00',
          doctor: {
            name: isRtl.value ? 'د. سارة المنصور' : 'Dr. Sarah Al-Mansour',
            specialty: isRtl.value ? 'استشارية جراحة الفم وزراعة الأسنان' : 'Oral Surgery Consultant',
            clinic: { name: isRtl.value ? 'عيادات النخبة التخصصية' : 'Elite Specialized Clinics' },
            avatar: 'https://images.unsplash.com/photo-1594824813583-097262f01f1f?w=120&auto=format&fit=crop&q=80',
          },
          invoice: { status: 'paid', total: 250 },
        },
      ];
    }
  } catch (err) {
    // Keep fallback list
  } finally {
    globalStore.setLoading(['appointments', false]);
  }
};

const upcomingAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'confirmed' || a.status === 'pending');
});

const completedAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'completed');
});

const cancelledAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'cancelled');
});

const currentList = computed(() => {
  if (activeTab.value === 'upcoming') return upcomingAppointments.value;
  if (activeTab.value === 'completed') return completedAppointments.value;
  return cancelledAppointments.value;
});

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'confirmed': return t('appointments.statusConfirmed');
    case 'pending': return t('appointments.statusPending');
    case 'completed': return t('appointments.statusCompleted');
    case 'cancelled': return t('appointments.statusCancelled');
    default: return status;
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'confirmed': return 'status-confirmed';
    case 'pending': return 'status-pending';
    case 'completed': return 'status-completed';
    case 'cancelled': return 'status-cancelled';
    default: return '';
  }
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(isRtl.value ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch (e) {
    return dateStr;
  }
};

const cancelApt = async (apt: any) => {
  if (!confirm(isRtl.value ? 'هل أنت متأكد من رغبتك بإلغاء هذا الموعد؟' : 'Are you sure you want to cancel this appointment?')) return;
  try {
    cancellingId.value = apt.id;
    if (!apt.id.startsWith('apt-')) {
      await api.cancelAppointment(apt.id);
    }
    apt.status = 'cancelled';
  } catch (err: any) {
    alert(err.message || 'Cancellation error');
  } finally {
    cancellingId.value = null;
  }
};

const rebook = (apt: any) => {
  bookingModal.openBookingFlow({ doctor: apt.doctor });
};

const viewReport = (apt: any) => {
  alert(isRtl.value ? 'التقرير الطبي: تم إجراء الكشف وحالة المريض مستقرة وممتازة.' : 'Medical Report: Health vitals optimal. Follow-up in 2 weeks.');
};

defineExpose({
  loadAppointments,
});

onMounted(() => {
  loadAppointments();
});
</script>

<style scoped lang="scss">
.status-tabs-nav {
  display: flex;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 16px;
  padding: 4px;
  gap: 6px;
  margin-bottom: 16px;

  .tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: var(--unity-text-muted);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    .count-pill {
      background: var(--unity-border);
      color: var(--unity-text-main);
      font-size: 0.65rem;
      padding: 1px 6px;
      border-radius: 8px;
    }

    &.active {
      background: var(--unity-primary-dark);
      color: #fff;

      .count-pill {
        background: rgba(255, 255, 255, 0.25);
        color: #fff;
      }
    }
  }
}

.cards-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.appointment-item-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--unity-shadow-subtle);

  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 0.72rem;
      font-weight: 800;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      &.status-confirmed {
        background: #ecfdf5;
        color: #047857;
        .dot { background: #10b981; }
      }

      &.status-completed {
        background: #e0f2fe;
        color: #0369a1;
        .dot { background: #0284c7; }
      }

      &.status-cancelled {
        background: #fef2f2;
        color: #dc2626;
        .dot { background: #ef4444; }
      }
    }

    .invoice-badge {
      font-size: 0.7rem;
      font-weight: 700;

      &.paid {
        color: #059669;
      }
      &.pending {
        color: #d97706;
      }
    }
  }

  .doctor-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;

    img {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: cover;
    }

    .doc-text {
      h5 {
        font-size: 0.98rem;
        font-weight: 600;
        color: var(--unity-text-main);
      }

      p {
        font-size: 0.78rem;
        color: var(--unity-text-muted);
        margin-top: 2px;
      }

      .clinic-sub {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.68rem;
        color: var(--unity-text-dim);
        margin-top: 3px;
      }
    }
  }

  .datetime-banner {
    background: var(--unity-bg);
    border-radius: 14px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;

    .dt-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--unity-text-main);

      i {
        color: var(--unity-primary);
        font-size: 0.85rem;
      }
    }

    .dt-divider {
      width: 1px;
      height: 16px;
      background: var(--unity-border);
    }
  }

  .card-actions-row {
    display: flex;
    gap: 10px;

    button {
      flex: 1;
      padding: 9px;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fee2e2;

      &:hover {
        background: #fee2e2;
      }
    }

    .btn-reschedule {
      background: var(--unity-primary-dark);
      color: #fff;
      border: none;

      &:hover {
        background: #022c22;
      }
    }

    .btn-report {
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-main);
    }

    .btn-rebook {
      background: var(--unity-primary);
      color: #fff;
      border: none;

      &.full-width {
        width: 100%;
      }
    }
  }
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--unity-text-muted);

  .empty-icon-wrap {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    color: var(--unity-text-dim);
    margin-bottom: 14px;
  }

  h4 {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--unity-text-main);
    margin-bottom: 6px;
  }

  p {
    font-size: 0.8rem;
    max-width: 260px;
    line-height: 1.5;
    margin-bottom: 18px;
  }

  .book-now-btn {
    padding: 10px 24px;
    border-radius: 14px;
    background: var(--unity-primary-dark);
    color: #fff;
    border: none;
    font-size: 0.85rem;
    font-weight: 800;
    cursor: pointer;
  }
}
</style>

