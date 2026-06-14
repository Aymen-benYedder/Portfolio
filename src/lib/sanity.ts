import type { SanityDocument } from 'sanity';
import createImageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

const pid = 'kv8mx0wv';
const ds = 'production';
const imageBuilder = createImageUrlBuilder({
  projectId: pid,
  dataset: ds,
});

export const urlFor = (source: SanityImageSource) => imageBuilder.image(source).auto('format').fit('max');

/**
 * Fetch data from Sanity API directly (bypassing the sanity:client virtual module)
 * This ensures compatibility with static site generation on Cloudflare Pages
 * @param query - GROQ query string
 * @returns Parsed JSON response from Sanity API
 */
export async function fetchSanityApi(query: string): Promise<any> {
  const token = import.meta.env.SANITY_API_READ_TOKEN;
  if (!token) {
    throw new Error('SANITY_API_READ_TOKEN not found in environment');
  }
  
  const encodedQuery = encodeURIComponent(query);
  const url = `https://${pid}.api.sanity.io/v2024-01-01/data/query/${ds}?query=${encodedQuery}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Sanity API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export const POSTS_QUERY = `*[_type == "post" && status == "published" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  status,
  publishedAt,
  updatedAt,
  readingTime,
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

export const POST_QUERY = `*[_type == "post" && status == "published" && slug.current == $slug][0] {
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
    email,
    address {
      streetAddress,
      addressLocality,
      addressRegion,
      postalCode,
      addressCountry
    }
  },
  seoTitle,
  seoDescription,
  canonicalUrl,
  noIndex,
  directAnswer,
  keyTakeaways,
  faq
}`;

export const ALL_SLUGS_QUERY = `*[_type == "post" && status == "published" && defined(slug.current)]{"slug": slug.current}`;

export const EXPERIENCES_QUERY = `*[_type == "experience"] | order(order asc)`;

export const PROJECTS_QUERY = `*[_type == "project"] | order(order asc)`;

export const SKILLS_QUERY = `*[_type == "skill"] | order(order asc)`;

export const FAQS_QUERY = `*[_type == "faq"] | order(order asc)`;

export const EDUCATION_QUERY = `*[_type == "education"] | order(order asc)`;

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]`;

export const SERVICES_QUERY = `*[_type == "servicePage"] | order(order asc)`;

export const SERVICE_QUERY = `*[_type == "servicePage" && slug.current == $slug][0]`;

export const AUTHORS_QUERY = `*[_type == "author"] | order(name asc) {
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
  email,
  sameAs,
  knowsAbout,
  address {
    streetAddress,
    addressLocality,
    addressRegion,
    postalCode,
    addressCountry
  }
}`;

export const AUTHOR_QUERY = `*[_type == "author" && slug.current == $slug][0] {
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
  email,
  sameAs,
  knowsAbout,
  address {
    streetAddress,
    addressLocality,
    addressRegion,
    postalCode,
    addressCountry
  }
}`;

export const CATEGORIES_QUERY = `*[_type == "category"] | order(title asc) { _id, title, slug, description }`;

export const TAGS_QUERY = `*[_type == "tag"] | order(title asc) { _id, title, slug }`;