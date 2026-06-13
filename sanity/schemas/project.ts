import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'badge', title: 'Badge', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'link', title: 'Link URL', type: 'url' }),
    defineField({ name: 'linkText', title: 'Link Text', type: 'string' }),
    defineField({ name: 'meta', title: 'Meta (client, location, period)', type: 'string' }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
});
