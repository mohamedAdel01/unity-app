import { ref, computed } from 'vue';
import ar from '../locales/ar';
import en from '../locales/en';

export type LocaleCode = 'ar' | 'en';

const currentLocale = ref<LocaleCode>('ar');

const dictionaries: Record<LocaleCode, any> = {
  ar,
  en,
};

export function useI18n() {
  const isRtl = computed(() => currentLocale.value === 'ar');

  const setLocale = (lang: LocaleCode) => {
    currentLocale.value = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('unity_locale', lang);
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
    }
  };

  const initLocale = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unity_locale') as LocaleCode | null;
      if (saved && (saved === 'ar' || saved === 'en')) {
        setLocale(saved);
      } else {
        setLocale('ar');
      }
    }
  };

  const t = (path: string, fallback?: string): string => {
    const dict = dictionaries[currentLocale.value] || dictionaries.ar;
    const parts = path.split('.');
    let cur: any = dict;

    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) {
        cur = cur[p];
      } else {
        cur = undefined;
        break;
      }
    }

    if (cur !== undefined && typeof cur === 'string') {
      return cur;
    }

    // Try fallback to Arabic if missing in English
    if (currentLocale.value !== 'ar') {
      let arCur: any = dictionaries.ar;
      for (const p of parts) {
        if (arCur && typeof arCur === 'object' && p in arCur) {
          arCur = arCur[p];
        } else {
          arCur = undefined;
          break;
        }
      }
      if (arCur !== undefined && typeof arCur === 'string') return arCur;
    }

    return fallback || path;
  };

  return {
    locale: currentLocale,
    isRtl,
    setLocale,
    initLocale,
    t,
  };
}
