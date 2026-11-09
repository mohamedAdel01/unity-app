export const storage = {
  // ─── Cookie / LocalStorage Auth Storage ──────────────────
  async get(key: string): Promise<string | null> {
    if (typeof window !== 'undefined') {
      const fromLocal = localStorage.getItem(key);
      if (fromLocal) return fromLocal;
    }
    if (typeof useCookie === 'function') {
      try {
        const c = useCookie(key);
        if (c.value !== undefined && c.value !== null) {
          return typeof c.value === 'string' ? c.value : JSON.stringify(c.value);
        }
      } catch (e) {}
    }
    return null;
  },

  async set(key: string, value: any, days = 7): Promise<void> {
    const strVal = typeof value === 'string' ? value : JSON.stringify(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, strVal);
    }
    if (typeof useCookie === 'function') {
      try {
        const c = useCookie(key, { maxAge: days * 86400, path: '/' });
        c.value = strVal;
      } catch (e) {}
    }
  },

  async remove(key: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
    if (typeof useCookie === 'function') {
      try {
        const c = useCookie(key);
        c.value = null;
      } catch (e) {}
    }
  },
};
