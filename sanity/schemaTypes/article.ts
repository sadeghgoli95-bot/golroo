import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'article',
  title: 'مقالات',
  type: 'document',

  groups: [
    {name: 'content', title: 'محتوا', default: true},
    {name: 'seo', title: 'سئو'},
    {name: 'relations', title: 'ارتباطات'},
    {name: 'publish', title: 'انتشار'},
  ],

  fields: [
    defineField({
      name: 'title',
      title: 'عنوان مقاله',
      type: 'string',
      group: 'content',
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title'},
      validation: Rule => Rule.required(),
    }),

    defineField({
      name: 'articleId',
      title: 'شناسه گل‌رو',
      type: 'string',
      group: 'content',
      readOnly: true,
      initialValue: () => {
        const year = new Date().getFullYear()
        const random = Math.floor(1000 + Math.random() * 9000)
        return `GR-${year}-${random}`
      },
    }),

    defineField({
      name: 'topic',
      title: 'موضوع',
      type: 'string',
      group: 'content',
    }),

    defineField({
      name: 'readingTime',
      title: 'زمان مطالعه',
      type: 'number',
      group: 'content',
      description: 'بر حسب دقیقه',
    }),

    defineField({
      name: 'seo',
      title: 'اطلاعات سئو',
      type: 'seo',
      group: 'seo',
    }),

    defineField({
      name: 'excerpt',
      title: 'مقدمه انسانی',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'شروع مقاله؛ از یک مشاهده یا تجربه آغاز شود.',
    }),

    defineField({
      name: 'callout',
      title: 'قراره درباره چی حرف بزنیم؟',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'در ۲ تا ۳ جمله بگو این مقاله قرار است درباره چه چیزی باشد.',
    }),

    defineField({
      name: 'body',
      title: 'متن اصلی مقاله',
      type: 'array',
      group: 'content',
      description: 'بدنه اصلی مقاله.',
      of: [defineArrayMember({type: 'block'})],
    }),

    defineField({
      name: 'window',
      title: 'پنجره گل‌رو',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'بخش ثابت «پنجره گل‌رو».',
    }),

    defineField({
      name: 'realExample',
      title: 'مثال یا مشاهده واقعی',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'block'})],
      description: 'نمونه‌ای واقعی یا آشنا برای مخاطب',
    }),

    defineField({
      name: 'scientificExplanation',
      title: 'توضیح علمی (بر پایه منابع)',
      type: 'array',
      group: 'content',
      description: 'توضیح علمی همراه با استناد به منابع.',
      of: [defineArrayMember({type: 'block'})],
    }),

    defineField({
      name: 'importantPoints',
      title: 'نکات مهم',
      type: 'array',
      group: 'content',
      description: 'خلاصه نکات مهم به صورت فهرست.',
      of: [{type: 'string'}],
    }),

    defineField({
      name: 'finalThought',
      title: 'جمع‌بندی',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'جمع‌بندی بدون نتیجه‌گیری قطعی.',
    }),

    defineField({
      name: 'finalQuestion',
      title: 'پرسشی برای تأمل',
      type: 'text',
      rows: 2,
      group: 'content',
      description: 'سؤالی که ذهن مخاطب را باز بگذارد.',
    }),

    defineField({
      name: 'featuredImage',
      title: 'تصویر شاخص',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
    }),

    defineField({
      name: 'featuredImageAlt',
      title: 'توضیح تصویر (Alt)',
      type: 'string',
      group: 'content',
      description: 'توضیح تصویر برای دسترس‌پذیری و سئو',
    }),

    defineField({
      name: 'imageCaption',
      title: 'کپشن تصویر',
      type: 'string',
      group: 'content',
    }),

    defineField({
      name: 'sources',
      title: 'منابع علمی',
      type: 'array',
      group: 'relations',
      of: [defineArrayMember({type: 'reference', to: [{type: 'source'}]})],
    }),

    defineField({
      name: 'category',
      title: 'دسته‌بندی',
      type: 'reference',
      to: [{type: 'category'}],
      group: 'relations',
    }),

    defineField({
      name: 'tags',
      title: 'برچسب‌ها',
      type: 'array',
      group: 'relations',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tag'}]})],
    }),

    defineField({
      name: 'author',
      title: 'نویسنده',
      type: 'reference',
      to: [{type: 'author'}],
      group: 'relations',
    }),

    defineField({
      name: 'status',
      title: 'وضعیت مقاله',
      type: 'string',
      group: 'publish',
      initialValue: 'draft',
      options: {
        layout: 'radio',
        list: [
          {title: '🟡 پیش‌نویس', value: 'draft'},
          {title: '🟢 آماده انتشار', value: 'ready'},
          {title: '🔵 منتشر شده', value: 'published'},
          {title: '🔴 نیازمند بازبینی', value: 'review'},
        ],
      },
    }),

    defineField({
      name: 'publishedAt',
      title: 'تاریخ انتشار',
      type: 'datetime',
      group: 'publish',
      initialValue: () => new Date().toISOString(),
    }),

    defineField({
      name: 'lastUpdated',
      title: 'آخرین بروزرسانی',
      type: 'datetime',
      group: 'publish',
    }),

    defineField({
      name: 'lastReviewed',
      title: 'آخرین بازبینی علمی',
      type: 'date',
      group: 'publish',
    }),

    defineField({
      name: 'evidenceLevel',
      title: 'سطح شواهد',
      type: 'string',
      group: 'publish',
      options: {
        list: [
          {title: 'نظر متخصص', value: 'expert'},
          {title: 'مطالعه مشاهده‌ای', value: 'observational'},
          {title: 'مرور نظام‌مند', value: 'systematic'},
          {title: 'راهنمای بالینی', value: 'guideline'},
        ],
      },
    }),

    defineField({
      name: 'editorChecklist',
      title: 'چک‌لیست انتشار',
      type: 'object',
      group: 'publish',
      fields: [
        {name: 'tone', title: 'لحن بررسی شد', type: 'boolean'},
        {name: 'spelling', title: 'غلط املایی ندارد', type: 'boolean'},
        {name: 'sources', title: 'منابع بررسی شدند', type: 'boolean'},
        {name: 'seo', title: 'سئو کامل است', type: 'boolean'},
        {name: 'internalLinks', title: 'لینک داخلی دارد', type: 'boolean'},
        {name: 'brand', title: 'مطابق منشور گل‌رو است', type: 'boolean'},
      ],
    }),

    defineField({
      name: 'revisionHistory',
      title: 'تاریخچه ویرایش',
      type: 'array',
      group: 'publish',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'version', title: 'نسخه', type: 'string'},
            {name: 'date', title: 'تاریخ', type: 'date'},
            {name: 'changes', title: 'تغییرات', type: 'text'},
          ],
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'articleId',
      media: 'featuredImage',
    },
  },
})
