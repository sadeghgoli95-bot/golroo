import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'source',
  title: 'منابع علمی',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'عنوان مقاله',
      type: 'string',
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'authors',
      title: 'نویسندگان',
      type: 'string',
    }),

    defineField({
      name: 'journal',
      title: 'ژورنال',
      type: 'string',
    }),

    defineField({
      name: 'year',
      title: 'سال',
      type: 'number',
    }),

    defineField({
      name: 'doi',
      title: 'DOI',
      type: 'string',
    }),

    defineField({
      name: 'url',
      title: 'لینک',
      type: 'url',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'journal',
    },
  },
})