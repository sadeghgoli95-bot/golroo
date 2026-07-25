import {defineField, defineType} from 'sanity'
import TagIcon from '@sanity/icons/Tag'

export default defineType({
  name: 'tag',
  title: 'برچسب‌ها',
  type: 'document',
  icon: TagIcon,

  fields: [
    defineField({
      name: 'title',
      title: 'نام برچسب',
      type: 'string',
      placeholder: 'مثال: خواب کودک',
      validation: (Rule) => Rule.required().error('نام برچسب الزامی است.'),
    }),

    defineField({
      name: 'slug',
      title: 'آدرس (Slug)',
      type: 'slug',
      description: 'به‌صورت خودکار از روی نام برچسب ساخته می‌شود.',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required().error('آدرس (Slug) الزامی است.'),
    }),

    defineField({
      name: 'description',
      title: 'توضیحات',
      type: 'text',
      rows: 3,
      description: 'توضیح کوتاه درباره این برچسب (اختیاری).',
    }),
  ],

  preview: {
    select: {
      title: 'title',
    },
  },
})
