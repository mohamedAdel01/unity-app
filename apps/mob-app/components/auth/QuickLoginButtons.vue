<template>
  <div class="quick-login-section">
    <!-- Divider -->
    <div class="quick-divider">
      <span>{{ t('Or continue with') }}</span>
    </div>

    <!-- Social Row: Google & Apple Only -->
    <div class="social-row">
      <button type="button" class="social-pill-btn google" @click="handleGoogle">
        <svg viewBox="0 0 24 24" class="social-svg">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Google</span>
      </button>

      <button type="button" class="social-pill-btn apple" @click="handleApple">
        <svg viewBox="0 0 24 24" class="social-svg">
          <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.36-.57.65-1.07 1.72-.94 2.74 1.01.08 2.03-.5 2.65-1.25z"/>
        </svg>
        <span>Apple</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

const handleGoogle = () => {
  const config = useRuntimeConfig();
  const baseUrl = config.public?.apiUrl || 'http://localhost:4000';
  window.location.href = `${baseUrl}/v1/auth/google?platform=web`;
};

const handleApple = () => {
  // Apple Sign-In flow
  alert('Sign in with Apple');
};
</script>

<style scoped lang="scss">
.quick-login-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 4px 0;

  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--unity-border);
  }

  span {
    padding: 0 12px;
    font-size: 0.78rem;
    color: var(--unity-text-dim);
    font-weight: 500;
  }
}

.social-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  .social-pill-btn {
    height: 48px;
    border-radius: 14px;
    background: var(--unity-surface);
    border: 1.5px solid var(--unity-border);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--unity-text-main);
    box-shadow: var(--unity-shadow-subtle);
    transition: all 0.2s ease;

    .social-svg {
      width: 19px;
      height: 19px;
    }

    &.apple {
      background: #0f172a;
      color: #fff;
      border-color: #0f172a;
    }

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  }
}
</style>
