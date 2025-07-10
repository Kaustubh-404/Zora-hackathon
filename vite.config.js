import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [
        react(),
        // Remove tailwindcss() plugin - we'll use PostCSS instead
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    define: {
        global: 'globalThis',
    },
    server: {
        port: 3000,
        host: true,
    },
    build: {
        rollupOptions: {
            external: [],
        },
    },
});
