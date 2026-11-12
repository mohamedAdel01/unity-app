import { defineStore } from 'pinia';

export interface AuthUser {
  id: string;
  name: string;
  phone?: string | null;
  role: 'admin' | 'doctor' | 'patient' | 'receptionist';
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
          this.logout();
          break;
      }
    },
  },
});

