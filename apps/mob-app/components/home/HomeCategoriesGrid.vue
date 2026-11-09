<template>
  <section class="section-container">
    <div class="section-header">
      <h4>{{ t('home.categoriesTitle') }}</h4>
      <NuxtLink to="/services" class="see-all-link">
        {{ t('home.browseServices') }} 
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
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';

const router = useRouter();
const { t, isRtl } = useI18n();

const categories = computed(() => [
  {
    id: 'clinics',
    title: t('categories.clinics'),
    subtitle: t('categories.clinicsSub'),
    icon: 'pi pi-user-plus',
    iconClass: 'icon-emerald',
    badge: t('categories.clinicsBadge'),
    badgeClass: 'badge-emerald',
  },
  {
    id: 'lab',
    title: t('categories.lab'),
    subtitle: t('categories.labSub'),
    icon: 'pi pi-table',
    iconClass: 'icon-cyan',
    badge: t('categories.labBadge'),
    badgeClass: 'badge-cyan',
  },
  {
    id: 'xray',
    title: t('categories.xray'),
    subtitle: t('categories.xraySub'),
    icon: 'pi pi-box',
    iconClass: 'icon-emerald',
  },
  {
    id: 'nursing',
    title: t('categories.nursing'),
    subtitle: t('categories.nursingSub'),
    icon: 'pi pi-heart',
    iconClass: 'icon-emerald',
  },
  {
    id: 'telehealth',
    title: t('categories.telehealth'),
    subtitle: t('categories.telehealthSub'),
    icon: 'pi pi-video',
    iconClass: 'icon-cyan',
    badge: t('categories.telehealthBadge'),
    badgeClass: 'badge-amber',
  },
  {
    id: 'pharmacy',
    title: t('categories.pharmacy'),
    subtitle: t('categories.pharmacySub'),
    icon: 'pi pi-file-edit',
    iconClass: 'icon-emerald',
  },
]);

const navigateToCategory = (cat: any) => {
  if (cat.id === 'clinics' || cat.id === 'telehealth') {
    router.push('/services?tab=doctors');
  } else {
    router.push('/services?tab=services');
  }
};
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
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  .category-card {
    position: relative;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    border-radius: 18px;
    padding: 14px 10px;
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
      top: 6px;
      inset-inline-end: 6px;
      font-size: 0.58rem;
      font-weight: 600;
      padding: 1px 6px;
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
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      margin-bottom: 8px;

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
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--unity-text-main);
      margin-bottom: 2px;
    }

    small {
      font-size: 0.65rem;
      color: var(--unity-text-muted);
    }
  }
}
</style>

