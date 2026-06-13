import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 }),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: [{ title: 'Draft', value: 'draft' }, { title: 'Published', value: 'published' }] },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),

    defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime', validation: (rule) => rule.required() }),
    defineField({ name: 'updatedAt', title: 'Updated at', type: 'datetime' }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'readingTime', title: 'Reading Time (min)', type: 'number' }),

    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),

    defineField({ name: 'directAnswer', title: 'Direct Answer (AEO)', type: 'text', rows: 4, description: 'A concise 2-4 sentence answer at the top of the article for answer engines.' }),
    defineField({
      name: 'keyTakeaways',
      title: 'Key Takeaways (AEO)',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: '3-5 short takeaways that summarize the article.',
    }),
    defineField({
      name: 'faq',
      title: 'FAQ (AEO)',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required() },
          { name: 'answer', title: 'Answer', type: 'text', rows: 3, validation: (rule) => rule.required() },
        ],
        preview: { select: { title: 'question', subtitle: 'answer' } },
      }],
    }),

    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Override the <title> tag. Recommended 50-60 characters.',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2,
      description: 'Override the meta description. Recommended 150-160 characters.',
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL Override',
      type: 'url',
      description: 'Optional. Use only if the canonical URL differs from the default.',
    }),
    defineField({
      name: 'noIndex',
      title: 'No Index',
      type: 'boolean',
      initialValue: false,
      description: 'Prevent search engines from indexing this article.',
    }),

    defineField({
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alternative Text', validation: (rule) => rule.required() },
        { name: 'caption', type: 'string', title: 'Caption' },
      ],
    }),

    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
  ],
  orderings: [
    { title: 'Published Date (newest)', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
    { title: 'Published Date (oldest)', name: 'publishedAtAsc', by: [{ field: 'publishedAt', direction: 'asc' }] },
    { title: 'Featured first', name: 'featured', by: [{ field: 'featured', direction: 'desc' }, { field: 'publishedAt', direction: 'desc' }] },
    { title: 'Updated Date', name: 'updatedAt', by: [{ field: 'updatedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', media: 'image', status: 'status' },
    prepare({ title, media, status }) {
      return { title, media, subtitle: status ? `[${status}]` : undefined };
    },
  },
});
