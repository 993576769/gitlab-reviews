import path from 'node:path';
import process from 'node:process';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const {
    TAURI_DEBUG,
    TAURI_DEV_HOST,
  } = loadEnv(mode, process.cwd(), '');

  return {
    // prevent vite from obscuring rust errors
    clearScreen: false,
    // Tauri expects a fixed port, fail if that port is not available
    server: {
      host: TAURI_DEV_HOST || false,
      port: 3000,
      strictPort: true,
      hmr: TAURI_DEV_HOST
        ? {
            protocol: 'ws',
            host: TAURI_DEV_HOST,
            port: 1430,
          }
        : undefined,
    },
    // to make use of `TAURI_PLATFORM`, `TAURI_ARCH`, `TAURI_FAMILY`,
    // `TAURI_PLATFORM_VERSION`, `TAURI_PLATFORM_TYPE` and `TAURI_DEBUG`
    // env variables
    envPrefix: ['VITE_', 'TAURI_'],
    build: {
      // Tauri supports es2021
      target: ['es2021', 'chrome100', 'safari13'],
      // don't minify for debug builds
      minify: !TAURI_DEBUG ? 'esbuild' : false,
      // produce sourcemaps for debug builds
      sourcemap: !!TAURI_DEBUG,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [vue()],
  };
});
