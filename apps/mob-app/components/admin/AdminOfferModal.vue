<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="close">
    <div class="modal-sheet" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-icon">
          <i class="pi pi-gift"></i>
        </div>
        <div class="header-titles">
          <h4>{{ isEdit ? t('Edit Offer') : t('Add New Offer') }}</h4>
          <p>{{ t('Offers can be written in both Arabic and English') }}</p>
        </div>
        <button type="button" class="close-btn" :aria-label="t('Close')" @click="close">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Form Body -->
      <form class="modal-form-body" @submit.prevent="handleSubmit">
        <!-- 1. Offer Titles (Bilingual Card) -->
        <div class="bilingual-card">
          <div class="card-top-tag">
            <i class="pi pi-bookmark"></i>
            <span>{{ t('Offer Titles') }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="lang-pill ar-pill">AR</span>
              <span>{{ t('Offer Title (Arabic)') }}</span>
              <span class="req">*</span>
            </label>
            <input 
              v-model="form.title_ar" 
              type="text" 
              class="form-input" 
              dir="rtl"
              placeholder="مثال: فحص شامل لصحة القلب والضغط" 
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="lang-pill en-pill">EN</span>
              <span>{{ t('Offer Title (English)') }}</span>
              <span class="req">*</span>
            </label>
            <input 
              v-model="form.title_en" 
              type="text" 
              class="form-input" 
              dir="ltr"
              placeholder="e.g. Comprehensive Heart & Vitals Checkup" 
              required 
            />
          </div>
        </div>

        <!-- 2. Offer Descriptions (Bilingual Card) -->
        <div class="bilingual-card">
          <div class="card-top-tag">
            <i class="pi pi-align-right"></i>
            <span>{{ t('Offer Descriptions') }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="lang-pill ar-pill">AR</span>
              <span>{{ t('Description (Arabic)') }}</span>
            </label>
            <textarea 
              v-model="form.description_ar" 
              class="form-textarea" 
              dir="rtl"
              rows="2"
              placeholder="تفاصيل العرض وما يشمله الفحص..."
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="lang-pill en-pill">EN</span>
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
        </div>

        <!-- 3. Pricing Grid (Only Original Price & Price After Discount) -->
        <div class="pricing-card">
          <div class="form-row-grid">
            <!-- Original Price before discount -->
            <div class="form-group">
              <label class="form-label">
                {{ t('Price Before Discount') }}
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

            <!-- Price after discount -->
            <div class="form-group">
              <label class="form-label">
                {{ t('Price After Discount') }}
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

          <!-- Dynamic Discount Preview Pill -->
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
          <div class="form-group duration-group">
            <label class="form-label">
              {{ t('Estimated Duration') }}
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
        </div>

        <!-- 4. Real Image Upload Box -->
        <div class="image-upload-card">
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

          <!-- Preview State -->
          <div v-if="form.image" class="image-preview-box">
            <img :src="resolvePreview(form.image)" alt="Offer banner" class="preview-img" />
            <div class="preview-overlay-actions">
              <button 
                type="button" 
                class="preview-action-btn btn-change" 
                :title="t('Change Image')"
                @click="triggerFileInput"
              >
                <i class="pi pi-camera"></i>
                <span>{{ t('Change Image') }}</span>
              </button>
              <button 
                type="button" 
                class="preview-action-btn btn-remove" 
                :title="t('Remove Image')"
                @click="removeImage"
              >
                <i class="pi pi-trash"></i>
                <span>{{ t('Remove Image') }}</span>
              </button>
            </div>
          </div>

          <!-- Empty Upload Dropzone -->
          <div 
            v-else 
            class="upload-dropzone" 
            :class="{ 'is-dragover': isDragOver }"
            @click="triggerFileInput"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="handleDrop"
          >
            <div class="dropzone-icon">
              <i class="pi pi-cloud-upload"></i>
            </div>
            <strong class="dropzone-title">{{ t('Click to choose or drag & drop photo') }}</strong>
            <p class="dropzone-hint">{{ t('Supports JPG, PNG and WebP up to 5MB') }}</p>
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

        <!-- Submit & Cancel Buttons -->
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="close">
            {{ t('Cancel') }}
          </button>
          <button type="submit" class="btn-submit" :disabled="loading || uploadingImage">
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            <span v-else>{{ isEdit ? t('Save Changes') : t('Create Offer') }}</span>
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
const { registerModalOpen, registerModalClose } = useModalState();

// 2. Data (refs, reactive state)
const loading = ref(false);
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
const isEdit = computed(() => Boolean(props.offer?.id));

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
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
    return url;
  }
  const config = useRuntimeConfig();
  const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
  return `${baseUrl}${url}`;
};

const processImageFile = async (file: File) => {
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toast.error(t('Image size exceeds 5MB'));
    return;
  }

  const reader = new FileReader();
  reader.onload = async (uploadEvent) => {
    const dataUrl = (uploadEvent.target?.result as string) || '';
    form.value.image = dataUrl;

    // Immediately upload to server to get permanent WebP path
    try {
      uploadingImage.value = true;
      const res = await api.apiRequest({
        service: 'ADMIN_UPLOAD_OFFER_IMAGE',
        payload: { image: dataUrl },
      });
      if (res?.data?.url) {
        form.value.image = res.data.url;
      }
    } catch (_) {
      // Fallback: keep base64 and server will save it upon form submission
    } finally {
      uploadingImage.value = false;
    }
  };
  reader.readAsDataURL(file);
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
    loading.value = true;
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

    if (isEdit.value && props.offer?.id) {
      await api.apiRequest({
        service: 'ADMIN_UPDATE_OFFER',
        payload: {
          id: props.offer.id,
          ...payload,
        },
      });
      toast.success(t('Offer updated successfully!'));
    } else {
      await api.apiRequest({
        service: 'ADMIN_CREATE_OFFER',
        payload,
      });
      toast.success(t('Offer created successfully!'));
    }

    emit('saved');
    close();
  } catch (err: any) {
    toast.error(err?.message || t('Failed to save offer'));
  } finally {
    loading.value = false;
  }
};

// 5. Watches (watch, watchEffect)
watch(
  () => props.offer,
  (val) => {
    if (val) {
      form.value = {
        title_ar: val.title_ar || val.title || '',
        title_en: val.title_en || val.title || '',
        description_ar: val.description_ar || val.description || '',
        description_en: val.description_en || val.description || '',
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
  max-height: 90vh;
  overflow-y: auto;
  background: var(--unity-surface);
  border-radius: 24px 24px 0 0;
  padding: 16px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.18);
  animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .modal-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--unity-border);

    .header-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: rgba(4, 120, 87, 0.1);
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
        font-size: 1rem;
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
    display: flex;
    flex-direction: column;
    gap: 10px;

    .bilingual-card {
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      border-radius: 14px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .card-top-tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--unity-primary);
        letter-spacing: 0.2px;

        i {
          font-size: 0.75rem;
        }
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .form-label {
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--unity-text-main);
        display: flex;
        align-items: center;
        gap: 5px;

        .lang-pill {
          font-size: 0.60rem;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
          letter-spacing: 0.5px;

          &.ar-pill {
            background: rgba(4, 120, 87, 0.12);
            color: #047857;
          }

          &.en-pill {
            background: rgba(37, 99, 235, 0.12);
            color: #2563eb;
          }
        }

        .currency-tag {
          font-size: 0.68rem;
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
        background: var(--unity-surface);
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
          box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
        }

        &::placeholder {
          color: var(--unity-text-dim);
          font-size: 0.80rem;
        }
      }

      .form-textarea {
        width: 100%;
        min-height: 52px;
        height: 52px;
        background: var(--unity-surface);
        border: 1.5px solid var(--unity-border);
        border-radius: 12px;
        padding: 8px 12px;
        font-size: 0.84rem;
        color: var(--unity-text-main);
        font-family: inherit;
        line-height: 1.4;
        outline: none;
        transition: all 0.2s ease;
        box-sizing: border-box;
        resize: vertical;

        &:focus {
          border-color: var(--unity-primary);
          background: var(--unity-surface);
          box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.12);
        }

        &::placeholder {
          color: var(--unity-text-dim);
          font-size: 0.80rem;
        }
      }

      .highlight-price {
        border-color: var(--unity-primary);
        font-weight: 700;
        color: var(--unity-primary);
      }
    }

    .pricing-card {
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      border-radius: 14px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .form-row-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .discount-live-pill {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(4, 120, 87, 0.08);
        border: 1px dashed rgba(4, 120, 87, 0.3);
        border-radius: 8px;
        padding: 4px 10px;

        .pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.70rem;
          font-weight: 800;
          color: var(--unity-primary);
        }

        .pill-saving {
          font-size: 0.68rem;
          font-weight: 700;
          color: #059669;
        }
      }

      .duration-group {
        margin-top: 0;

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;

          i {
            position: absolute;
            inset-inline-start: 12px;
            color: var(--unity-text-dim);
            font-size: 0.85rem;
            pointer-events: none;
          }

          input {
            padding-inline-start: 34px;
          }
        }
      }
    }

    .image-upload-card {
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      border-radius: 14px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .image-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .uploading-indicator {
          font-size: 0.70rem;
          font-weight: 700;
          color: var(--unity-primary);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
      }

      .hidden-file-input {
        display: none;
      }

      .upload-dropzone {
        border: 1.5px dashed var(--unity-border);
        border-radius: 12px;
        background: var(--unity-surface);
        padding: 12px 10px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover, &.is-dragover {
          border-color: var(--unity-primary);
          background: rgba(4, 120, 87, 0.04);
        }

        .dropzone-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(4, 120, 87, 0.08);
          color: var(--unity-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          margin-bottom: 2px;
        }

        .dropzone-title {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--unity-text-main);
        }

        .dropzone-hint {
          margin: 0;
          font-size: 0.66rem;
          color: var(--unity-text-dim);
        }
      }

      .image-preview-box {
        position: relative;
        width: 100%;
        height: 120px;
        border-radius: 12px;
        overflow: hidden;
        border: 1.5px solid var(--unity-border);
        background: #000;

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .preview-overlay-actions {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 60%);
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          padding: 8px;
          gap: 6px;

          .preview-action-btn {
            height: 28px;
            padding: 0 8px;
            border-radius: 6px;
            font-size: 0.68rem;
            font-weight: 700;
            cursor: pointer;
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            transition: all 0.15s;

            &.btn-change {
              background: #ffffff;
              color: #0f172a;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

              &:hover {
                background: #f1f5f9;
              }
            }

            &.btn-remove {
              background: rgba(239, 68, 68, 0.9);
              color: #ffffff;

              &:hover {
                background: #dc2626;
              }
            }
          }
        }
      }
    }

    .toggle-checkbox-row {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 2px;
      user-select: none;

      .toggle-checkbox {
        width: 16px;
        height: 16px;
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
      display: flex;
      gap: 10px;
      margin-top: 4px;

      button {
        flex: 1;
        height: 44px;
        border-radius: 12px;
        font-size: 0.84rem;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;
      }

      .btn-cancel {
        background: var(--unity-bg);
        border: 1.5px solid var(--unity-border);
        color: var(--unity-text-muted);

        &:hover {
          background: var(--unity-surface-muted, #f1f5f9);
          color: var(--unity-text-main);
        }
      }

      .btn-submit {
        background: var(--unity-primary);
        color: #fff;
        border: none;
        box-shadow: 0 4px 14px rgba(4, 120, 87, 0.25);

        &:hover:not(:disabled) {
          background: var(--unity-primary-dark, #065f46);
          transform: translateY(-1px);
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
