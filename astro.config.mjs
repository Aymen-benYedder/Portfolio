// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://aymen.benyedder.top',
  output: 'static',
  adapter: cloudflare({
    imageService: true,
    platformProxy: { enabled: true },
  }),
  integrations: [
    react(),
    sanity({
      projectId: 'kv8mx0wv',
      dataset: 'production',
      apiVersion: '2026-03-01',
      useCdn: false,
    }),
    sitemap({
      filter: (page) => !page.includes('/sample-post') && !page.includes('/template') && !page.includes('/admin'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date('2026-06-13'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});