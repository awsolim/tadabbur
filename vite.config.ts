import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // keeps SW updated automatically
      includeAssets: ["favicon.ico", "apple-touch-icon.png"], // include extra assets
      manifest: {
        name: "Tadabbur",
        short_name: "Tadabbur",
        description: "Islamic Tadabbur Halaqah",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable", // improves icon appearance on Android
          },
        ],
      },
      workbox: {
        // good default caching; you can tune later
        cleanupOutdatedCaches: true, // removes old caches
      },
    }),
  ],
});