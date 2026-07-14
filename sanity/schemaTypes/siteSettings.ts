import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'تنظیمات سایت',
  type: 'document',

  fields: [
    defineField({
      name: 'siteTitle',
      title: 'نام سایت',
      type: 'string',
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'siteDescription',
      title: 'توضیحات سایت',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'logo',
      title: 'لوگو',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
    }),

    defineField({
      name: 'defaultOgImage',
      title: 'تصویر پیش‌فرض اشتراک‌گذاری',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'instagram',
      title: 'اینستاگرام',
      type: 'url',
    }),

    defineField({
      name: 'telegram',
      title: 'تلگرام',
      type: 'url',
    }),

    defineField({
      name: 'threads',
      title: 'Threads',
      type: 'url',
    }),
  ],

  preview: {
    prepare() {
      return {
        title: 'تنظیمات سایت',
      }
    },
  },
})