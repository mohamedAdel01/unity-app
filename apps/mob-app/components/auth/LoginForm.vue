<template>
  <form class="login-form-card" @submit.prevent="handleSubmit">
    <div class="input-field-group">
      <label class="field-label">{{ t('Email or Mobile Phone') }}</label>
      <div class="input-shell">
        <i class="pi pi-user field-icon"></i>
        <input 
          v-model="form.login" 
          type="text" 
          :placeholder="isRtl ? '05XXXXXXXX أو البريد الإلكتروني' : '05XXXXXXXX or email'" 
          required 
        />
      </div>
    </div>

    <div class="input-field-group">
      <label class="field-label">{{ t('Password') }}</label>
      <div class="input-shell">
        <i class="pi pi-lock field-icon"></i>
        <input 
          v-model="form.password" 
          :type="showPassword ? 'text' : 'password'" 
          placeholder="••••••••" 
          required 
        />
        <button type="button" class="eye-toggle-btn" @click="showPassword = !showPassword">
          <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
        </button>
      </div>
    </div>

    <button type="submit" class="submit-login-btn" :disabled="globalStore.loading.includes('login')">
      <i v-if="globalStore.loading.includes('login')" class="pi pi-spin pi-spinner"></i>
      <span v-else>{{ t('Sign In') }}</span>
      <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'" class="btn-arrow"></i>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useGlobalStore } from '../../stores/global';
import { useAppToast } from '../../composables/useAppToast';

const emit = defineEmits<{
  (e: 'success', user: any): void;
}>();

const router = useRouter();
const route = useRoute();
const api = useUnityApi();
const { t, isRtl } = useI18n();
const globalStore = useGlobalStore();
const toast = useAppToast();

const showPassword = ref(false);
const form = ref({
  login: '',
  password: '',
});

const handleSubmit = async () => {
  if (!form.value.login || !form.value.password) return;
  try {
    globalStore.setLoading(['login', true]);
    const res = await api.login(form.value.login, form.value.password);
    if (res.status && res.data?.user) {
      toast.success(isRtl.value ? 'مرحباً بك مجدداً!' : 'Welcome back!');
      emit('success', res.data.user);
      const target = (route.query.redirect as string) || '/';
      router.push(target);
    }
  } catch (err: any) {
    toast.error(err.message || 'فشل تسجيل الدخول');
  } finally {
    globalStore.setLoading(['login', false]);
  }
};
</script>

<style scoped lang="scss">
.login-form-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 22px;
  padding: 20px 18px;
  box-shadow: var(--unity-shadow-subtle);
}

.input-field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .field-label {
    font-size: 0.86rem;
    font-weight: 600;
    color: var(--unity-text-main);
    margin-bottom: 6px;
  }

  .input-shell {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--unity-bg);
    border: 1.5px solid var(--unity-border);
    border-radius: 14px;
    padding: 0 14px;
    height: 48px;
    transition: all 0.2s;

    &:focus-within {
      border-color: var(--unity-primary);
      background: var(--unity-surface);
      box-shadow: 0 0 0 3px var(--unity-primary-light);
    }

    .field-icon {
      font-size: 1rem;
      color: var(--unity-text-dim);
      margin-inline-end: 10px;
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.88rem;
      color: var(--unity-text-main);
      font-family: inherit;

      &::placeholder {
        color: var(--unity-text-dim);
      }
    }

    .eye-toggle-btn {
      background: transparent;
      border: none;
      color: var(--unity-text-dim);
      font-size: 1rem;
      cursor: pointer;
      padding: 4px;
    }
  }
}

.forgot-row {
  display: flex;
  justify-content: flex-end;

  .btn-otp-switch {
    background: transparent;
    border: none;
    color: var(--unity-primary);
    font-size: 0.76rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

.submit-login-btn {
  width: 100%;
  height: 50px;
  border-radius: 16px;
  background: var(--unity-primary);
  color: #fff;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 6px 18px rgba(4, 120, 87, 0.25);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--unity-primary-dark);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-arrow {
    font-size: 0.85rem;
  }
}
</style>

