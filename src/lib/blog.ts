import { staticPosts, type StaticPost } from '@data/posts';
import type { SanityDocument } from 'sanity';
import { urlFor, fetchSanityApi } from './sanity';
//+++
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  description?: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime?: number;
  body?: string;
  categories: string[];
  tags: string[];
  featured?: boolean;
  image?: {
    url: string;
    alt: string;
    caption?: string;
  };
  author?: {
    id: string;
    name: string;
    slug: string;
    jobTitle?: string;
    bio?: string;
    image?: string;
    sameAs?: string[];
    knowsAbout?: string[];
    email?: string;
  };
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  directAnswer?: string;
  keyTakeaways?: string[];
  faq?: { question: string; answer: string }[];
  isSanity: boolean;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  jobTitle?: string;
  bio?: string;
  image?: string;
  email?: string;
  sameAs?: string[];
  knowsAbout?: string[];
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

function normalizeSanityPost(post: SanityDocument): BlogPost {
  const categories = post.categories?.map((c: any) => c.title).filter(Boolean) || [];
  const tags = post.tags?.map((t: any) => t.title).filter(Boolean) || [];

  return {
    id: post._id,
    title: post.title,
    slug: post.slug.current,
    excerpt: post.excerpt,
    description: post.excerpt || post.seoDescription,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    readingTime: post.readingTime,
    body: post.body,
    categories,
    tags,
    featured: post.featured,
    image: post.image?.asset ? {
      url: urlFor(post.image.asset).width(1200).height(630).url(),
      alt: post.image.alt || '',
      caption: post.image.caption,
    } : undefined,
    author: post.author ? {
      id: post.author._id,
      name: post.author.name,
      slug: post.author.slug?.current,
      jobTitle: post.author.jobTitle,
      bio: post.author.bio,
      image: post.author.image?.asset ? urlFor(post.author.image.asset).width(200).height(200).url() : undefined,
      sameAs: post.author.sameAs,
      knowsAbout: post.author.knowsAbout,
      email: post.author.email,
    } : undefined,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    canonicalUrl: post.canonicalUrl,
    noIndex: post.noIndex,
    directAnswer: post.directAnswer,
    keyTakeaways: post.keyTakeaways,
    faq: post.faq,
    isSanity: true,
  };
}

function normalizeStaticPost(post: StaticPost): BlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    readingTime: post.readingTime,
    body: post.body,
    categories: post.categories,
    tags: post.tags,
    image: undefined,
    author: undefined,
    isSanity: false,
  };
}

export async function getNormalizedPosts(): Promise<BlogPost[]> {
  const { POSTS_QUERY } = await import('./sanity');

  let sanityPosts: SanityDocument[] = [];
  try {
    const data = await fetchSanityApi(POSTS_QUERY);
    sanityPosts = data.result || [];
  } catch (e) {
    console.warn('Failed to fetch Sanity posts, using static fallback:', e);
  }

  const staticFallback = staticPosts.map(normalizeStaticPost);

  if (sanityPosts.length > 0) {
    const sanityNormalized = sanityPosts.map(normalizeSanityPost);
    const allPosts = [...sanityNormalized, ...staticFallback];
    const seen = new Set<string>();
    const uniquePosts = allPosts.filter(post => {
      if (seen.has(post.slug)) return false;
      seen.add(post.slug);
      return true;
    });
    return uniquePosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  return staticFallback.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getNormalizedPost(slug: string): Promise<BlogPost | null> {
  const staticPost = staticPosts.find(p => p.slug === slug);
  if (staticPost) {
    return normalizeStaticPost(staticPost);
  }
  
  try {
    const POST_QUERY = `*[_type == "post" && status == "published" && slug.current == "${slug}"][0] {
      _id,
      title,
      slug,
      excerpt,
      status,
      publishedAt,
      updatedAt,
      readingTime,
      body,
      tags[]->{title, slug},
      categories[]->{title, slug},
      featured,
      image {
        asset->{
          _id,
          url
        },
        alt,
        caption
      },
      author->{
        _id,
        name,
        slug,
        jobTitle,
        bio,
        image {
          asset->{
            _id,
            url
          },
          alt
        },
        sameAs,
        knowsAbout,
        email
      },
      seoTitle,
      seoDescription,
      canonicalUrl,
      noIndex,
      directAnswer,
      keyTakeaways,
      faq
    }`;
    const data = await fetchSanityApi(POST_QUERY);
    const sanityPost = data.result;

    if (sanityPost) {
      return normalizeSanityPost(sanityPost);
    }
  } catch (e) {
    console.warn('Failed to fetch Sanity post:', e);
  }

  return null;
}

export function getAllNormalizedSlugs(): { slug: string }[] {
  const sanitySlugs = [] as { slug: string }[];
  const staticSlugs = staticPosts.map(p => ({ slug: p.slug }));
  const all = [...sanitySlugs, ...staticSlugs];
  const seen = new Set<string>();
  return all.filter(s => {
    if (seen.has(s.slug)) return false;
    seen.add(s.slug);
    return true;
  });
}

export function calculateReadingTime(body: string): number {
  const wordsPerMinute = 200;
  const text = body.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function getCanonicalUrl(slug: string, canonicalOverride?: string): string {
  if (canonicalOverride) return canonicalOverride;
  return `https://aymen.benyedder.top/blog/${slug}/`;
}

export function getRelatedPosts(posts: BlogPost[], currentSlug: string, limit = 3): BlogPost[] {
  const current = posts.find(p => p.slug === currentSlug);
  if (!current) return [];

  const related = posts
    .filter(p => p.slug !== currentSlug)
    .map(p => {
      let score = 0;
      const currentCategories = new Set(current.categories);
      const currentTags = new Set(current.tags);
      p.categories.forEach(c => { if (currentCategories.has(c)) score += 2; });
      p.tags.forEach(t => { if (currentTags.has(t)) score += 1; });
      return { post: p, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.post);

  return related;
}

export async function getAuthors(): Promise<Author[]> {
  try {
    const query = `*[_type == "author"] | order(name asc) {
      _id, name, slug, jobTitle, bio, image { asset->{ _id, url }, alt }, email, sameAs, knowsAbout, address
    }`;
    const data = await fetchSanityApi(query);
    const authors = data.result || [];
    return authors.map((a: any) => ({
      id: a._id,
      name: a.name,
      slug: a.slug.current,
      jobTitle: a.jobTitle,
      bio: a.bio,
      image: a.image?.asset ? urlFor(a.image.asset).width(200).height(200).url() : undefined,
      email: a.email,
      sameAs: a.sameAs,
      knowsAbout: a.knowsAbout,
      address: a.address,
    }));
  } catch (e) {
    console.warn('Failed to fetch authors:', e);
    return [];
  }
}