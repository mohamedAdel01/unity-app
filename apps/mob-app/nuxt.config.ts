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

  routeRules: {
    '/v1/**': {
      proxy: 'http://localhost:4000/v1/**',
    },
    '/terms-and-conditions': { redirect: '/terms' },
    '/admin/promotion': { redirect: '/admin/promotions' },
    '/help': { redirect: '/support' },
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
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/');
            // فصل كود المشرف ولوحات الإدارة عن كود المرضى الأساسي
            if (normalizedId.includes('pages/admin') || normalizedId.includes('components/admin')) {
              return 'admin-portal';
            }
            // فصل مكتبة أرقام الهواتف
            if (normalizedId.includes('node_modules/libphonenumber-js')) {
              return 'libphonenumber';
            }
            // فصل مكتبات Capacitor
            if (normalizedId.includes('node_modules/@capacitor')) {
              return 'capacitor-vendor';
            }
          },
        },
      },
    },
  },

  devServer: {
    port: 3000,
  },

  modules: [
    '@pinia/nuxt',
  ],

  css: [
    '../../shared/assets/styles/primeicons-woff2.scss',
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