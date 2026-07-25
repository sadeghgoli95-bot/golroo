import {defineField, defineType} from 'sanity'
import {createStringCharCountInput, createTextCharCountInput} from '../components/CharCountInput'

export default defineType({
  name: 'seo',
  title: 'سئو',
  type: 'object',

  fieldsets: [
    {
      name: 'social',
      title: 'نمایش در شبکه‌های اجتماعی',
      description: 'وقتی این مقاله در توییتر/تلگرام و مشابه آن به اشتراک گذاشته شود، این اطلاعات نمایش داده می‌شود.',
      options: {collapsible: true, collapsed: true},
    },
    {
      name: 'advanced',
      title: 'تنظیمات پیشرفته',
      description: 'معمولاً نیازی به تغییر این بخش نیست.',
      options: {collapsible: true, collapsed: true},
    },
  ],

  fields: [
    defineField({
      name: 'metaTitle',
      title: 'عنوان در نتایج گوگل',
      type: 'string',
      description: 'عنوانی که در تب مرورگر و نتایج جست‌وجوی گوگل نمایش داده می‌شود. اگر خالی بماند، از عنوان مقاله استفاده می‌شود.',
      placeholder: 'در صورت خالی‌بودن، از «عنوان مقاله» استفاده می‌شود',
      validation: (Rule) => Rule.max(60).warning('عنوان بهتر است زیر ۶۰ کاراکتر باشد تا در گوگل کامل نمایش داده شود.'),
      components: {input: createStringCharCountInput({max: 60})},
    }),

    defineField({
      name: 'metaDescription',
      title: 'توضیحات متا',
      type: 'text',
      rows: 3,
      description: 'این متن در نتایج گوگل زیر عنوان نمایش داده می‌شود. بین ۱۲۰ تا ۱۵۵ کاراکتر بنویسید و خلاصه‌ای جذاب از مقاله باشد.',
      placeholder: 'خلاصه‌ای جذاب و دقیق از این مقاله در ۱۲۰ تا ۱۵۵ کاراکتر...',
      validation: (Rule) =>
        Rule.min(70)
          .warning('توضیحات متا کوتاه است؛ بهتر است حداقل ۷۰ کاراکتر باشد.')
          .max(160)
          .warning('توضیحات متا طولانی است و ممکن است در گوگل بریده شود؛ حداکثر ۱۶۰ کاراکتر توصیه می‌شود.'),
      components: {input: createTextCharCountInput({min: 120, max: 155})},
    }),

    defineField({
      name: 'focusKeyword',
      title: 'کلیدواژه اصلی',
      type: 'string',
      description: 'مهم‌ترین عبارتی که کاربران برای پیداکردن این مقاله در گوگل جست‌وجو می‌کنند. سعی کنید همین عبارت در عنوان و مقدمه هم بیاید.',
      placeholder: 'مثال: ترس کودک از مدرسه',
    }),

    defineField({
      name: 'keywords',
      title: 'کلیدواژه‌های فرعی',
      type: 'array',
      description: 'چند عبارت مرتبط دیگر که مقاله می‌تواند برایشان دیده شود.',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),

    defineField({
      name: 'ogImage',
      title: 'تصویر اشتراک‌گذاری',
      type: 'image',
      fieldset: 'social',
      description: 'تصویری که هنگام اشتراک‌گذاری لینک در شبکه‌های اجتماعی نمایش داده می‌شود. اگر خالی باشد، از تصویر شاخص مقاله استفاده می‌شود.',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'twitterTitle',
      title: 'عنوان در توییتر/X',
      type: 'string',
      fieldset: 'social',
      description: 'در صورت خالی بودن، از «عنوان در نتایج گوگل» استفاده می‌شود.',
    }),

    defineField({
      name: 'twitterDescription',
      title: 'توضیحات در توییتر/X',
      type: 'text',
      rows: 3,
      fieldset: 'social',
      description: 'در صورت خالی بودن، از «توضیحات متا» استفاده می‌شود.',
    }),

    defineField({
      name: 'canonicalUrl',
      title: 'آدرس اصلی (Canonical URL)',
      type: 'url',
      fieldset: 'advanced',
      description: 'فقط زمانی پر کنید که این محتوا نسخه‌ای از مطلبی در آدرس دیگر است و می‌خواهید گوگل آن آدرس را اصلی بداند.',
      placeholder: 'https://mirora.ir/journal/...',
    }),

    defineField({
      name: 'noIndex',
      title: 'از نتایج گوگل مخفی شود؟',
      type: 'boolean',
      fieldset: 'advanced',
      description: 'اگر فعال کنید، این مقاله در نتایج جست‌وجوی گوگل نمایش داده نمی‌شود. برای مقالات عادی این گزینه باید خاموش بماند.',
      initialValue: false,
    }),
  ],
})
