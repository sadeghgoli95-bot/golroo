import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'author',
  title: 'نویسندگان',
  type: 'document',

  fields: [
    defineField({
      name: 'name',
      title: 'نام',
      type: 'string',
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
      },
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'image',
      title: 'تصویر',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'bio',
      title: 'بیوگرافی',
      type: 'text',
      rows: 4,
    }),
  ],

  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
})