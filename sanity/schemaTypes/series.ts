import { defineField, defineType } from 'sanity'

export const series = defineType({
  name: 'series',
  title: 'Series',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Title', validation: r => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: { source: 'title' },
      validation: r => r.required(),
    }),
    defineField({ name: 'year', type: 'number', title: 'Year', validation: r => r.required() }),
    defineField({
      name: 'mode',
      type: 'string',
      title: 'Display Mode',
      description: 'Dark for B&W series, Light for color series',
      options: { list: [{ title: 'Dark (B&W)', value: 'dark' }, { title: 'Light (Color)', value: 'light' }], layout: 'radio' },
      initialValue: 'dark',
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      title: 'Cover Image',
      options: { hotspot: true },
    }),
    defineField({ name: 'description', type: 'text', title: 'Description', rows: 3 }),
    defineField({
      name: 'photos',
      type: 'array',
      title: 'Photos',
      of: [{ type: 'reference', to: [{ type: 'photo' }] }],
      validation: r => r.min(1),
    }),
    defineField({ name: 'order', type: 'number', title: 'Display Order' }),
  ],
  orderings: [{
    title: 'Display Order',
    name: 'orderAsc',
    by: [{ field: 'order', direction: 'asc' }],
  }],
  preview: {
    select: { title: 'title', subtitle: 'year', media: 'coverImage' },
  },
})
