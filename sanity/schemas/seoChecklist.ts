import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'seoChecklist',
  title: 'SEO / AEO Checklist',
  type: 'object',
  fields: [
    defineField({ name: 'note', title: 'Note', type: 'string', readOnly: true, initialValue: 'This panel is informational only. Ensure the SEO/AEO fields on this post are complete before publishing.' }),
  ],
});
