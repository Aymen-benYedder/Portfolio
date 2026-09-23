// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import { staticPosts } from './src/data/posts.ts';

// Real content dates for the sitemap — Google distrusts lastmod values that
// are stamped with build time on every deploy. Use the post's actual
// publishedAt (or updatedAt when present) instead.
const postLastmod = new Map(
  staticPosts.map((p) => [p.slug, p.updatedAt ?? p.publishedAt]),
);

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
      serialize: (page) => {
        const url = page.url;
        // Homepage: highest priority
        if (url === 'https://aymen.benyedder.top/') {
          return { ...page, changefreq: 'daily', priority: 1.0 };
        }
        // Individual blog posts: check BEFORE /blog/ to avoid wildcard catch
        if (url.startsWith('https://aymen.benyedder.top/blog/') && url !== 'https://aymen.benyedder.top/blog/') {
          const slug = url.replace('https://aymen.benyedder.top/blog/', '').replace(/\/$/, '');
          const lastmod = postLastmod.get(slug);
          return { ...page, changefreq: 'monthly', priority: 0.6, ...(lastmod ? { lastmod } : {}) };
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
    optimizeDeps: {
      // Pre-bundle animejs at server start so Vite never discovers it as a
      // "new dependency" mid-session (which caused 504 Outdated Optimize Dep
      // errors and broke the hero letter animation in dev).
      include: ['animejs'],
    },
  },
});