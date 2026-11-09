<template>
  <form class="register-form-card" @submit.prevent="handleSubmit">
    <div class="input-field-group">
      <label class="field-label">{{ t('profile.fullName') }}</label>
      <div class="input-shell">
        <i class="pi pi-user field-icon"></i>
        <input 
          v-model="form.name" 
          type="text" 
          :placeholder="isRtl ? 'الاسم الثلاثي' : 'Full Name'" 
          required 
        />
      </div>
    </div>

    <div class="input-field-group">
      <label class="field-label">{{ t('profile.emailOrPhone') }}</label>
      <div class="input-shell">
        <i class="pi pi-envelope field-icon"></i>
        <input 
          v-model="form.identifier" 
          type="text" 
          :placeholder="isRtl ? '05XXXXXXXX أو البريد الإلكتروني' : '05XXXXXXXX or email'" 
          required 
        />
      </div>
    </div>

    <div class="input-field-group">
      <label class="field-label">{{ t('profile.password') }}</label>
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

    <button type="submit" class="submit-reg-btn" :disabled="globalStore.loading.includes('register')">
      <i v-if="globalStore.loading.includes('register')" class="pi pi-spin pi-spinner"></i>
      <span v-else>{{ t('auth.createNewAccount') }}</span>
      <i :class="isRtl ? 'pi pi-arrow-left' : 'pi pi-arrow-right'" class="btn-arrow"></i>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useGlobalStore } from '../../stores/global';

const router = useRouter();
const api = useUnityApi();
const { t, isRtl } = useI18n();
const globalStore = useGlobalStore();

const showPassword = ref(false);
const form = ref({
  name: '',
  identifier: '',
  password: '',
});

const handleSubmit = async () => {
  if (!form.value.name || !form.value.identifier || !form.value.password) return;
  try {
    globalStore.setLoading(['register', true]);
    const isEmail = form.value.identifier.includes('@');
    await api.register({
      name: form.value.name,
      email: isEmail ? form.value.identifier : undefined,
      phone: !isEmail ? form.value.identifier : undefined,
      password: form.value.password,
    });
    router.push({
      path: '/auth/otp',
      query: { target: form.value.identifier },
    });
  } catch (err: any) {
    alert(err.message || 'Registration error');
  } finally {
    globalStore.setLoading(['register', false]);
  }
};
</script>

<style scoped lang="scss">
.register-form-card {
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
  gap: 6px;

  .field-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--unity-text-main);
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

.submit-reg-btn {
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
  margin-top: 6px;

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

