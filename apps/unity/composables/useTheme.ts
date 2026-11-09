import { ref, onMounted } from 'vue';

export type AppTheme = 'emerald' | 'teal' | 'dark';

const currentTheme = ref<AppTheme>('emerald');

export function useTheme() {
  const applyTheme = (theme: AppTheme) => {
    currentTheme.value = theme;
    if (typeof window !== 'undefined') {
      localStorage.setItem('unity_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const initTheme = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unity_theme') as AppTheme | null;
      if (saved && ['emerald', 'teal', 'dark'].includes(saved)) {
        applyTheme(saved);
      } else {
        applyTheme('emerald');
      }
    }
  };

  const toggleDark = () => {
    if (currentTheme.value === 'dark') {
      applyTheme('emerald');
    } else {
      applyTheme('dark');
    }
  };

  return {
    currentTheme,
    applyTheme,
    initTheme,
    toggleDark,
  };
}

