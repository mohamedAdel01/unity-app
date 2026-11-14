import { ref, onMounted } from 'vue';

export type AppTheme = 'light' | 'dark' | 'emerald' | 'teal';

const currentTheme = ref<'light' | 'dark'>('light');

export function useTheme() {
  const applyTheme = (theme: AppTheme | string) => {
    const normalized: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
    currentTheme.value = normalized;
    if (typeof window !== 'undefined') {
      localStorage.setItem('unity_theme', normalized);
      document.documentElement.setAttribute('data-theme', normalized);
      if (normalized === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const initTheme = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unity_theme');
      if (saved === 'dark') {
        applyTheme('dark');
      } else {
        applyTheme('light');
      }
    }
  };

  const toggleDark = () => {
    if (currentTheme.value === 'dark') {
      applyTheme('light');
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

