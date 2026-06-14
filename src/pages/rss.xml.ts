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
      _id, title, slug, description, publishedAt, categories[]->{title}
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
    categories: p.categories,
  }));

  const posts = sanityPosts.length > 0 ? sanityPosts : staticFallback;

  const items = posts.map((post: any) => {
    // Extract category titles from objects if needed
    const categoryTitles = post.categories?.map((cat: any) => 
      cat && cat.title ? cat.title : String(cat)
    ).filter(Boolean) || [];
    
    return {
      title: post.title || 'Untitled',
      link: `/blog/${post.slug?.current || post.slug}/`,
      pubDate: new Date(post.publishedAt),
      description: post.description || '',
      categories: categoryTitles,
      author: 'Aymen ben Yedder',
    };
  });

  return rss({
    title: 'AYMEN.DEV Technical Blog',
    description: 'Technical writing on DevOps, system resilience, observability, and full-stack engineering.',
    site: 'https://aymen.benyedder.top',
    items,
  });
}