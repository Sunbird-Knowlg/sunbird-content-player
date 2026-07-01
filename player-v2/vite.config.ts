import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  if (command === 'serve') {
    /*
     * SCORM / HTML content is served from a CDN (e.g. Azure blob storage).
     * When player runs on localhost, CDN is cross-origin → window.parent.API blocked.
     * Set VITE_CDN_PROXY in .env.local to proxy CDN requests through localhost:
     *   VITE_CDN_PROXY=https://edsandboxda72f12a.blob.core.windows.net
     * Then content URL is rewritten to /content-proxy/<path> which Vite proxies.
     */
    const cdnProxy = env.VITE_CDN_PROXY;
    return {
      plugins: [react()],
      server: {
        port: 3001,
        proxy: cdnProxy ? {
          '/content-proxy': {
            target: cdnProxy,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/content-proxy/, ''),
          },
        } : undefined,
      },
      define: {
        __CDN_PROXY__: JSON.stringify(cdnProxy || ''),
      },
    };
  }

  return {
    plugins: [
      react(),
      dts({ include: ['src'], exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test', 'src/plugins/_testUtils.tsx'], outDir: 'dist', rollupTypes: true }),
    ],
    define: {
      __CDN_PROXY__: JSON.stringify(''),
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'SunbirdPlayer',
        formats: ['es', 'umd'],
        fileName: (format) => `sunbird-player.${format}.js`,
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
          },
          assetFileNames: 'sunbird-player[extname]',
        },
      },
      sourcemap: true,
      cssCodeSplit: false,
    },
  };
});
