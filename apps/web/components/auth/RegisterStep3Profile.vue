<template>
  <div class="step-content register-step3">
    <!-- Success Note: Account & Mobile verified -->
    <div class="account-created-banner">
      <i class="pi pi-check-circle"></i>
      <div>
        <h6>{{ t('Account & Mobile Verified!') }}</h6>
        <small>{{ t('Complete your profile or skip to continue later.') }}</small>
      </div>
    </div>

    <!-- Gender Selection -->
    <div class="input-field-group">
      <label class="field-label">{{ t('Gender') }}</label>
      <div class="gender-selector">
        <button 
          type="button" 
          class="gender-pill" 
          :class="{ 'selected': form.gender === 'male' }"
          @click="form.gender = 'male'"
        >
          <i class="pi pi-user"></i>
          <span>{{ t('Male') }}</span>
        </button>
        <button 
          type="button" 
          class="gender-pill" 
          :class="{ 'selected': form.gender === 'female' }"
          @click="form.gender = 'female'"
        >
          <i class="pi pi-heart"></i>
          <span>{{ t('Female') }}</span>
        </button>
      </div>
    </div>

    <!-- Date of Birth -->
    <div class="input-field-group">
      <label class="field-label">{{ t('Date of Birth') }}</label>
      <AppDatePickerModal v-model="form.date_of_birth" />
    </div>

    <!-- Avatar Section: Upload custom photo OR first letter of name -->
    <div class="input-field-group">
      <label class="field-label">{{ t('Profile Picture') }}</label>
      
      <div class="avatar-custom-box">
        <!-- Leading preview container: Uploaded image OR Letter initial badge -->
        <div class="avatar-visual-wrapper" @click="triggerFileUpload">
          <template v-if="form.avatar">
            <img :src="form.avatar" alt="User avatar" class="avatar-photo-preview" />
            <div class="avatar-action-badge edit-badge" :title="t('Change photo')">
              <i class="pi pi-pencil"></i>
            </div>
          </template>

          <template v-else>
            <div class="avatar-initial-badge">
              <span class="initial-char">{{ userNameInitial }}</span>
            </div>
            <div class="avatar-action-badge camera-badge" :title="t('Upload photo')">
              <i class="pi pi-camera"></i>
            </div>
          </template>
        </div>

        <!-- Trailing actions & descriptions -->
        <div class="avatar-info-panel">
          <template v-if="form.avatar">
            <div class="avatar-btn-group">
              <button type="button" class="btn-avatar-action upload" @click="triggerFileUpload">
                <i class="pi pi-refresh"></i>
                <span>{{ t('Change Photo') }}</span>
              </button>
              <button type="button" class="btn-avatar-action remove" @click="removeCustomAvatar">
                <i class="pi pi-trash"></i>
                <span>{{ t('Remove Photo') }}</span>
              </button>
            </div>
            <small class="avatar-hint-note success">
              <i class="pi pi-check"></i>
              <span>{{ t('Custom photo selected') }}</span>
            </small>
          </template>

          <template v-else>
            <button type="button" class="btn-avatar-action upload" @click="triggerFileUpload">
              <i class="pi pi-upload"></i>
              <span>{{ t('Upload Photo') }}</span>
            </button>
            <small class="avatar-hint-note">
              {{ t('Default avatar will be your first name initial, or you can upload your own photo.') }}
            </small>
          </template>

          <input 
            ref="fileInputRef" 
            type="file" 
            accept="image/*" 
            class="hidden-file-input" 
            @change="onAvatarFileChange" 
          />
        </div>
      </div>
    </div>

    <!-- Step 3 Action Buttons (Save or Skip) -->
    <div class="step-buttons-row">
      <button 
        type="button" 
        class="nav-step-btn skip-btn" 
        @click="emit('skip')"
      >
        <span>{{ t('Skip for now') }}</span>
      </button>

      <button 
        type="button" 
        class="nav-step-btn submit-btn" 
        :disabled="loading"
        @click="handleSubmit"
      >
        <i v-if="loading" class="pi pi-spin pi-spinner"></i>
        <span v-else>{{ t('Save & Continue') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';
import { useGlobalStore } from '../../stores/global';
import AppDatePickerModal from '../common/AppDatePickerModal.vue';

const props = defineProps<{
  userName?: string;
}>();

const emit = defineEmits<{
  (e: 'completed'): void;
  (e: 'skip'): void;
}>();

const api = useUnityApi();
const { t } = useI18n();
const toast = useAppToast();
const globalStore = useGlobalStore();

// 2. Data (refs, reactive state)
const form = ref({
  gender: 'male',
  avatar: '',
  date_of_birth: '1995-05-15',
});

const fileInputRef = ref<HTMLInputElement | null>(null);

// 3. Computed (computed properties)
const loading = computed(() => {
  return globalStore.loading.includes('UPDATE_PROFILE') || globalStore.loading.includes('completeRegistration');
});

const userNameInitial = computed(() => {
  const name = props.userName?.trim() || '';
  if (!name) return 'U';
  const firstGrapheme = Array.from(name)[0] || 'U';
  return firstGrapheme.toUpperCase();
});

// 4. Methods (functions, handlers)
const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

const removeCustomAvatar = () => {
  form.value.avatar = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  toast.info(t('Reverted to name initial avatar'));
};

const onAvatarFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.error(t('Please choose a valid image file (JPG or PNG).'));
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    toast.error(t('Image size too large, max 8MB.'));
    return;
  }

  const reader = new FileReader();
  reader.onload = (uploadEvent) => {
    const rawResult = uploadEvent.target?.result as string;
    const img = new Image();
    img.onload = () => {
      const maxDim = 600;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      form.value.avatar = canvas.toDataURL('image/jpeg', 0.88);
      toast.success(t('Avatar photo selected successfully!'));
    };
    img.src = rawResult;
  };
  reader.readAsDataURL(file);
};

const handleSubmit = async () => {
  try {
    await api.apiRequest({
      module: 'auth',
      service: 'UPDATE_PROFILE',
      payload: {
        gender: form.value.gender,
        avatar: form.value.avatar || undefined,
        date_of_birth: form.value.date_of_birth,
      },
      pinia: true,
    });

    toast.success(t('Profile completed successfully!'));
    emit('completed');
  } catch (err: any) {
    toast.warning(err.message || t('Saved with warnings'));
    emit('completed');
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.step-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.account-created-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  padding: 10px 12px;

  i {
    font-size: 1.3rem;
    color: #059669;
  }

  h6 {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 700;
    color: #065f46;
  }

  small {
    display: block;
    font-size: 0.72rem;
    color: #047857;
    margin-top: 2px;
    line-height: 1.3;
  }
}

.input-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .field-label {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--unity-text-main);
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
    height: 48px;
    border-radius: 12px;
    border: 1.5px solid var(--unity-border);
    background: var(--unity-bg);
    color: var(--unity-text-main);
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    i {
      font-size: 0.95rem;
      color: var(--unity-text-dim);
    }

    &.selected {
      border-color: var(--unity-primary);
      background: rgba(4, 120, 87, 0.08);
      color: var(--unity-primary);

      i {
        color: var(--unity-primary);
      }
    }
  }
}

.avatar-custom-box {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--unity-bg);
  border: 1.5px solid var(--unity-border);
  border-radius: 16px;
  padding: 12px 14px;

  .avatar-visual-wrapper {
    position: relative;
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    cursor: pointer;

    .avatar-photo-preview {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--unity-primary);
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.2);
    }

    .avatar-initial-badge {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3);
      border: 2px solid #ffffff;

      .initial-char {
        color: #ffffff;
        font-size: 1.7rem;
        font-weight: 800;
        line-height: 1;
        user-select: none;
      }
    }

    .avatar-action-badge {
      position: absolute;
      bottom: -2px;
      inset-inline-end: -2px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--unity-primary);
      color: #ffffff;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

      &.edit-badge {
        background: #0284c7;
      }
    }
  }

  .avatar-info-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;

    .avatar-btn-group {
      display: flex;
      gap: 8px;
    }

    .btn-avatar-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 36px;
      padding: 0 12px;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;

      &.upload {
        background: var(--unity-surface);
        border: 1px solid var(--unity-border);
        color: var(--unity-primary);

        i {
          color: var(--unity-primary);
        }

        &:hover {
          background: rgba(4, 120, 87, 0.08);
          border-color: var(--unity-primary);
        }
      }

      &.remove {
        background: #fef2f2;
        border: 1px solid #fee2e2;
        color: #dc2626;

        i {
          color: #dc2626;
        }

        &:hover {
          background: #fee2e2;
        }
      }
    }

    .avatar-hint-note {
      font-size: 0.7rem;
      color: var(--unity-text-dim);
      font-weight: 500;
      line-height: 1.35;

      &.success {
        color: #059669;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .hidden-file-input {
      display: none;
    }
  }
}

.nav-step-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  border-radius: 14px;
  font-size: 0.90rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.step-buttons-row {
  display: flex;
  gap: 10px;
  margin-top: 6px;

  .skip-btn {
    flex: 1;
    background: var(--unity-bg);
    border: 1.5px solid var(--unity-border);
    color: var(--unity-text-muted);

    &:hover {
      background: var(--unity-border);
      color: var(--unity-text-main);
    }
  }

  .submit-btn {
    flex: 2;
    background: var(--unity-primary);
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background: var(--unity-primary-dark);
    }
  }
}
</style>
