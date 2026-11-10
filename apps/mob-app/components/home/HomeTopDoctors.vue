<template>
  <section v-if="filteredDoctors.length > 0 || globalStore.loading.includes('doctors')" class="section-container">
    <div class="section-header">
      <div class="header-with-badge">
        <i class="pi pi-verified verified-icon"></i>
        <h4>{{ t('Certified Top Doctors') }}</h4>
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
        <div class="doc-card-header">
          <div class="doc-avatar-group">
            <img 
              v-if="doctor.avatar"
              :src="doctor.avatar" 
              :alt="doctor.name" 
            />
            <div v-else class="doc-initial-avatar">
              <span>{{ (doctor.name || 'D').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="doc-texts">
              <h5>{{ doctor.name }}</h5>
              <p v-if="doctor.specialty || doctor.clinic?.name">{{ doctor.specialty || doctor.clinic?.name }}</p>
              <div v-if="doctor.clinic?.name" class="doc-clinic-name">
                <i class="pi pi-building"></i>
                <span>{{ doctor.clinic.name }}</span>
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
            <span>{{ doctor.availabilityText || t('Available Today') }}</span>
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
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
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

// 2. Data (refs, reactive state)
const doctors = ref<any[]>([]);

// 3. Computed (computed properties)
const filteredDoctors = computed(() => {
  if (!props.searchQuery) return doctors.value;
  const q = props.searchQuery.toLowerCase();
  return doctors.value.filter(d => 
    d.name.toLowerCase().includes(q) || 
    d.specialty?.toLowerCase().includes(q) ||
    d.clinic?.name?.toLowerCase().includes(q)
  );
});

// 4. Methods (functions, handlers)
const loadDoctors = async () => {
  try {
    const res = await api.apiRequest({ service: 'DOCTORS' });
    if (res && res.status && Array.isArray(res.data)) {
      doctors.value = res.data.map((d: any) => ({
        id: d.id,
        name: d.user?.name || d.name,
        specialty: d.clinic?.name || (t('Specialist Consultant')),
        clinic: d.clinic,
        rating: '4.9',
        availabilityText: t('Available Today'),
        avatar: d.user?.avatar || d.avatar || '',
        consultation_fee: d.consultation_fee || 250,
      }));
    } else {
      doctors.value = [];
    }
  } catch (err) {
    doctors.value = [];
  }
};

const bookDoctor = (doctor: any) => {
  bookingModal.openBookingFlow({ doctor });
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  loadDoctors();
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

      img, .doc-initial-avatar {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .doc-initial-avatar {
        background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
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
