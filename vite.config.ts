import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa"; // ✅ Adds PWA build + offline caching

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // ✅ Updates the service worker when you redeploy
      includeAssets: ["favicon.svg", "robots.txt"], // ✅ Cache static assets if present
      manifest: {
        name: "Tadabbur Halaqah",
        short_name: "Tadabbur",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
