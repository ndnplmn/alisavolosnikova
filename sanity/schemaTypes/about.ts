import { defineField, defineType } from 'sanity'

export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'statement',
      type: 'text',
      title: 'Opening Statement',
      description: 'Large serif text at top of About page',
      rows: 3,
    }),
    defineField({
      name: 'bio',
      type: 'array',
      title: 'Biography',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'pullQuote',
      type: 'string',
      title: 'Pull Quote',
      description: 'Centered large quote, no quotation marks needed',
    }),
    defineField({
      name: 'portrait',
      type: 'image',
      title: 'Portrait Photo',
      options: { hotspot: true },
    }),
    defineField({
      name: 'clients',
      type: 'array',
      title: 'Clients / Publications',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'practice',
      type: 'object',
      title: 'Practice',
      fields: [
        { name: 'vision', type: 'array', title: 'Vision', of: [{ type: 'string' }] },
        { name: 'process', type: 'array', title: 'Process', of: [{ type: 'string' }] },
        { name: 'medium', type: 'array', title: 'Medium', of: [{ type: 'string' }] },
      ],
    }),
  ],
  preview: {
    select: { title: 'statement' },
    prepare({ title }: { title?: string }) {
      return { title: title ? title.substring(0, 60) : 'About Page' }
    },
  },
})
