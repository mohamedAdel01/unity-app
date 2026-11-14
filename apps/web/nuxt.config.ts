import { defineNuxtConfig } from 'nuxt/config';
import { fileURLToPath } from 'node:url';

const apiUrl = process.env.NUXT_PUBLIC_BASE_URL || process.env.BASE_URL || process.env.NUXT_PUBLIC_API_URL || process.env.API_URL || 'https://api.unity-clinics.cyou';

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  ssr: false,
  alias: {
    '@shared': fileURLToPath(new URL('../../shared', import.meta.url)),
  },
  runtimeConfig: {
    public: {
      BASE_URL: apiUrl,
      API_URL: apiUrl,
      apiUrl: apiUrl,
    },
  },

  experimental: {
    appManifest: false,
  },

  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      },
    },
    define: {
      'process.env.BASE_URL': JSON.stringify(apiUrl),
      'process.env.API_URL': JSON.stringify(apiUrl),
      'process.env.NUXT_PUBLIC_API_URL': JSON.stringify(apiUrl),
      'window.__UNITY_API_URL__': JSON.stringify(apiUrl),
    },
    build: {
      reportCompressedSize: false,
    },
  },

  devServer: {
    port: 3100,
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
      title: 'عيادات يونيتي التخصصية — Unity Specialized Clinics',
      htmlAttrs: {
        lang: 'ar',
        dir: 'rtl',
      },
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        { name: 'theme-color', content: '#007663' },
        { name: 'description', content: 'البوابة الرسمية لعيادات يونيتي التخصصية — الشروط وسياسة الخصوصية وطلب إدارة وحذف البيانات والحساب.' },
      ],
      link: [
        { rel: 'icon', type: 'image/webp', href: '/favicon.webp' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },
});
