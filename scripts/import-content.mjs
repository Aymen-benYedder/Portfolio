import { createClient } from '@sanity/client';
import { staticPosts } from '../src/data/posts.js';

const client = createClient({
  projectId: 'kv8mx0wv',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2026-03-01',
  token: process.env.SANITY_WRITE_TOKEN
});

const author = {
  _type: 'author',
  name: 'Aymen ben Yedder',
  slug: { _type: 'slug', current: 'aymen-ben-yedder' },
  jobTitle: 'DevOps & Cloud Infrastructure Engineer',
  bio: 'DevOps Engineer and Web Systems Architect based in Medenine, Tunisia. 8+ years designing production infrastructure.',
  sameAs: [
    'https://github.com/Aymen-benYedder',
    'https://www.linkedin.com/in/aymenby'
  ],
  knowsAbout: ['Kubernetes', 'Terraform', 'ArgoCD', 'FluxCD', 'Docker', 'GitOps', 'CI/CD']
};

async function importContent() {
  console.log('Creating author...');
  const authorResult = await client.create(author).catch(e => console.log('Author may already exist:', e.message));
  console.log('Author created:', authorResult?._id);

  console.log('\nCreating categories...');
  const categories = ['DevOps', 'Cloud', 'Security', 'Infrastructure'];
  const createdCategories = [];
  for (const cat of categories) {
    const result = await client.create({
      _type: 'category',
      title: cat,
      slug: { _type: 'slug', current: cat.toLowerCase() }
    }).catch(e => console.log('Category error:', e.message));
    createdCategories.push({ title: cat, _id: result?._id });
    console.log('Created category:', cat);
  }

  console.log('\nCreating tags...');
  const tagsList = ['GitOps', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'DevOps', 'Security'];
  const createdTags = [];
  for (const tag of tagsList) {
    const result = await client.create({
      _type: 'tag',
      title: tag,
      slug: { _type: 'slug', current: tag.toLowerCase() }
    }).catch(e => console.log('Tag error:', e.message));
    createdTags.push({ title: tag, _id: result?._id });
    console.log('Created tag:', tag);
  }

  console.log('\nImporting blog posts...');
  for (const post of staticPosts) {
    const doc = {
      _type: 'post',
      title: post.title,
      slug: { _type: 'slug', current: post.slug },
      excerpt: post.description,
      status: 'published',
      publishedAt: post.publishedAt,
      readingTime: post.readingTime,
      directAnswer: 'This article covers ' + post.title + '. ' + post.description,
      keyTakeaways: [
        'Key insight 1 about ' + post.title,
        'Key insight 2 about the topic',
        'Key insight 3 for implementation'
      ],
      categories: createdCategories.filter(c => post.categories.includes(c.title)).map(c => ({ _type: 'reference', _ref: c._id })),
      tags: createdTags.filter(t => post.tags.includes(t.title)).map(t => ({ _type: 'reference', _ref: t._id })),
      author: authorResult ? { _type: 'reference', _ref: authorResult._id } : undefined,
      body: []
    };

    const result = await client.create(doc).catch(e => console.log('Post error:', e.message));
    console.log('Created post:', post.title);
  }

  console.log('\n✅ Import complete!');
}

importContent().catch(console.error);