<template>
  <div class="admin-examination-card" :class="{ 'is-inactive': !examination.is_active }">
    <div class="card-top">
      <div class="icon-box service">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 18h8"/>
          <path d="M3 22h18"/>
          <path d="M14 22a7 7 0 1 0 0-14h-1"/>
          <path d="M9 14h2"/>
          <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/>
          <path d="M12 6V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/>
        </svg>
      </div>

      <div class="entity-info">
        <h4>{{ primaryName }}</h4>
        <span v-if="categoryName" class="category-badge">
          {{ categoryName }}
        </span>
        <p v-if="displayDescription" class="srv-desc">{{ displayDescription }}</p>
      </div>

      <div class="card-controls" @click.stop>
        <button 
          type="button"
          class="unity-switch-toggle" 
          :class="{ 'active': examination.is_active }"
          :aria-checked="examination.is_active"
          role="switch"
          :title="examination.is_active ? t('Active') : t('Inactive')"
          @click.stop="emit('toggle-status', examination)"
        >
          <span class="switch-slider"></span>
        </button>

        <button 
          type="button" 
          class="btn-card-edit" 
          :title="t('Edit Examination')"
          :aria-label="t('Edit Examination')"
          @click.stop="emit('edit', examination)"
        >
          <i class="pi pi-pencil"></i>
        </button>
      </div>
    </div>

    <div class="card-footer">
      <!-- Price on the Right in RTL -->
      <div class="srv-price-box">
        <span class="srv-price">{{ examination.price }}</span>
        <span class="srv-currency">{{ t('EGP') }}</span>
      </div>

      <!-- Timing on the Left in RTL -->
      <div class="srv-duration-box">
        <i class="pi pi-clock"></i>
        <span>{{ examination.duration || 15 }} {{ t('mins') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed } from 'vue';
import { useI18n } from '../../composables/useI18n';

interface Examination {
  id: string | number;
  name: string;
  name_ar?: string;
  name_en?: string;
  price: number;
  duration?: number;
  description?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  is_active: boolean;
}

const props = defineProps<{
  examination: Examination;
}>();

const emit = defineEmits<{
  (e: 'toggle-status', examination: Examination): void;
  (e: 'edit', examination: Examination): void;
}>();

const { t, isRtl, resolveI18n } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const primaryName = computed(() => {
  if (isRtl.value) {
    return resolveI18n(props.examination.name_ar || props.examination.name || props.examination.name_en || '');
  }
  return resolveI18n(props.examination.name_en || props.examination.name || props.examination.name_ar || '');
});

const displayDescription = computed(() => {
  if (isRtl.value) {
    return resolveI18n(props.examination.description_ar || props.examination.description || '');
  }
  return resolveI18n(props.examination.description_en || props.examination.description || '');
});

const categoryName = computed(() => {
  const cat = (props.examination as any)?.examination_category || (props.examination as any)?.category;
  if (!cat) return '';
  if (isRtl.value) {
    if (cat.name_ar && cat.name_ar.trim()) return cat.name_ar.trim();
    const raw = (cat.name || cat.name_en || '').trim();
    if (raw && t(raw) !== raw) return t(raw);
    const lower = raw.toLowerCase();
    if (lower === 'skin' || lower === 'dermatology') return 'جلدية';
    return resolveI18n(cat.name_ar || cat.name || cat.name_en);
  }
  return resolveI18n(cat.name_en || cat.name || cat.name_ar);
});

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-examination-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &.is-inactive {
    opacity: 0.72;

    &:hover {
      border-color: var(--unity-border);
      transform: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-box {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;

      svg {
        width: 22px;
        height: 22px;
      }

      &.service {
        background: #e0f2fe;
        color: #0284c7;
        border: 1px solid #bae6fd;

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          background: rgba(2, 132, 199, 0.14);
          border-color: rgba(2, 132, 199, 0.28);
          color: #38bdf8;
        }
      }
    }

    .entity-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      text-align: start;

      :global(html[dir='ltr']) &,
      :global([dir='ltr']) & {
        text-align: left;
      }

      :global(html[dir='rtl']) &,
      :global([dir='rtl']) & {
        text-align: right;
      }

      h4 {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--unity-text-main);
        margin: 0;
      }

      .category-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.70rem;
        font-weight: 700;
        color: var(--unity-primary);
        background: var(--unity-primary-light);
        padding: 2px 7px;
        border-radius: 6px;
        width: fit-content;
        margin-top: 1px;
      }

      .srv-desc {
        font-size: 0.74rem;
        color: var(--unity-text-muted);
        margin: 0;
        line-height: 1.3;
      }
    }

    .card-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;

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

        &:focus-visible {
          box-shadow: 0 0 0 2px #fff, 0 0 0 4px #059669;
        }
      }

      .btn-card-edit {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: var(--unity-primary-light, #ecfdf5);
        border: 1.5px solid var(--unity-primary-tint, #a7f3d0);
        color: var(--unity-primary, #047857);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 0;

        i {
          font-size: 1.05rem;
          color: var(--unity-primary, #047857);
        }

        &:hover {
          background: #d1fae5;
          border-color: #6ee7b7;
          color: #065f46;
          transform: translateY(-1px);

          i {
            color: #065f46;
          }
        }

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          background: rgba(16, 185, 129, 0.14);
          border-color: rgba(16, 185, 129, 0.28);
          color: #34d399;

          i {
            color: #34d399;
          }

          &:hover {
            background: rgba(16, 185, 129, 0.22);
            border-color: rgba(16, 185, 129, 0.4);
            color: #6ee7b7;

            i {
              color: #6ee7b7;
            }
          }
        }

        &:active {
          transform: scale(0.94);
        }
      }
    }
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--unity-border);
    padding-top: 10px;

    .srv-price-box {
      display: inline-flex;
      align-items: baseline;
      gap: 4px;

      .srv-price {
        font-size: 0.96rem;
        font-weight: 800;
        color: #047857;
      }

      .srv-currency {
        font-size: 0.74rem;
        font-weight: 700;
        color: #047857;
        opacity: 0.85;
      }
    }

    .srv-duration-box {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--unity-text-muted, #64748b);
      display: inline-flex;
      align-items: center;
      gap: 5px;

      i {
        font-size: 0.76rem;
        color: var(--unity-text-muted, #64748b);
      }
    }
  }
}
</style>
