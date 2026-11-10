<template>
  <section class="section-container">
    <div class="section-header">
      <h4>{{ t('What are you looking for today?') }}</h4>
      <NuxtLink to="/services" class="see-all-link">
        {{ t('Browse Services') }} 
        <i :class="isRtl ? 'pi pi-angle-left' : 'pi pi-angle-right'"></i>
      </NuxtLink>
    </div>

    <div class="categories-grid">
      <div 
        v-for="cat in categories" 
        :key="cat.id" 
        class="category-card"
        @click="navigateToCategory(cat)"
      >
        <span v-if="cat.badge" class="cat-pill-badge" :class="cat.badgeClass">{{ cat.badge }}</span>
        <div class="cat-icon-wrap" :class="cat.iconClass">
          <i :class="cat.icon"></i>
        </div>
        <h5>{{ cat.title }}</h5>
        <small>{{ cat.subtitle }}</small>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

const router = useRouter();

const { t, isRtl } = useI18n();

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)
const categories = computed(() => [
  {
    id: 'doctor',
    title: t('Doctor Consultation Checkup'),
    subtitle: t('In-clinic appointments & specialized consultations'),
    icon: 'pi pi-user-plus',
    iconClass: 'icon-emerald',
    badge: t('Instant'),
    badgeClass: 'badge-emerald',
  },
  {
    id: 'lab',
    title: t('Book Tests & Lab Examinations'),
    subtitle: t('Lab tests, diagnostics & comprehensive packages'),
    icon: 'pi pi-table',
    iconClass: 'icon-cyan',
    badge: t('Special'),
    badgeClass: 'badge-cyan',
  },
]);

// 4. Methods (functions, handlers)
const navigateToCategory = (cat: any) => {
  if (cat.id === 'doctor') {
    router.push('/services?tab=doctors');
  } else {
    router.push('/services?tab=services');
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.section-container {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h4 {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--unity-text-main);
    }

    .see-all-link {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--unity-primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 2px;
    }
  }
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  .category-card {
    position: relative;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    border-radius: 18px;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s;
    box-shadow: var(--unity-shadow-subtle);

    &:hover {
      border-color: var(--unity-primary);
      transform: translateY(-2px);
    }

    .cat-pill-badge {
      position: absolute;
      top: 8px;
      inset-inline-end: 8px;
      font-size: 0.62rem;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 10px;

      &.badge-emerald {
        background: #d1fae5;
        color: #065f46;
      }
      &.badge-cyan {
        background: #e0f2fe;
        color: #0369a1;
      }
      &.badge-amber {
        background: #fef3c7;
        color: #92400e;
      }
    }

    .cat-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      margin-bottom: 10px;

      &.icon-emerald {
        background: #ecfdf5;
        color: #047857;
      }
      &.icon-cyan {
        background: #f0fdfa;
        color: #0d9488;
      }
    }

    h5 {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--unity-text-main);
      margin-bottom: 3px;
    }

    small {
      font-size: 0.68rem;
      line-height: 1.35;
      color: var(--unity-text-muted);
    }
  }
}
</style>
