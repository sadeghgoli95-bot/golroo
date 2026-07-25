import type {StructureResolver} from 'sanity/structure'
import CogIcon from '@sanity/icons/Cog'
import {PublishingChecklistView} from './components/PublishingChecklistView'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('محتوا')
    .items([
      S.documentTypeListItem('article')
        .title('مقالات')
        .child(
          S.documentTypeList('article')
            .title('مقالات')
            .child((documentId) =>
              S.document()
                .documentId(documentId)
                .schemaType('article')
                .views([S.view.form().title('ویرایش'), S.view.component(PublishingChecklistView).title('چک‌لیست انتشار')])
            )
        ),
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'siteSettings' && item.getId() !== 'article'),
      S.divider(),
      S.listItem()
        .title('تنظیمات سایت')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
