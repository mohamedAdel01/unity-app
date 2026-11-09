<template>
  <div class="otp-page">
    <OtpHeader />
    <OtpDisplay 
      :code="otpCode" 
      :target="targetIdentifier" 
      @resend="onResendOtp" 
    />
    <OtpKeypad 
      :code-length="otpCode.length" 
      :loading="isSubmitting"
      @digit="onDigitPress" 
      @backspace="onBackspacePress" 
      @clear="onClearPress" 
      @confirm="onConfirmOtp" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import OtpHeader from '../../components/auth/OtpHeader.vue';
import OtpDisplay from '../../components/auth/OtpDisplay.vue';
import OtpKeypad from '../../components/auth/OtpKeypad.vue';

definePageMeta({
  middleware: ['guest'],
});

const router = useRouter();
const route = useRoute();

const targetIdentifier = computed(() => {
  return (route.query.target as string) || '05XXXXXXXX';
});

const otpCode = ref('');
const isSubmitting = ref(false);

const onDigitPress = (digit: string) => {
  if (otpCode.value.length < 4) {
    otpCode.value += digit;
  }
};

const onBackspacePress = () => {
  if (otpCode.value.length > 0) {
    otpCode.value = otpCode.value.slice(0, -1);
  }
};

const onClearPress = () => {
  otpCode.value = '';
};

const onResendOtp = () => {
  otpCode.value = '';
  // Logic for resending OTP
};

const onConfirmOtp = async () => {
  if (otpCode.value.length < 4) return;
  try {
    isSubmitting.value = true;
    // Simulate verification or call API
    await new Promise(r => setTimeout(r, 600));
    router.push('/');
  } catch (err: any) {
    alert(err.message || 'OTP Verification failed');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.otp-page {
  min-height: calc(100vh - 40px);
  padding: 16px 18px 20px;
  display: flex;
  flex-direction: column;
}
</style>

