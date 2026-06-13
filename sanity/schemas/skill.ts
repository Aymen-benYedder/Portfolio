import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'skill',
  title: 'Skill Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Category Title', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'skills', title: 'Skills', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
  ],
});
