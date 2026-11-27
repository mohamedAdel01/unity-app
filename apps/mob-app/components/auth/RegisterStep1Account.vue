<template>
  <form class="step-content register-step1" autocomplete="off" @submit.prevent="handleSubmit">
    <!-- Full Name -->
    <div class="input-field-group">
      <label class="field-label">{{ t('Full Name') }}</label>
      <div class="input-shell">
        <i class="pi pi-user field-icon"></i>
        <input 
          v-model="form.name" 
          type="text" 
          :placeholder="t('Full Name')" 
          required 
          autofocus
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          data-lpignore="true"
          data-1p-ignore="true"
        />
      </div>
    </div>

    <!-- Phone Number -->
    <div class="input-field-group">
      <label class="field-label">{{ t('Phone Number') }}</label>
      <AppPhoneInput 
        v-model="form.phone" 
        :required="true"
        @valid="val => isPhoneValid = val"
      />
    </div>

    <!-- Password -->
    <div class="input-field-group">
      <label class="field-label">{{ t('Password') }}</label>
      <div class="input-shell">
        <i class="pi pi-lock field-icon"></i>
        <input 
          v-model="form.password" 
          :type="showPassword ? 'text' : 'password'" 
          placeholder="••••••••" 
          required 
          minlength="6"
          autocomplete="new-password"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
        />
        <button 
          type="button" 
          class="eye-toggle-btn" 
          :aria-label="showPassword ? t('Hide') : t('Show')" 
          @click="showPassword = !showPassword"
        >
          <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
        </button>
      </div>
    </div>

    <!-- Referral / Invitation Code -->
    <div class="input-field-group">
      <label class="field-label">{{ t('Referral Code') }}</label>
      <div class="input-shell">
        <i class="pi pi-gift field-icon"></i>
        <input 
          v-model="form.referral_code" 
          type="text" 
          :placeholder="t('e.g. UNI1234 (Earn 50 bonus points)')" 
          dir="ltr"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="characters"
          spellcheck="false"
        />
      </div>
    </div>

    <!-- Step 1 Submit Button -->
    <button 
      type="submit" 
      class="nav-step-btn next-btn" 
      :disabled="!isValid || loading"
    >
      <i v-if="loading" class="pi pi-spin pi-spinner"></i>
      <span v-else>{{ t('Continue') }}</span>
    </button>
  </form>
</template>

<script setup lang="ts">
// 1. Setup & Imports (Imports, defineProps, defineEmits, definePageMeta, Composables, Stores)
import { ref, computed } from 'vue';
import { useUnityApi } from '../../composables/useUnityApi';
import { useI18n } from '../../composables/useI18n';
import { useAppToast } from '../../composables/useAppToast';
import { useGlobalStore } from '../../stores/global';
import AppPhoneInput from '../common/AppPhoneInput.vue';

const props = defineProps<{
  initialData?: {
    name?: string;
    phone?: string;
    referral_code?: string;
  };
}>();

const emit = defineEmits<{
  (e: 'success', data: { name: string; phone: string }): void;
}>();

const api = useUnityApi();
const { t } = useI18n();
const toast = useAppToast();
const globalStore = useGlobalStore();

// 2. Data (refs, reactive state)
const form = ref({
  name: props.initialData?.name || '',
  phone: props.initialData?.phone || '',
  password: '',
  referral_code: props.initialData?.referral_code || '',
});

const isPhoneValid = ref(false);
const showPassword = ref(false);

// 3. Computed (computed properties)
const loading = computed(() => globalStore.loading.includes('REGISTER') || globalStore.loading.includes('register'));

const isValid = computed(() => {
  return (
    form.value.name.trim().length >= 2 &&
    isPhoneValid.value &&
    form.value.password.length >= 6
  );
});

// 4. Methods (functions, handlers)
const handleSubmit = async () => {
  if (!isValid.value || loading.value) return;

  try {
    await api.apiRequest({
      module: 'auth',
      service: 'REGISTER',
      payload: {
        name: form.value.name.trim(),
        phone: form.value.phone.trim(),
        password: form.value.password,
        referral_code: form.value.referral_code ? form.value.referral_code.trim().toUpperCase() : undefined,
      },
      pinia: true,
    });

    toast.success(t('Account created successfully!'));
    emit('success', {
      name: form.value.name.trim(),
      phone: form.value.phone.trim(),
    });
  } catch (err: any) {
    toast.error(err.message || t('Failed to create account'));
  }
};

// 5. Watches (watch, watchEffect)

// 6. Hooks (onMounted, onUnmounted, etc.)

// 7. Meta (useHead, useSeoMeta)
</script>

<style scoped lang="scss">
.step-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .field-label {
    font-size: 0.82rem;
    font-weight: 700;
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
    transition: all 0.2s ease;

    &:focus-within {
      border-color: var(--unity-primary);
      background: var(--unity-surface);
      box-shadow: 0 0 0 3px rgba(var(--unity-primary-rgb), 0.12);
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
        font-size: 0.82rem;
      }
    }

    .eye-toggle-btn {
      background: none;
      border: none;
      color: var(--unity-text-dim);
      cursor: pointer;
      padding: 4px;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--unity-primary);
      }
    }
  }
}

.nav-step-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  border-radius: 14px;
  font-size: 0.90rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &.next-btn {
    background: var(--unity-primary);
    color: #ffffff;
    width: 100%;
    margin-top: 6px;
    box-shadow: 0 4px 14px rgba(var(--unity-primary-rgb), 0.25);

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background: var(--unity-primary-dark);
    }
  }
}
</style>
