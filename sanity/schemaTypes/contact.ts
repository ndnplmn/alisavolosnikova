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
    defineField({
      name: 'email',
      type: 'string',
      title: 'Email Address',
      validation: r => r.email(),
    }),
    defineField({ name: 'location', type: 'string', title: 'Location', placeholder: 'Moscow · Available Worldwide' }),
  ],
  preview: {
    select: { email: 'email' },
    prepare({ email }: { email?: string }) {
      return { title: 'Contact Settings', subtitle: email ?? 'No email set' }
    },
  },
})
