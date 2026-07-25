import {defineField, defineType} from 'sanity'
import BookIcon from '@sanity/icons/Book'

export default defineType({
  name: 'source',
  title: 'منابع علمی',
  type: 'document',
  icon: BookIcon,

  fields: [
    defineField({
      name: 'title',
      title: 'عنوان مقاله/منبع',
      type: 'string',
      description: 'عنوان کامل مقاله یا منبع علمی، همان‌طور که در ژورنال منتشر شده است.',
      validation: (Rule) => Rule.required().error('عنوان منبع الزامی است.'),
    }),

    defineField({
      name: 'authors',
      title: 'نویسندگان',
      type: 'string',
      description: 'نام نویسندگان اصلی این منبع.',
      placeholder: 'مثال: Smith J, Doe A.',
    }),

    defineField({
      name: 'journal',
      title: 'ژورنال / نشریه',
      type: 'string',
      placeholder: 'مثال: Journal of Child Psychology',
    }),

    defineField({
      name: 'year',
      title: 'سال انتشار',
      type: 'number',
      validation: (Rule) => Rule.min(1900).max(new Date().getFullYear()).warning('سال انتشار را بررسی کنید.'),
    }),

    defineField({
      name: 'doi',
      title: 'DOI',
      type: 'string',
      description: 'شناسه دیجیتال منبع (در صورت وجود) — برای اعتبارسنجی علمی مفید است.',
    }),

    defineField({
      name: 'url',
      title: 'لینک منبع',
      type: 'url',
      description: 'لینک مستقیم به منبع در صورت وجود.',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'journal',
    },
  },
})
