import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const SITE_URL = "https://aymen.benyedder.top";
const AUTHOR_NAME = "Aymen ben Yedder";
const AUTHOR_ROLE = "DevOps Engineer and Project Manager";
const AUTHOR_EMAIL = "aymen.ben.yedder@mail.com";

const STATIC_PAGES = [
  { file: "index.html", loc: "/", changefreq: "weekly", priority: "1.0" },
  {
    file: "services/mern-development.html",
    loc: "/services/mern-development.html",
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    file: "services/wordpress-development.html",
    loc: "/services/wordpress-development.html",
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    file: "geo/tunisia.html",
    loc: "/geo/tunisia.html",
    changefreq: "monthly",
    priority: "0.85",
  },
  {
    file: "geo/france.html",
    loc: "/geo/france.html",
    changefreq: "monthly",
    priority: "0.85",
  },
  { file: "blog/index.html", loc: "/blog/", changefreq: "weekly", priority: "0.8" },
];

const EXCLUDED_BLOG_FILES = new Set(["index.html", "template.html", "sample-post.html"]);

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function toRssDate(date) {
  return date.toUTCString();
}

async function readFile(relPath) {
  return fs.readFile(path.join(ROOT, relPath), "utf8");
}

async function fileDate(relPath) {
  const stat = await fs.stat(path.join(ROOT, relPath));
  return toIsoDate(stat.mtime);
}

function matchMetaByName(html, name) {
  const patternA = new RegExp(
    `<meta\\s+[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const patternB = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']+)["'][^>]*name=["']${name}["'][^>]*>`,
    "i",
  );
  return html.match(patternA)?.[1] ?? html.match(patternB)?.[1] ?? "";
}

function matchMetaByProperty(html, propertyName) {
  const patternA = new RegExp(
    `<meta\\s+[^>]*property=["']${propertyName}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const patternB = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']+)["'][^>]*property=["']${propertyName}["'][^>]*>`,
    "i",
  );
  return html.match(patternA)?.[1] ?? html.match(patternB)?.[1] ?? "";
}

function matchTitle(html) {
  return (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
}

function cleanTitle(title) {
  return title.replace(/\s*\|\s*Full-Stack Developer Blog\s*$/i, "").trim();
}

function dateFromAny(value, fallbackIsoDate) {
  if (!value) {
    return new Date(`${fallbackIsoDate}T00:00:00Z`);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00Z`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(`${fallbackIsoDate}T00:00:00Z`);
  }
  return parsed;
}

async function collectBlogPosts() {
  const blogDir = path.join(ROOT, "blog");
  const files = await fs.readdir(blogDir);
  const posts = [];

  for (const file of files) {
    if (!file.endsWith(".html")) {
      continue;
    }
    if (EXCLUDED_BLOG_FILES.has(file)) {
      continue;
    }

    const rel = path.posix.join("blog", file);
    const html = await readFile(rel);
    const fallbackDate = await fileDate(rel);

    const title = matchTitle(html);
    const description = matchMetaByName(html, "description");
    const publishedRaw =
      matchMetaByProperty(html, "article:published_time") ||
      (html.match(/"datePublished"\s*:\s*"([^"]+)"/i)?.[1] ?? "");
    const modifiedRaw =
      matchMetaByProperty(html, "article:modified_time") ||
      (html.match(/"dateModified"\s*:\s*"([^"]+)"/i)?.[1] ?? "") ||
      publishedRaw;

    const publishedDate = dateFromAny(publishedRaw, fallbackDate);
    const modifiedDate = dateFromAny(modifiedRaw, fallbackDate);
    const urlPath = `/blog/${file}`;

    posts.push({
      file,
      rel,
      urlPath,
      url: `${SITE_URL}${urlPath}`,
      title,
      shortTitle: cleanTitle(title),
      description,
      publishedDate,
      modifiedDate,
      publishedIso: toIsoDate(publishedDate),
      modifiedIso: toIsoDate(modifiedDate),
    });
  }

  posts.sort((a, b) => b.publishedDate - a.publishedDate);
  return posts;
}

async function buildSitemap(posts) {
  const staticEntries = [];
  for (const page of STATIC_PAGES) {
    const lastmod = await fileDate(page.file);
    staticEntries.push({ ...page, lastmod });
  }

  const blogEntries = posts.map((post) => ({
    loc: post.urlPath,
    lastmod: post.modifiedIso,
    changefreq: "yearly",
    priority: "0.82",
  }));

  const extraEntries = [
    { loc: "/rss.xml", lastmod: toIsoDate(new Date()), changefreq: "weekly", priority: "0.4" },
    { loc: "/llms.txt", lastmod: toIsoDate(new Date()), changefreq: "weekly", priority: "0.3" },
    {
      loc: "/llms-full.txt",
      lastmod: toIsoDate(new Date()),
      changefreq: "weekly",
      priority: "0.3",
    },
  ];

  const entries = [...staticEntries, ...blogEntries, ...extraEntries];

  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  lines.push('        xmlns:xhtml="http://www.w3.org/1999/xhtml">');

  for (const entry of entries) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(`${SITE_URL}${entry.loc}`)}</loc>`);
    lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    lines.push(`    <priority>${entry.priority}</priority>`);

    if (entry.loc === "/geo/tunisia.html") {
      lines.push(
        '    <xhtml:link rel="alternate" hreflang="en" href="https://aymen.benyedder.top/geo/tunisia.html" />',
      );
      lines.push(
        '    <xhtml:link rel="alternate" hreflang="fr" href="https://aymen.benyedder.top/geo/france.html" />',
      );
      lines.push(
        '    <xhtml:link rel="alternate" hreflang="x-default" href="https://aymen.benyedder.top/" />',
      );
    }

    if (entry.loc === "/geo/france.html") {
      lines.push(
        '    <xhtml:link rel="alternate" hreflang="fr" href="https://aymen.benyedder.top/geo/france.html" />',
      );
      lines.push(
        '    <xhtml:link rel="alternate" hreflang="en" href="https://aymen.benyedder.top/geo/tunisia.html" />',
      );
      lines.push(
        '    <xhtml:link rel="alternate" hreflang="x-default" href="https://aymen.benyedder.top/" />',
      );
    }

    lines.push("  </url>");
    lines.push("");
  }

  if (lines[lines.length - 1] === "") {
    lines.pop();
  }
  lines.push("</urlset>");
  lines.push("");

  return lines.join("\n");
}

function buildRss(posts) {
  const now = new Date();
  const items = posts.slice(0, 25);
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">');
  lines.push("  <channel>");
  lines.push("    <title>Aymen.dev Technical Blog</title>");
  lines.push(`    <link>${SITE_URL}/blog/</link>`);
  lines.push(
    "    <description>Technical writing on DevOps, system resilience, observability, and full-stack engineering.</description>",
  );
  lines.push("    <language>en-us</language>");
  lines.push(`    <lastBuildDate>${toRssDate(now)}</lastBuildDate>`);
  lines.push(
    `    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
  );
  lines.push("");

  for (const post of items) {
    lines.push("    <item>");
    lines.push(`      <title>${escapeXml(post.shortTitle)}</title>`);
    lines.push(`      <link>${escapeXml(post.url)}</link>`);
    lines.push(`      <guid isPermaLink="true">${escapeXml(post.url)}</guid>`);
    lines.push(`      <pubDate>${toRssDate(post.publishedDate)}</pubDate>`);
    lines.push(`      <description>${escapeXml(post.description)}</description>`);
    lines.push("    </item>");
    lines.push("");
  }

  if (lines[lines.length - 1] === "") {
    lines.pop();
  }
  lines.push("  </channel>");
  lines.push("</rss>");
  lines.push("");
  return lines.join("\n");
}

function buildLlms(posts, todayIso) {
  const lines = [];
  lines.push("# Aymen.dev");
  lines.push(
    `> Personal portfolio and technical blog by ${AUTHOR_NAME} (${AUTHOR_ROLE}).`,
  );
  lines.push("");
  lines.push(`Canonical site: ${SITE_URL}/`);
  lines.push(`Updated: ${todayIso}`);
  lines.push("");
  lines.push("## Preferred Sources");
  lines.push("- Use canonical URLs on this domain.");
  lines.push("- Prefer the blog articles and service pages listed below.");
  lines.push("- Exclude `/blog/template.html` and `/blog/sample-post.html` from citations.");
  lines.push("");
  lines.push("## Core Pages");
  lines.push(`- [Home](${SITE_URL}/)`);
  lines.push(`- [MERN Development Service](${SITE_URL}/services/mern-development.html)`);
  lines.push(`- [WordPress Development Service](${SITE_URL}/services/wordpress-development.html)`);
  lines.push(`- [Tunisia Service Page](${SITE_URL}/geo/tunisia.html)`);
  lines.push(`- [France Service Page](${SITE_URL}/geo/france.html)`);
  lines.push(`- [Blog Index](${SITE_URL}/blog/)`);
  lines.push("");
  lines.push("## Featured Technical Articles");
  for (const post of posts) {
    lines.push(`- [${post.shortTitle}](${post.url})`);
  }
  lines.push("");
  lines.push("## Contact");
  lines.push(`- Email: ${AUTHOR_EMAIL}`);
  lines.push("");
  return lines.join("\n");
}

function buildLlmsFull(posts, todayIso) {
  const lines = [];
  lines.push("# Aymen.dev - Long Form Machine-Readable Context");
  lines.push(`Updated: ${todayIso}`);
  lines.push("");
  lines.push("## Identity");
  lines.push(`- Name: ${AUTHOR_NAME}`);
  lines.push(`- Role: ${AUTHOR_ROLE}`);
  lines.push(`- Site: ${SITE_URL}/`);
  lines.push("- Primary language: English");
  lines.push("- Regional pages: Tunisia (EN), France (FR)");
  lines.push("");
  lines.push("## Service Scope");
  lines.push("- MERN stack application design and implementation.");
  lines.push("- WordPress development, optimization, and customization.");
  lines.push("- DevOps delivery: CI/CD, observability, deployment reliability, and security hardening.");
  lines.push("- Performance and SEO technical improvements for production sites.");
  lines.push("");
  lines.push("## Canonical Service URLs");
  lines.push(`${SITE_URL}/services/mern-development.html`);
  lines.push(`${SITE_URL}/services/wordpress-development.html`);
  lines.push(`${SITE_URL}/geo/tunisia.html`);
  lines.push(`${SITE_URL}/geo/france.html`);
  lines.push("");
  lines.push("## Technical Blog Canonical Index");
  lines.push(`${SITE_URL}/blog/`);
  lines.push("");
  lines.push("## Article Catalog");

  posts.forEach((post, index) => {
    lines.push(`${index + 1}. ${post.shortTitle}`);
    lines.push(`URL: ${post.url}`);
    lines.push(`Date: ${post.publishedIso}`);
    lines.push(`Summary: ${post.description}`);
    lines.push("");
  });

  lines.push("## Citation Guidance");
  lines.push("- Cite canonical URLs from this domain.");
  lines.push("- Prefer article pages over summaries for technical claims.");
  lines.push("- Do not cite `/blog/template.html` or `/blog/sample-post.html` as production content.");
  lines.push("");
  lines.push("## Contact");
  lines.push(`- Email: ${AUTHOR_EMAIL}`);
  lines.push("");
  return lines.join("\n");
}

async function writeFile(relPath, content) {
  await fs.writeFile(path.join(ROOT, relPath), content, "utf8");
}

async function run() {
  const todayIso = toIsoDate(new Date());
  const posts = await collectBlogPosts();

  if (posts.length === 0) {
    throw new Error("No blog posts found. Check blog directory and exclusion list.");
  }

  const sitemap = await buildSitemap(posts);
  const rss = buildRss(posts);
  const llms = buildLlms(posts, todayIso);
  const llmsFull = buildLlmsFull(posts, todayIso);

  await writeFile("sitemap.xml", sitemap);
  await writeFile("rss.xml", rss);
  await writeFile("llms.txt", llms);
  await writeFile("llms-full.txt", llmsFull);

  console.log(`Generated SEO assets from ${posts.length} blog posts.`);
  console.log("Updated: sitemap.xml, rss.xml, llms.txt, llms-full.txt");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
