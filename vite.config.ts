import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      },
      manifest: {
        name: 'Khu du lịch quốc gia Núi Bà Đen',
        short_name: 'Núi Bà Đen',
        description: 'Ứng dụng du lịch số cho Khu du lịch quốc gia Núi Bà Đen - Nóc nhà Nam Bộ',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#ffffff',
        theme_color: '#10b981',
        scope: '/',
        lang: 'vi',
        dir: 'ltr',
        categories: ['travel', 'tourism', 'lifestyle'],
        icons: [
          {
            src: '/assets/images/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/assets/images/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Bản đồ số',
            short_name: 'Bản đồ',
            description: 'Truy cập nhanh bản đồ du lịch số',
            url: '/map',
            icons: [
              {
                src: '/assets/images/android-chrome-192x192.png',
                sizes: '192x192'
              }
            ]
          },
          {
            name: 'Cẩm nang du lịch',
            short_name: 'Cẩm nang',
            description: 'Xem cẩm nang du lịch Núi Bà Đen',
            url: '/guide',
            icons: [
              {
                src: '/assets/images/android-chrome-192x192.png',
                sizes: '192x192'
              }
            ]
          },
          {
            name: 'Đăng ký leo núi',
            short_name: 'Leo núi',
            description: 'Đăng ký leo núi Bà Đen',
            url: '/climb',
            icons: [
              {
                src: '/assets/images/android-chrome-192x192.png',
                sizes: '192x192'
              }
            ]
          }
        ],

        related_applications: [],
        prefer_related_applications: false,
        edge_side_panel: {
          preferred_width: 400
        },
        launch_handler: {
          client_mode: 'navigate-existing'
        },
        handle_links: 'preferred',
        protocol_handlers: [
          {
            protocol: 'web+nuibaden',
            url: '/%s'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          map: ['leaflet', 'react-leaflet'],
          icons: ['lucide-react']
        }
      }
    }
  }
})
