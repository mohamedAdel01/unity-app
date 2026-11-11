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
          </div>

          <p v-if="patient.mrn || patient.clinic" class="mrn-clinic-line">
            <span v-if="patient.mrn">MRN - {{ patient.mrn }}</span>
            <span v-if="patient.mrn && patient.clinic" class="dot-separator">•</span>
            <span v-if="patient.clinic">{{ patient.clinic }}</span>
          </p>
        </div>
      </div>

      <!-- Left Side: Expand / Collapse Toggle Chevron -->
      <button class="expand-toggle-btn" :aria-label="isExpanded ? t('Close') : t('View All')">
        <i :class="isExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
      </button>
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

      <!-- Row 3: Next Appointment -->
      <div v-if="patient.next_appointment" class="detail-row">
        <span class="row-label">{{ t('Next Appointment') }}</span>
        <div class="next-apt-value">
          <span class="apt-green-dot"></span>
          <span>{{ patient.next_appointment }}</span>
        </div>
      </div>

      <!-- Subtle Divider -->
      <div v-if="patient.diagnosis" class="cell-divider"></div>

      <!-- Row 4: Current Diagnosis -->
      <div v-if="patient.diagnosis" class="diagnosis-box">
        <span class="row-label">{{ t('Current Diagnosis') }}</span>
        <p class="diagnosis-text">{{ patient.diagnosis }}</p>
      </div>

      <!-- Action Buttons Row -->
      <div class="actions-buttons-row">
        <!-- Edit Patient (Circle Button) -->
        <button class="btn-circle-edit" :title="t('Edit Patient')" @click="emit('edit', patient)">
          <i class="pi pi-pencil"></i>
        </button>

        <!-- Book Appointment (Outline Button) -->
        <button class="btn-book-outline" @click="emit('book', patient)">
          <i class="pi pi-calendar"></i>
          <span>{{ t('Book Appointment') }}</span>
        </button>

        <!-- View Medical File (Primary Green Button) -->
        <button class="btn-view-file-fill" @click="emit('view-file', patient)">
          <i class="pi pi-folder"></i>
          <span>{{ t('View Medical File') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import { useI18n } from '../../composables/useI18n';

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
}>();

const { t } = useI18n();

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
  const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
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
        text-align: right;

        .name-badge-line {
          display: flex;
          align-items: center;
          gap: 8px;

          .patient-name {
            font-size: 0.98rem;
            font-weight: 800;
            color: var(--unity-text-main);
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

    // 3. Actions Row
    .actions-buttons-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;

      .btn-circle-edit {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        color: var(--unity-text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.2s;

        &:hover {
          background: var(--unity-border);
          color: var(--unity-text-main);
        }
      }

      .btn-book-outline {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 9px 14px;
        border-radius: 12px;
        background: var(--unity-surface);
        border: 1.5px solid var(--unity-border);
        color: var(--unity-text-main);
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;

        i {
          font-size: 0.85rem;
          color: var(--unity-text-muted);
        }

        &:hover {
          border-color: var(--unity-primary);
          color: var(--unity-primary);

          i {
            color: var(--unity-primary);
          }
        }
      }

      .btn-view-file-fill {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: 12px;
        background: var(--unity-primary-dark);
        color: #ffffff;
        border: none;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(6, 78, 59, 0.22);
        transition: all 0.2s;
        white-space: nowrap;

        i {
          font-size: 0.9rem;
        }

        &:hover {
          background: var(--unity-primary);
          transform: translateY(-1px);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}
</style>
