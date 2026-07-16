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
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'question'},
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'answer',
      title: 'پاسخ',
      type: 'text',
      rows: 5,
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'category',
      title: 'دسته‌بندی',
      type: 'string',
      options: {
        list: [
          {title: 'شروع درمان', value: 'شروع درمان'},
          {title: 'جلسات آنلاین', value: 'جلسات آنلاین'},
          {title: 'جلسات حضوری', value: 'جلسات حضوری'},
          {title: 'کودک و نوجوان', value: 'کودک و نوجوان'},
          {title: 'والدین', value: 'والدین'},
          {title: 'هزینه و رزرو', value: 'هزینه و رزرو'},
        ],
      },
    }),

    defineField({
      name: 'order',
      title: 'ترتیب نمایش',
      type: 'number',
      initialValue: 0,
    }),

    defineField({
      name: 'published',
      title: 'منتشر شود',
      type: 'boolean',
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: 'question',
      subtitle: 'category',
    },
  },
})
