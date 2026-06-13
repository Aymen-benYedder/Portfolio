import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'servicePage',
  title: 'Service Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (rule) => rule.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'body', title: 'Body', type: 'blockContent' }),
    defineField({ name: 'icon', title: 'Icon', type: 'string' }),
    defineField({ name: 'features', title: 'Features', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
});
