import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import regions from './fetch/region.mjs';

const isCE = process.env.WIND_BUILD_MODE === 'ce';

const emojiFromRegion = (region) => {
  switch (region) {
    case 'capetown':
      return '🇿🇦';
    case 'tarifa':
      return '🇪🇸';
    case 'holland':
      return '🇳🇱';
    case 'sweden':
      return '🇸🇪';
    default:
      return '🌍';
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_WIND_ENDPOINT,
  build: {
    rollupOptions: {
      input: {
        ...(isCE ? { 'main-ce': 'src/main.ce.js' } : { 'main': 'index.html' })
      }
    }
  },
  plugins: [
    vue({
      customElement: isCE,
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'jim-wind'
        }
      },
    }),
    {
      name: 'spotlist',
      resolveId(id) {
        if (id.startsWith('virtual:spotlist')) {
          return id;
        }
      },
      load(id) {
        if (!id.startsWith('virtual:spotlist')) {
          return null;
        }

        const spots = regions.flatMap(region =>
          region.spots.map(spot => ({
            ...spot,
            region: region.name,
            emoji: emojiFromRegion(region.name)
          }))
        ).sort((a, b) => a.name.localeCompare(b.name));

        return `export default ${JSON.stringify(spots)}`;
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:1337',
      }
    }
  }
});
