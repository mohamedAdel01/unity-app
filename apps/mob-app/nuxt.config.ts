import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  ssr: false,
  runtimeConfig: {
    public: {
      API_URL: process.env.NUXT_PUBLIC_API_URL || 'https://api.unity-clinics.cyou',
    },
  },

  experimental: {
    appManifest: false,
  },

  vite: {
    build: {
      reportCompressedSize: false,
    },
  },

  devServer: {
    port: 4000,
  },

  modules: [
    '@pinia/nuxt',
  ],

  css: [
    'primeicons/primeicons.css',
    '../../shared/assets/styles/main.scss',
    '../../shared/assets/styles/rtl.scss',
  ],

  app: {
    head: {
      title: 'عيادات يونيتي التخصصية — Unity Clinics',
      htmlAttrs: {
        lang: 'ar',
        dir: 'rtl',
      },
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
        },
        { name: 'theme-color', content: '#007663' },
      ],
      link: [
        { rel: 'icon', type: 'image/webp', href: '/favicon.webp' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
});