import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  ssr: false, // SPA Mode for smooth mobile-app interactions

  modules: [
    '@primevue/nuxt-module',
    '@pinia/nuxt',
  ],

  primevue: {
    options: {
      ripple: true,
      theme: 'none', // Uses our custom Unity Medical SCSS design system
    },
  },

  css: [
    'primeicons/primeicons.css',
    '../../shared/assets/styles/main.scss',
    '../../shared/assets/styles/rtl.scss',
  ],

  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'http://localhost:4000',
    },
  },

  app: {
    head: {
      title: 'Unity — الرعاية الصحية والطبية المتكاملة',
      htmlAttrs: {
        lang: 'ar',
        dir: 'rtl',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#047857' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Alexandria:wght@400;500;600;700;800&display=swap' },
      ],
    },
  },
});
