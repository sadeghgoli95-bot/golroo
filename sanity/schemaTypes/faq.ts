import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'faq',
  title: 'سوالات متداول',
  type: 'document',

  fields: [
    defineField({
      name: 'question',
      title: 'سوال',
      type: 'string',
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'answer',
      title: 'پاسخ',
      type: 'text',
      rows: 5,
      validation: Rule => Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: 'question',
    },
  },
})