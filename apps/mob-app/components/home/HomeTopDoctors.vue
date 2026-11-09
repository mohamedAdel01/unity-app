<template>
  <section class="section-container">
    <div class="section-header">
      <div class="header-with-badge">
        <i class="pi pi-verified verified-icon"></i>
        <h4>{{ t('home.topDoctorsTitle') }}</h4>
      </div>
      <NuxtLink to="/services?tab=doctors" class="see-all-link">
        {{ t('common.viewAll') }} 
        <i :class="isRtl ? 'pi pi-angle-left' : 'pi pi-angle-right'"></i>
      </NuxtLink>
    </div>

    <div v-if="globalStore.loading.includes('doctors')" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else class="doctors-cards-list">
      <div 
        v-for="doctor in filteredDoctors" 
        :key="doctor.id" 
        class="doctor-item-card"
      >
        <div class="doc-card-header">
          <div class="doc-avatar-group">
            <img 
              :src="doctor.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80'" 
              :alt="doctor.name" 
            />
            <div class="doc-texts">
              <h5>{{ doctor.name }}</h5>
              <p>{{ doctor.specialty || doctor.clinic?.name || t('home.defaultSpecialty') }}</p>
              <div class="doc-clinic-name">
                <i class="pi pi-building"></i>
                <span>{{ doctor.clinic?.name || t('home.defaultClinicName') }}</span>
              </div>
            </div>
          </div>
          <div class="doc-rating-badge">
            <span>⭐ {{ doctor.rating || '4.9' }}</span>
          </div>
        </div>

        <div class="doc-card-footer">
          <div class="doc-availability">
            <i class="pi pi-calendar-plus"></i>
            <span>{{ doctor.availabilityText || t('home.availableToday') }}</span>
          </div>
          <button 
            class="book-appointment-btn" 
            @click="bookDoctor(doctor)"
          >
            {{ t('home.bookAppointment') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useBookingModal } from '../../composables/useBookingModal';
import { useGlobalStore } from '../../stores/global';

const props = defineProps<{
  searchQuery?: string;
  categoryFilter?: string;
}>();

const api = useUnityApi();
const { t, isRtl } = useI18n();
const bookingModal = useBookingModal();
const globalStore = useGlobalStore();

const doctors = ref<any[]>([]);

const loadDoctors = async () => {
  try {
    globalStore.setLoading(['doctors', true]);
    const res = await api.getDoctors();
    if (res.status && Array.isArray(res.data) && res.data.length > 0) {
      doctors.value = res.data.map((d: any) => ({
        id: d.id,
        name: d.user?.name || d.name,
        specialty: d.clinic?.name || (isRtl.value ? 'استشاري متخصص' : 'Specialist Consultant'),
        clinic: d.clinic,
        rating: '4.9',
        availabilityText: t('home.availableToday'),
        avatar: d.user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        consultation_fee: d.consultation_fee || 250,
      }));
    } else {
      doctors.value = [
        {
          id: 'doc-1',
          name: isRtl.value ? 'د. خالد السبيعي' : 'Dr. Khaled Al-Subaie',
          specialty: isRtl.value ? 'استشاري أمراض القلب والقسطرة' : 'Cardiology Consultant',
          clinic: { name: isRtl.value ? 'مجمع الرياض الطبي الاستشاري' : 'Riyadh Medical Complex' },
          rating: '4.9',
          availabilityText: t('home.availableToday'),
          avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
          consultation_fee: 250,
        },
        {
          id: 'doc-2',
          name: isRtl.value ? 'د. سارة المنصور' : 'Dr. Sarah Al-Mansour',
          specialty: isRtl.value ? 'استشارية جراحة الفم وزراعة الأسنان' : 'Oral & Dental Surgery Consultant',
          clinic: { name: isRtl.value ? 'عيادات النخبة التخصصية - العليا' : 'Elite Specialized Clinics' },
          rating: '4.8',
          availabilityText: t('home.availableTomorrow'),
          avatar: 'https://images.unsplash.com/photo-1594824813583-097262f01f1f?w=150&auto=format&fit=crop&q=80',
          consultation_fee: 200,
        },
        {
          id: 'doc-3',
          name: isRtl.value ? 'د. ريان الشهري' : 'Dr. Rayan Al-Shehri',
          specialty: isRtl.value ? 'استشاري طب الأسرة والمجتمع' : 'Family Medicine Consultant',
          clinic: { name: isRtl.value ? 'عيادة افتراضية معتمدة' : 'Certified Telehealth Clinic' },
          rating: '5.0',
          availabilityText: t('home.instantCall'),
          avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
          consultation_fee: 180,
        },
      ];
    }
  } catch (err) {
    // Keep fallback list
  } finally {
    globalStore.setLoading(['doctors', false]);
  }
};

const filteredDoctors = computed(() => {
  if (!props.searchQuery) return doctors.value;
  const q = props.searchQuery.toLowerCase();
  return doctors.value.filter(d => 
    d.name.toLowerCase().includes(q) || 
    d.specialty?.toLowerCase().includes(q) ||
    d.clinic?.name?.toLowerCase().includes(q)
  );
});

const bookDoctor = (doctor: any) => {
  bookingModal.openBookingFlow({ doctor });
};

onMounted(() => {
  loadDoctors();
});
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
      font-weight: 600;
      color: var(--unity-text-main);
    }

    .header-with-badge {
      display: flex;
      align-items: center;
      gap: 6px;

      .verified-icon {
        color: #10b981;
        font-size: 1.15rem;
      }
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

.doctors-cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

    .doc-rating-badge {
      background: #ecfdf5;
      color: #047857;
      font-size: 0.75rem;
      font-weight: 600;
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
          font-size: 0.98rem;
          font-weight: 600;
          color: var(--unity-text-main);
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

      img {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        object-fit: cover;
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
      color: var(--unity-text-muted);
      font-weight: 600;

      i {
        font-size: 0.85rem;
        color: var(--unity-primary);
      }
    }

    .book-appointment-btn {
      background: var(--unity-primary-dark);
      color: #fff;
      border: none;
      padding: 8px 18px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #022c22;
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

