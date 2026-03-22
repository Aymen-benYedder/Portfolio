# SEO/GEO Auto Generator

Regenerates:
- `sitemap.xml`
- `rss.xml`
- `llms.txt`
- `llms-full.txt`

## Run

```bash
node scripts/generate-seo-assets.mjs
```

## When to run

- After publishing a new blog post.
- After changing a post title/description/date.
- Before deploying SEO updates.

## Notes

- Excludes: `blog/template.html`, `blog/sample-post.html`
- Uses metadata from each blog post (`title`, `description`, `article:published_time`, `article:modified_time`).
