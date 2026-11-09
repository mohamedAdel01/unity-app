<template>
  <div class="admin-redirect-loading">
    <i class="pi pi-spin pi-spinner"></i>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();

onMounted(() => {
  router.replace('/admin/patients');
});
</script>

<style scoped>
.admin-redirect-loading {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: var(--unity-primary);
}
</style>

