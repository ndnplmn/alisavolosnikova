import { defineField, defineType } from 'sanity'

export const photo = defineType({
  name: 'photo',
  title: 'Photo',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Title' }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Image',
      options: { hotspot: true },
      validation: r => r.required(),
    }),
    defineField({
      name: 'weight',
      type: 'string',
      title: 'Layout Weight',
      description: 'Controls how this photo appears in the masonry grid',
      options: {
        list: [
          { title: 'Full Width', value: 'full' },
          { title: 'Half Width', value: 'half' },
          { title: '30% (left)', value: 'split-30' },
          { title: '70% (right)', value: 'split-70' },
        ],
        layout: 'radio',
      },
      initialValue: 'full',
    }),
    defineField({ name: 'year', type: 'number', title: 'Year' }),
    defineField({ name: 'dimensions', type: 'string', title: 'Print Dimensions', placeholder: '60×90 cm' }),
    defineField({ name: 'availableAsPrint', type: 'boolean', title: 'Available as Print', initialValue: false }),
    defineField({ name: 'altText', type: 'string', title: 'Alt Text (Accessibility)' }),
  ],
  preview: {
    select: { title: 'title', media: 'image' },
    prepare({ title, media }) {
      return { title: title ?? 'Untitled', media }
    },
  },
})
