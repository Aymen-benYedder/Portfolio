import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 4 }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
  orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
});
