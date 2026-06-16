// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://aymen.benyedder.top',
  output: 'static',
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
      lastmod: new Date(),
      serialize: (page) => {
        const url = page.url;
        // Homepage: highest priority
        if (url === 'https://aymen.benyedder.top/') {
          return { ...page, changefreq: 'daily', priority: 1.0, lastmod: new Date() };
        }
        // Individual blog posts: check BEFORE /blog/ to avoid wildcard catch
        if (url.startsWith('https://aymen.benyedder.top/blog/') && url !== 'https://aymen.benyedder.top/blog/') {
          return { ...page, changefreq: 'monthly', priority: 0.6, lastmod: new Date() };
        }
        // Blog index
        if (url === 'https://aymen.benyedder.top/blog/') {
          return { ...page, changefreq: 'weekly', priority: 0.7 };
        }
        // Core service pages
        if (url.includes('/services/')) {
          return { ...page, changefreq: 'monthly', priority: 0.8 };
        }
        // Default (contact, about, etc.)
        return { ...page, changefreq: 'monthly', priority: 0.5 };
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});