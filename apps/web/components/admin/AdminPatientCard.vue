<template>
  <div class="admin-patient-card" :class="{ 'is-expanded': isExpanded }">
    <!-- ============================================== -->
    <!-- Card Header (Always visible - Click to toggle)  -->
    <!-- ============================================== -->
    <div class="card-header-bar" @click="toggleExpand">
      <!-- Right Side: Avatar + Name + Subtitle -->
      <div class="patient-main-cell">
        <!-- Avatar Holder -->
        <div class="avatar-holder">
          <img 
            v-if="patient.avatar" 
            :src="resolveAvatar(patient.avatar)" 
            :alt="patient.name" 
            class="avatar-photo" 
          />
          <div v-else class="avatar-placeholder">
            <span>{{ getInitial(patient.name) }}</span>
          </div>
          <!-- Online / Active Status Dot -->
          <span class="active-dot"></span>
        </div>

        <!-- Name & Details -->
        <div class="patient-details">
          <div class="name-badge-line">
            <h4 class="patient-name">{{ patient.name }}</h4>
            <span v-if="patient.role === 'receptionist'" class="role-badge-tag receptionist">
              <i class="pi pi-id-card"></i>
              {{ t('Receptionist') }}
            </span>
          </div>

          <p v-if="patient.clinic" class="mrn-clinic-line">
            <span>{{ patient.clinic }}</span>
          </p>
        </div>
      </div>

      <!-- Left Side: Header Controls (Quick Book + Chevron Toggle) -->
      <div class="patient-header-controls" @click.stop>
        <button 
          type="button" 
          class="header-quick-book-btn" 
          :title="t('Book Appointment')" 
          :aria-label="t('Book Appointment')" 
          @click.stop="emit('book', patient)"
        >
          <i class="pi pi-calendar-plus"></i>
          <span>{{ t('Book') }}</span>
        </button>

        <button class="expand-toggle-btn" :aria-label="isExpanded ? t('Close') : t('View All')" @click.stop="toggleExpand">
          <i :class="isExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
        </button>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- Expanded Body (Visible when isExpanded is true)-->
    <!-- ============================================== -->
    <div v-if="isExpanded" class="card-expanded-body">
      <!-- Row 1: Phone Number & National ID (Two Columns) -->
      <div class="two-col-grid">
        <div v-if="patient.phone" class="info-cell">
          <span class="cell-label">{{ t('Phone Number') }}</span>
          <span class="cell-value ltr-text">{{ formatPhone(patient.phone) }}</span>
        </div>

        <div v-if="patient.national_id" class="info-cell">
          <span class="cell-label">{{ t('National ID') }}</span>
          <span class="cell-value ltr-text">{{ maskNationalId(patient.national_id) }}</span>
        </div>
      </div>

      <!-- Row 2: Last Visit -->
      <div v-if="patient.last_visit" class="detail-row">
        <span class="row-label">{{ t('Last Visit') }}</span>
        <span class="row-value">{{ patient.last_visit }}</span>
      </div>

      <!-- Subtle Divider -->
      <div v-if="patient.diagnosis" class="cell-divider"></div>

      <!-- Row 3: Current Diagnosis -->
      <div v-if="patient.diagnosis" class="diagnosis-box">
        <span class="row-label">{{ t('Current Diagnosis') }}</span>
        <p class="diagnosis-text">{{ patient.diagnosis }}</p>
      </div>

      <!-- Bottom Action Row: Icon-only buttons side-by-side matching unified standard -->
      <div class="card-bottom-actions-row">
        <!-- 1. Edit Patient -->
        <button 
          type="button" 
          class="action-icon-btn btn-edit" 
          :title="t('Edit Patient')" 
          :aria-label="t('Edit Patient')" 
          @click.stop="emit('edit', patient)"
        >
          <i class="pi pi-pencil"></i>
        </button>

        <!-- 2. Book Appointment -->
        <button 
          type="button" 
          class="action-icon-btn btn-book" 
          :title="t('Book Appointment')" 
          :aria-label="t('Book Appointment')" 
          @click.stop="emit('book', patient)"
        >
          <i class="pi pi-calendar-plus"></i>
        </button>

        <!-- 3. Medical File -->
        <button 
          type="button" 
          class="action-icon-btn btn-file" 
          :title="t('Medical File')" 
          :aria-label="t('Medical File')" 
          @click.stop="emit('view-file', patient)"
        >
          <i class="pi pi-folder"></i>
        </button>

        <!-- 4. Change Role (Admin only: Assign as Receptionist / Revert to Patient) -->
        <button 
          v-if="isAdmin"
          type="button" 
          class="action-icon-btn btn-role" 
          :class="{ 'is-receptionist': patient.role === 'receptionist' }"
          :title="patient.role === 'receptionist' ? t('Change role to Patient') : t('Assign as Receptionist')" 
          :aria-label="t('Change Role')" 
          @click.stop="emit('change-role', patient)"
        >
          <i :class="patient.role === 'receptionist' ? 'pi pi-id-card' : 'pi pi-user-plus'"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useAuthStore } from '../../stores/auth';

const props = withDefaults(
  defineProps<{
    patient: any;
    initiallyExpanded?: boolean;
  }>(),
  {
    initiallyExpanded: false,
  }
);

const emit = defineEmits<{
  (e: 'view-file', patient: any): void;
  (e: 'book', patient: any): void;
  (e: 'edit', patient: any): void;
  (e: 'change-role', patient: any): void;
}>();

const { t } = useI18n();
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

// 2. Data (refs, reactive state)
const isExpanded = ref(props.initiallyExpanded);

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const getInitial = (name?: string) => {
  if (!name) return 'م';
  return name.trim().charAt(0);
};

const formatPhone = (phone?: string) => {
  if (!phone) return '';
  return phone;
};

const maskNationalId = (id?: string) => {
  if (!id) return '';
  if (id.length <= 4) return `••••••${id}`;
  const lastFour = id.slice(-4);
  return `••••••${lastFour}`;
};

const getBadgeClass = (badge?: string) => {
  if (!badge) return 'badge-green';
  if (badge.includes('ذهب') || badge.includes('Gold')) return 'badge-gold';
  if (badge.includes('فض') || badge.includes('Silver')) return 'badge-silver';
  if (badge.includes('اليوم') || badge.includes('Today')) return 'badge-today';
  if (badge.includes('ميدغلف') || badge.includes('Medgulf')) return 'badge-medgulf';
  if (badge.includes('الراجحي') || badge.includes('Rajhi')) return 'badge-rajhi';
  return 'badge-green';
};

const resolveAvatar = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
    return url;
  }
  const config = useRuntimeConfig();
  const baseUrl = config.public?.API_URL || config.public?.apiUrl || 'http://localhost:4000';
  return `${baseUrl}${url}`;
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-patient-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 20px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .patient-main-cell .patient-details {
      text-align: left;
    }

    .two-col-grid .info-cell,
    .detail-row,
    .diagnosis-box {
      text-align: left;
    }
  }

  &.is-expanded {
    border-color: #cbd5e1;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }

  // 1. Header Bar
  .card-header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;

    .patient-main-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;

      .avatar-holder {
        position: relative;
        width: 46px;
        height: 46px;
        flex-shrink: 0;

        .avatar-photo {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid var(--unity-border);
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #f1f5f9;
          border: 1.5px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--unity-text-muted);
        }

        .active-dot {
          position: absolute;
          bottom: 1px;
          inset-inline-end: 1px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid #ffffff;
        }
      }

      .patient-details {
        display: flex;
        flex-direction: column;
        text-align: start;

        :global(html[dir='ltr']) &,
        :global([dir='ltr']) & {
          text-align: left;
        }

        :global(html[dir='rtl']) &,
        :global([dir='rtl']) & {
          text-align: right;
        }

        .name-badge-line {
          display: flex;
          align-items: center;
          gap: 8px;

          .patient-name {
            font-size: 0.98rem;
            font-weight: 800;
            color: var(--unity-text-main);
          }

          .role-badge-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 0.68rem;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 6px;

            &.receptionist {
              background: #f5f3ff;
              color: #7c3aed;
              border: 1px solid #ddd6fe;
            }

            i {
              font-size: 0.72rem;
            }
          }

          .insurance-badge {
            font-size: 0.65rem;
            font-weight: 700;
            padding: 2px 8px;
            border-radius: 12px;

            &.badge-gold {
              background: #fef3c7;
              color: #92400e;
            }

            &.badge-silver {
              background: #f1f5f9;
              color: #475569;
            }

            &.badge-today {
              background: #ecfdf5;
              color: #047857;
              border: 1px solid #a7f3d0;
            }

            &.badge-medgulf {
              background: #e0f2fe;
              color: #0369a1;
            }

            &.badge-rajhi {
              background: #f3e8ff;
              color: #7e22ce;
            }

            &.badge-green {
              background: #d1fae5;
              color: #065f46;
            }
          }
        }

        .mrn-clinic-line {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          color: var(--unity-text-muted);
          margin-top: 2px;

          .dot-separator {
            opacity: 0.6;
          }
        }
      }
    }

    .patient-header-controls {
      display: flex;
      align-items: center;
      gap: 8px;

      .header-quick-book-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border-radius: 10px;
        border: 1px solid var(--unity-primary);
        background: var(--unity-primary-light, #ecfdf5);
        color: var(--unity-primary);
        font-size: 0.76rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

        i {
          font-size: 0.8rem;
        }

        &:hover {
          background: var(--unity-primary);
          color: #ffffff;
        }
      }
    }

    .expand-toggle-btn {
      background: transparent;
      border: none;
      color: var(--unity-text-muted);
      cursor: pointer;
      font-size: 0.9rem;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;

      &:hover {
        color: var(--unity-text-main);
      }
    }
  }

  // 2. Expanded Body
  .card-expanded-body {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--unity-border-light);
    display: flex;
    flex-direction: column;
    gap: 12px;

    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      .info-cell {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: start;

        .cell-label {
          font-size: 0.72rem;
          color: var(--unity-text-dim);
          font-weight: 500;
          margin-bottom: 2px;
          width: 100%;
        }

        .cell-value {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--unity-text-main);
          width: 100%;

          &.ltr-text {
            direction: ltr;
            text-align: right;
            unicode-bidi: isolate;

            :global([dir='ltr']) &,
            :global(html:not([dir='rtl'])) & {
              text-align: left;
            }
          }
        }
      }
    }

    .detail-row {
      display: flex;
      flex-direction: column;
      text-align: right;
      gap: 2px;

      .row-label {
        font-size: 0.72rem;
        color: var(--unity-text-dim);
        font-weight: 500;
      }

      .row-value {
        font-size: 0.82rem;
        color: var(--unity-text-main);
        font-weight: 600;
      }

      .next-apt-value {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--unity-text-main);

        .apt-green-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          flex-shrink: 0;
        }
      }
    }

    .cell-divider {
      height: 1px;
      background: var(--unity-border-light);
      margin: 2px 0;
    }

    .diagnosis-box {
      display: flex;
      flex-direction: column;
      text-align: right;
      gap: 2px;

      .row-label {
        font-size: 0.72rem;
        color: var(--unity-text-dim);
        font-weight: 500;
      }

      .diagnosis-text {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--unity-text-main);
      }
    }

    // 3. Bottom Action Row: 3 Icon-only buttons
    .card-bottom-actions-row {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      width: 100%;
      margin-top: 12px;

      :global([dir='ltr']) &,
      :global(html:not([dir='rtl'])) & {
        justify-content: flex-start;
      }

      .action-icon-btn {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 0;
        flex-shrink: 0;

        i {
          font-size: 1.15rem;
        }

        &.btn-edit {
          background: var(--unity-surface, #ffffff);
          border: 1.5px solid var(--unity-border, #e2e8f0);
          color: var(--unity-text-muted, #64748b);

          &:hover {
            background: var(--unity-surface-muted, #f8fafc);
            border-color: #cbd5e1;
            color: var(--unity-text-main, #0f172a);
            transform: translateY(-1px);
          }
        }

        &.btn-book {
          background: var(--unity-primary-light, #ecfdf5);
          border: 1.5px solid var(--unity-primary-tint, #a7f3d0);
          color: var(--unity-primary, #047857);

          :global([data-theme='dark']) &,
          :global(html.dark) & {
            background: rgba(16, 185, 129, 0.14);
            border-color: rgba(16, 185, 129, 0.28);
            color: #34d399;
          }

          &:hover {
            background: #d1fae5;
            border-color: #6ee7b7;
            transform: translateY(-1px);
          }
        }

        &.btn-file {
          background: var(--unity-primary, #047857);
          border: none;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(4, 120, 87, 0.22);

          &:hover {
            background: var(--unity-primary-dark, #065f46);
            transform: translateY(-1px);
          }
        }

        &.btn-role {
          background: #eff6ff;
          border: 1.5px solid #bfdbfe;
          color: #1d4ed8;

          &:hover {
            background: #dbeafe;
            border-color: #93c5fd;
            transform: translateY(-1px);
          }

          &.is-receptionist {
            background: #f5f3ff;
            border: 1.5px solid #ddd6fe;
            color: #7c3aed;

            &:hover {
              background: #ede9fe;
              border-color: #c4b5fd;
            }
          }
        }

        &:active {
          transform: scale(0.96);
        }
      }
    }
  }
}
</style>
