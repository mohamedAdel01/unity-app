<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="close">
      <div class="modal-sheet" @click.stop="isClinicDropdownOpen = false">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-title">
          <i :class="props.doctor?.id ? 'pi pi-user-edit' : 'pi pi-user-plus'"></i>
          <h4>{{ props.doctor?.id ? t('Edit Doctor') : t('Add New Doctor') }}</h4>
        </div>
        <button class="btn-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <form class="doctor-form" @submit.prevent="handleSubmit">
        <div class="form-body">
          <!-- Doctor Avatar Upload (Full section is clickable) -->
        <div 
          class="avatar-upload-section" 
          role="button" 
          tabindex="0" 
          :title="t('Upload Photo')"
          @click="triggerFileInput"
          @keydown.enter.prevent="triggerFileInput"
          @keydown.space.prevent="triggerFileInput"
        >
          <div class="avatar-preview-wrapper">
            <img 
              v-if="form.avatar" 
              :src="resolvePreview(form.avatar)" 
              alt="Doctor Avatar" 
              class="avatar-preview-img" 
            />
            <div v-else class="avatar-preview-placeholder">
              <i class="pi pi-user"></i>
            </div>

            <!-- Upload / Change Button -->
            <button 
              type="button" 
              class="btn-avatar-camera" 
              :title="t('Upload Photo')"
              :aria-label="t('Upload Photo')"
              @click.stop="triggerFileInput"
            >
              <i class="pi pi-camera"></i>
            </button>

            <!-- Delete / Clear Avatar Button -->
            <button 
              v-if="form.avatar" 
              type="button" 
              class="btn-avatar-trash" 
              :title="t('Remove Photo')"
              :aria-label="t('Remove Photo')"
              @click.stop="removeAvatar"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>

          <div class="avatar-info-hint">
            <span class="avatar-label">{{ t('Doctor Photo') }}</span>
            <span class="avatar-subtext">{{ form.avatar ? t('Click to change photo') : t('JPG, PNG or WebP') }}</span>
          </div>

          <input 
            ref="fileInputRef" 
            type="file" 
            accept="image/*" 
            class="hidden-file-input" 
            @change="handleFileChange" 
          />
        </div>

        <!-- Doctor Name (Arabic) -->
        <div class="form-group">
          <label>{{ t('Doctor Name (Arabic)') }} <span class="required">*</span></label>
          <div class="input-shell">
            <i class="pi pi-user"></i>
            <input 
              v-model="form.name_ar" 
              type="text" 
              :placeholder="t('e.g. Dr. Ahmed Al-Mansoury')" 
              dir="rtl"
              required 
              autofocus
            />
          </div>
        </div>

        <!-- Doctor Name (English) -->
        <div class="form-group">
          <label>{{ t('Doctor Name (English)') }}</label>
          <div class="input-shell">
            <i class="pi pi-user"></i>
            <input 
              v-model="form.name_en" 
              type="text" 
              placeholder="e.g. Dr. Ahmed Al-Mansoury" 
              dir="ltr"
            />
          </div>
        </div>

        <!-- Clinic Custom Dropdown (100% inside modal, never overflows screen) -->
        <div class="form-group">
          <label>{{ t('Clinic') }} <span class="required">*</span></label>
          <div class="custom-select-shell" :class="{ 'is-open': isClinicDropdownOpen }" @click.stop>
            <button 
              type="button" 
              class="select-trigger-btn" 
              @click="isClinicDropdownOpen = !isClinicDropdownOpen"
            >
              <div class="trigger-label-group">
                <i class="pi pi-building"></i>
                <span class="selected-text" :class="{ 'is-placeholder': !form.clinic_id }">
                  {{ selectedClinicName || t('Select Clinic...') }}
                </span>
              </div>
              <i class="pi pi-chevron-down chevron-icon" :class="{ 'rotated': isClinicDropdownOpen }"></i>
            </button>

            <!-- Dropdown Options List -->
            <transition name="dropdown-fade">
              <div v-if="isClinicDropdownOpen" class="dropdown-menu-list">
                <div 
                  v-for="clinic in clinics" 
                  :key="clinic.id" 
                  class="dropdown-option-item"
                  :class="{ 'is-selected': String(clinic.id) === String(form.clinic_id) }"
                  @click="selectClinic(clinic.id)"
                >
                  <div class="option-content">
                    <span class="clinic-bullet"></span>
                    <span class="clinic-name">{{ getClinicDisplayName(clinic) }}</span>
                  </div>
                  <i v-if="String(clinic.id) === String(form.clinic_id)" class="pi pi-check check-icon"></i>
                </div>

                <div v-if="clinics.length === 0" class="empty-clinics-hint">
                  {{ t('No clinics available') }}
                </div>
              </div>
            </transition>
          </div>
        </div>

        <!-- Fees (Two-Col Grid: Consultation Fee & Follow-up Fee) -->
        <div class="two-col-grid">
          <div class="form-group">
            <label>{{ t('Consultation Fee') }} ({{ t('EGP') }}) <span class="required">*</span></label>
            <div class="input-shell">
              <i class="pi pi-wallet"></i>
              <input 
                v-model="form.consultation_fee" 
                type="number" 
                min="0"
                step="1"
                placeholder="0" 
              />
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('Follow-up Fee') }} ({{ t('EGP') }})</label>
            <div class="input-shell">
              <i class="pi pi-wallet"></i>
              <input 
                v-model="form.follow_up_fee" 
                type="number" 
                min="0"
                step="1"
                placeholder="0" 
              />
            </div>
          </div>
        </div>

        <!-- Consultation Duration -->
        <div class="form-group">
          <label>{{ t('Consultation Duration') }}</label>
          <div class="input-shell">
            <i class="pi pi-clock"></i>
            <input 
              v-model="form.slot_duration" 
              type="number" 
              min="5"
              max="120"
              step="5"
              placeholder="15" 
            />
          </div>
        </div>

        <!-- Doctor Description (Arabic) -->
        <div class="form-group">
          <label>{{ t('Doctor Description (Arabic)') }}</label>
          <textarea 
            v-model="form.description_ar" 
            rows="2"
            dir="rtl"
            class="textarea-shell"
            :placeholder="t('Write doctor description, qualifications, and clinical experience in Arabic...')"
          ></textarea>
        </div>

        <!-- Doctor Description (English) -->
        <div class="form-group">
          <label>{{ t('Doctor Description (English)') }}</label>
          <textarea 
            v-model="form.description_en" 
            rows="2"
            dir="ltr"
            class="textarea-shell"
            :placeholder="t('Write doctor description, qualifications, and clinical experience in English...')"
          ></textarea>
        </div>

        </div>

        <!-- Modal Actions -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="close">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="btn-submit" :disabled="!isFormValid || loading">
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ props.doctor?.id ? t('Save Changes') : t('Register Doctor') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
  </Teleport>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import { useModalState } from '../../composables/useModalState';
import { useGlobalStore } from '../../stores/global';

interface Doctor {
  id?: string | number;
  name?: string;
  name_ar?: string;
  name_en?: string;
  user?: any;
  clinic?: any;
  clinic_id?: string | number;
  specialty?: string;
  status?: string;
  is_active?: boolean;
  consultation_fee?: number | string | null;
  follow_up_fee?: number | string | null;
  slot_duration?: number | string | null;
  bio?: string | null;
}

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    doctor?: Doctor | null;
    clinics?: any[];
  }>(),
  {
    doctor: null,
    clinics: () => [],
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', doc: any): void;
  (e: 'updated', doc: any): void;
}>();

const { t, isRtl } = useI18n();
const api = useUnityApi();
const toast = useAppToast();
const globalStore = useGlobalStore();
const { registerModalOpen, registerModalClose } = useModalState();

// 2. Data (refs, reactive state)
const isClinicDropdownOpen = ref(false);
const clinics = ref<any[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);

const form = ref<{
  name_ar: string;
  name_en: string;
  avatar: string;
  clinic_id: string | number;
  consultation_fee: number | string;
  follow_up_fee: number | string;
  slot_duration: number | string;
  bio: string;
  description_ar: string;
  description_en: string;
}>({
  name_ar: '',
  name_en: '',
  avatar: '',
  clinic_id: '',
  consultation_fee: '',
  follow_up_fee: '',
  slot_duration: '',
  bio: '',
  description_ar: '',
  description_en: '',
});

// 3. Computed (computed properties)
const loading = computed(() => {
  return globalStore.loading.includes('ADMIN_CREATE_DOCTOR') || globalStore.loading.includes('ADMIN_UPDATE_DOCTOR');
});

const selectedClinicName = computed(() => {
  if (!form.value.clinic_id) return '';
  const match = clinics.value.find((c) => String(c.id) === String(form.value.clinic_id));
  if (!match) return '';
  return getClinicDisplayName(match);
});

const isFormValid = computed(() => {
  return (
    (form.value.name_ar.trim().length >= 2 || form.value.name_en.trim().length >= 2) &&
    !!form.value.clinic_id
  );
});

// 4. Methods (functions, handlers)
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toast.error(t('Image size exceeds 5MB'));
    return;
  }

  const reader = new FileReader();
  reader.onload = (uploadEvent) => {
    form.value.avatar = (uploadEvent.target?.result as string) || '';
  };
  reader.readAsDataURL(file);
};

const removeAvatar = () => {
  form.value.avatar = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const resolvePreview = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
    return url;
  }
  const config = useRuntimeConfig();
  const baseUrl = config.public?.API_URL || config.public?.apiUrl || 'http://localhost:4000';
  return `${baseUrl}${url}`;
};

const selectClinic = (id: any) => {
  form.value.clinic_id = id;
  isClinicDropdownOpen.value = false;
};

const close = () => {
  isClinicDropdownOpen.value = false;
  form.value = {
    name_ar: '',
    name_en: '',
    avatar: '',
    clinic_id: '',
    consultation_fee: '',
    follow_up_fee: '',
    slot_duration: '',
    bio: '',
    description_ar: '',
    description_en: '',
  };
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  emit('close');
};

const getClinicDisplayName = (clinic: any) => {
  if (!clinic) return '';
  const isAr = Boolean(isRtl.value);
  if (isAr) {
    return clinic.name_ar || clinic.name || clinic.name_en || '';
  }
  return clinic.name_en || clinic.name || clinic.name_ar || '';
};

const ADMIN_CLINICS = async () => {
  try {
    const res = await api.apiRequest({ 
      service: 'ADMIN_CLINICS',
      filter: { page: 1, limit: 100 },
    });
    const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
    if (raw.length > 0) {
      clinics.value = raw.map((c: any) => ({
        id: c.id,
        name_ar: c.name_ar || '',
        name_en: c.name_en || '',
        name: getClinicDisplayName(c),
        is_active: c.is_active ?? true,
      }));
      if (!form.value.clinic_id && clinics.value.length > 0) {
        form.value.clinic_id = clinics.value[0].id;
      }
    }
  } catch (err) {
    if (props.clinics && props.clinics.length > 0) {
      clinics.value = props.clinics.map((c: any) => ({
        ...c,
        name: getClinicDisplayName(c),
      }));
    }
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value || loading.value) return;

  try {
    const matchedClinic = clinics.value.find((c) => String(c.id) === String(form.value.clinic_id)) || null;

    const numConsultation = form.value.consultation_fee !== '' && form.value.consultation_fee !== null ? Number(form.value.consultation_fee) : 0;
    const numFollowUp = form.value.follow_up_fee !== '' && form.value.follow_up_fee !== null ? Number(form.value.follow_up_fee) : 0;
    const numSlotDuration = form.value.slot_duration !== '' && form.value.slot_duration !== null ? Number(form.value.slot_duration) : 15;
    const cleanDescAr = form.value.description_ar?.trim() || '';
    const cleanDescEn = form.value.description_en?.trim() || '';
    const cleanBio = cleanDescAr || cleanDescEn ? (cleanDescAr || cleanDescEn) : (form.value.bio?.trim() || null);
    const arName = form.value.name_ar.trim();
    const enName = form.value.name_en.trim();

    const payload = {
      name_ar: arName,
      name_en: enName || null,
      avatar: form.value.avatar || null,
      clinic_id: form.value.clinic_id,
      consultation_fee: numConsultation,
      follow_up_fee: numFollowUp,
      slot_duration: numSlotDuration,
      bio: cleanBio,
      description_ar: cleanDescAr || null,
      description_en: cleanDescEn || null,
    };

    const res = await api.apiRequest({
      service: props.doctor?.id ? 'ADMIN_UPDATE_DOCTOR' : 'ADMIN_CREATE_DOCTOR',
      payload: props.doctor?.id ? { id: props.doctor.id, ...payload } : payload,
    });

    if (res?.status || res?.data) {
      const resultData = res?.data || {};
      const doctorItem = {
        ...(props.doctor?.id ? props.doctor : { status: 'active', is_active: true, schedules: [] }),
        ...resultData,
        name_ar: arName,
        name_en: enName,
        name: isRtl.value ? arName : enName,
        avatar: resultData.avatar || form.value.avatar || null,
        clinic: matchedClinic || resultData.clinic,
        clinic_id: form.value.clinic_id,
        specialty: isRtl.value ? matchedClinic?.name_ar : matchedClinic?.name_en,
        consultation_fee: numConsultation,
        follow_up_fee: numFollowUp,
        slot_duration: numSlotDuration,
        bio: cleanBio,
      };

      emit(props.doctor?.id ? 'updated' : 'created', doctorItem);
      toast.success(props.doctor?.id ? t('Doctor updated successfully!') : t('Doctor registered successfully!'));
      close();
    }
  } catch (err: any) {
    toast.error(err?.message || (props.doctor?.id ? t('Failed to update doctor') : t('Failed to register doctor')));
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.clinics,
  (newClinics) => {
    if (newClinics && newClinics.length > 0) {
      clinics.value = newClinics.map((c: any) => ({
        ...c,
        name: getClinicDisplayName(c),
      }));
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => props.doctor,
  (val) => {
    if (val) {
      let dAr = val.description_ar || val.bio_ar || '';
      let dEn = val.description_en || val.bio_en || '';
      if (!dAr && !dEn && val.bio) {
        const raw = String(val.bio).trim();
        if (raw.startsWith('{') && raw.endsWith('}') && (raw.includes('"ar"') || raw.includes('"en"'))) {
          try {
            const p = JSON.parse(raw);
            dAr = p.ar || '';
            dEn = p.en || '';
          } catch (_) {
            dAr = raw;
          }
        } else {
          dAr = raw;
        }
      }

      form.value = {
        name_ar: val.name_ar || val.name || '',
        name_en: val.name_en || '',
        avatar: val.avatar || '',
        clinic_id: val.clinic?.id || val.clinic_id || '',
        consultation_fee: val.consultation_fee !== undefined && val.consultation_fee !== null ? Number(val.consultation_fee) : '',
        follow_up_fee: val.follow_up_fee !== undefined && val.follow_up_fee !== null ? Number(val.follow_up_fee) : '',
        slot_duration: val.slot_duration !== undefined && val.slot_duration !== null ? Number(val.slot_duration) : '',
        bio: val.bio || '',
        description_ar: dAr,
        description_en: dEn,
      };
    } else {
      form.value = {
        name_ar: '',
        name_en: '',
        avatar: '',
        clinic_id: clinics.value[0]?.id || '',
        consultation_fee: '',
        follow_up_fee: '',
        slot_duration: '',
        bio: '',
        description_ar: '',
        description_en: '',
      };
    }
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      registerModalOpen();
      isClinicDropdownOpen.value = false;

      // 1. Sync from props.clinics if provided
      if (props.clinics && props.clinics.length > 0) {
        clinics.value = props.clinics.map((c: any) => ({
          ...c,
          name: getClinicDisplayName(c),
        }));
      }

      // 2. Always fetch fresh clinics list from server so newly added clinics appear immediately
      ADMIN_CLINICS();

      // 3. Populate Form
      if (props.doctor) {
        let dAr = props.doctor.description_ar || props.doctor.bio_ar || '';
        let dEn = props.doctor.description_en || props.doctor.bio_en || '';
        if (!dAr && !dEn && props.doctor.bio) {
          const raw = String(props.doctor.bio).trim();
          if (raw.startsWith('{') && raw.endsWith('}') && (raw.includes('"ar"') || raw.includes('"en"'))) {
            try {
              const p = JSON.parse(raw);
              dAr = p.ar || '';
              dEn = p.en || '';
            } catch (_) {
              dAr = raw;
            }
          } else {
            dAr = raw;
          }
        }

        form.value = {
          name_ar: props.doctor.name_ar || props.doctor.name || '',
          name_en: props.doctor.name_en || '',
          avatar: props.doctor.avatar || '',
          clinic_id: props.doctor.clinic?.id || props.doctor.clinic_id || '',
          consultation_fee: props.doctor.consultation_fee !== undefined && props.doctor.consultation_fee !== null ? Number(props.doctor.consultation_fee) : '',
          follow_up_fee: props.doctor.follow_up_fee !== undefined && props.doctor.follow_up_fee !== null ? Number(props.doctor.follow_up_fee) : '',
          slot_duration: props.doctor.slot_duration !== undefined && props.doctor.slot_duration !== null ? Number(props.doctor.slot_duration) : '',
          bio: props.doctor.bio || '',
          description_ar: dAr,
          description_en: dEn,
        };
      } else {
        const defaultClinicId = (props.clinics && props.clinics[0]?.id) || clinics.value[0]?.id || '';
        form.value = {
          name_ar: '',
          name_en: '',
          avatar: '',
          clinic_id: defaultClinicId,
          consultation_fee: '',
          follow_up_fee: '',
          slot_duration: '',
          bio: '',
          description_ar: '',
          description_en: '',
        };
      }
    } else {
      registerModalClose();
    }
  },
  { immediate: true }
);

watch(
  () => props.clinics,
  (newClinics) => {
    if (Array.isArray(newClinics) && newClinics.length > 0) {
      clinics.value = newClinics.map((c: any) => ({
        ...c,
        name: getClinicDisplayName(c),
      }));
      if (!form.value.clinic_id && clinics.value.length > 0) {
        form.value.clinic_id = clinics.value[0].id;
      }
    }
  },
  { deep: true }
);

// 6. Hooks (onMounted, onUnmounted, etc.)
onMounted(() => {
  ADMIN_CLINICS();
});

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
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-sheet {
  width: 100%;
  max-width: 480px;
  height: 88vh;
  max-height: 88vh;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.12);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;

  .modal-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 14px;
    border-bottom: 1px solid var(--unity-border-light);
    background: var(--unity-surface);
    margin-bottom: 0;

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;

      i {
        font-size: 1.25rem;
        color: var(--unity-primary);
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        padding: 8px;
        border-radius: 12px;
      }

      h4 {
        margin: 0;
        font-size: 1.05rem;
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
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: var(--unity-border);
        color: var(--unity-text-main);
      }
    }
  }

  .doctor-form {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    width: 100%;

    .form-body {
      flex: 1 1 auto;
      overflow-y: auto;
      min-height: 0;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      -webkit-overflow-scrolling: touch;

    .avatar-upload-section {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 14px;
      background: var(--unity-bg);
      border: 1.5px dashed var(--unity-border);
      border-radius: 18px;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:hover {
        border-color: var(--unity-primary);
        background: #f0fdf4;
      }

      &:active {
        transform: scale(0.995);
      }

      .avatar-preview-wrapper {
        position: relative;
        width: 64px;
        height: 64px;
        flex-shrink: 0;

        .avatar-preview-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--unity-primary);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        }

        .avatar-preview-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--unity-surface);
          border: 1.5px solid var(--unity-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 1.6rem;
        }

        .btn-avatar-camera {
          position: absolute;
          bottom: -2px;
          inset-inline-start: -2px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--unity-primary);
          color: #ffffff;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s;

          &:hover {
            transform: scale(1.1);
          }
        }

        .btn-avatar-trash {
          position: absolute;
          top: -2px;
          inset-inline-end: -2px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ef4444;
          color: #ffffff;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s;

          &:hover {
            transform: scale(1.1);
          }
        }
      }

      .avatar-info-hint {
        display: flex;
        flex-direction: column;
        gap: 2px;
        text-align: right;
        flex: 1;

        .avatar-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--unity-text-main);
        }

        .avatar-subtext {
          font-size: 0.75rem;
          color: var(--unity-text-muted);
        }
      }

      .hidden-file-input {
        display: none;
      }
    }

    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: right;

      label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--unity-text-main);

        .required {
          color: #ef4444;
          margin-inline-start: 2px;
        }
      }

      .input-shell {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        border-radius: 14px;
        padding: 0 14px;
        height: 48px;
        transition: border-color 0.2s;

        i {
          color: var(--unity-text-dim);
          font-size: 1rem;
        }

        input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 0.88rem;
          color: var(--unity-text-main);
          font-family: inherit;
        }
      }

      .textarea-shell {
        width: 100%;
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        border-radius: 14px;
        padding: 10px 14px;
        font-size: 0.88rem;
        color: var(--unity-text-main);
        font-family: inherit;
        outline: none;
        resize: none;
        box-sizing: border-box;
        transition: border-color 0.2s;

        &:focus {
          border-color: var(--unity-primary);
        }
      }

      .custom-select-shell {
        position: relative;
        width: 100%;
        box-sizing: border-box;

        .select-trigger-btn {
          width: 100%;
          height: 48px;
          background: var(--unity-bg);
          border: 1.5px solid var(--unity-border);
          border-radius: 14px;
          padding: 0 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: inherit;
          font-family: inherit;

          &:hover,
          &:focus {
            border-color: var(--unity-primary);
          }

          .trigger-label-group {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;

            i {
              color: var(--unity-text-dim);
              font-size: 1rem;
              flex-shrink: 0;
            }

            .selected-text {
              font-size: 0.88rem;
              font-weight: 600;
              color: var(--unity-text-main);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              &.is-placeholder {
                color: var(--unity-text-muted);
                font-weight: normal;
              }
            }
          }

          .chevron-icon {
            font-size: 0.8rem;
            color: var(--unity-text-dim);
            transition: transform 0.2s ease;
            flex-shrink: 0;

            &.rotated {
              transform: rotate(180deg);
            }
          }
        }

        &.is-open .select-trigger-btn {
          border-color: var(--unity-primary);
          box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
        }

        .dropdown-menu-list {
          position: absolute;
          top: calc(100% + 6px);
          inset-inline-start: 0;
          width: 100%;
          max-height: 190px;
          overflow-y: auto;
          background: var(--unity-surface);
          border: 1.5px solid var(--unity-border);
          border-radius: 14px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          z-index: 50;
          padding: 6px;
          box-sizing: border-box;

          .dropdown-option-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.15s ease;

            .option-content {
              display: flex;
              align-items: center;
              gap: 8px;

              .clinic-bullet {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: var(--unity-text-dim);
                transition: background 0.15s;
              }

              .clinic-name {
                font-size: 0.86rem;
                font-weight: 600;
                color: var(--unity-text-main);
              }
            }

            .check-icon {
              color: var(--unity-primary);
              font-size: 0.85rem;
            }

            &:hover {
              background: var(--unity-bg);
            }

            &.is-selected {
              background: rgba(4, 120, 87, 0.08);

              .clinic-bullet {
                background: var(--unity-primary);
              }

              .clinic-name {
                color: var(--unity-primary);
                font-weight: 700;
              }
            }
          }

          .empty-clinics-hint {
            padding: 12px;
            text-align: center;
            font-size: 0.8rem;
            color: var(--unity-text-muted);
          }
        }
      }
    }
  }

  .modal-actions {
    flex: 0 0 auto;
    width: 100%;
    box-sizing: border-box;
    padding: 14px 20px max(20px, env(safe-area-inset-bottom, 20px));
    border-top: 1px solid var(--unity-border);
    background: var(--unity-surface);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10;
    margin-top: auto;

    button {
      height: 48px;
      border-radius: 12px;
      font-size: 0.90rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-cancel {
      flex: 1;
      background: var(--unity-bg);
      border: 1.5px solid var(--unity-border);
      color: var(--unity-text-muted);

      &:hover {
        background: var(--unity-border);
        color: var(--unity-text-main);
      }
    }

    .btn-submit {
      flex: 2;
      background: var(--unity-primary);
      color: #fff;
      box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);

      &:hover:not(:disabled) {
        background: var(--unity-primary-dark);
      }

      &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
    }
  }
}
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
