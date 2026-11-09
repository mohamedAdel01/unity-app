<template>
  <div class="records-tabs" role="tablist">
    <button 
      class="tab-btn" 
      :class="{ active: modelValue === 'reports' }" 
      role="tab"
      :aria-selected="modelValue === 'reports'"
      @click="$emit('update:modelValue', 'reports')"
    >
      <i class="pi pi-file-edit"></i>
      <span>{{ t('Visit Reports') }}</span>
    </button>
    <button 
      class="tab-btn" 
      :class="{ active: modelValue === 'labs' }" 
      role="tab"
      :aria-selected="modelValue === 'labs'"
      @click="$emit('update:modelValue', 'labs')"
    >
      <i class="pi pi-compass"></i>
      <span>{{ t('Lab Results') }}</span>
    </button>
    <button 
      class="tab-btn" 
      :class="{ active: modelValue === 'prescriptions' }" 
      role="tab"
      :aria-selected="modelValue === 'prescriptions'"
      @click="$emit('update:modelValue', 'prescriptions')"
    >
      <i class="pi pi-shield"></i>
      <span>{{ t('Prescriptions') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';

defineProps<{
  modelValue: 'reports' | 'labs' | 'prescriptions';
}>();

defineEmits<{
  (e: 'update:modelValue', val: 'reports' | 'labs' | 'prescriptions'): void;
}>();

const { t } = useI18n();
</script>

<style scoped lang="scss">
.records-tabs {
  display: flex;
  background: var(--unity-surface-muted, #f1f5f9);
  padding: 4px;
  border-radius: 14px;
  gap: 4px;

  .tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: var(--unity-text-muted);
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    i {
      font-size: 0.85rem;
    }

    &.active {
      background: var(--unity-surface, #ffffff);
      color: var(--unity-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
  }
}
</style>

