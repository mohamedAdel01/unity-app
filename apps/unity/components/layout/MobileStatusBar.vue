<template>
  <div class="mobile-status-bar">
    <div class="status-time">{{ currentTime }}</div>
    <div class="dynamic-island">
      <span class="camera-lens"></span>
    </div>
    <div class="status-icons">
      <i class="pi pi-signal"></i>
      <i class="pi pi-wifi"></i>
      <div class="battery-indicator">
        <div class="battery-level"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const currentTime = ref('9:41');
let timeInterval: any = null;

const updateClock = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  currentTime.value = `${hours}:${minutes}`;
};

onMounted(() => {
  updateClock();
  timeInterval = setInterval(updateClock, 30000);
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});
</script>

<style scoped lang="scss">
.mobile-status-bar {
  height: 44px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--unity-surface);
  flex-shrink: 0;
  z-index: 50;

  .status-time {
    font-size: 0.88rem;
    font-weight: 800;
    letter-spacing: -0.2px;
    color: var(--unity-text-main);
  }

  .dynamic-island {
    width: 90px;
    height: 24px;
    background: #000;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-inline: 10px;

    .camera-lens {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #111827;
      border: 1px solid #1f2937;
    }
  }

  .status-icons {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.78rem;
    color: var(--unity-text-main);

    .battery-indicator {
      width: 20px;
      height: 11px;
      border: 1.5px solid var(--unity-text-main);
      border-radius: 3px;
      padding: 1px;
      display: flex;
      align-items: center;

      .battery-level {
        width: 80%;
        height: 100%;
        background: var(--unity-text-main);
        border-radius: 1px;
      }
    }
  }
}
</style>

