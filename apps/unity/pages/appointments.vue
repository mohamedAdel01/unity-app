<template>
  <div class="appointments-page">
    <!-- Top Header -->
    <div class="page-top-header">
      <button class="back-btn" @click="router.back()">
        <i class="pi pi-arrow-right"></i>
      </button>
      <h3 class="page-title">مواعيدي وحجوزاتي</h3>
      <button class="refresh-btn" @click="loadAppointments">
        <i class="pi pi-refresh" :class="{ 'pi-spin': loading }"></i>
      </button>
    </div>

    <!-- Filter Tabs (القادمة / المكتملة / الملغية) -->
    <div class="status-tabs-nav">
      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'upcoming' }"
        @click="activeTab = 'upcoming'"
      >
        <span>القادمة</span>
        <span class="count-pill">{{ upcomingAppointments.length }}</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'completed' }"
        @click="activeTab = 'completed'"
      >
        <span>المكتملة</span>
        <span class="count-pill">{{ completedAppointments.length }}</span>
      </button>

      <button 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'cancelled' }"
        @click="activeTab = 'cancelled'"
      >
        <span>الملغية</span>
      </button>
    </div>

    <!-- Content List -->
    <div class="appointments-list-container">
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <span>جاري تحميل المواعيد...</span>
      </div>

      <div v-else-if="currentList.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <i class="pi pi-calendar-times"></i>
        </div>
        <h4>لا توجد مواعيد في هذا القسم</h4>
        <p>يمكنك حجز موعد جديد في أي وقت مع نخبة الأطباء المتخصصين</p>
        <button class="book-now-btn" @click="bookingModal.openQuickBook">
          حجز موعد الآن
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
              {{ apt.invoice?.status === 'paid' ? 'مدفوع بالكامل' : 'الدفع عند الوصول' }}
            </span>
          </div>

          <!-- Doctor & Clinic Info -->
          <div class="doctor-row">
            <img 
              :src="apt.doctor?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80'" 
              alt="Doctor" 
            />
            <div class="doc-text">
              <h5>{{ apt.doctor?.name || 'د. خالد السبيعي' }}</h5>
              <p>{{ apt.doctor?.specialty || apt.service?.name || 'استشاري أمراض القلب والقسطرة' }}</p>
              <div class="clinic-sub">
                <i class="pi pi-map-marker"></i>
                <span>{{ apt.clinic?.name || apt.doctor?.clinic?.name || 'مجمع الرياض الطبي الاستشاري' }}</span>
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
              <span>{{ apt.start_time || '10:00 ص' }} - {{ apt.end_time || '10:30 ص' }}</span>
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
                <span v-else>إلغاء الموعد</span>
              </button>
              <button class="btn-reschedule" @click="rebook(apt)">
                تعديل الموعد
              </button>
            </template>

            <template v-else-if="apt.status === 'completed'">
              <button class="btn-report" @click="viewReport(apt)">
                <i class="pi pi-file"></i>
                <span>عرض التقرير الطبي</span>
              </button>
              <button class="btn-rebook" @click="rebook(apt)">
                <i class="pi pi-refresh"></i>
                <span>إعادة الحجز</span>
              </button>
            </template>

            <template v-else>
              <button class="btn-rebook full-width" @click="rebook(apt)">
                حجز موعد جديد
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUnityApi } from '../composables/useUnityApi';
import { useBookingModal } from '../composables/useBookingModal';

const router = useRouter();
const api = useUnityApi();
const bookingModal = useBookingModal();

const activeTab = ref<'upcoming' | 'completed' | 'cancelled'>('upcoming');
const appointments = ref<any[]>([]);
const loading = ref(false);
const cancellingId = ref<string | null>(null);

const loadAppointments = async () => {
  try {
    loading.value = true;
    const res = await api.getMyAppointments();
    if (res.status && Array.isArray(res.data) && res.data.length > 0) {
      appointments.value = res.data;
    } else {
      // Fallback mockup
      appointments.value = [
        {
          id: 'apt-1',
          status: 'confirmed',
          date: '2026-11-12',
          start_time: '10:00:00',
          end_time: '10:30:00',
          doctor: {
            name: 'د. خالد السبيعي',
            specialty: 'استشاري أمراض القلب والقسطرة',
            clinic: { name: 'مجمع الرياض الطبي الدولي' },
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
            name: 'د. سارة المنصور',
            specialty: 'استشارية جراحة الفم وزراعة الأسنان',
            clinic: { name: 'عيادات النخبة التخصصية' },
            avatar: 'https://images.unsplash.com/photo-1594824813583-097262f01f1f?w=120&auto=format&fit=crop&q=80',
          },
          invoice: { status: 'paid', total: 250 },
        },
      ];
    }
  } catch (err) {
    // Keep fallback list
  } finally {
    loading.value = false;
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
    case 'confirmed': return 'موعد مؤكد';
    case 'pending': return 'قيد المراجعة';
    case 'completed': return 'مكتمل';
    case 'cancelled': return 'ملغي';
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
    return d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch (e) {
    return dateStr;
  }
};

const cancelApt = async (apt: any) => {
  if (!confirm('هل أنت متأكد من رغبتك بإلغاء هذا الموعد؟')) return;
  try {
    cancellingId.value = apt.id;
    if (!apt.id.startsWith('apt-')) {
      await api.cancelAppointment(apt.id);
    }
    apt.status = 'cancelled';
  } catch (err: any) {
    alert(err.message || 'حدث خطأ أثناء الإلغاء');
  } finally {
    cancellingId.value = null;
  }
};

const rebook = (apt: any) => {
  bookingModal.openBookingFlow({ doctor: apt.doctor });
};

const viewReport = (apt: any) => {
  alert('التقرير الطبي: تم إجراء الكشف وحالة المريض مستقرة وممتازة. المتابعة بعد أسبوعين.');
};

onMounted(() => {
  loadAppointments();
});
</script>

<style scoped lang="scss">
.appointments-page {
  padding: 16px 18px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .back-btn, .refresh-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-main);
    cursor: pointer;
  }

  .page-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--unity-text-main);
  }
}

.status-tabs-nav {
  display: flex;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 16px;
  padding: 4px;
  gap: 6px;

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
    font-weight: 700;
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
        font-weight: 800;
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

