import { defineType, defineArrayMember } from 'sanity';

export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({ title: 'Block', type: 'block', styles: [
      { title: 'Normal', value: 'normal' },
      { title: 'H2', value: 'h2' },
      { title: 'H3', value: 'h3' },
      { title: 'H4', value: 'h4' },
      { title: 'Quote', value: 'blockquote' },
    ], lists: [{ title: 'Bullet', value: 'bullet' }, { title: 'Numbered', value: 'number' }],
    marks: { decorators: [
      { title: 'Strong', value: 'strong' },
      { title: 'Emphasis', value: 'em' },
      { title: 'Code', value: 'code' },
    ], annotations: [
      { name: 'link', type: 'object', title: 'Link', fields: [{ name: 'href', type: 'url', title: 'URL' }] },
    ] } }),
    defineArrayMember({ type: 'image', options: { hotspot: true }, fields: [
      { name: 'alt', type: 'string', title: 'Alternative Text' },
      { name: 'caption', type: 'string', title: 'Caption' },
    ] }),
    defineArrayMember({
      type: 'object',
      name: 'code',
      title: 'Code Block',
      fields: [
        { name: 'language', type: 'string', title: 'Language' },
        { name: 'filename', type: 'string', title: 'Filename' },
        { name: 'code', type: 'text', title: 'Code' },
        { name: 'highlightedLines', type: 'array', of: [{ type: 'number' }], title: 'Highlighted Lines' },
      ],
    }),
  ],
});
