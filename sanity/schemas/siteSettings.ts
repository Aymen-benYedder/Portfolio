import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Site Title', type: 'string' }),
    defineField({ name: 'description', title: 'Site Description', type: 'text', rows: 2 }),
    defineField({ name: 'aboutText', title: 'About Text', type: 'blockContent' }),
    defineField({ name: 'status', title: 'Status', type: 'string', options: { list: ['available', 'busy', 'unavailable'] } }),
  ],
});
