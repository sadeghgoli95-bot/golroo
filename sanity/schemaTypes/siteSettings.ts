import {defineField, defineType} from 'sanity'
import CogIcon from '@sanity/icons/Cog'

export default defineType({
  name: 'siteSettings',
  title: 'تنظیمات سایت',
  type: 'document',
  icon: CogIcon,

  fields: [
    defineField({
      name: 'siteTitle',
      title: 'نام سایت',
      type: 'string',
      description: 'نامی که در تب مرورگر و بسیاری از جاهای سایت نمایش داده می‌شود.',
      validation: (Rule) => Rule.required().error('نام سایت الزامی است.'),
    }),

    defineField({
      name: 'siteDescription',
      title: 'توضیحات سایت',
      type: 'text',
      rows: 3,
      description: 'توضیح کوتاه درباره سایت که در معرفی کلی و برخی نتایج گوگل استفاده می‌شود.',
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
      description: 'آیکون کوچکی که در تب مرورگر نمایش داده می‌شود.',
    }),

    defineField({
      name: 'defaultOgImage',
      title: 'تصویر پیش‌فرض اشتراک‌گذاری',
      type: 'image',
      description: 'اگر مقاله‌ای تصویر اختصاصی برای اشتراک‌گذاری نداشته باشد، این تصویر استفاده می‌شود.',
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
