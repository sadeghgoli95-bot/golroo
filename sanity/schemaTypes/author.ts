import {defineArrayMember, defineField, defineType} from 'sanity'
import UserIcon from '@sanity/icons/User'

export default defineType({
  name: 'author',
  title: 'نویسندگان',
  type: 'document',
  icon: UserIcon,

  fields: [
    defineField({
      name: 'name',
      title: 'نام',
      type: 'string',
      placeholder: 'مثال: محمد صادق گل‌رو',
      validation: (Rule) => Rule.required().error('نام نویسنده الزامی است.'),
    }),

    defineField({
      name: 'slug',
      title: 'آدرس (Slug)',
      type: 'slug',
      description: 'به‌صورت خودکار از روی نام ساخته می‌شود.',
      options: {
        source: 'name',
      },
      validation: (Rule) => Rule.required().error('آدرس (Slug) الزامی است.'),
    }),

    defineField({
      name: 'image',
      title: 'تصویر پروفایل',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'title',
      title: 'عنوان حرفه‌ای',
      type: 'string',
      description: 'مثال: روان‌شناس و روان‌درمانگر کودک و نوجوان',
      placeholder: 'روان‌شناس و روان‌درمانگر کودک و نوجوان',
    }),

    defineField({
      name: 'bio',
      title: 'بیوگرافی',
      type: 'text',
      rows: 4,
      description: 'معرفی کوتاه نویسنده که در پایین مقالات نمایش داده می‌شود.',
    }),

    defineField({
      name: 'degree',
      title: 'مدرک تحصیلی',
      type: 'string',
      placeholder: 'مثال: دکترای روان‌شناسی بالینی',
    }),

    defineField({
      name: 'organization',
      title: 'کلینیک / سازمان',
      type: 'string',
    }),

    defineField({
      name: 'interests',
      title: 'حوزه‌های مورد علاقه',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),

    defineField({
      name: 'quote',
      title: 'نقل‌قول',
      type: 'text',
      rows: 3,
      description: 'یک جمله کوتاه از نویسنده که هویت او را نشان می‌دهد (اختیاری).',
    }),
  ],

  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
})
