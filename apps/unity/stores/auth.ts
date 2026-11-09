import { defineStore } from 'pinia';

export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: 'admin' | 'doctor' | 'patient';
  avatar?: string | null;
  status: 'active' | 'inactive';
  patient?: any;
  doctor?: any;
  mrn?: string;
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
    currentUserName: (state) => state.user?.name || '',
  },

  actions: {
    initAuth() {
      if (typeof window !== 'undefined') {
        const savedToken = localStorage.getItem('unity_token');
        const savedUser = localStorage.getItem('unity_user');
        if (savedToken) {
          this.token = savedToken;
        }
        if (savedUser) {
          try {
            this.user = JSON.parse(savedUser);
          } catch {
            this.user = null;
          }
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
      }
    },

    setUser(user: AuthUser) {
      this.user = user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('unity_user', JSON.stringify(user));
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('unity_token');
        localStorage.removeItem('unity_user');
      }
    },
  },
});

