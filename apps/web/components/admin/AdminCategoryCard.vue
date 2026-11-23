<template>
  <div class="admin-category-card" :class="{ 'is-inactive': !category.is_active }" @click="emit('select', category)">
    <div class="card-top">
      <div class="icon-box category">
        <i :class="categoryIcon"></i>
      </div>

      <div class="entity-info">
        <h4>{{ primaryName }}</h4>
      </div>

      <div class="card-controls" @click.stop>
        <button 
          type="button"
          class="unity-switch-toggle" 
          :class="{ 'active': category.is_active }"
          :aria-checked="category.is_active"
          role="switch"
          :title="category.is_active ? t('Active') : t('Inactive')"
          @click.stop="emit('toggle-status', category)"
        >
          <span class="switch-slider"></span>
        </button>

        <button 
          type="button" 
          class="btn-card-edit" 
          :title="t('Edit Category')"
          :aria-label="t('Edit Category')"
          @click.stop="emit('edit', category)"
        >
          <i class="pi pi-pencil"></i>
        </button>
      </div>
    </div>

    <div class="card-footer">
      <span class="capacity-text">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="service-icon">
          <path d="M6 18h8"/>
          <path d="M3 22h18"/>
          <path d="M14 22a7 7 0 1 0 0-14h-1"/>
          <path d="M9 14h2"/>
          <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/>
          <path d="M12 6V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/>
        </svg>
        <span>{{ category.examinations_count ?? 0 }} {{ t('Services') }}</span>
      </span>

      <div class="view-services-btn">
        <span>{{ t('View Services') }}</span>
        <i :class="isRtl ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed } from 'vue';
import { useI18n } from '../../composables/useI18n';

interface Category {
  id: string | number;
  name_ar?: string;
  name_en?: string;
  name?: string;
  description_ar?: string;
  description_en?: string;
  description?: string;
  icon?: string;
  examinations_count?: number;
  is_active?: boolean;
}

const props = defineProps<{
  category: Category;
}>();

const emit = defineEmits<{
  (e: 'toggle-status', category: Category): void;
  (e: 'edit', category: Category): void;
  (e: 'select', category: Category): void;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const primaryName = computed(() => {
  return isRtl.value
    ? (props.category?.name_ar || props.category?.name || props.category?.name_en || '')
    : (props.category?.name_en || props.category?.name || props.category?.name_ar || '');
});

const categoryIcon = computed(() => {
  if (props.category?.icon) return props.category.icon;
  const name = ((props.category?.name_ar || props.category?.name || props.category?.name_en || '') + '').toLowerCase();
  if (name.includes('دم') || name.includes('تحاليل') || name.includes('blood') || name.includes('lab')) return 'pi pi-chart-line';
  if (name.includes('جلد') || name.includes('derma') || name.includes('بشرة')) return 'pi pi-heart';
  if (name.includes('قلب') || name.includes('cardio')) return 'pi pi-heart-fill';
  if (name.includes('أشعة') || name.includes('x-ray') || name.includes('scan')) return 'pi pi-camera';
  if (name.includes('أسنان') || name.includes('dental')) return 'pi pi-shield';
  if (name.includes('أطفال') || name.includes('pediatric')) return 'pi pi-user';
  return 'pi pi-folder';
});

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-category-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 18px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &.is-inactive {
    opacity: 0.72;

    &:hover {
      border-color: var(--unity-border);
      transform: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }
  }

  &:hover {
    border-color: var(--unity-primary);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(4, 120, 87, 0.08);

    .view-services-btn {
      opacity: 0.9;
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

      i {
        font-size: 1.2rem;
      }

      &.category {
        background: var(--unity-primary-light, #ecfdf5);
        color: var(--unity-primary, #047857);
        border: 1px solid var(--unity-primary-tint, #a7f3d0);

        :global([data-theme='dark']) &,
        :global(html.dark) & {
          background: rgba(16, 185, 129, 0.14);
          border-color: rgba(16, 185, 129, 0.28);
          color: #34d399;
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
        font-size: 1.05rem;
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
          transform: scale(0.96);
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

    .capacity-text {
      font-size: 0.75rem;
      color: var(--unity-text-muted);
      display: inline-flex;
      align-items: center;
      gap: 6px;

      svg,
      i {
        color: var(--unity-primary);
        flex-shrink: 0;
      }
    }

    .view-services-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--unity-primary);
      transition: all 0.2s ease;

      i {
        font-size: 0.70rem;
      }
    }
  }
}
</style>