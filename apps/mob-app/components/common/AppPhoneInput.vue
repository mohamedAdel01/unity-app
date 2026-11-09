<template>
  <div class="app-phone-input-wrapper" dir="ltr">
    <div class="phone-input-shell" :class="{ 'is-focused': isFocused, 'is-valid': isValid && phoneDigits, 'is-invalid': hasError }" dir="ltr">
      <!-- Country Code Picker Trigger (Pinned on the LEFT: Flag + DialCode + Chevron) -->
      <button 
        type="button" 
        class="country-picker-btn" 
        :title="isRtl ? 'تغيير مفتاح الدولة' : 'Change country code'"
        @click="toggleDropdown"
      >
        <span class="country-flag-box">
          <img :src="`/flags/${selectedCountry.code.toLowerCase()}.svg`" :alt="selectedCountry.code" class="country-flag-img" />
        </span>
        <span class="dial-code" dir="ltr">{{ selectedCountry.dialCode }}</span>
        <i class="pi pi-chevron-down arrow-icon" :class="{ 'open': isDropdownOpen }"></i>
      </button>

      <!-- Vertical Divider -->
      <div class="input-divider"></div>

      <!-- Phone Digits Input (In the middle, typing left-to-right) -->
      <div class="field-input-box">
        <input 
          ref="inputRef"
          v-model="phoneDigits" 
          type="tel" 
          :placeholder="computedPlaceholder" 
          dir="ltr"
          :maxlength="16"
          :required="required"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          data-form-type="other"
          @focus="onFocus"
          @blur="onBlur"
          @input="onInput"
        />
      </div>

      <!-- Validity / Icon Badge (On the far RIGHT) -->
      <div class="validation-badge">
        <span v-if="isValid && phoneDigits" class="valid-icon" :title="isRtl ? 'رقم هاتف صحيح' : 'Valid phone number'">
          <i class="pi pi-check-circle"></i>
        </span>
        <span v-else class="phone-icon-placeholder">
          <i class="pi pi-phone"></i>
        </span>
      </div>
    </div>

    <!-- Dropdown Menu for Countries (Egypt pinned at the top) -->
    <div v-if="isDropdownOpen" class="country-dropdown-overlay" @click="closeDropdown">
      <div class="country-dropdown-card" :dir="isRtl ? 'rtl' : 'ltr'" @click.stop>
        <div class="dropdown-header">
          <h6>{{ isRtl ? 'اختر الدولة' : 'Select Country' }}</h6>
          <button type="button" class="btn-close-dropdown" @click="closeDropdown">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <ul class="country-list">
          <li 
            v-for="c in countryList" 
            :key="c.code" 
            class="country-item"
            :class="{ 'selected': c.code === selectedCountry.code }"
            @click="selectCountry(c)"
          >
            <div class="country-info">
              <span class="country-flag-box">
                <img :src="`/flags/${c.code.toLowerCase()}.svg`" :alt="c.code" class="country-flag-img" />
              </span>
              <span class="country-name">{{ isRtl ? c.nameAr : c.nameEn }}</span>
              <span v-if="c.isDefault" class="default-badge">{{ isRtl ? 'افتراضي' : 'Default' }}</span>
            </div>
            <span class="country-dial-code" dir="ltr">{{ c.dialCode }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Error Hint -->
    <small v-if="hasError" class="phone-error-hint" :dir="isRtl ? 'rtl' : 'ltr'">
      {{ errorMessage || (isRtl ? `يرجى إدخال رقم هاتف صحيح (${selectedCountry.nameAr})` : `Please enter a valid phone number (${selectedCountry.nameEn})`) }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { isValidPhoneNumber, parsePhoneNumber, CountryCode } from 'libphonenumber-js';
import { useI18n } from '../../composables/useI18n';

interface CountryItem {
  code: CountryCode;
  nameAr: string;
  nameEn: string;
  dialCode: string;
  flag: string;
  placeholder: string;
  isDefault?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    required?: boolean;
    placeholder?: string;
    validateOnBlur?: boolean;
  }>(),
  {
    modelValue: '',
    required: false,
    placeholder: '',
    validateOnBlur: true,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'valid', isValid: boolean): void;
  (e: 'change', data: { raw: string; e164: string; isValid: boolean; country: string }): void;
}>();

const { isRtl } = useI18n();

const countryList: CountryItem[] = [
  { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt', dialCode: '+20', flag: '🇪🇬', placeholder: '01X XXXX XXXX', isDefault: true },
  { code: 'SA', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', placeholder: '05X XXX XXXX' },
  { code: 'AE', nameAr: 'الإمارات العربية المتحدة', nameEn: 'UAE', dialCode: '+971', flag: '🇦🇪', placeholder: '5X XXX XXXX' },
  { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', dialCode: '+965', flag: '🇰🇼', placeholder: '9XXX XXXX' },
  { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar', dialCode: '+974', flag: '🇶🇦', placeholder: '3XXX XXXX' },
  { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain', dialCode: '+973', flag: '🇧🇭', placeholder: '3XXX XXXX' },
  { code: 'OM', nameAr: 'عُمان', nameEn: 'Oman', dialCode: '+968', flag: '🇴🇲', placeholder: '9XXX XXXX' },
  { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', dialCode: '+962', flag: '🇯🇴', placeholder: '7X XXX XXXX' },
];

const selectedCountry = ref<CountryItem>(countryList[0]); // Default is Egypt (+20)
const phoneDigits = ref('');
const isFocused = ref(false);
const isTouched = ref(false);
const isDropdownOpen = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const computedPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder;
  return selectedCountry.value.placeholder;
});

// Robust phone validation with libphonenumber-js
const isValid = computed(() => {
  const clean = phoneDigits.value.replace(/[\s\-\(\)]/g, '').trim();
  if (!clean) return false;

  try {
    // If user enters international number starting with +
    if (clean.startsWith('+')) {
      return isValidPhoneNumber(clean);
    }
    // Validate with selected country code (e.g. EG)
    return isValidPhoneNumber(clean, selectedCountry.value.code);
  } catch {
    return false;
  }
});

const hasError = computed(() => {
  return isTouched.value && phoneDigits.value.trim().length > 0 && !isValid.value;
});

const errorMessage = computed(() => {
  if (!hasError.value) return '';
  if (selectedCountry.value.code === 'EG') {
    return isRtl.value
      ? 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01116515445)'
      : 'Please enter a valid Egyptian phone number (e.g. 01116515445)';
  }
  return isRtl.value
    ? `يرجى إدخال رقم هاتف صحيح (${selectedCountry.value.nameAr})`
    : `Please enter a valid phone number (${selectedCountry.value.nameEn})`;
});

// Build E.164 formatted number (e.g. +201116515445)
const getFormattedE164 = (): string => {
  const clean = phoneDigits.value.replace(/[\s\-\(\)]/g, '').trim();
  if (!clean) return '';

  try {
    if (clean.startsWith('+')) {
      return parsePhoneNumber(clean).format('E.164');
    }
    return parsePhoneNumber(clean, selectedCountry.value.code).format('E.164');
  } catch {
    // Fallback if parsing library fails: append dialCode
    if (clean.startsWith('+')) return clean;
    const dialDigits = selectedCountry.value.dialCode.replace('+', '');
    const national = clean.startsWith('0') ? clean.slice(1) : clean;
    return `+${dialDigits}${national}`;
  }
};

const notifyChange = () => {
  const e164 = getFormattedE164();
  emit('update:modelValue', e164);
  emit('valid', isValid.value);
  emit('change', {
    raw: phoneDigits.value,
    e164,
    isValid: isValid.value,
    country: selectedCountry.value.code,
  });
};

const onInput = () => {
  // If user pasted or typed full international number starting with + or 00
  let val = phoneDigits.value.trim();
  if (val.startsWith('00')) {
    val = '+' + val.slice(2);
  }
  if (val.startsWith('+')) {
    for (const c of countryList) {
      if (val.startsWith(c.dialCode)) {
        selectedCountry.value = c;
        phoneDigits.value = val.slice(c.dialCode.length).trim();
        break;
      }
    }
  }
  notifyChange();
};

const onFocus = () => {
  isFocused.value = true;
};

const onBlur = () => {
  isFocused.value = false;
  isTouched.value = true;
  notifyChange();
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const selectCountry = (c: CountryItem) => {
  selectedCountry.value = c;
  closeDropdown();
  inputRef.value?.focus();
  notifyChange();
};

// Sync incoming modelValue
watch(() => props.modelValue, (val) => {
  if (!val) {
    phoneDigits.value = '';
    return;
  }
  const clean = val.replace(/[\s\-\(\)]/g, '').trim();
  // Check if starts with a known country dial code
  let matched = false;
  for (const c of countryList) {
    if (clean.startsWith(c.dialCode)) {
      selectedCountry.value = c;
      const withoutDial = clean.slice(c.dialCode.length);
      if (withoutDial !== phoneDigits.value.replace(/[\s\-\(\)]/g, '')) {
        phoneDigits.value = withoutDial;
      }
      matched = true;
      break;
    }
  }
  if (!matched && clean !== phoneDigits.value) {
    phoneDigits.value = clean;
  }
}, { immediate: true });

onMounted(() => {
  if (phoneDigits.value) {
    notifyChange();
  }
});
</script>

<style scoped lang="scss">
.app-phone-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  position: relative;
  direction: ltr !important;
}

.phone-input-shell {
  display: flex;
  align-items: center;
  direction: ltr !important;
  flex-direction: row !important;
  background: var(--unity-surface);
  border: 1.5px solid var(--unity-border);
  border-radius: 16px;
  padding: 4px 12px;
  min-height: 52px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

  &.is-focused {
    border-color: var(--unity-primary, #007663);
    box-shadow: 0 0 0 3px rgba(0, 118, 99, 0.12);
  }

  &.is-valid {
    border-color: #10b981;
    background: #f0fdf4;
  }

  &.is-invalid {
    border-color: #ef4444;
    background: #fef2f2;
  }
}

.country-picker-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 4px;
  color: var(--unity-text-main);
  font-weight: 700;
  font-size: 0.95rem;
  border-radius: 8px;
  transition: background 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .country-flag-box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 17px;
    border-radius: 3px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    flex-shrink: 0;

    .country-flag-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .dial-code {
    font-family: inherit;
    font-weight: 700;
    color: var(--unity-text-main);
    letter-spacing: 0.2px;
    direction: ltr;
  }

  .arrow-icon {
    font-size: 0.72rem;
    color: var(--unity-text-muted);
    transition: transform 0.2s ease;

    &.open {
      transform: rotate(180deg);
    }
  }
}

.input-divider {
  width: 1.5px;
  height: 24px;
  background: var(--unity-border);
  margin: 0 10px;
  flex-shrink: 0;
}

.field-input-box {
  flex: 1;
  display: flex;
  align-items: center;

  input {
    width: 100%;
    border: none;
    background: transparent;
    outline: none;
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--unity-text-main);
    letter-spacing: 0.5px;
    padding: 8px 0;
    direction: ltr;
    text-align: left;

    &::placeholder {
      color: var(--unity-text-dim, #9ca3af);
      font-weight: 400;
      letter-spacing: normal;
    }
  }
}

.validation-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding-left: 8px;
  flex-shrink: 0;

  .valid-icon {
    color: #10b981;
    font-size: 1.15rem;
    animation: popIn 0.2s ease;
  }

  .phone-icon-placeholder {
    color: var(--unity-text-muted, #9ca3af);
    font-size: 1.05rem;
  }
}

@keyframes popIn {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

// Dropdown Overlay & Card
.country-dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(2px);
}

.country-dropdown-card {
  background: var(--unity-surface);
  border: 1px solid var(--unity-border);
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  max-height: 480px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideUp 0.25s ease;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--unity-border);

  h6 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--unity-text-main);
  }

  .btn-close-dropdown {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: var(--unity-bg);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--unity-text-muted);

    &:hover {
      background: var(--unity-border);
      color: var(--unity-text-main);
    }
  }
}

.country-list {
  list-style: none;
  margin: 0;
  padding: 8px 12px;
  overflow-y: auto;
  max-height: 380px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .country-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: var(--unity-bg);
    }

    &.selected {
      background: #ecfdf5;
      color: #065f46;

      .country-dial-code {
        color: #047857;
        font-weight: 700;
      }
    }

    .country-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .country-flag-box {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 18px;
        border-radius: 4px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        flex-shrink: 0;

        .country-flag-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      }

      .country-name {
        font-weight: 600;
        font-size: 0.95rem;
      }

      .default-badge {
        font-size: 0.72rem;
        background: #d1fae5;
        color: #065f46;
        padding: 2px 6px;
        border-radius: 6px;
        font-weight: 600;
      }
    }

    .country-dial-code {
      font-weight: 600;
      font-size: 0.92rem;
      color: var(--unity-text-muted);
    }
  }
}

.phone-error-hint {
  color: #ef4444;
  font-size: 0.78rem;
  font-weight: 500;
  padding-inline-start: 4px;
}
</style>

