import { defineStore } from "pinia";

export const useGlobalStore = defineStore("loading", {
  state: () => ({
    loading: [] as string[],
  }),
  getters: {
    isLoading: (state) => (service: string) => state.loading.includes(service),
  },
  actions: {
    setLoading([service, loading]: [string, boolean]) {
      if (loading) {
        if (!this.loading.includes(service)) {
          this.loading.push(service);
        }
      } else {
        this.loading = this.loading.filter((s) => s != service);
      }
    },
  },
});

