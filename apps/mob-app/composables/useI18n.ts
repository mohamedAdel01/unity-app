import { ref, computed } from 'vue';
import ar from '../locales/ar';
import en from '../locales/en';

export type LocaleCode = 'ar' | 'en';

const currentLocale = ref<LocaleCode>('ar');

const dictionaries: Record<LocaleCode, Record<string, string>> = {
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

  /**
   * Bya3 Flat Translation function:
   * t("Medical Records & Lab Tests") -> returns Arabic translation in 'ar', English text in 'en'.
   */
  const t = (key: string, fallback?: string): string => {
    if (!key) return '';

    const dict = dictionaries[currentLocale.value] || dictionaries.ar;

    // Flat lookup: "English Key": "Arabic Translation"
    if (dict && typeof dict === 'object' && key in dict && typeof dict[key] === 'string') {
      return dict[key];
    }

    // In English mode, if not in dict, the key itself is already English!
    if (currentLocale.value === 'en') {
      return fallback || key;
    }

    // In Arabic mode, if missing, return fallback or key
    return fallback || key;
  };

  /**
   * Universal bilingual / JSON resolver:
   * Safely parses and resolves any string, object, or property that contains
   * multilingual data (e.g. '{"ar":"...","en":"..."}' or { ar: "...", en: "..." } or name_ar/name_en)
   * to the appropriate localized string based on the current active language.
   */
  const resolveI18n = (val: any): string => {
    return resolveI18nText(val, currentLocale.value);
  };

  return {
    locale: currentLocale,
    isRtl,
    setLocale,
    initLocale,
    t,
    resolveI18n,
  };
}

/**
 * Standalone export of resolveI18nText for use in non-composable utilities or stores
 */
export function resolveI18nText(val: any, targetLocale?: LocaleCode): string {
  if (val === null || val === undefined) return '';

  const activeLocale: LocaleCode = targetLocale || currentLocale.value || 'ar';
  const fallbackLocale: LocaleCode = activeLocale === 'ar' ? 'en' : 'ar';

  // 1. If it's already an object
  if (typeof val === 'object') {
    // If it has ar / en keys
    if (val[activeLocale]) return String(val[activeLocale]).trim();
    if (val[fallbackLocale]) return String(val[fallbackLocale]).trim();

    // If it has name_ar / name_en
    if (val.name_ar || val.name_en) {
      const primary = activeLocale === 'ar' ? val.name_ar : val.name_en;
      const secondary = activeLocale === 'ar' ? val.name_en : val.name_ar;
      if (primary) return String(primary).trim();
      if (secondary) return String(secondary).trim();
    }

    // If it has title_ar / title_en
    if (val.title_ar || val.title_en) {
      const primary = activeLocale === 'ar' ? val.title_ar : val.title_en;
      const secondary = activeLocale === 'ar' ? val.title_en : val.title_ar;
      if (primary) return String(primary).trim();
      if (secondary) return String(secondary).trim();
    }

    // If it has description_ar / description_en
    if (val.description_ar || val.description_en) {
      const primary = activeLocale === 'ar' ? val.description_ar : val.description_en;
      const secondary = activeLocale === 'ar' ? val.description_en : val.description_ar;
      if (primary) return String(primary).trim();
      if (secondary) return String(secondary).trim();
    }

    // If it has nested name or title
    if (val.name) return resolveI18nText(val.name, activeLocale);
    if (val.title) return resolveI18nText(val.title, activeLocale);

    return '';
  }

  // 2. If it's a string
  if (typeof val === 'string') {
    let str = val.trim();

    // Check if wrapped in quotes from JSON stringify
    if (str.startsWith('"') && str.endsWith('"') && str.length > 2) {
      try {
        const unescaped = JSON.parse(str);
        if (typeof unescaped === 'string') str = unescaped.trim();
        else if (typeof unescaped === 'object') return resolveI18nText(unescaped, activeLocale);
      } catch (_) {}
    }

    // If it contains a localized JSON object anywhere in the string
    // e.g. '{"ar":"...", "en":"..."}' or '({"ar":"...", "en":"..."})' or inside sentences
    if (str.includes('{') && str.includes('}') && (str.includes('ar') || str.includes('en'))) {
      const jsonRegex = /\{[^{}]*?(?:"ar"|'ar'|"en"|'en')[^{}]*?\}/g;
      str = str.replace(jsonRegex, (match) => {
        try {
          const cleanJson = match.replace(/'/g, '"');
          const parsed = JSON.parse(cleanJson);
          if (parsed && typeof parsed === 'object') {
            return resolveI18nText(parsed, activeLocale);
          }
        } catch (_) {}
        return match;
      });
    }

    return str;
  }

  return String(val);
}
