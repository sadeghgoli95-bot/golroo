import {defineArrayMember, defineField, defineType} from 'sanity'

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
      name: 'title',
      title: 'عنوان حرفه‌ای',
      type: 'string',
      description: 'مثال: روان‌شناس و روان‌درمانگر کودک و نوجوان',
    }),

    defineField({
      name: 'bio',
      title: 'بیوگرافی',
      type: 'text',
      rows: 4,
    }),

    defineField({
      name: 'degree',
      title: 'مدرک تحصیلی',
      type: 'string',
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
    }),

    defineField({
      name: 'quote',
      title: 'نقل‌قول',
      type: 'text',
      rows: 3,
    }),
  ],

  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
})
