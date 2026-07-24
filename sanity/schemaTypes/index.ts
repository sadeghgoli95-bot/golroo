import {type SchemaTypeDefinition} from 'sanity'

import analyticsSnapshot from './analyticsSnapshot'
import article from './article'
import author from './author'
import category from './category'
import faq from './faq'
import seo from './seo'
import siteSettings from './siteSettings'
import source from './source'
import tag from './tag'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    article,
    author,
    category,
    tag,
    source,
    faq,
    seo,
    siteSettings,
    analyticsSnapshot,
  ],
}