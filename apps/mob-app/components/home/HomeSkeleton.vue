<template>
  <div class="home-skeleton-wrapper" aria-hidden="true">
    <!-- 1. Header Skeleton -->
    <div class="skeleton-header">
      <div class="skeleton-user-box">
        <div class="skeleton-shimmer skeleton-avatar"></div>
        <div class="skeleton-user-details">
          <div class="skeleton-shimmer skeleton-greeting-bar"></div>
        </div>
      </div>
      <div class="skeleton-shimmer skeleton-bell-btn"></div>
    </div>

    <!-- 2. Upcoming Booking Card Skeleton -->
    <div class="skeleton-section">
      <div class="skeleton-section-header">
        <div class="skeleton-shimmer skeleton-title-bar-sm"></div>
        <div class="skeleton-shimmer skeleton-link-bar"></div>
      </div>
      <div class="skeleton-upcoming-card">
        <div class="skeleton-upcoming-left">
          <div class="skeleton-shimmer skeleton-icon-box"></div>
          <div class="skeleton-shimmer skeleton-text-bar-md"></div>
        </div>
        <div class="skeleton-shimmer skeleton-pill-btn"></div>
      </div>
    </div>

    <!-- 3. Categories Grid Skeleton -->
    <div class="skeleton-section">
      <div class="skeleton-section-header">
        <div class="skeleton-shimmer skeleton-title-bar-md"></div>
      </div>
      <div class="skeleton-categories-grid">
        <div v-for="i in 2" :key="i" class="skeleton-category-card">
          <div class="skeleton-shimmer skeleton-cat-icon"></div>
          <div class="skeleton-shimmer skeleton-cat-title"></div>
          <div class="skeleton-shimmer skeleton-cat-desc"></div>
          <div class="skeleton-shimmer skeleton-cat-btn"></div>
        </div>
      </div>
    </div>

    <!-- 4. Today Offers Carousel Skeleton -->
    <div class="skeleton-section">
      <div class="skeleton-section-header">
        <div class="skeleton-header-col">
          <div class="skeleton-shimmer skeleton-title-bar-md"></div>
          <div class="skeleton-shimmer skeleton-subtitle-bar"></div>
        </div>
        <div class="skeleton-shimmer skeleton-link-bar"></div>
      </div>
      <div class="skeleton-offers-carousel">
        <div v-for="i in 2" :key="i" class="skeleton-offer-card">
          <div class="skeleton-shimmer skeleton-offer-img"></div>
          <div class="skeleton-offer-body">
            <div class="skeleton-shimmer skeleton-offer-title"></div>
            <div class="skeleton-shimmer skeleton-offer-desc"></div>
            <div class="skeleton-offer-footer">
              <div class="skeleton-shimmer skeleton-offer-price"></div>
              <div class="skeleton-shimmer skeleton-offer-btn"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)

// 2. Data (refs, reactive state)

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--unity-border-subtle, #f1f5f9) 25%,
    var(--unity-border, #e2e8f0) 50%,
    var(--unity-border-subtle, #f1f5f9) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.6s infinite ease-in-out;
  border-radius: 8px;
}

.home-skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
}

// 1. Header
.skeleton-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .skeleton-user-box {
    display: flex;
    align-items: center;
    gap: 10px;

    .skeleton-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .skeleton-user-details {
      display: flex;
      flex-direction: column;

      .skeleton-greeting-bar {
        width: 120px;
        height: 18px;
        border-radius: 6px;
      }
    }
  }

  .skeleton-bell-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
  }
}

// Section Base
.skeleton-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  .skeleton-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .skeleton-title-bar-sm {
      width: 80px;
      height: 16px;
      border-radius: 6px;
    }

    .skeleton-title-bar-md {
      width: 135px;
      height: 16px;
      border-radius: 6px;
    }

    .skeleton-link-bar {
      width: 50px;
      height: 14px;
      border-radius: 6px;
    }

    .skeleton-header-col {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .skeleton-subtitle-bar {
        width: 85px;
        height: 11px;
        border-radius: 4px;
      }
    }
  }
}

// 2. Upcoming Booking Card Skeleton
.skeleton-upcoming-card {
  background: var(--unity-surface);
  border: 1.5px dashed var(--unity-border);
  border-radius: 18px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  .skeleton-upcoming-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;

    .skeleton-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .skeleton-text-bar-md {
      width: 140px;
      height: 14px;
      border-radius: 6px;
    }
  }

  .skeleton-pill-btn {
    width: 80px;
    height: 28px;
    border-radius: 12px;
    flex-shrink: 0;
  }
}

// 3. Categories Grid Skeleton
.skeleton-categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 11px;

  .skeleton-category-card {
    background: var(--unity-surface);
    border: 1.5px solid var(--unity-border);
    border-radius: 22px;
    padding: 20px 14px 16px;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;

    .skeleton-cat-icon {
      width: 50px;
      height: 50px;
      border-radius: 16px;
      margin-bottom: 4px;
    }

    .skeleton-cat-title {
      width: 85%;
      height: 14px;
      border-radius: 6px;
    }

    .skeleton-cat-desc {
      width: 95%;
      height: 20px;
      border-radius: 6px;
      margin-bottom: auto;
    }

    .skeleton-cat-btn {
      width: 100%;
      height: 30px;
      border-radius: 24px;
    }
  }
}

// 4. Offers Carousel Skeleton
.skeleton-offers-carousel {
  display: flex;
  gap: 12px;
  overflow-x: hidden;
  margin-inline: -20px;
  padding-inline: 20px;
  padding-block: 4px 10px;

  .skeleton-offer-card {
    width: 176px;
    flex-shrink: 0;
    background: var(--unity-surface);
    border: 1px solid var(--unity-border);
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .skeleton-offer-img {
      width: 100%;
      height: 76px;
      border-radius: 0;
    }

    .skeleton-offer-body {
      padding: 8px 10px 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .skeleton-offer-title {
        width: 80%;
        height: 14px;
        border-radius: 4px;
      }

      .skeleton-offer-desc {
        width: 95%;
        height: 18px;
        border-radius: 4px;
      }

      .skeleton-offer-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 4px;
        padding-top: 6px;
        border-top: 1px dashed var(--unity-border-subtle);

        .skeleton-offer-price {
          width: 50px;
          height: 14px;
          border-radius: 4px;
        }

        .skeleton-offer-btn {
          width: 60px;
          height: 24px;
          border-radius: 8px;
        }
      }
    }
  }
}

// 5. Doctors Skeleton
.skeleton-doctor-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  .skeleton-doc-header {
    display: flex;
    align-items: center;
    gap: 12px;

    .skeleton-doc-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .skeleton-doc-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;

      .skeleton-doc-name {
        width: 110px;
        height: 16px;
        border-radius: 6px;
      }

      .skeleton-doc-spec {
        width: 70px;
        height: 12px;
        border-radius: 4px;
      }
    }
  }

  .skeleton-doc-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--unity-border-light);
    padding-top: 12px;

    .skeleton-doc-avail {
      width: 90px;
      height: 14px;
      border-radius: 4px;
    }

    .skeleton-doc-btn {
      width: 80px;
      height: 30px;
      border-radius: 12px;
    }
  }
}
</style>
