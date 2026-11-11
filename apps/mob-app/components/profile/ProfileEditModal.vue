<template>
  <div v-if="isOpen" class="modal-backdrop" @click="close">
    <div class="modal-sheet" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-title">
          <i class="pi pi-user-edit"></i>
          <h4>{{ t('Edit Profile') }}</h4>
        </div>
        <button class="btn-close" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <form class="modal-form" @submit.prevent="handleSubmit">
        <!-- 1. Avatar Picker / Preview -->
        <div class="avatar-picker-section">
          <div 
            class="avatar-preview-wrapper"
            :title="t('Change Photo')"
            @click="triggerPhotoPicker"
          >
            <img 
              v-if="hasPreviewPhoto"
              :src="resolvedPreviewUrl" 
              alt="Profile Avatar" 
            />
            <div v-else class="letter-avatar-initial">
              <span>{{ getUserInitial(form.name) }}</span>
            </div>

            <div class="camera-pill">
              <i class="pi pi-camera"></i>
            </div>
          </div>

          <div class="avatar-actions">
            <button 
              type="button" 
              class="avatar-action-btn primary"
              @click="triggerPhotoPicker"
            >
              <i class="pi pi-upload"></i>
              <span>{{ t('Change Photo') }}</span>
            </button>
            <button 
              v-if="form.avatar" 
              type="button" 
              class="avatar-action-btn danger"
              @click="removePhoto"
            >
              <i class="pi pi-trash"></i>
              <span>{{ t('Remove Photo') }}</span>
            </button>
          </div>

          <input 
            ref="fileInputRef" 
            type="file" 
            accept="image/*" 
            class="hidden-file-input" 
            @change="onPhotoSelected" 
          />
        </div>

        <!-- 2. Full Name -->
        <div class="form-group">
          <label>{{ t('Full Name') }}</label>
          <div class="input-shell">
            <i class="pi pi-user"></i>
            <input 
              v-model="form.name" 
              type="text" 
              :placeholder="t('Full Name')"
              required 
            />
          </div>
        </div>

        <!-- 3. Date of Birth -->
        <div class="form-group">
          <label>{{ t('Date of Birth') }}</label>
          <div class="input-shell">
            <i class="pi pi-calendar"></i>
            <input 
              v-model="form.date_of_birth" 
              type="date" 
              :max="maxDate"
            />
          </div>
        </div>

        <!-- 4. Gender -->
        <div class="form-group">
          <label>{{ t('Gender') }}</label>
          <div class="gender-selector">
            <button 
              type="button" 
              class="gender-pill" 
              :class="{ active: form.gender === 'male' }"
              @click="form.gender = 'male'"
            >
              <i class="pi pi-user"></i>
              <span>{{ t('Male') }}</span>
            </button>
            <button 
              type="button" 
              class="gender-pill" 
              :class="{ active: form.gender === 'female' }"
              @click="form.gender = 'female'"
            >
              <i class="pi pi-user"></i>
              <span>{{ t('Female') }}</span>
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="close">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="btn-submit" :disabled="!isFormValid || loading">
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ t('Save Changes') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';
import { useAuthStore } from '../../stores/auth';
import { isUserUploadedPhoto, resolveAvatarUrl, getUserInitial } from '../../composables/useUserAvatar';

const props = defineProps<{
  isOpen: boolean;
  user?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'updated', user: any): void;
}>();

const { t } = useI18n();
const toast = useAppToast();
const authStore = useAuthStore();
const api = useUnityApi();

// 2. Data (refs, reactive state)
const fileInputRef = ref<HTMLInputElement | null>(null);
const loading = ref(false);

const form = ref({
  name: '',
  avatar: '',
  date_of_birth: '',
  gender: 'male',
});

// 3. Computed (computed properties)
const maxDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const isFormValid = computed(() => {
  return form.value.name.trim().length >= 2;
});

const hasPreviewPhoto = computed(() => {
  return isUserUploadedPhoto(form.value.avatar);
});

const resolvedPreviewUrl = computed(() => {
  return resolveAvatarUrl(form.value.avatar);
});

// 4. Methods (functions, handlers)
const close = () => {
  emit('close');
};

const triggerPhotoPicker = () => {
  fileInputRef.value?.click();
};

const removePhoto = () => {
  form.value.avatar = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const onPhotoSelected = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.error(t('Please select a valid image file'));
    return;
  }

  try {
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 480;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          form.value.avatar = dataUrl;
        }
      };
      img.src = uploadEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  } catch {
    toast.error(t('Failed to upload photo'));
  }
};

const initForm = () => {
  let dob = '';
  const rawDob = props.user?.patient?.date_of_birth || props.user?.date_of_birth;
  if (rawDob) {
    try {
      dob = new Date(rawDob).toISOString().split('T')[0];
    } catch {
      dob = '';
    }
  }

  form.value = {
    name: props.user?.name || '',
    avatar: props.user?.avatar || '',
    date_of_birth: dob,
    gender: props.user?.patient?.gender || props.user?.gender || 'male',
  };
};

const handleSubmit = async () => {
  if (!isFormValid.value || loading.value) return;

  try {
    loading.value = true;

    const payload: {
      name: string;
      avatar: string;
      gender: string;
      date_of_birth?: string | null;
    } = {
      name: form.value.name.trim(),
      avatar: form.value.avatar,
      gender: form.value.gender,
    };

    if (form.value.date_of_birth) {
      payload.date_of_birth = form.value.date_of_birth;
    } else {
      payload.date_of_birth = null;
    }

    const res = await api.apiRequest({
      service: 'UPDATE_PROFILE',
      payload,
    });

    const updatedUser = res?.data?.user || res?.user;
    if (updatedUser) {
      authStore.setUser(updatedUser);
      if (props.user) {
        Object.assign(props.user, updatedUser);
      }
    }

    toast.success(t('Profile updated successfully!'));
    emit('updated', updatedUser);
    close();
  } catch (err: any) {
    toast.error(err?.data?.message || err?.message || t('Failed to update profile'));
  } finally {
    loading.value = false;
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      initForm();
    }
  },
  { immediate: true }
);

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-sheet {
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 24px 20px 32px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;

      i {
        font-size: 1.2rem;
        color: var(--unity-primary);
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        padding: 8px;
        border-radius: 12px;
      }

      h4 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }
    }

    .btn-close {
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-muted);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--unity-border);
        color: var(--unity-text-main);
      }
    }
  }

  .modal-form {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .avatar-picker-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 10px 0;

      .avatar-preview-wrapper {
        position: relative;
        width: 84px;
        height: 84px;
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
          transform: scale(1.03);
        }

        img, .letter-avatar-initial {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #fff;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        }

        .letter-avatar-initial {
          background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          font-weight: 800;
        }

        .camera-pill {
          position: absolute;
          bottom: 2px;
          inset-inline-start: 2px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--unity-primary, #047857);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      }

      .avatar-actions {
        display: flex;
        align-items: center;
        gap: 8px;

        .avatar-action-btn {
          padding: 6px 12px;
          font-size: 0.78rem;
          font-weight: 600;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          border: 1px solid var(--unity-border);
          transition: all 0.2s;

          &.primary {
            background: #ecfdf5;
            color: var(--unity-primary);
            border-color: #a7f3d0;

            &:hover {
              background: #d1fae5;
            }
          }

          &.danger {
            background: #fef2f2;
            color: #ef4444;
            border-color: #fecaca;

            &:hover {
              background: #fee2e2;
            }
          }
        }
      }

      .hidden-file-input {
        display: none;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--unity-text-muted);
      }

      .input-shell {
        position: relative;
        display: flex;
        align-items: center;
        background: var(--unity-bg);
        border: 1px solid var(--unity-border);
        border-radius: 14px;
        padding: 0 14px;
        height: 48px;
        transition: all 0.2s;

        &:focus-within {
          border-color: var(--unity-primary);
          box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
        }

        i {
          color: var(--unity-text-muted);
          font-size: 1rem;
          margin-inline-end: 10px;
        }

        input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.95rem;
          color: var(--unity-text-main);
          outline: none;
          width: 100%;

          &::placeholder {
            color: var(--unity-text-muted);
            opacity: 0.7;
          }
        }
      }

      .gender-selector {
        display: flex;
        gap: 10px;

        .gender-pill {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 46px;
          border-radius: 14px;
          border: 1.5px solid var(--unity-border);
          background: var(--unity-bg);
          color: var(--unity-text-muted);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;

          i {
            font-size: 1rem;
          }

          &.active {
            border-color: var(--unity-primary);
            background: #ecfdf5;
            color: var(--unity-primary);
            box-shadow: 0 2px 8px rgba(4, 120, 87, 0.12);
          }
        }
      }
    }

    .modal-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 10px;

      button {
        flex: 1;
        height: 48px;
        border-radius: 14px;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;

        &.btn-cancel {
          background: var(--unity-bg);
          border: 1px solid var(--unity-border);
          color: var(--unity-text-muted);

          &:hover {
            background: var(--unity-border);
            color: var(--unity-text-main);
          }
        }

        &.btn-submit {
          background: var(--unity-primary);
          border: none;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          &:not(:disabled):hover {
            opacity: 0.92;
            transform: translateY(-1px);
          }
        }
      }
    }
  }
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

