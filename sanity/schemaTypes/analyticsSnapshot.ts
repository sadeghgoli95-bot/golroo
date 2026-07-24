import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'analyticsSnapshot',
  title: 'عکس‌فوری تحلیل‌ها (Analytics Snapshot)',
  type: 'document',

  // Append-only history: written exclusively by
  // lib/analytics/snapshot/SnapshotRepository.ts via the daily cron route
  // (app/api/cron/snapshot/route.ts) — never edited or deleted through
  // Studio, so no field here needs to be editable in the UI.
  fields: [
    defineField({
      name: 'timestamp',
      title: 'زمان ثبت',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),

    defineField({name: 'seoScore', title: 'امتیاز سئو', type: 'number'}),
    defineField({name: 'healthScore', title: 'امتیاز سلامت', type: 'number'}),
    defineField({name: 'aeoScore', title: 'امتیاز AEO', type: 'number'}),
    defineField({name: 'geoScore', title: 'امتیاز GEO', type: 'number'}),

    defineField({name: 'clicks', title: 'کلیک‌ها (GSC)', type: 'number'}),
    defineField({name: 'impressions', title: 'نمایش‌ها (GSC)', type: 'number'}),
    defineField({name: 'ctr', title: 'CTR (GSC)', type: 'number'}),
    defineField({name: 'position', title: 'میانگین جایگاه (GSC)', type: 'number'}),

    defineField({name: 'users', title: 'کاربران (GA4)', type: 'number'}),
    defineField({name: 'sessions', title: 'نشست‌ها (GA4)', type: 'number'}),
    defineField({name: 'engagementRate', title: 'نرخ تعامل (GA4)', type: 'number'}),

    defineField({name: 'publishedArticles', title: 'مقالات منتشرشده', type: 'number'}),
    defineField({name: 'draftArticles', title: 'پیش‌نویس‌ها', type: 'number'}),

    defineField({name: 'criticalIssues', title: 'مشکلات بحرانی', type: 'number'}),
    defineField({name: 'warnings', title: 'هشدارها', type: 'number'}),
  ],

  preview: {
    select: {timestamp: 'timestamp', seoScore: 'seoScore', healthScore: 'healthScore'},
    prepare: ({timestamp, seoScore, healthScore}) => ({
      title: timestamp ? new Date(timestamp).toLocaleString('fa-IR') : 'بدون تاریخ',
      subtitle: `سئو: ${seoScore ?? '-'} | سلامت: ${healthScore ?? '-'}`,
    }),
  },
})
