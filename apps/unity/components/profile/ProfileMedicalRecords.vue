<template>
  <div class="settings-card">
    <div class="settings-head">
      <div class="head-icon icon-green"><i class="pi pi-file"></i></div>
      <div class="head-text">
        <h5>{{ t('profile.recordsTitle') }}</h5>
        <small>{{ t('profile.recordsSub') }}</small>
      </div>
    </div>

    <div class="records-list">
      <div class="record-mini-card">
        <div class="rec-title">
          <strong>{{ t('profile.sampleRecordTitle') }}</strong>
          <small>{{ t('profile.sampleRecordDoctor') }}</small>
        </div>
        <p class="rec-diag">{{ t('profile.sampleRecordDiag') }}</p>
        <span class="rec-prescription"><i class="pi pi-check"></i> {{ t('profile.sampleRecordPrescription') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';

const { t, isRtl } = useI18n();
</script>

<style scoped lang="scss">
.settings-card {
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 20px;
  padding: 16px;
  box-shadow: var(--unity-shadow-subtle);

  .settings-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;

    .head-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;

      &.icon-green { background: #dcfce7; color: #15803d; }
    }

    .head-text {
      h5 {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--unity-text-main);
      }
      small {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
      }
    }
  }
}

.records-list {
  .record-mini-card {
    background: var(--unity-bg);
    border-radius: 12px;
    padding: 12px;

    .rec-title {
      display: flex;
      flex-direction: column;
      margin-bottom: 4px;

      strong {
        font-size: 0.88rem;
        color: var(--unity-text-main);
      }
      small {
        font-size: 0.72rem;
        color: var(--unity-text-muted);
      }
    }

    .rec-diag {
      font-size: 0.78rem;
      color: var(--unity-text-main);
      margin-bottom: 6px;
    }

    .rec-prescription {
      font-size: 0.72rem;
      color: #047857;
      font-weight: 700;
    }
  }
}
</style>

