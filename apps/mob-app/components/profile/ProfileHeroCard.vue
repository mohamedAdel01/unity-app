<template>
  <div class="profile-hero-card">
    <!-- User Info & Avatar (Positioned on the right in RTL) -->
    <div class="user-info-row">
      <div 
        class="avatar-wrapper" 
        :title="t('Upload or change photo')"
        @click="triggerPhotoUpload"
      >
        <img 
          v-if="hasUserPhoto"
          :src="resolvedPhotoUrl" 
          alt="Profile photo" 
        />
        <div v-else class="letter-avatar-initial">
          <span>{{ getUserInitial(user?.name) }}</span>
        </div>
        <span class="active-status-dot"></span>

        <!-- Camera overlay badge for photo upload -->
        <div class="camera-badge-pill" :title="t('Change photo')">
          <i class="pi pi-camera"></i>
        </div>

        <input 
          ref="fileInputRef" 
          type="file" 
          accept="image/*" 
          class="hidden-file-input" 
          @change="onPhotoSelected" 
        />
      </div>

      <div class="text-block">
        <h3 class="user-name">{{ user?.name || '' }}</h3>
        <div v-if="user?.mrn || user?.patient?.mrn" class="mrn-tag">
          <i class="pi pi-id-card"></i>
          <span>{{ t('File No:') }} {{ user?.mrn || user?.patient?.mrn }}</span>
        </div>
        <div v-else-if="user?.phone" class="phone-sub-tag" dir="ltr">
          <span>{{ user.phone }}</span>
        </div>
      </div>
    </div>

    <!-- Edit Profile Button (Positioned on the left in RTL) -->
    <button class="edit-profile-btn" aria-label="Edit Profile" @click="emit('edit')">
      <i class="pi pi-pencil"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useAuthStore } from '../../stores/auth';
import { useAppToast } from '../../composables/useAppToast';
import { useUnityApi } from '../../composables/useUnityApi';
import { isUserUploadedPhoto, resolveAvatarUrl, getUserInitial } from '../../composables/useUserAvatar';

const props = defineProps<{
  user?: any;
}>();

const emit = defineEmits<{
  (e: 'edit'): void;
}>();

const { t } = useI18n();

const authStore = useAuthStore();

const toast = useAppToast();

const api = useUnityApi();

// 2. Data (refs, reactive state)
const fileInputRef = ref<HTMLInputElement | null>(null);

// 3. Computed (computed properties)
const hasUserPhoto = computed(() => isUserUploadedPhoto(props.user?.avatar));

const resolvedPhotoUrl = computed(() => resolveAvatarUrl(props.user?.avatar));

// 4. Methods (functions, handlers)
const triggerPhotoUpload = () => {
  fileInputRef.value?.click();
};

const onPhotoSelected = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.error(t('Please select a valid image file'));
    return;
  }

  try {
    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const img = new Image();
      img.onload = async () => {
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

          if (props.user) {
            props.user.avatar = dataUrl;
          }
          if (authStore.user) {
            authStore.user.avatar = dataUrl;
            if (typeof window !== 'undefined') {
              localStorage.setItem('unity_user', JSON.stringify(authStore.user));
            }
          }

          toast.success(t('Profile photo updated successfully!'));

          // Sync with backend if available
          try {
            const config = useRuntimeConfig();
            const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
            if (api.token.value) {
              await $fetch(`${baseUrl}/api/v1/auth/profile`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${api.token.value}` },
                body: { avatar: dataUrl },
              });
            }
          } catch {
            // LocalStorage persistence is already set
          }
        }
      };
      img.src = uploadEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  } catch {
    toast.error(t('Failed to upload photo'));
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.profile-hero-card {
  position: relative;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 24px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--unity-shadow-subtle);
  direction: rtl;

  &[dir='ltr'] {
    direction: ltr;

    .user-info-row .text-block {
      text-align: left;
    }
  }

  .user-info-row {
    display: flex;
    align-items: center;
    gap: 14px;

    .text-block {
      text-align: right;

      .user-name {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }

      .mrn-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--unity-primary);
        font-size: 0.78rem;
        font-weight: 600;
        margin-top: 4px;

        i {
          font-size: 0.8rem;
        }
      }
    }

    .avatar-wrapper {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      flex-shrink: 0;
      cursor: pointer;

      img, .letter-avatar-initial {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #fff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      }

      .letter-avatar-initial {
        background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.6rem;
        font-weight: 800;
        user-select: none;
      }

      .active-status-dot {
        position: absolute;
        top: 2px;
        inset-inline-end: 2px;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background: #10b981;
        border: 2px solid #fff;
      }

      .camera-badge-pill {
        position: absolute;
        bottom: 0;
        inset-inline-start: 0;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--unity-primary, #047857);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.65rem;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s;

        &:hover {
          transform: scale(1.1);
        }
      }

      .hidden-file-input {
        display: none;
      }
    }
  }

  .edit-profile-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--unity-bg);
    border: 1px solid var(--unity-border);
    color: var(--unity-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.85rem;
    flex-shrink: 0;
    transition: all 0.2s;

    &:hover {
      background: var(--unity-border);
      color: var(--unity-text-main);
    }
  }
}
</style>
