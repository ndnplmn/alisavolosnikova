import { defineField, defineType } from 'sanity'

export const print = defineType({
  name: 'print',
  title: 'Print',
  type: 'document',
  fields: [
    defineField({
      name: 'photo',
      type: 'reference',
      title: 'Photo',
      to: [{ type: 'photo' }],
      validation: r => r.required(),
    }),
    defineField({ name: 'editionSize', type: 'number', title: 'Edition Size' }),
    defineField({ name: 'editionsSold', type: 'number', title: 'Editions Sold', initialValue: 0 }),
    defineField({ name: 'paper', type: 'string', title: 'Paper Type', placeholder: 'Archival Pigment' }),
    defineField({ name: 'technique', type: 'string', title: 'Print Technique' }),
    defineField({ name: 'dimensions', type: 'string', title: 'Dimensions', placeholder: '60×90 cm' }),
    defineField({
      name: 'colorMode',
      type: 'string',
      title: 'Color Mode',
      options: { list: [{ title: 'Black & White', value: 'bw' }, { title: 'Color', value: 'color' }], layout: 'radio' },
    }),
    defineField({
      name: 'format',
      type: 'string',
      title: 'Format',
      options: { list: [{ title: 'Large Format', value: 'large' }, { title: 'Small Format', value: 'small' }], layout: 'radio' },
    }),
  ],
  preview: {
    select: { title: 'photo.title', media: 'photo.image', editionSize: 'editionSize' },
    prepare({ title, media, editionSize }) {
      return { title: title ?? 'Untitled Print', subtitle: editionSize ? `Edition of ${editionSize}` : '', media }
    },
  },
})
