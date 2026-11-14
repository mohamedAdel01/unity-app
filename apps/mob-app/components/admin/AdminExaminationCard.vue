<template>
  <div class="admin-examination-card">
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
        <span v-if="secondaryName" class="secondary-lang-pill">{{ secondaryName }}</span>
        <span v-if="categoryName" class="category-badge">
          <i :class="(examination as any)?.category?.icon || 'pi pi-folder'"></i>
          {{ categoryName }}
        </span>
        <p v-if="displayDescription" class="srv-desc">{{ displayDescription }}</p>
      </div>

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
    </div>

    <div class="card-footer">
      <div class="footer-meta">
        <span class="srv-price">{{ examination.price }} {{ t('EGP') }}</span>
        <span class="srv-dot">•</span>
        <span class="srv-duration"><i class="pi pi-clock"></i> {{ examination.duration || 15 }} {{ t('mins') }}</span>
      </div>

      <button 
        type="button" 
        class="btn-card-edit" 
        :title="t('Edit Examination')"
        @click.stop="emit('edit', examination)"
      >
        <i class="pi pi-pencil"></i>
        <span>{{ t('Edit') }}</span>
      </button>
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

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const primaryName = computed(() => {
  if (isRtl.value) {
    return props.examination.name_ar || props.examination.name;
  }
  return props.examination.name_en || props.examination.name;
});

const secondaryName = computed(() => {
  if (isRtl.value) {
    return props.examination.name_en && props.examination.name_en !== primaryName.value ? props.examination.name_en : '';
  }
  return props.examination.name_ar && props.examination.name_ar !== primaryName.value ? props.examination.name_ar : '';
});

const displayDescription = computed(() => {
  if (isRtl.value) {
    return props.examination.description_ar || props.examination.description || '';
  }
  return props.examination.description_en || props.examination.description || '';
});

const categoryName = computed(() => {
  const cat = (props.examination as any)?.category;
  if (!cat) return '';
  if (isRtl.value) return cat.name_ar || cat.name;
  return cat.name_en || cat.name;
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
  transition: transform 0.2s;

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
      }
    }

    .entity-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      text-align: right;

      h4 {
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--unity-text-main);
        margin: 0;
      }

      .secondary-lang-pill {
        display: inline-block;
        font-size: 0.72rem;
        color: var(--unity-primary);
        font-weight: 600;
        opacity: 0.85;
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

    .unity-switch-toggle {
      position: relative;
      width: 46px;
      height: 26px;
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
        width: 22px;
        height: 22px;
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
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--unity-border);
    padding-top: 10px;

    .footer-meta {
      display: flex;
      align-items: center;
      gap: 6px;

      .srv-price {
        font-size: 0.85rem;
        font-weight: 800;
        color: #047857;
      }

      .srv-dot {
        color: var(--unity-text-dim);
      }

      .srv-duration {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
    }

    .btn-card-edit {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 10px;
      background: var(--unity-bg);
      border: 1px solid var(--unity-border);
      color: var(--unity-text-main);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;

      i {
        font-size: 0.75rem;
        color: var(--unity-primary);
      }

      &:hover {
        background: var(--unity-primary-light);
        border-color: var(--unity-primary);
        color: var(--unity-primary);
      }
    }
  }
}
</style>
