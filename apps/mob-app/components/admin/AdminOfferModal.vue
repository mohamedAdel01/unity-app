<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="close">
      <div class="modal-sheet" @click.stop>
        <!-- Modal Header (Fixed at top) -->
        <div class="modal-header">
          <div class="header-icon">
            <i class="pi pi-gift"></i>
          </div>
          <div class="header-titles">
            <h4>{{ props.offer?.id ? t('Edit Offer') : t('Add New Offer') }}</h4>
            <p>{{ t('Offers can be written in both Arabic and English') }}</p>
          </div>
          <button type="button" class="close-btn" :aria-label="t('Close')" @click="close">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Form Body (Scrollable with fixed footer) -->
        <form class="modal-form-body" @submit.prevent="handleSubmit">
          <div class="form-body">
            <!-- 1. Offer Titles Section -->
            <div class="form-group">
              <label class="form-label">
                <span>{{ t('Offer Title (Arabic)') }}</span>
                <span class="req">*</span>
              </label>
              <input 
                v-model="form.title_ar" 
                type="text" 
                class="form-input" 
                dir="rtl"
                placeholder="مثال: باقة شاملة لصحة القلب والضغط" 
                required 
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <span>{{ t('Offer Title (English)') }}</span>
              </label>
              <input 
                v-model="form.title_en" 
                type="text" 
                class="form-input" 
                dir="ltr"
                placeholder="e.g. Comprehensive Heart & Vitals Checkup" 
              />
            </div>

            <!-- 2. Descriptions (Compact textareas) -->
            <div class="form-group">
              <label class="form-label">
                <span>{{ t('Description (Arabic)') }}</span>
              </label>
              <textarea 
                v-model="form.description_ar" 
                class="form-textarea" 
                dir="rtl"
                rows="2"
                placeholder="تفاصيل العرض وما تشمله الخدمة..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span>{{ t('Description (English)') }}</span>
              </label>
              <textarea 
                v-model="form.description_en" 
                class="form-textarea" 
                dir="ltr"
                rows="2"
                placeholder="Full details of the package and examinations included..."
              ></textarea>
            </div>

            <!-- 3. Pricing Grid (2-Column) -->
            <div class="form-row-grid">
              <div class="form-group">
                <label class="form-label">
                  <span>{{ t('Price Before Discount') }}</span>
                  <span class="currency-tag">({{ t('EGP') }})</span>
                </label>
                <input 
                  v-model.number="form.original_price" 
                  type="number" 
                  min="1" 
                  step="any"
                  class="form-input" 
                  placeholder="500" 
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span>{{ t('Price After Discount') }}</span>
                  <span class="currency-tag">({{ t('EGP') }})</span>
                  <span class="req">*</span>
                </label>
                <input 
                  v-model.number="form.price" 
                  type="number" 
                  min="1" 
                  step="any"
                  class="form-input highlight-price" 
                  placeholder="350" 
                  required 
                />
              </div>
            </div>

            <!-- Dynamic Discount Live Pill -->
            <div v-if="discountComputed" class="discount-live-pill">
              <div class="pill-badge">
                <i class="pi pi-tag"></i>
                <span>{{ t('Discount of') }} {{ discountComputed }}%</span>
              </div>
              <span class="pill-saving">
                {{ t('You save') }} {{ Number(form.original_price) - Number(form.price) }} {{ t('EGP') }}
              </span>
            </div>

            <!-- Duration Field -->
            <div class="form-group">
              <label class="form-label">
                <span>{{ t('Estimated Duration') }}</span>
                <span class="currency-tag">({{ t('mins') }})</span>
              </label>
              <div class="input-with-icon">
                <i class="pi pi-clock"></i>
                <input 
                  v-model.number="form.duration" 
                  type="number" 
                  min="5" 
                  max="240"
                  class="form-input" 
                  placeholder="30" 
                />
              </div>
            </div>

            <!-- 4. Compact Image Banner Dropzone -->
            <div class="form-group">
              <div class="image-header-row">
                <label class="form-label">
                  <i class="pi pi-image"></i>
                  <span>{{ t('Offer Banner / Image') }}</span>
                </label>
                <span v-if="uploadingImage" class="uploading-indicator">
                  <i class="pi pi-spin pi-spinner"></i>
                  <span>{{ t('Loading...') }}</span>
                </span>
              </div>

              <!-- Preview State (Compact Horizontal Strip) -->
              <div v-if="form.image" class="image-preview-strip">
                <img :src="resolvePreview(form.image)" alt="Offer banner" class="preview-thumb" />
                <div class="preview-meta">
                  <span class="preview-status">{{ t('Image selected successfully') }}</span>
                </div>
                <div class="preview-btns">
                  <button 
                    type="button" 
                    class="btn-icon-action" 
                    :title="t('Change Image')"
                    @click="triggerFileInput"
                  >
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button 
                    type="button" 
                    class="btn-icon-action btn-danger" 
                    :title="t('Remove Image')"
                    @click="removeImage"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>

              <!-- Empty Upload Dropzone (Compact Horizontal Strip) -->
              <div 
                v-else 
                class="upload-dropzone-compact" 
                :class="{ 'is-dragover': isDragOver }"
                @click="triggerFileInput"
                @dragover.prevent="isDragOver = true"
                @dragleave.prevent="isDragOver = false"
                @drop.prevent="handleDrop"
              >
                <div class="dropzone-icon">
                  <i class="pi pi-camera"></i>
                </div>
                <div class="dropzone-text">
                  <span class="dropzone-title">{{ t('Click to choose or drag & drop photo') }}</span>
                  <span class="dropzone-hint">{{ t('Supports JPG, PNG and WebP up to 5MB') }}</span>
                </div>
              </div>

              <input 
                ref="fileInputRef" 
                type="file" 
                accept="image/*" 
                class="hidden-file-input" 
                @change="handleFileChange" 
              />
            </div>

            <!-- 5. Active Toggle -->
            <label class="toggle-checkbox-row">
              <input v-model="form.is_active" type="checkbox" class="toggle-checkbox" />
              <span class="toggle-text">{{ t('Activate this offer immediately in the app') }}</span>
            </label>
          </div>

          <!-- Fixed Modal Footer -->
          <div class="modal-footer">
            <button type="submit" class="btn-submit" :disabled="loading || uploadingImage">
              <i v-if="loading" class="pi pi-spin pi-spinner"></i>
              <span v-else>{{ props.offer?.id ? t('Save Changes') : t('Create Offer') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed, watch, onUnmounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useUnityApi } from '../../composables/useUnityApi';
import { useAppToast } from '../../composables/useAppToast';
import { useModalState } from '../../composables/useModalState';
import { useGlobalStore } from '../../stores/global';
import { compressImageFile } from '@shared/utils/image';

const props = defineProps<{
  isOpen: boolean;
  offer?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const { t } = useI18n();
const api = useUnityApi();
const toast = useAppToast();
const globalStore = useGlobalStore();
const { registerModalOpen, registerModalClose } = useModalState();

// 2. Data (refs, reactive state)
const uploadingImage = ref(false);
const isDragOver = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const form = ref({
  title_ar: '',
  title_en: '',
  description_ar: '',
  description_en: '',
  price: 0,
  original_price: null as number | null,
  duration: 30,
  image: '',
  is_active: true,
});

// 3. Computed (computed properties)
const loading = computed(() => {
  return globalStore.loading.includes('ADMIN_CREATE_OFFER') || globalStore.loading.includes('ADMIN_UPDATE_OFFER');
});

const discountComputed = computed(() => {
  const orig = Number(form.value.original_price);
  const cur = Number(form.value.price);
  if (orig && cur && orig > cur) {
    return Math.round(((orig - cur) / orig) * 100);
  }
  return null;
});

// 4. Methods (functions, handlers)
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const resolvePreview = (url?: string) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image/')) return trimmed;
  const config = useRuntimeConfig();
  const baseUrl = (config.public?.apiUrl || 'http://localhost:4000').replace(/\/+$/, '');
  if (trimmed.includes('localhost:4000')) {
    const path = trimmed.split('localhost:4000')[1];
    return `${baseUrl}${path}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${baseUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

const processImageFile = async (file: File) => {
  if (!file) return;

  if (file.size > 15 * 1024 * 1024) {
    toast.error(t('Image size exceeds 15MB'));
    return;
  }

  try {
    uploadingImage.value = true;
    const dataUrl = await compressImageFile(file, 800, 0.82);
    form.value.image = dataUrl;

    // Immediately upload to server to get permanent WebP path
    try {
      const res = await api.apiRequest({
        service: 'ADMIN_UPLOAD_OFFER_IMAGE',
        payload: { image: dataUrl },
      });
      if (res?.data?.url) {
        form.value.image = res.data.url;
      }
    } catch (_) {
      // Fallback: keep base64 and server will save it upon form submission
    }
  } catch (_) {
    toast.error(t('Failed to process image'));
  } finally {
    uploadingImage.value = false;
  }
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processImageFile(file);
  }
};

const handleDrop = (e: DragEvent) => {
  isDragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    processImageFile(file);
  }
};

const removeImage = () => {
  form.value.image = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const close = () => {
  emit('close');
};

const handleSubmit = async () => {
  if (!form.value.title_ar.trim() && !form.value.title_en.trim()) {
    toast.error(t('Please provide offer title in Arabic and English'));
    return;
  }
  if (!form.value.price || form.value.price <= 0) {
    toast.error(t('Please enter a valid price'));
    return;
  }

  try {
    const payload = {
      title_ar: form.value.title_ar.trim(),
      title_en: form.value.title_en.trim() || form.value.title_ar.trim(),
      description_ar: form.value.description_ar.trim(),
      description_en: form.value.description_en.trim() || form.value.description_ar.trim(),
      price: Number(form.value.price),
      original_price: form.value.original_price ? Number(form.value.original_price) : null,
      duration: Number(form.value.duration) || 30,
      image: form.value.image?.trim() || null,
      is_active: form.value.is_active,
    };

    await api.apiRequest({
      service: props.offer?.id ? 'ADMIN_UPDATE_OFFER' : 'ADMIN_CREATE_OFFER',
      payload: props.offer?.id ? { id: props.offer.id, ...payload } : payload,
    });

    toast.success(props.offer?.id ? t('Offer updated successfully!') : t('Offer created successfully!'));
    emit('saved');
    close();
  } catch (err: any) {
    toast.error(err?.message || (props.offer?.id ? t('Failed to update offer') : t('Failed to save offer')));
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.offer,
  (val) => {
    if (val) {
      form.value = {
        title_ar: val.title_ar || '',
        title_en: val.title_en || '',
        description_ar: val.description_ar || '',
        description_en: val.description_en || '',
        price: Number(val.price || 0),
        original_price: val.original_price ? Number(val.original_price) : null,
        duration: Number(val.duration || 30),
        image: val.image || '',
        is_active: val.is_active !== undefined ? Boolean(val.is_active) : true,
      };
    } else {
      form.value = {
        title_ar: '',
        title_en: '',
        description_ar: '',
        description_en: '',
        price: 0,
        original_price: null,
        duration: 30,
        image: '',
        is_active: true,
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
    } else {
      registerModalClose();
    }
  }
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-sheet {
  width: 100%;
  max-width: 480px;
  height: 88vh;
  max-height: 88vh;
  overflow: hidden;
  background: var(--unity-surface);
  border-radius: 28px 28px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.18);
  animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  direction: rtl;

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .modal-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--unity-border);
    background: var(--unity-surface);

    .header-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: rgba(65, 91, 46, 0.1);
      color: var(--unity-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      flex-shrink: 0;
    }

    .header-titles {
      flex: 1;
      min-width: 0;

      h4 {
        margin: 0;
        font-size: 0.98rem;
        font-weight: 800;
        color: var(--unity-text-main);
      }

      p {
        margin: 2px 0 0;
        font-size: 0.72rem;
        color: var(--unity-text-muted);
        line-height: 1.3;
      }
    }

    .close-btn {
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
        background: var(--unity-surface-muted, #f1f5f9);
        color: var(--unity-text-main);
      }
    }
  }

  .modal-form-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .form-body {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      -webkit-overflow-scrolling: touch;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .form-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--unity-text-main);
        display: flex;
        align-items: center;
        gap: 5px;

        .currency-tag {
          font-size: 0.70rem;
          color: var(--unity-text-dim);
          font-weight: 600;
        }

        .req {
          color: #ef4444;
          font-weight: 800;
        }
      }

      .form-input {
        width: 100%;
        height: 44px;
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        border-radius: 12px;
        padding: 0 12px;
        font-size: 0.86rem;
        color: var(--unity-text-main);
        font-family: inherit;
        outline: none;
        transition: all 0.2s ease;
        box-sizing: border-box;

        &:focus {
          border-color: var(--unity-primary);
          background: var(--unity-surface);
          box-shadow: 0 0 0 3px rgba(65, 91, 46, 0.12);
        }

        &::placeholder {
          color: var(--unity-text-dim);
          font-size: 0.80rem;
        }

        &.highlight-price {
          border-color: rgba(65, 91, 46, 0.4);
          font-weight: 700;
          color: var(--unity-primary);
        }
      }

      .form-textarea {
        width: 100%;
        min-height: 56px;
        max-height: 100px;
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        border-radius: 12px;
        padding: 8px 12px;
        font-size: 0.84rem;
        color: var(--unity-text-main);
        font-family: inherit;
        outline: none;
        resize: vertical;
        transition: all 0.2s ease;
        box-sizing: border-box;

        &:focus {
          border-color: var(--unity-primary);
          background: var(--unity-surface);
          box-shadow: 0 0 0 3px rgba(65, 91, 46, 0.12);
        }

        &::placeholder {
          color: var(--unity-text-dim);
          font-size: 0.78rem;
        }
      }

      .input-with-icon {
        position: relative;
        display: flex;
        align-items: center;

        i {
          position: absolute;
          left: 12px;
          color: var(--unity-text-dim);
          font-size: 0.88rem;
          pointer-events: none;
        }

        .form-input {
          padding-left: 36px;
        }
      }
    }

    .form-row-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .discount-live-pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(65, 91, 46, 0.08);
      border: 1px solid rgba(65, 91, 46, 0.2);
      border-radius: 10px;
      padding: 6px 12px;

      .pill-badge {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.76rem;
        font-weight: 800;
        color: var(--unity-primary);

        i {
          font-size: 0.78rem;
        }
      }

      .pill-saving {
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }
    }

    .image-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;

      .uploading-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.72rem;
        color: var(--unity-primary);
        font-weight: 600;
      }
    }

    .upload-dropzone-compact {
      height: 64px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 14px;
      background: var(--unity-bg);
      border: 1.5px dashed var(--unity-border);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover, &.is-dragover {
        border-color: var(--unity-primary);
        background: rgba(65, 91, 46, 0.04);
      }

      .dropzone-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(65, 91, 46, 0.08);
        color: var(--unity-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.05rem;
        flex-shrink: 0;
      }

      .dropzone-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;

        .dropzone-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--unity-text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropzone-hint {
          font-size: 0.68rem;
          color: var(--unity-text-dim);
        }
      }
    }

    .image-preview-strip {
      height: 64px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 10px;
      background: var(--unity-bg);
      border: 1.5px solid var(--unity-border);
      border-radius: 12px;

      .preview-thumb {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .preview-meta {
        flex: 1;
        min-width: 0;

        .preview-status {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--unity-primary);
        }
      }

      .preview-btns {
        display: flex;
        align-items: center;
        gap: 6px;

        .btn-icon-action {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--unity-surface);
          border: 1px solid var(--unity-border);
          color: var(--unity-text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.82rem;
          transition: all 0.2s;

          &:hover {
            border-color: var(--unity-primary);
            color: var(--unity-primary);
          }

          &.btn-danger:hover {
            border-color: #ef4444;
            color: #ef4444;
            background: #fef2f2;
          }
        }
      }
    }

    .hidden-file-input {
      display: none;
    }

    .toggle-checkbox-row {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
      padding: 6px 0;

      .toggle-checkbox {
        width: 18px;
        height: 18px;
        accent-color: var(--unity-primary);
        cursor: pointer;
      }

      .toggle-text {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--unity-text-main);
      }
    }

    .modal-footer {
      flex: 0 0 auto;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px max(20px, env(safe-area-inset-bottom, 20px));
      border-top: 1px solid var(--unity-border);
      background: var(--unity-surface);
      margin-top: auto;
      z-index: 10;

      .btn-submit {
        width: 100%;
        flex: 1;
        height: 48px;
        background: var(--unity-primary);
        border: none;
        border-radius: 12px;
        color: #ffffff;
        font-size: 0.90rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover:not(:disabled) {
          background: var(--unity-primary-dark);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
