import { defineField, defineType } from 'sanity'

export const contact = defineType({
  name: 'contact',
  title: 'Contact Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'collaborationTypes',
      type: 'array',
      title: 'Collaboration Types',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'instagram', type: 'string', title: 'Instagram Handle', placeholder: 'alisavolosnikova' }),
    defineField({ name: 'email', type: 'string', title: 'Email Address' }),
    defineField({ name: 'location', type: 'string', title: 'Location', placeholder: 'Moscow · Available Worldwide' }),
  ],
})
