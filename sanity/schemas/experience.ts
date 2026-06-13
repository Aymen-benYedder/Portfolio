import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'experience',
  title: 'Work Experience',
  type: 'document',
  fields: [
    defineField({ name: 'company', title: 'Company', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'period', title: 'Period', type: 'string' }),
    defineField({ name: 'role', title: 'Role', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'highlight', title: 'Highlight', type: 'string' }),
    defineField({ name: 'skills', title: 'Skills', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
  orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
});
