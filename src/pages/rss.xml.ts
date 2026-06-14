import rss from '@astrojs/rss';
import { fetchSanityApi, urlFor } from '@lib/sanity';
import { staticPosts } from '@data/posts';

export const prerender = true;

function serializePortableText(body: any): string {
  if (!body) return '';
  if (typeof body === 'string') return body;
  
  let html = '';
  for (const block of body) {
    if (block._type === 'block') {
      let text = '';
      for (const span of block.children) {
        let content = span.text || '';
        if (span.marks?.includes('strong')) content = `<strong>${content}</strong>`;
        if (span.marks?.includes('em')) content = `<em>${content}</em>`;
        if (span.marks?.includes('code')) content = `<code>${content}</code>`;
        text += content;
      }
      const style = block.style || 'normal';
      if (style === 'h2') html += `<h2>${text}</h2>`;
      else if (style === 'h3') html += `<h3>${text}</h3>`;
      else if (style === 'blockquote') html += `<blockquote>${text}</blockquote>`;
      else html += `<p>${text}</p>`;
    } else if (block._type === 'image') {
      const src = block.asset?._ref ? urlFor(block).width(800).url() : '';
      const alt = block.alt || '';
      html += `<figure><img src="${src}" alt="${alt}" /></figure>`;
    } else if (block._type === 'code') {
      html += `<pre><code>${block.code}</code></pre>`;
    }
  }
  return html;
}

export async function GET() {
  let sanityPosts: any[] = [];
  try {
    const query = `*[_type == "post" && status == "published" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) {
      _id, title, slug, excerpt, publishedAt, updatedAt, tags[]->{title}, categories[]->{title}, body
    }`;
    const data = await fetchSanityApi(query);
    sanityPosts = data.result || [];
  } catch (e) {
    console.warn('Failed to fetch Sanity posts for RSS:', e);
  }

  const staticFallback = staticPosts.map(p => ({
    _id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    publishedAt: p.publishedAt,
    updatedAt: p.updatedAt,
    categories: p.categories,
    tags: p.tags,
    body: p.body,
    status: 'published',
  }));

  const posts = sanityPosts.length > 0 ? sanityPosts : staticFallback;

  const items = posts.map((post: any) => {
    const slug = post.slug?.current || post.slug;
    const bodyHtml = post.body ? serializePortableText(post.body) : '';
    
    return {
      title: post.title,
      link: `/blog/${slug}/`,
      pubDate: new Date(post.publishedAt),
      description: post.description || post.excerpt || '',
      categories: post.categories || [],
      author: 'Aymen ben Yedder',
      customData: `
        <content:encoded><![CDATA[${bodyHtml}]]></content:encoded>
        ${post.tags?.length ? post.tags.map((t: any) => `<category>${t.title || t}</category>`).join('') : ''}
      `,
    };
  });

  return rss({
    title: 'AYMEN.DEV Technical Blog',
    description: 'Technical writing on DevOps, system resilience, observability, and full-stack engineering.',
    site: 'https://aymen.benyedder.top',
    xmlns: { 
      atom: 'http://www.w3.org/2005/Atom',
      content: 'http://purl.org/rss/1.0/modules/content/',
    },
    customData: `<language>en-us</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate><atom:link href="https://aymen.benyedder.top/rss.xml" rel="self" type="application/rss+xml"/>`,
    items,
  });
}