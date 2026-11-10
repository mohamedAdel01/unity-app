<template>
  <div class="admin-examinations-list">
    <!-- Examinations Cards List -->
    <div v-if="examinations.length > 0" class="cards-list">
      <AdminExaminationCard 
        v-for="srv in examinations" 
        :key="srv.id" 
        :examination="srv" 
        @toggle-status="emit('toggle-status', $event)"
        @edit="emit('edit', $event)"
      />
    </div>

    <!-- Empty State for Examinations -->
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <path d="m9 14 2 2 4-4"/>
      </svg>
      <h5>{{ t('No medical examinations registered yet') }}</h5>
      <p>{{ t('Add medical examinations to enable appointments and patient bookings.') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { useI18n } from '../../composables/useI18n';
import AdminExaminationCard from './AdminExaminationCard.vue';

interface Examination {
  id: string | number;
  name: string;
  price: number;
  duration?: number;
  description?: string | null;
  is_active: boolean;
}

const props = defineProps<{
  examinations: Examination[];
}>();

const emit = defineEmits<{
  (e: 'toggle-status', examination: Examination): void;
  (e: 'edit', examination: Examination): void;
}>();

const { t } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.admin-examinations-list {
  display: flex;
  flex-direction: column;
  width: 100%;

  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 20px;
    background: var(--unity-surface);
    border: 1px dashed var(--unity-border);
    border-radius: 20px;
    color: var(--unity-text-muted);

    svg {
      font-size: 2.2rem;
      width: 44px;
      height: 44px;
      color: var(--unity-text-dim);
      margin-bottom: 12px;
    }

    h5 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--unity-text-main);
      margin: 0 0 6px;
    }

    p {
      font-size: 0.78rem;
      max-width: 280px;
      margin: 0;
      line-height: 1.4;
    }
  }
}
</style>

