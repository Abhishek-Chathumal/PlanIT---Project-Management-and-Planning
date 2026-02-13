import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://v2.tauri.app/start/frontend/vite/
export default defineConfig({
    plugins: [react()],

    // Prevent vite from obscuring Rust errors
    clearScreen: false,

    server: {
        // Tauri expects a fixed port; fail if that port is not available
        port: 1420,
        strictPort: true,
        // Allow Tauri to reach the dev server
        watch: {
            ignored: ['**/src-tauri/**'],
        },
    },

    // Env variables starting with TAURI_ are passed to the Tauri app
    envPrefix: ['VITE_', 'TAURI_ENV_*'],

    build: {
        // Tauri uses Chromium on Windows and WebKit on macOS and Linux
        target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari14',
        // Don't minify for debug builds
        minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
        // Produce sourcemaps for debug builds
        sourcemap: !!process.env.TAURI_ENV_DEBUG,
    },
});
