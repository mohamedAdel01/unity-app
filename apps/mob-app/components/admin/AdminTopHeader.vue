<template>
  <div class="admin-unified-top-bar">
    <!-- Right: Identity with Avatar and Title only -->
    <div class="admin-identity">
      <div class="admin-avatar-ring">
        <i :class="icon || 'pi pi-shield'"></i>
      </div>
      <div class="admin-meta">
        <button 
          v-if="showBack" 
          type="button" 
          class="top-back-link" 
          @click="emit('back')"
        >
          <i :class="isRtl ? 'pi pi-arrow-right' : 'pi pi-arrow-left'"></i>
          <span>{{ backText || t('Return') }}</span>
        </button>
        <h4 class="role-title">{{ title }}</h4>
      </div>
    </div>

    <!-- Left: Action Button (Add) or Slot -->
    <slot name="action">
      <button 
        v-if="actionText || showAdd"
        type="button" 
        class="admin-header-add-btn" 
        :title="actionText || t('Add')"
        :aria-label="actionText || t('Add')"
        @click="emit('action')"
      >
        <i :class="actionIcon || 'pi pi-plus'"></i>
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    icon?: string;
    actionText?: string;
    actionIcon?: string;
    showAdd?: boolean;
    showBack?: boolean;
    backText?: string;
  }>(),
  {
    subtitle: '',
    icon: 'pi pi-shield',
    actionText: '',
    actionIcon: 'pi pi-plus',
    showAdd: false,
    showBack: false,
    backText: '',
  }
);

const emit = defineEmits<{
  (e: 'action'): void;
  (e: 'back'): void;
}>();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-unified-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 0 16px;
  direction: inherit;

  &[dir='ltr'] {
    direction: ltr;

    .admin-identity .admin-meta {
      text-align: left;
    }
  }

  .admin-identity {
    display: flex;
    align-items: center;
    gap: 10px;

    .admin-avatar-ring {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      background: #ecfdf5;
      border: 1.5px solid #a7f3d0;
      color: #047857;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      flex-shrink: 0;
    }

    .admin-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: right;

      .top-back-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: transparent;
        border: none;
        padding: 0;
        margin-bottom: 2px;
        font-size: 0.74rem;
        font-weight: 500;
        color: var(--unity-text-muted);
        cursor: pointer;
        transition: color 0.15s ease;

        i {
          font-size: 0.68rem;
        }

        &:hover {
          color: var(--unity-primary);
        }
      }

      .role-title {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--unity-text-main);
        margin: 0;
        line-height: 1.2;
      }
    }
  }

  .admin-header-add-btn {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: var(--unity-primary, #047857);
    border: none;
    color: #ffffff;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(4, 120, 87, 0.22);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    flex-shrink: 0;

    i {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
    }

    &:hover {
      background: var(--unity-primary-dark, #065f46);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(4, 120, 87, 0.28);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}
</style>

