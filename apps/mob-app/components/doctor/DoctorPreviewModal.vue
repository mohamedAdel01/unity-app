<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="close">
      <div class="doctor-preview-sheet" @click.stop>
        <!-- Modal Top Bar -->
        <div class="preview-header">
          <div class="header-title-wrap">
            <i class="pi pi-user header-icon"></i>
            <h4>{{ t('Doctor Profile') }}</h4>
          </div>
          <button type="button" class="btn-close" :aria-label="t('Close')" @click="close">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Scrollable Modal Content -->
        <div class="preview-body">
          <!-- Big Doctor Image Banner -->
          <div class="doctor-image-banner" @click="isImageZoomed = !isImageZoomed">
            <img 
              v-if="doctorAvatarUrl && !avatarFailed" 
              :src="doctorAvatarUrl" 
              :alt="doctorName" 
              class="banner-photo" 
              :class="{ 'is-zoomed': isImageZoomed }"
              @error="avatarFailed = true" 
            />
            <div v-else class="banner-placeholder">
              <span class="placeholder-initial">{{ (doctorName || 'D').charAt(0).toUpperCase() }}</span>
            </div>

            <!-- Floating Status / Verification Badge -->
            <div class="banner-badge">
              <i class="pi pi-verified"></i>
              <span>{{ t('Certified Doctor') }}</span>
            </div>
          </div>

          <!-- Doctor Identification Row -->
          <div class="doctor-meta-section">
            <h3 class="doctor-full-name">{{ doctorName }}</h3>
            
            <div class="doctor-tags-row">
              <span v-if="doctorClinic" class="meta-tag clinic-tag">
                <i class="pi pi-building"></i>
                <span>{{ doctorClinic }}</span>
              </span>
            </div>
          </div>

          <!-- Doctor Description Section -->
          <div class="doctor-description-section">
            <div class="section-title-row">
              <i class="pi pi-info-circle"></i>
              <h5>{{ t('About Doctor') }}</h5>
            </div>
            
            <div class="description-card">
              <p v-if="doctorDescription" class="description-text">
                {{ doctorDescription }}
              </p>
              <div v-else class="empty-description">
                <i class="pi pi-file"></i>
                <span>{{ t('No description available for this doctor yet.') }}</span>
              </div>
            </div>
          </div>

          <!-- Key Consultation Highlights (Fee & Duration) -->
          <div class="consultation-highlights-grid">
            <div v-if="consultationFee" class="highlight-card">
              <span class="highlight-label">{{ t('Consultation Fee') }}</span>
              <strong class="highlight-val">{{ consultationFee }} {{ t('EGP') }}</strong>
            </div>

            <div v-if="slotDuration" class="highlight-card">
              <span class="highlight-label">{{ t('Session Duration') }}</span>
              <strong class="highlight-val">{{ slotDuration }} {{ t('mins') }}</strong>
            </div>
          </div>
        </div>

        <!-- Sticky Footer Action -->
        <div class="preview-footer">
          <button type="button" class="btn-book-action" @click="handleBook">
            <i class="pi pi-calendar-plus"></i>
            <span>{{ t('Book Appointment') }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch, onUnmounted } from 'vue';
import { useI18n, resolveI18nText } from '../../composables/useI18n';
import { useModalState } from '../../composables/useModalState';

const props = defineProps<{
  isOpen: boolean;
  doctor?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'book', doctor: any): void;
}>();

const { t, isRtl } = useI18n();
const { registerModalOpen, registerModalClose } = useModalState();
const config = useRuntimeConfig();
const baseUrl = config.public?.API_URL || config.public?.apiUrl || 'http://localhost:4000';

// 2. Data (refs, reactive state)
const avatarFailed = ref(false);
const isImageZoomed = ref(false);

// 3. Computed (computed properties)
const doctorName = computed(() => {
  const d = props.doctor;
  if (!d) return '';
  const isAr = Boolean(isRtl.value);
  if (isAr) {
    return d.name_ar || d.name || d.name_en || '';
  }
  return d.name_en || d.name || d.name_ar || '';
});

const doctorAvatarUrl = computed(() => {
  const raw = props.doctor?.avatar || props.doctor?.avatar_url;
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('data:image/')) return trimmed;
  if (trimmed.includes('localhost:4000')) {
    const path = trimmed.split('localhost:4000')[1];
    return `${baseUrl}${path}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${baseUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
});

const doctorClinic = computed(() => {
  const d = props.doctor;
  if (!d?.clinic) return '';
  if (typeof d.clinic === 'string') return d.clinic;
  const isAr = Boolean(isRtl.value);
  return isAr ? (d.clinic.name_ar || d.clinic.name || '') : (d.clinic.name_en || d.clinic.name || '');
});

const doctorDescription = computed(() => {
  const d = props.doctor;
  if (!d) return '';
  const isAr = Boolean(isRtl.value);
  
  // 1. Direct localized description fields
  if (isAr && d.description_ar?.trim()) return d.description_ar.trim();
  if (!isAr && d.description_en?.trim()) return d.description_en.trim();

  // 2. Generic description field
  if (d.description && typeof d.description === 'string' && d.description.trim()) {
    return d.description.trim();
  }

  // 3. Fallback
  return d.description_ar || d.description_en || '';
});

const consultationFee = computed(() => {
  const f = props.doctor?.consultation_fee;
  return f !== undefined && f !== null && Number(f) > 0 ? Number(f) : null;
});

const slotDuration = computed(() => {
  const dur = props.doctor?.slot_duration;
  return dur !== undefined && dur !== null && Number(dur) > 0 ? Number(dur) : null;
});

// 4. Methods (functions, handlers)
const close = () => {
  emit('close');
};

const handleBook = () => {
  const d = props.doctor;
  close();
  if (d) {
    emit('book', d);
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      avatarFailed.value = false;
      isImageZoomed.value = false;
      registerModalOpen();
    } else {
      registerModalClose();
    }
  },
  { immediate: true }
);

// 6. Hooks (onMounted, onUnmounted, etc.)
onUnmounted(() => {
  if (props.isOpen) {
    registerModalClose();
  }
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  z-index: 120;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 640px) {
    align-items: center;
    padding: 24px;
  }
}

.doctor-preview-sheet {
  width: 100%;
  max-width: 480px;
  max-height: 88vh;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.22);
  animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;

  @media (min-width: 640px) {
    border-radius: 28px;
    max-width: 520px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  }

  :global([dir='ltr']) &,
  :global(html[dir='ltr']) & {
    direction: ltr;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  // 1. Header
  .preview-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 14px;
    border-bottom: 1px solid var(--unity-border);
    background: var(--unity-surface);

    .header-title-wrap {
      display: flex;
      align-items: center;
      gap: 10px;

      .header-icon {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        background: rgba(var(--unity-primary-rgb), 0.1);
        color: var(--unity-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
      }

      h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }
    }

    .btn-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--unity-surface-muted);
        color: var(--unity-text-main);
      }
    }
  }

  // 2. Scrollable Body
  .preview-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    -webkit-overflow-scrolling: touch;

    // Doctor Image Banner
    .doctor-image-banner {
      position: relative;
      width: 100%;
      height: 220px;
      border-radius: 20px;
      overflow: hidden;
      background: #f1f5f9;
      border: 1.5px solid var(--unity-border);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      .banner-photo {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
        transition: transform 0.35s ease;

        &.is-zoomed {
          transform: scale(1.15);
        }
      }

      .banner-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(var(--unity-primary-rgb), 0.12), rgba(var(--unity-accent-rgb), 0.06));

        .placeholder-initial {
          font-size: 4rem;
          font-weight: 900;
          color: var(--unity-primary);
          opacity: 0.8;
        }
      }

      .banner-badge {
        position: absolute;
        bottom: 12px;
        inset-inline-start: 12px;
        background: rgba(var(--unity-primary-rgb), 0.9);
        backdrop-filter: blur(8px);
        color: #ffffff;
        font-size: 0.74rem;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

        i {
          font-size: 0.8rem;
        }
      }
    }

    // Doctor Identification
    .doctor-meta-section {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .doctor-full-name {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      .doctor-tags-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;

        .meta-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 10px;
          font-size: 0.76rem;
          font-weight: 700;

          i {
            font-size: 0.82rem;
          }

          &.clinic-tag {
            background: var(--unity-primary-light);
            border: 1px solid var(--unity-primary-border);
            color: var(--unity-primary);
          }
        }
      }
    }

    // Doctor Description
    .doctor-description-section {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .section-title-row {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--unity-primary);

        i {
          font-size: 0.95rem;
        }

        h5 {
          margin: 0;
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--unity-text-main);
        }
      }

      .description-card {
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        border-radius: 16px;
        padding: 14px 16px;

        .description-text {
          margin: 0;
          font-size: 0.84rem;
          line-height: 1.6;
          color: var(--unity-text-main);
          white-space: pre-line;
        }

        .empty-description {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--unity-text-dim);
          font-size: 0.78rem;
          font-style: italic;

          i {
            font-size: 0.9rem;
          }
        }
      }
    }

    // Consultation Highlights Grid
    .consultation-highlights-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;

      .highlight-card {
        background: var(--unity-surface);
        border: 1px solid var(--unity-border);
        border-radius: 14px;
        padding: 10px 14px;
        display: flex;
        flex-direction: column;
        gap: 3px;

        .highlight-label {
          font-size: 0.72rem;
          color: var(--unity-text-dim);
          font-weight: 600;
        }

        .highlight-val {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--unity-primary);
        }
      }
    }
  }

  // 3. Footer
  .preview-footer {
    flex-shrink: 0;
    padding: 14px 20px max(20px, env(safe-area-inset-bottom, 20px));
    border-top: 1px solid var(--unity-border);
    background: var(--unity-surface);

    .btn-book-action {
      width: 100%;
      height: 48px;
      border-radius: 14px;
      background: var(--unity-primary);
      color: #ffffff;
      border: none;
      font-size: 0.92rem;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(var(--unity-primary-rgb), 0.25);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        background: var(--unity-primary-dark);
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(var(--unity-primary-rgb), 0.3);
      }

      &:active {
        transform: scale(0.98);
      }

      i {
        font-size: 1.05rem;
      }
    }
  }
}
</style>
