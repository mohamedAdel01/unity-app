<template>
  <div class="admin-doctor-card">
    <!-- 1. Doctor Profile Header -->
    <div class="doctor-profile-row">
      <!-- Right Side: Doctor Avatar + Status Dot + Titles -->
      <div class="doctor-identity-cell">
        <!-- Avatar Holder -->
        <div class="avatar-holder">
          <img 
            v-if="doctorAvatarUrl"
            :src="doctorAvatarUrl" 
            :alt="doctorDisplayName" 
            class="avatar-photo" 
          />
          <div v-else class="avatar-placeholder">
            <i class="pi pi-user"></i>
          </div>
          <span class="status-dot" :class="isDoctorActive ? 'online' : 'offline'"></span>
        </div>

        <!-- Details -->
        <div class="doctor-details">
          <div class="name-status-line">
            <h4 class="doctor-name">{{ doctorDisplayName }}</h4>
            <span class="inline-status-dot" :class="isDoctorActive ? 'online' : 'offline'"></span>
          </div>
          <p class="clinic-line">
            <span>{{ doctorDisplayClinic }}</span>
            <template v-if="doctorRoom">
              <span class="dot-separator">•</span>
              <span>{{ t('Clinic Room') }} {{ doctorRoom }}</span>
            </template>
          </p>
          <p v-if="doctorDisplayDescription" class="doctor-description-line">
            {{ doctorDisplayDescription }}
          </p>
        </div>
      </div>

      <!-- Left Side: Controls Cell (Status Switch Toggle + Gear Action with Dropdown) -->
      <div class="doctor-controls-cell" @click.stop>
        <button 
          type="button" 
          class="unity-switch-toggle" 
          :class="{ 'active': isDoctorActive }" 
          :aria-checked="isDoctorActive"
          role="switch"
          :title="isDoctorActive ? t('Open Clinic') : t('Unavailable')"
          @click.stop="emit('toggle-status', props.doctor)"
        >
          <span class="switch-slider"></span>
        </button>

        <div class="gear-menu-wrapper">
          <button 
            type="button" 
            class="btn-gear-action" 
            :class="{ 'is-active': isGearMenuOpen }"
            :title="t('Manage Doctor')" 
            :aria-label="t('Manage Doctor')"
            @click.stop="toggleGearMenu"
          >
            <i class="pi pi-cog"></i>
          </button>

          <!-- Dropdown Menu -->
          <transition name="dropdown-anim">
            <div v-if="isGearMenuOpen" class="gear-dropdown-menu" @click.stop>
              <!-- 1. Doctor Bookings / Cases -->
              <button 
                type="button" 
                class="dropdown-menu-item" 
                @click.stop="onSelectCases"
              >
                <div class="item-icon-pill icon-cases">
                  <i class="pi pi-calendar-plus"></i>
                </div>
                <span class="item-title">{{ t('Doctor Bookings') }}</span>
                <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="item-chevron"></i>
              </button>

              <div class="dropdown-menu-divider" />

              <!-- 2. Edit Schedule -->
              <button 
                type="button" 
                class="dropdown-menu-item" 
                @click.stop="onSelectSchedule"
              >
                <div class="item-icon-pill icon-schedule">
                  <i class="pi pi-clock"></i>
                </div>
                <span class="item-title">{{ t('Edit Schedule') }}</span>
                <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="item-chevron"></i>
              </button>

              <div class="dropdown-menu-divider" />

              <!-- 3. Edit Doctor Profile -->
              <button 
                type="button" 
                class="dropdown-menu-item" 
                @click.stop="onSelectEdit"
              >
                <div class="item-icon-pill icon-edit">
                  <i class="pi pi-pencil"></i>
                </div>
                <span class="item-title">{{ t('Edit Doctor') }}</span>
                <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'" class="item-chevron"></i>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- 2. Schedule Row (Optional / If provided) -->
    <div v-if="scheduleTime" class="doctor-schedule-strip">
      <i :class="isEveningSchedule ? 'pi pi-moon' : 'pi pi-clock'"></i>
      <span>{{ scheduleTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';

const props = withDefaults(
  defineProps<{
    doctor?: any;
  }>(),
  {
    doctor: () => ({}),
  }
);

const emit = defineEmits<{
  (e: 'edit', doctor: any): void;
  (e: 'edit-schedule', doctor: any): void;
  (e: 'view-cases', doctor: any): void;
  (e: 'toggle-status', doctor: any): void;
}>();

const { t, isRtl } = useI18n();
const config = useRuntimeConfig();
const baseUrl = config?.public?.API_URL || config?.public?.apiUrl || 'http://localhost:4000';

// 2. Data (refs, reactive state)
const isGearMenuOpen = ref(false);

// 3. Computed (computed properties)
const isDoctorActive = computed(() => {
  return Boolean(props.doctor?.is_active ?? (props.doctor?.status === 'active'));
});

const doctorDisplayName = computed(() => {
  const doc = props.doctor;
  if (!doc) return '';
  const isArabic = Boolean(isRtl?.value);
  if (isArabic) {
    return doc.name_ar || doc.name || doc.name_en || '';
  }
  return doc.name_en || doc.name || doc.name_ar || '';
});

const doctorDisplayClinic = computed(() => {
  const doc = props.doctor;
  if (!doc) return '';
  if (typeof doc.clinic === 'string' && doc.clinic.trim()) {
    return doc.clinic;
  }
  const isArabic = Boolean(isRtl?.value);
  if (isArabic) {
    return doc.clinic?.name_ar || doc.clinic_ar || doc.clinic?.name_en || '';
  }
  return doc.clinic?.name_en || doc.clinic_en || doc.clinic?.name_ar || '';
});

const doctorDisplayDescription = computed(() => {
  const d = props.doctor;
  if (!d) return '';
  const isAr = Boolean(isRtl?.value);

  // 1. Direct localized description fields
  if (isAr && d.description_ar && typeof d.description_ar === 'string' && d.description_ar.trim()) {
    return d.description_ar.trim();
  }
  if (!isAr && d.description_en && typeof d.description_en === 'string' && d.description_en.trim()) {
    return d.description_en.trim();
  }
  if (isAr && d.bio_ar && typeof d.bio_ar === 'string' && d.bio_ar.trim()) {
    return d.bio_ar.trim();
  }
  if (!isAr && d.bio_en && typeof d.bio_en === 'string' && d.bio_en.trim()) {
    return d.bio_en.trim();
  }

  // 2. Generic description field
  if (d.description && typeof d.description === 'string' && d.description.trim()) {
    const raw = d.description.trim();
    if (raw.startsWith('{') && raw.endsWith('}') && (raw.includes('"ar"') || raw.includes('"en"'))) {
      try {
        const p = JSON.parse(raw);
        const resolved = isAr ? (p.ar || p.en || '') : (p.en || p.ar || '');
        if (resolved) return resolved.trim();
      } catch (_) {}
    }
    return raw;
  }

  // 3. Fallback from bio field
  if (d.bio && typeof d.bio === 'string' && d.bio.trim()) {
    const raw = d.bio.trim();
    if (raw.startsWith('{') && raw.endsWith('}') && (raw.includes('"ar"') || raw.includes('"en"'))) {
      try {
        const p = JSON.parse(raw);
        const resolved = isAr ? (p.ar || p.en || '') : (p.en || p.ar || '');
        if (resolved) return resolved.trim();
      } catch (_) {}
    }
    return raw;
  }

  // 4. Cross-language fallback if one language was omitted
  const fallback = isAr
    ? (d.description_en || d.bio_en || '')
    : (d.description_ar || d.bio_ar || '');
  return typeof fallback === 'string' ? fallback.trim() : '';
});

const doctorRoom = computed(() => {
  return props.doctor?.room || props.doctor?.room_number || '';
});

const scheduleTime = computed(() => {
  return props.doctor?.schedule_time || '';
});

const isEveningSchedule = computed(() => {
  return Boolean(props.doctor?.is_evening);
});

const casesCountText = computed(() => {
  const count = props.doctor?.cases_count;
  return count !== undefined && count !== null ? String(count) : '';
});

const doctorAvatarUrl = computed(() => {
  const raw = props.doctor?.avatar || props.doctor?.avatar_url;
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  return `${baseUrl}${trimmed}`;
});

// 4. Methods (functions, handlers)
const toggleGearMenu = () => {
  isGearMenuOpen.value = !isGearMenuOpen.value;
};

const closeGearMenu = () => {
  isGearMenuOpen.value = false;
};

const onSelectCases = () => {
  closeGearMenu();
  emit('view-cases', props.doctor);
};

const onSelectSchedule = () => {
  closeGearMenu();
  emit('edit-schedule', props.doctor);
};

const onSelectEdit = () => {
  closeGearMenu();
  emit('edit', props.doctor);
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)
const onWindowClick = () => {
  closeGearMenu();
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('click', onWindowClick);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', onWindowClick);
  }
});

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-doctor-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 22px;
  padding: 16px 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 12px;
  direction: inherit;

  &[dir='ltr'] {
    direction: ltr;

    .doctor-profile-row .doctor-identity-cell .doctor-details {
      text-align: left;
    }
  }

  // 1. Profile Row
  .doctor-profile-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    .doctor-identity-cell {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      min-width: 0;
      flex: 1;

      .avatar-holder {
        position: relative;
        width: 48px;
        height: 48px;
        flex-shrink: 0;
        margin-top: 2px;

        .avatar-photo {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid #e2e8f0;
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
          color: #94a3b8;
          font-size: 1.25rem;
        }

        .status-dot {
          position: absolute;
          bottom: 1px;
          inset-inline-end: 1px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #ffffff;

          &.online {
            background: #10b981;
          }

          &.offline {
            background: #94a3b8;
          }
        }
      }

      .doctor-details {
        display: flex;
        flex-direction: column;
        text-align: right;
        min-width: 0;
        flex: 1;

        .name-status-line {
          display: flex;
          align-items: center;
          gap: 6px;

          .doctor-name {
            font-size: 0.98rem;
            font-weight: 800;
            color: var(--unity-text-main);
          }

          .inline-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;

            &.online {
              background: #10b981;
            }

            &.offline {
              background: #94a3b8;
            }
          }
        }

        .clinic-line {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          color: var(--unity-text-muted);
          margin-top: 2px;

          .dot-separator {
            opacity: 0.5;
          }
        }

        .doctor-description-line {
          font-size: 0.76rem;
          color: var(--unity-text-muted, #64748b);
          line-height: 1.4;
          margin-top: 3px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .doctor-controls-cell {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;

      .gear-menu-wrapper {
        position: relative;
        display: inline-flex;
      }

      .btn-gear-action {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: var(--unity-surface, #ffffff);
        border: 1.5px solid var(--unity-border, #e2e8f0);
        color: var(--unity-text-muted, #64748b);
        font-size: 1.1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.22s ease;

        i {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        &:hover,
        &.is-active {
          background: #ecfdf5;
          border-color: var(--unity-primary, #047857);
          color: var(--unity-primary, #047857);

          i {
            transform: rotate(60deg);
          }
        }

        &:active {
          transform: scale(0.94);
        }
      }

      .unity-switch-toggle {
        position: relative;
        width: 44px;
        height: 24px;
        border-radius: 9999px;
        background: #cbd5e1;
        border: none;
        padding: 2px;
        cursor: pointer;
        outline: none;
        display: inline-flex;
        align-items: center;
        transition: background-color 0.25s ease;
        flex-shrink: 0;
        direction: ltr;

        .switch-slider {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(0);
        }

        &.active {
          background: #059669;

          .switch-slider {
            transform: translateX(20px);
          }
        }
      }
    }
  }

  // 2. Schedule Strip
  .doctor-schedule-strip {
    background: #f8fafc;
    border-radius: 12px;
    padding: 8px 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--unity-text-main);

    i {
      font-size: 0.9rem;
      color: var(--unity-text-muted);
    }
  }

  // Gear Dropdown Floating Menu (Ultra-Modern Glassmorphic Style)
  .gear-dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    min-width: 220px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(226, 232, 240, 0.95);
    border-radius: 18px;
    box-shadow: 
      0 16px 36px -4px rgba(15, 23, 42, 0.12),
      0 6px 14px -2px rgba(15, 23, 42, 0.06);
    padding: 7px;
    z-index: 70;
    display: flex;
    flex-direction: column;
    gap: 3px;

    :global([dir='ltr']) &,
    :global(html[dir='ltr']) & {
      left: auto;
      right: 0;
    }

    .dropdown-menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 10px;
      border: none;
      background: transparent;
      border-radius: 12px;
      color: var(--unity-text-main, #0f172a);
      cursor: pointer;
      width: 100%;
      text-align: right;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      :global([dir='ltr']) &,
      :global(html[dir='ltr']) & {
        text-align: left;
      }

      .item-icon-pill {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.2s ease;

        i {
          font-size: 0.95rem;
        }

        &.icon-cases {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        &.icon-schedule {
          background: #f0f9ff;
          color: #0284c7;
          border: 1px solid #bae6fd;
        }

        &.icon-edit {
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fde68a;
        }
      }

      .item-title {
        font-size: 0.86rem;
        font-weight: 700;
        color: var(--unity-text-main, #0f172a);
        white-space: nowrap;
        flex: 1;
      }

      .item-chevron {
        font-size: 0.70rem;
        color: #94a3b8;
        opacity: 0.5;
        transition: all 0.2s ease;
      }

      &:hover,
      &:active {
        background: var(--unity-bg, #f8fafc);

        .item-icon-pill {
          transform: scale(1.06);
        }

        .item-title {
          color: var(--unity-primary, #047857);
        }

        .item-chevron {
          opacity: 1;
          color: var(--unity-primary, #047857);
        }
      }
    }

    .dropdown-menu-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.8), transparent);
      margin: 2px 8px;
    }
  }
}

.dropdown-anim-enter-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-anim-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 1, 1);
}

.dropdown-anim-enter-from,
.dropdown-anim-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
