import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'education',
  title: 'Education',
  type: 'document',
  fields: [
    defineField({ name: 'school', title: 'School', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'degree', title: 'Degree', type: 'string' }),
    defineField({ name: 'period', title: 'Period', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
});
