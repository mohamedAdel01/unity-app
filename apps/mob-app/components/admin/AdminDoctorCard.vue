<template>
  <div 
    class="admin-doctor-card" 
    :dir="isRtl ? 'rtl' : 'ltr'" 
    :class="[isRtl ? 'card-rtl' : 'card-ltr', { 'is-inactive': !isDoctorActive }]"
  >
    <!-- 1. Doctor Profile Header -->
    <div class="doctor-profile-row">
      <!-- Right Side: Doctor Avatar + Status Dot + Titles -->
      <div class="doctor-identity-cell">
        <!-- Avatar Holder -->
        <div class="avatar-holder">
          <img 
            v-if="doctorAvatarUrl && !avatarLoadError"
            :src="doctorAvatarUrl" 
            :alt="doctorDisplayName" 
            class="avatar-photo" 
            @error="avatarLoadError = true"
          />
          <div v-else class="avatar-placeholder">
            <span v-if="doctorInitial" class="avatar-initial">{{ doctorInitial }}</span>
            <i v-else class="pi pi-user"></i>
          </div>
          <span class="status-dot" :class="isDoctorActive ? 'online' : 'offline'"></span>
        </div>

        <!-- Details -->
        <div class="doctor-details" :class="isRtl ? 'details-rtl' : 'details-ltr'">
          <div class="name-status-line">
            <h4 class="doctor-name">{{ doctorDisplayName }}</h4>
            <span class="inline-status-dot" :class="isDoctorActive ? 'online' : 'offline'"></span>
          </div>
          <p class="clinic-line">
            <span>{{ doctorDisplayClinic }}</span>
            <template v-if="doctorPhone">
              <span class="dot-separator">•</span>
              <span class="doctor-phone-tag"><i class="pi pi-phone"></i> {{ doctorPhone }}</span>
            </template>
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
            <div 
              v-if="isGearMenuOpen" 
              class="gear-dropdown-menu" 
              :class="isRtl ? 'dropdown-rtl' : 'dropdown-ltr'" 
              @click.stop
            >
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
const avatarLoadError = ref(false);

// 3. Computed (computed properties)
const isDoctorActive = computed(() => {
  if (props.doctor?.status !== undefined) return Boolean(props.doctor.status);
  return Boolean(props.doctor?.is_active ?? true);
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

  // 2. Generic description field
  if (d.description && typeof d.description === 'string' && d.description.trim()) {
    return d.description.trim();
  }

  // 3. Cross-language fallback if one language was omitted
  const fallback = isAr ? (d.description_en || '') : (d.description_ar || '');
  return typeof fallback === 'string' ? fallback.trim() : '';
});

const doctorRoom = computed(() => {
  return props.doctor?.room || props.doctor?.room_number || '';
});

const doctorPhone = computed(() => {
  return props.doctor?.user?.phone || props.doctor?.phone || '';
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
  const raw = props.doctor?.avatar || props.doctor?.avatar_url || props.doctor?.user?.avatar;
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

const doctorInitial = computed(() => {
  const name = doctorDisplayName.value;
  if (!name) return '';
  const clean = name.replace(/^د[\/.]\s*/, '').trim();
  return clean ? clean.charAt(0).toUpperCase() : '';
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
watch(
  () => [props.doctor?.avatar, props.doctor?.avatar_url, props.doctor?.user?.avatar],
  () => {
    avatarLoadError.value = false;
  }
);

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
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &.is-inactive {
    opacity: 0.72;

    &:hover {
      border-color: var(--unity-border);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    }
  }

  &[dir='ltr'],
  &.card-ltr {
    direction: ltr !important;

    .doctor-profile-row .doctor-identity-cell .doctor-details {
      text-align: left !important;
      align-items: flex-start !important;

      .doctor-description-line {
        text-align: left !important;
        direction: ltr !important;
        align-self: flex-start !important;
        width: 100%;
      }
    }
  }

  &[dir='rtl'],
  &.card-rtl {
    direction: rtl !important;

    .doctor-profile-row .doctor-identity-cell .doctor-details {
      text-align: right !important;
      align-items: flex-start !important;

      .doctor-description-line {
        text-align: right !important;
        direction: rtl !important;
        align-self: flex-start !important;
        width: 100%;
      }
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
          background: var(--unity-surface-soft);
          border: 1.5px solid var(--unity-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--unity-text-dim);
          font-size: 1.25rem;

          .avatar-initial {
            font-size: 1.05rem;
            font-weight: 800;
            color: var(--unity-primary);
          }
        }

        .status-dot {
          position: absolute;
          bottom: 1px;
          inset-inline-end: 1px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid var(--unity-surface);

          &.online {
            background: var(--unity-accent);
          }

          &.offline {
            background: #94a3b8;
          }
        }
      }

      .doctor-details {
        display: flex;
        flex-direction: column;
        text-align: start;
        min-width: 0;
        flex: 1;

        &.details-ltr {
          text-align: left !important;

          .doctor-description-line {
            text-align: left !important;
            direction: ltr !important;
          }
        }

        &.details-rtl {
          text-align: right !important;

          .doctor-description-line {
            text-align: right !important;
            direction: rtl !important;
          }
        }

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
              background: var(--unity-accent);
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

          .doctor-phone-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            color: var(--unity-primary);
            font-weight: 600;

            i {
              font-size: 0.68rem;
            }
          }
        }

        .doctor-description-line {
          font-size: 0.76rem;
          color: var(--unity-text-muted);
          line-height: 1.4;
          margin-top: 3px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
          unicode-bidi: plaintext;
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
        background: var(--unity-surface);
        border: 1.5px solid var(--unity-border);
        color: var(--unity-text-muted);
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
          background: var(--unity-primary-light);
          border-color: var(--unity-primary);
          color: var(--unity-primary);

          :global([data-theme='dark']) &,
          :global(html.dark) & {
            background: rgba(var(--unity-accent-rgb), 0.14);
            border-color: var(--unity-accent);
            color: var(--unity-accent-light);
          }

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
          background: var(--unity-primary-hover);

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
    min-width: 220px;
    background: var(--unity-surface);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--unity-border, rgba(226, 232, 240, 0.95));
    border-radius: 18px;
    box-shadow: 
      0 16px 36px -4px rgba(15, 23, 42, 0.12),
      0 6px 14px -2px rgba(15, 23, 42, 0.06);
    padding: 7px;
    z-index: 70;
    display: flex;
    flex-direction: column;
    gap: 3px;

    :global([data-theme='dark']) &,
    :global(html.dark) & {
      background: #111827;
      border-color: #374151;
      box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.6), 0 6px 14px -2px rgba(0, 0, 0, 0.4);
    }

    // RTL mode (Arabic): button is on the left, so dropdown opens inward to the right
    &.dropdown-rtl {
      left: 0 !important;
      right: auto !important;
      direction: rtl !important;
      text-align: right !important;
      transform-origin: top left;

      .dropdown-menu-item {
        text-align: right !important;
      }
    }

    // LTR mode (English): button is on the right, so dropdown opens inward to the left
    &.dropdown-ltr {
      right: 0 !important;
      left: auto !important;
      direction: ltr !important;
      text-align: left !important;
      transform-origin: top right;

      .dropdown-menu-item {
        text-align: left !important;
      }
    }

    .dropdown-menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 10px;
      border: none;
      background: transparent;
      border-radius: 12px;
      color: var(--unity-text-main);
      cursor: pointer;
      width: 100%;
      text-align: inherit;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

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
          background: var(--unity-primary-light);
          color: var(--unity-primary);
          border: 1px solid var(--unity-primary-tint);

          :global([data-theme='dark']) &,
          :global(html.dark) & {
            background: rgba(var(--unity-accent-rgb), 0.14);
            border-color: rgba(var(--unity-accent-rgb), 0.28);
            color: var(--unity-accent-light);
          }
        }

        &.icon-schedule {
          background: #f0f9ff;
          color: #0284c7;
          border: 1px solid #bae6fd;

          :global([data-theme='dark']) &,
          :global(html.dark) & {
            background: rgba(2, 132, 199, 0.14);
            border-color: rgba(2, 132, 199, 0.28);
            color: #38bdf8;
          }
        }

        &.icon-edit {
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fde68a;

          :global([data-theme='dark']) &,
          :global(html.dark) & {
            background: rgba(217, 119, 6, 0.14);
            border-color: rgba(217, 119, 6, 0.28);
            color: #fbbf24;
          }
        }
      }

      .item-title {
        font-size: 0.86rem;
        font-weight: 700;
        color: var(--unity-text-main);
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
        background: var(--unity-surface-soft, rgba(241, 245, 249, 0.8));

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          background: rgba(31, 41, 55, 0.8);
        }

        .item-icon-pill {
          transform: scale(1.06);
        }

        .item-title {
          color: var(--unity-primary);
        }

        .item-chevron {
          opacity: 1;
          color: var(--unity-primary);
        }
      }
    }

    .dropdown-menu-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--unity-border, rgba(226, 232, 240, 0.8)), transparent);
      margin: 2px 8px;

      :global([data-theme='dark']) &,
      :global(html.dark) & {
        background: #374151;
      }
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
