import { defineConfig, loadEnv, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react(), splitVendorChunkPlugin()],
    define: {
      "process.env.VITE_FIREBASE_API_KEY": JSON.stringify(env.VITE_FIREBASE_API_KEY),
      "process.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
      "process.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
      "process.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
      "process.env.VITE_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      "process.env.VITE_FIREBASE_APP_ID": JSON.stringify(env.VITE_FIREBASE_APP_ID),
    },
    build: {
      chunkSizeWarningLimit: 900,
      target: "es2020",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/firebase")) {
              return "firebase";
            }
            if (id.includes("node_modules/framer-motion") || id.includes("node_modules/canvas-confetti")) {
              return "motion-effects";
            }
            if (
              id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/react-router-dom")
            ) {
              return "react-vendor";
            }
            return undefined;
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
