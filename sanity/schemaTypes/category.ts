import {defineField, defineType} from 'sanity'
import TagIcon from '@sanity/icons/Tag'

export default defineType({
  name: 'category',
  title: 'دسته‌بندی‌ها',
  type: 'document',
  icon: TagIcon,

  fields: [
    defineField({
      name: 'title',
      title: 'نام دسته‌بندی',
      type: 'string',
      placeholder: 'مثال: اضطراب و ترس',
      validation: (Rule) => Rule.required().error('نام دسته‌بندی الزامی است.'),
    }),

    defineField({
      name: 'slug',
      title: 'آدرس (Slug)',
      type: 'slug',
      description: 'به‌صورت خودکار از روی نام دسته‌بندی ساخته می‌شود.',
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
      description: 'توضیح کوتاه درباره این دسته‌بندی (اختیاری).',
    }),
  ],

  preview: {
    select: {
      title: 'title',
    },
  },
})
