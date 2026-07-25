import {defineField, defineType} from 'sanity'
import HelpCircleIcon from '@sanity/icons/HelpCircle'

export default defineType({
  name: 'faq',
  title: 'سوالات متداول',
  type: 'document',
  icon: HelpCircleIcon,

  fields: [
    defineField({
      name: 'question',
      title: 'سوال',
      type: 'string',
      description: 'سوالی که کاربران معمولاً می‌پرسند. همان‌طور که یک کاربر واقعی می‌پرسد بنویسید.',
      placeholder: 'مثال: چند جلسه درمان برای کودکم لازم است؟',
      validation: (Rule) => Rule.required().error('متن سوال نمی‌تواند خالی باشد.'),
    }),

    defineField({
      name: 'slug',
      title: 'آدرس (Slug)',
      type: 'slug',
      description: 'به‌صورت خودکار از روی سوال ساخته می‌شود.',
      options: {source: 'question'},
      validation: (Rule) => Rule.required().error('آدرس (Slug) الزامی است.'),
    }),

    defineField({
      name: 'answer',
      title: 'پاسخ',
      type: 'text',
      rows: 5,
      description: 'پاسخ کامل و روشن به سوال؛ ساده و قابل‌فهم برای والدین بنویسید.',
      placeholder: 'پاسخ را اینجا بنویسید...',
      validation: (Rule) => Rule.required().error('پاسخ نمی‌تواند خالی باشد.'),
    }),

    defineField({
      name: 'category',
      title: 'دسته‌بندی',
      type: 'string',
      description: 'این سوال مربوط به کدام موضوع است؟',
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
      description: 'عدد کوچک‌تر بالاتر نمایش داده می‌شود.',
      initialValue: 0,
    }),

    defineField({
      name: 'published',
      title: 'منتشر شود؟',
      type: 'boolean',
      description: 'اگر خاموش باشد، این سوال در سایت نمایش داده نمی‌شود.',
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
