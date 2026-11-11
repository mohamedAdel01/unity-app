import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  ssr: false, // SPA Mode for smooth mobile-app interactions

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: false,
    },
  },

  modules: [
    '@pinia/nuxt',
  ],

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
      title: 'عيادات يونيتي التخصصية — Unity Clinics',
      htmlAttrs: {
        lang: 'ar',
        dir: 'rtl',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#007663' },
      ],
      link: [
        { rel: 'icon', type: 'image/webp', href: '/favicon.webp' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap' },
      ],
    },
  },
});
