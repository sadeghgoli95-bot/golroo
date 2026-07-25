import {
  defineArrayMember,
  defineField,
  defineType,
  type InitialValueResolverContext,
  type InitialValueProperty,
  type Reference,
} from 'sanity'
import DocumentTextIcon from '@sanity/icons/DocumentText'
import EditIcon from '@sanity/icons/Edit'
import ImageIcon from '@sanity/icons/Image'
import BookIcon from '@sanity/icons/Book'
import HelpCircleIcon from '@sanity/icons/HelpCircle'
import TagIcon from '@sanity/icons/Tag'
import SearchIcon from '@sanity/icons/Search'
import RocketIcon from '@sanity/icons/Rocket'
import {ReadingTimeInput} from '../components/ReadingTimeInput'
import {createStringCharCountInput} from '../components/CharCountInput'
import {DEFAULT_AUTHOR_NAME} from '../lib/siteDefaults'
import {computeChecklist, summarizeChecklist} from '../lib/checklist/computeChecklist'

export default defineType({
  name: 'article',
  title: 'مقالات',
  type: 'document',

  groups: [
    {name: 'basics', title: 'اطلاعات پایه', icon: DocumentTextIcon, default: true},
    {name: 'content', title: 'محتوای مقاله', icon: EditIcon},
    {name: 'images', title: 'تصاویر', icon: ImageIcon},
    {name: 'references', title: 'منابع علمی', icon: BookIcon},
    {name: 'faq', title: 'سوالات متداول', icon: HelpCircleIcon},
    {name: 'relations', title: 'دسته‌بندی و ارتباطات', icon: TagIcon},
    {name: 'seo', title: 'سئو', icon: SearchIcon},
    {name: 'publish', title: 'انتشار', icon: RocketIcon},
  ],

  fieldsets: [
    {
      name: 'narrative',
      title: 'ساختار روایت',
      options: {collapsible: true, collapsed: false},
    },
    {
      name: 'clinicalReview',
      title: 'بازبینی علمی',
      options: {collapsible: true, collapsed: true},
    },
    {
      name: 'history',
      title: 'تاریخچه و چک‌لیست (فنی)',
      options: {collapsible: true, collapsed: true},
    },
  ],

  fields: [
    // ===== اطلاعات پایه =====
    defineField({
      name: 'title',
      title: 'عنوان مقاله',
      type: 'string',
      group: 'basics',
      description: 'عنوانی که بالای مقاله و در نتایج گوگل نمایش داده می‌شود. واضح و جذاب بنویسید؛ نه خیلی کوتاه، نه خیلی طولانی.',
      placeholder: 'مثال: چرا کودک من از مدرسه می‌ترسد؟',
      validation: (Rule) =>
        Rule.required()
          .error('عنوان مقاله الزامی است.')
          .max(90)
          .warning('عنوان کمی طولانی است؛ بهتر است زیر ۹۰ کاراکتر باشد.'),
      components: {input: createStringCharCountInput({max: 90})},
    }),

    defineField({
      name: 'slug',
      title: 'آدرس صفحه (Slug)',
      type: 'slug',
      group: 'basics',
      description: 'بخشی از آدرس اینترنتی مقاله. معمولاً بر اساس عنوان ساخته می‌شود؛ نیازی به تغییر دستی نیست مگر بخواهید آدرس متفاوتی داشته باشد.',
      options: {source: 'title'},
      validation: (Rule) => Rule.required().error('برای انتشار مقاله باید آدرس صفحه (Slug) مشخص شود.'),
    }),

    defineField({
      name: 'articleId',
      title: 'شناسه گل‌رو',
      type: 'string',
      group: 'basics',
      readOnly: true,
      description: 'شناسه یکتای داخلی مقاله؛ به‌صورت خودکار ساخته می‌شود و نیازی به دستکاری ندارد.',
      initialValue: () => {
        const year = new Date().getFullYear()
        const random = Math.floor(1000 + Math.random() * 9000)
        return `GR-${year}-${random}`
      },
    }),

    defineField({
      name: 'topic',
      title: 'موضوع کلی',
      type: 'string',
      group: 'basics',
      description: 'موضوع کلی مقاله برای دسته‌بندی داخلی (مثلاً «اضطراب کودک» یا «خواب نوجوان»).',
      placeholder: 'مثال: اضطراب کودک',
    }),

    // ===== محتوای مقاله =====
    defineField({
      name: 'excerpt',
      title: 'مقدمه انسانی',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'اولین چیزی که خواننده می‌خواند. از یک مشاهده، تجربه یا موقعیت واقعی و آشنا شروع کنید؛ نه تعریف خشک موضوع.',
      placeholder: 'مثال: خیلی از والدین با ما تماس می‌گیرند و می‌گویند فرزندشان صبح‌ها از رفتن به مدرسه امتناع می‌کند...',
    }),

    defineField({
      name: 'callout',
      title: 'قراره درباره چی حرف بزنیم؟',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'در ۲ تا ۳ جمله بگویید این مقاله قرار است دقیقاً درباره چه چیزی باشد تا خواننده بداند ادامه‌دادن ارزش دارد یا نه.',
      placeholder: 'در این مقاله می‌خوانید که...',
    }),

    defineField({
      name: 'body',
      title: 'متن اصلی مقاله',
      type: 'array',
      group: 'content',
      description: 'بدنه اصلی مقاله. می‌توانید تصویر، بلوک کد و خط جداکننده هم داخل متن اضافه کنید.',
      of: [
        defineArrayMember({type: 'block'}),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              title: 'توضیح تصویر (Alt)',
              type: 'string',
              description: 'توضیح کوتاه تصویر برای نمایش وقتی تصویر بارگذاری نمی‌شود و برای کاربران کم‌بینا. هرگز خالی نگذارید.',
              placeholder: 'مثال: کودکی نگران در حال نگاه‌کردن به مدرسه',
            },
            {name: 'caption', title: 'کپشن (اختیاری)', type: 'string', description: 'متن کوتاهی که زیر تصویر نمایش داده می‌شود.'},
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'codeBlock',
          title: 'بلوک کد',
          fields: [
            {name: 'language', title: 'زبان', type: 'string', description: 'مثال: js, html, css — برای رنگی‌شدن کد.'},
            {name: 'code', title: 'کد', type: 'text', rows: 8},
          ],
          preview: {
            select: {title: 'language', subtitle: 'code'},
          },
        }),
        defineArrayMember({
          type: 'object',
          name: 'break',
          title: 'خط جداکننده',
          fields: [{name: 'dummy', type: 'string', hidden: true}],
          preview: {
            prepare: () => ({title: '— خط جداکننده —'}),
          },
        }),
      ],
    }),

    defineField({
      name: 'importantPoints',
      title: 'نکات مهم',
      type: 'array',
      group: 'content',
      description: 'خلاصه نکات مهم مقاله به‌صورت فهرست کوتاه — برای خواننده‌ای که فقط می‌خواهد نکات کلیدی را ببیند.',
      of: [{type: 'string'}],
    }),

    defineField({
      name: 'window',
      title: 'پنجره گل‌رو',
      type: 'text',
      rows: 4,
      group: 'content',
      fieldset: 'narrative',
      description: 'بخش ثابت برند «پنجره گل‌رو» — نگاه تخصصی/بالینی کوتاه مرتبط با موضوع مقاله.',
    }),

    defineField({
      name: 'realExample',
      title: 'مثال یا مشاهده واقعی',
      type: 'array',
      group: 'content',
      fieldset: 'narrative',
      of: [defineArrayMember({type: 'block'})],
      description: 'یک نمونه واقعی یا آشنا برای مخاطب که موضوع را ملموس‌تر می‌کند.',
    }),

    defineField({
      name: 'scientificExplanation',
      title: 'توضیح علمی (بر پایه منابع)',
      type: 'array',
      group: 'content',
      fieldset: 'narrative',
      description: 'توضیح علمی موضوع، همراه با استناد به منابع علمی. منابع را در بخش «منابع علمی» ثبت کنید.',
      of: [defineArrayMember({type: 'block'})],
    }),

    defineField({
      name: 'finalThought',
      title: 'جمع‌بندی',
      type: 'text',
      rows: 4,
      group: 'content',
      fieldset: 'narrative',
      description: 'جمع‌بندی مقاله بدون نتیجه‌گیری قطعی یا نسخه‌پیچی؛ فضا برای تفکر خواننده باز بماند.',
    }),

    defineField({
      name: 'finalQuestion',
      title: 'پرسشی برای تأمل',
      type: 'text',
      rows: 2,
      group: 'content',
      fieldset: 'narrative',
      description: 'سؤالی که ذهن خواننده را باز نگه می‌دارد و او را به فکرکردن بیشتر دعوت می‌کند.',
      placeholder: 'مثال: شما در موقعیت مشابه چه واکنشی نشان می‌دهید؟',
    }),

    defineField({
      name: 'readingTime',
      title: 'زمان مطالعه (دقیقه)',
      type: 'number',
      group: 'content',
      description: 'زمان تقریبی مطالعه مقاله بر حسب دقیقه. یک پیشنهاد بر اساس متن فعلی مقاله زیر همین فیلد نمایش داده می‌شود.',
      validation: (Rule) => Rule.min(1).warning('زمان مطالعه معمولاً حداقل ۱ دقیقه است.'),
      components: {input: ReadingTimeInput},
    }),

    // ===== تصاویر =====
    defineField({
      name: 'featuredImage',
      title: 'تصویر شاخص',
      type: 'image',
      group: 'images',
      options: {hotspot: true},
      description: 'تصویری که در لیست مقالات، شبکه‌های اجتماعی و بالای صفحه مقاله نمایش داده می‌شود.',
    }),

    defineField({
      name: 'featuredImageAlt',
      title: 'توضیح تصویر شاخص (Alt)',
      type: 'string',
      group: 'images',
      description: 'توضیح متنی تصویر شاخص برای دسترس‌پذیری و سئوی تصویر. اگر تصویر شاخص دارید، این را خالی نگذارید.',
      placeholder: 'مثال: کودکی در حال بازی با والدینش',
    }),

    defineField({
      name: 'imageCaption',
      title: 'کپشن تصویر شاخص',
      type: 'string',
      group: 'images',
      description: 'متن کوتاه اختیاری که زیر تصویر شاخص نمایش داده می‌شود.',
    }),

    // ===== منابع علمی =====
    defineField({
      name: 'sources',
      title: 'منابع علمی',
      type: 'array',
      group: 'references',
      description: 'مقالات و منابع علمی که ادعاهای این مطلب بر اساس آن‌هاست. هر ادعای علمی باید حداقل یک منبع داشته باشد.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'source'}]})],
    }),

    // ===== سوالات متداول =====
    defineField({
      name: 'faq',
      title: 'سوالات متداول مرتبط',
      type: 'array',
      group: 'faq',
      description: 'سوالات متداولی که در پایین این مقاله نمایش داده می‌شوند و به بهتر دیده‌شدن مقاله در گوگل کمک می‌کنند.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'faq'}]})],
    }),

    // ===== دسته‌بندی و ارتباطات =====
    defineField({
      name: 'category',
      title: 'دسته‌بندی',
      type: 'reference',
      to: [{type: 'category'}],
      group: 'relations',
      description: 'دسته اصلی این مقاله در سایت.',
    }),

    defineField({
      name: 'tags',
      title: 'برچسب‌ها',
      type: 'array',
      group: 'relations',
      description: 'برچسب‌های موضوعی برای کمک به جستجو و پیشنهاد مقالات مرتبط.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tag'}]})],
    }),

    defineField({
      name: 'author',
      title: 'نویسنده',
      type: 'reference',
      to: [{type: 'author'}],
      group: 'relations',
      description: `نویسنده مسئول این مقاله. برای مقاله‌های جدید، در صورت وجود نویسنده «${DEFAULT_AUTHOR_NAME}» در پایگاه داده، به‌صورت خودکار انتخاب می‌شود.`,
      // Part 2 item 1/3: a real lookup against the actual author document
      // (matched by name), never a hardcoded document ID — ids differ per
      // dataset/environment. If no matching author exists yet, this
      // resolves to undefined and the field stays empty, exactly like
      // before automation was added.
      // Cast: Sanity's InitialValueResolver type for reference fields does
      // not model the legitimate "nothing to default to yet" case
      // (returning undefined when no matching author document exists) —
      // this is a known typing gap, not a real type mismatch at runtime.
      initialValue: (async (_params: unknown, context: InitialValueResolverContext) => {
        const client = context.getClient({apiVersion: '2024-01-01'})
        const authorId = await client.fetch<string | null>(
          `*[_type == "author" && name == $name][0]._id`,
          {name: DEFAULT_AUTHOR_NAME}
        )
        return authorId ? {_ref: authorId} : undefined
      }) as unknown as InitialValueProperty<unknown, Omit<Reference, '_type'>>,
    }),

    // ===== سئو =====
    defineField({
      name: 'seo',
      title: 'اطلاعات سئو',
      type: 'seo',
      group: 'seo',
      description: 'این اطلاعات در نتایج گوگل و هنگام اشتراک‌گذاری در شبکه‌های اجتماعی نمایش داده می‌شود.',
    }),

    // ===== انتشار =====
    defineField({
      name: 'status',
      title: 'وضعیت مقاله',
      type: 'string',
      group: 'publish',
      description: 'وضعیت فعلی مقاله در گردش کار انتشار.',
      initialValue: 'draft',
      options: {
        layout: 'radio',
        list: [
          {title: '🟡 پیش‌نویس', value: 'draft'},
          {title: '🔴 نیازمند بازبینی', value: 'review'},
          {title: '🟢 آماده انتشار', value: 'ready'},
          {title: '🔵 منتشر شده', value: 'published'},
        ],
      },
    }),

    defineField({
      name: 'publishedAt',
      title: 'تاریخ انتشار',
      type: 'datetime',
      group: 'publish',
      description: 'تاریخ و ساعتی که مقاله منتشر شده یا قرار است منتشر شود.',
      initialValue: () => new Date().toISOString(),
    }),

    defineField({
      name: 'lastUpdated',
      title: 'آخرین به‌روزرسانی',
      type: 'datetime',
      group: 'publish',
      description: 'آخرین باری که محتوای این مقاله تغییر محتوایی داشته است.',
    }),

    defineField({
      name: 'lastReviewed',
      title: 'آخرین بازبینی علمی',
      type: 'date',
      group: 'publish',
      fieldset: 'clinicalReview',
      description: 'تاریخی که یک متخصص محتوای علمی مقاله را بازبینی کرده است.',
    }),

    defineField({
      name: 'evidenceLevel',
      title: 'سطح شواهد علمی',
      type: 'string',
      group: 'publish',
      fieldset: 'clinicalReview',
      description: 'میزان قوت شواهد علمی پشتیبان این مقاله.',
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
      title: 'چک‌لیست دستی سردبیر',
      type: 'object',
      group: 'publish',
      fieldset: 'history',
      description: 'چک‌لیست تکمیلی داخلی سردبیر (جدا از چک‌لیست خودکار آماده‌سازی انتشار).',
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
      title: 'تاریخچه نسخه‌ها',
      type: 'array',
      group: 'publish',
      fieldset: 'history',
      description: 'یادداشت‌های اختیاری از تغییرات مهم این مقاله در طول زمان.',
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
      articleId: 'articleId',
      media: 'featuredImage',
      status: 'status',
      slug: 'slug',
      excerpt: 'excerpt',
      body: 'body',
      featuredImage: 'featuredImage',
      featuredImageAlt: 'featuredImageAlt',
      sources: 'sources',
      faq: 'faq',
      author: 'author',
      metaDescription: 'seo.metaDescription',
      focusKeyword: 'seo.focusKeyword',
      canonicalUrl: 'seo.canonicalUrl',
      updatedAt: '_updatedAt',
    },
    prepare(values) {
      const {title, articleId, media, status, updatedAt} = values
      const statusLabel: Record<string, string> = {
        draft: '🟡 پیش‌نویس',
        review: '🔴 نیازمند بازبینی',
        ready: '🟢 آماده انتشار',
        published: '🔵 منتشر شده',
      }

      const {complete, total} = summarizeChecklist(
        computeChecklist({
          title: values.title as string | undefined,
          slug: values.slug as {current?: string} | undefined,
          excerpt: values.excerpt as string | undefined,
          body: values.body,
          featuredImage: values.featuredImage,
          featuredImageAlt: values.featuredImageAlt as string | undefined,
          author: values.author,
          sources: values.sources as unknown[] | undefined,
          faq: values.faq as unknown[] | undefined,
          seo: {
            metaDescription: values.metaDescription as string | undefined,
            focusKeyword: values.focusKeyword as string | undefined,
            canonicalUrl: values.canonicalUrl as string | undefined,
          },
        })
      )

      const lastEditedLabel = updatedAt
        ? new Date(updatedAt as string).toLocaleDateString('fa-IR')
        : null

      const parts = [
        statusLabel[status as string] ?? '',
        articleId ? String(articleId) : '',
        `آماده‌سازی: ${complete}/${total}`,
        lastEditedLabel ? `آخرین ویرایش: ${lastEditedLabel}` : '',
      ].filter(Boolean)

      return {
        title: (title as string) || 'بدون عنوان',
        subtitle: parts.join('   ·   '),
        media,
      }
    },
  },
})
