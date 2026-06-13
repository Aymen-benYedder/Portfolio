import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: 'jobTitle', title: 'Job Title', type: 'string' }),
    defineField({ name: 'bio', title: 'Bio', type: 'text', rows: 4 }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, fields: [
      { name: 'alt', type: 'string', title: 'Alternative Text' },
    ]}),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'sameAs', title: 'Same As (URLs)', type: 'array', of: [{ type: 'url' }], options: { layout: 'tags' } }),
    defineField({ name: 'knowsAbout', title: 'Knows About', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'address', title: 'Address', type: 'object', fields: [
      { name: 'streetAddress', type: 'string', title: 'Street' },
      { name: 'addressLocality', type: 'string', title: 'City' },
      { name: 'addressRegion', type: 'string', title: 'Region' },
      { name: 'postalCode', type: 'string', title: 'Postal Code' },
      { name: 'addressCountry', type: 'string', title: 'Country (ISO-2)' },
    ]}),
  ],
  preview: { select: { title: 'name', media: 'image' } },
});
