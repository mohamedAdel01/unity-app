<template>
  <div class="hero-headline">
    <h3>{{ t('home.heroTitle') }}</h3>
    <p>{{ t('home.heroSubtitle') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();
</script>

<style scoped lang="scss">
.hero-headline {
  margin-top: 4px;

  h3 {
    font-size: 1.45rem;
    font-weight: 900;
    color: var(--unity-text-main);
    letter-spacing: -0.4px;
  }

  p {
    font-size: 0.8rem;
    color: var(--unity-text-muted);
    margin-top: 2px;
  }
}
</style>
