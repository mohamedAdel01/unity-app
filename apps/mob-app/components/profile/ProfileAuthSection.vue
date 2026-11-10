<template>
  <div class="auth-section">
    <button v-if="api.token.value" class="logout-btn" @click="handleLogout">
      <i class="pi pi-sign-out"></i>
      <span>{{ t('Log Out of Account') }}</span>
    </button>

    <div v-else class="login-prompt-card">
      <h5>{{ t('Sign In to View Your Medical Record') }}</h5>
      <p>{{ t('Sign in or register a patient profile to retain your bookings and health records') }}</p>
      <button class="login-action-btn" @click="openAuthModal = true">
        {{ t('Sign In / Register') }}
      </button>
    </div>

    <!-- Auth Modal -->
    <Teleport to="body">
      <div v-if="openAuthModal" class="auth-modal-backdrop" @click="openAuthModal = false">
        <div class="auth-modal-sheet" @click.stop>
          <div class="modal-pill"></div>
          <h4>{{ isRegister ? t('Create Account') : t('Sign In') }}</h4>

          <div class="auth-form">
            <div v-if="isRegister" class="form-group">
              <label>{{ t('Full Name') }}</label>
              <input v-model="authForm.name" type="text" placeholder="Ahmed Al-Salama" />
            </div>

            <div class="form-group">
              <label>{{ t('Phone Number') }}</label>
              <input
                v-model="authForm.phone"
                type="tel"
                placeholder="05XXXXXXXX"
                dir="ltr"
              />
            </div>

            <div class="form-group">
              <label>{{ t('Password') }}</label>
              <input v-model="authForm.password" type="password" placeholder="••••••••" />
            </div>

            <button class="submit-auth-btn" :disabled="authLoading" @click="submitAuth">
              <i v-if="authLoading" class="pi pi-spin pi-spinner"></i>
              <span v-else>{{ isRegister ? t('Create Account') : t('Sign In') }}</span>
            </button>

            <!-- Social Login Options (Disabled for V1 release per instructions) -->
            <div v-if="false" class="social-divider">
              <span>{{ t('Or continue with') }}</span>
            </div>

            <div v-if="false" class="social-buttons">
              <!-- Google -->
              <button type="button" class="social-btn google-btn" @click="loginWithGoogleOAuth">
                <svg viewBox="0 0 24 24" class="social-icon">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{{ t('Continue with Google') }}</span>
              </button>

              <!-- Apple -->
              <button type="button" class="social-btn apple-btn" @click="loginWithAppleOAuth">
                <svg viewBox="0 0 24 24" class="social-icon">
                  <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.36-.57.65-1.07 1.72-.94 2.74 1.01.08 2.03-.5 2.65-1.25z"/>
                </svg>
                <span>{{ t('Continue with Apple') }}</span>
              </button>
            </div>

            <button class="toggle-auth-btn" @click="isRegister = !isRegister">
              {{ isRegister ? t('Already have an account? Sign In') : t('New user? Register now') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';

const emit = defineEmits<{
  (e: 'user-updated', user: any): void;
}>();

const router = useRouter();

const api = useUnityApi();

const { t } = useI18n();

const toast = useAppToast();

// 2. Data (refs, reactive state)
const openAuthModal = ref(false);

const isRegister = ref(false);

const authLoading = ref(false);

const authForm = ref({
  name: '',
  identifier: '',
  password: '',
  phone: '',
});

// 3. Computed (computed properties)

// 4. Methods (functions, handlers)
const submitAuth = async () => {
  try {
    authLoading.value = true;
    if (isRegister.value) {
      await api.apiRequest({
        module: 'auth',
        service: 'REGISTER',
        payload: {
          name: authForm.value.name,
          password: authForm.value.password,
          phone: authForm.value.phone,
        },
        pinia: true,
      });
    } else {
      await api.apiRequest({
        module: 'auth',
        service: 'LOGIN',
        payload: {
          phone: authForm.value.phone,
          password: authForm.value.password,
        },
        pinia: true,
      });
    }
    emit('user-updated', api.currentUser.value);
    openAuthModal.value = false;
    toast.success(t('Logged in successfully!'));
  } catch (err: any) {
    toast.error(err.message || 'خطأ في المصادقة');
  } finally {
    authLoading.value = false;
  }
};

const loginWithGoogleOAuth = () => {
  // Initiates Google OAuth redirect matching Bya3 pattern
  window.location.href = 'http://localhost:4000/v1/auth/google?platform=web';
};

const loginWithAppleOAuth = async () => {
  // If native Capacitor Apple Sign-in exists
  try {
    const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform();
    if (isNative && (window as any).SignInWithApple) {
      const res = await (window as any).SignInWithApple.authorize();
      await api.apiRequest({
        module: 'auth',
        service: 'APPLE_LOGIN',
        payload: {
          identityToken: res.response.identityToken,
          email: res.response.email,
          givenName: res.response.givenName,
          familyName: res.response.familyName,
          userIdentifier: res.response.user,
        },
        pinia: true,
      });
      emit('user-updated', api.currentUser.value);
      openAuthModal.value = false;
      toast.success(t('Logged in with Apple successfully!'));
    } else {
      toast.info('تسجيل الدخول عبر Apple متاح على أجهزة iOS والتطبيق الأصلي.', 'Apple Sign-In');
    }
  } catch (err: any) {
    toast.error(err.message || 'تعذر تسجيل الدخول عبر Apple');
  }
};

const handleLogout = async () => {
  await api.apiRequest({ module: 'auth', service: 'LOGOUT', pinia: true });
  emit('user-updated', null);
  router.push('/');
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.auth-section {
  padding-bottom: 20px;

  .logout-btn {
    width: 100%;
    padding: 12px;
    border-radius: 14px;
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fee2e2;
    font-size: 0.85rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &:hover {
      background: #fee2e2;
    }
  }

  .login-prompt-card {
    background: var(--unity-surface);
    border: 1.5px solid var(--unity-border);
    border-radius: 20px;
    padding: 18px;
    text-align: center;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);

    h5 {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--unity-text-main);
      margin-bottom: 4px;
    }

    p {
      font-size: 0.75rem;
      color: var(--unity-text-muted);
      line-height: 1.4;
      margin-bottom: 14px;
    }

    .login-action-btn {
      width: 100%;
      padding: 10px;
      border-radius: 12px;
      background: var(--unity-primary);
      color: #fff;
      border: none;
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;

      &:hover {
        background: var(--unity-primary-dark);
      }
    }
  }
}

.auth-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(6px);
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.auth-modal-sheet {
  width: 100%;
  max-width: 440px;
  background: var(--unity-surface);
  border-radius: 24px 24px 0 0;
  padding: 14px 20px 32px;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  .modal-pill {
    width: 40px;
    height: 4px;
    border-radius: 10px;
    background: var(--unity-border);
    margin: 0 auto 16px;
  }

  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--unity-text-main);
    margin-bottom: 18px;
    text-align: center;
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--unity-text-muted);
    }

    input {
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid var(--unity-border);
      background: var(--unity-bg);
      color: var(--unity-text-main);
      font-size: 0.85rem;
      outline: none;

      &:focus {
        border-color: var(--unity-primary);
      }
    }
  }

  .submit-auth-btn {
    margin-top: 6px;
    padding: 12px;
    border-radius: 14px;
    background: var(--unity-primary);
    color: #fff;
    border: none;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;

    &:hover {
      background: var(--unity-primary-dark);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .social-divider {
    display: flex;
    align-items: center;
    margin: 6px 0;
    text-align: center;

    &::before, &::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--unity-border);
    }

    span {
      padding: 0 10px;
      font-size: 0.72rem;
      color: var(--unity-text-dim);
      font-weight: 600;
    }
  }

  .social-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .social-btn {
      width: 100%;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid var(--unity-border);
      background: var(--unity-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--unity-text-main);
      transition: all 0.2s;

      .social-icon {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      &.google-btn:hover {
        background: var(--unity-bg);
        border-color: #cbd5e1;
      }

      &.apple-btn {
        background: #000;
        color: #fff;
        border-color: #000;

        &:hover {
          background: #1e1e1e;
        }
      }
    }
  }

  .toggle-auth-btn {
    background: none;
    border: none;
    color: var(--unity-primary);
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    margin-top: 4px;
    padding: 6px;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
