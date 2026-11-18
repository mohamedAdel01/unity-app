import { defineStore } from 'pinia';
import { storage } from '@shared/utils/storage';

export interface AuthUser {
  id: string;
  name: string;
  phone?: string | null;
  role: 'admin' | 'doctor' | 'patient' | 'receptionist';
  avatar?: string | null;
  status: 'active' | 'inactive';
  patient?: any;
  doctor?: any;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    token: null as string | null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    role: (state) => state.user?.role || null,
    isAdmin: (state) => state.user?.role === 'admin',
    isDoctor: (state) => state.user?.role === 'doctor',
    isPatient: (state) => state.user?.role === 'patient',
    isReceptionist: (state) => state.user?.role === 'receptionist',
    currentUserName: (state) => state.user?.name || '',
  },

  actions: {
    initAuth() {
      if (typeof window !== 'undefined') {
        const savedToken = localStorage.getItem('unity_token');
        const savedUser = localStorage.getItem('unity_user');
        this.token = savedToken || null;
        if (savedToken && savedUser) {
          try {
            this.user = JSON.parse(savedUser);
          } catch {
            this.user = null;
          }
        } else {
          this.user = null;
        }
        this.initialized = true;
      }
    },

    setAuth(user: AuthUser, token: string) {
      this.user = user;
      this.token = token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('unity_token', token);
        localStorage.setItem('unity_user', JSON.stringify(user));
        try {
          const nuxtApp = useNuxtApp();
          if ((nuxtApp as any)?.$triggerPushFlow) {
            (nuxtApp as any).$triggerPushFlow();
          }
        } catch (_) {}
      }
    },

    setUser(user: AuthUser) {
      this.user = user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('unity_user', JSON.stringify(user));
      }
    },

    async logout() {
      try {
        const nuxtApp = useNuxtApp();
        if ((nuxtApp as any)?.$unregisterPush) {
          await (nuxtApp as any).$unregisterPush();
        }
      } catch (_) {}

      this.user = null;
      this.token = null;
      this.initialized = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('unity_token');
        localStorage.removeItem('unity_user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        try {
          sessionStorage.clear();
        } catch (_) {}
      }
      if (typeof document !== 'undefined') {
        try {
          document.cookie = 'unity_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        } catch (_) {}
      }
      try {
        await storage.remove('unity_token');
        await storage.remove('unity_user');
        await storage.remove('token');
        await storage.remove('user');
      } catch (_) {}
    },

    // Bya3 Pinia Store Synchronization Action
    async MAIN({ service, response }: { service: string; payload?: any; filter?: any; response: any }) {
      switch (service) {
        case 'LOGIN':
        case 'REGISTER':
        case 'GOOGLE_TOKEN_LOGIN':
        case 'APPLE_LOGIN':
          if (response?.data?.token && response?.data?.user) {
            this.setAuth(response.data.user, response.data.token);
          }
          break;
        case 'UPDATE_PROFILE':
        case 'GET_PROFILE':
          if (response?.data?.user) {
            this.setUser(response.data.user);
          } else if (response?.data) {
            this.setUser(response.data);
          }
          break;
        case 'LOGOUT':
          await this.logout();
          break;
      }
    },
  },
});

