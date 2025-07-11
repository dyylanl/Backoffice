import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8081,
    proxy: {
      '/api/users': {
        target: 'https://user-api-production-99c2.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/users/, ''),
        headers: {
          'Access-Control-Allow-Origin': 'https://backoffice-seven-fawn.vercel.app',
        },
      },
    },
  },
});