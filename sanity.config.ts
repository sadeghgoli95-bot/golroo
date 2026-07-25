'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\app\studio\[[...tool]]\page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'
import {DeleteArticleAction} from './sanity/actions/DeleteArticleAction'
import {DuplicateArticleAction} from './sanity/actions/DuplicateArticleAction'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
  document: {
    // Only the article document type gets the custom delete/duplicate
    // actions — every other document type keeps Sanity's normal defaults,
    // per "do not modify other pages/schema" in the delete-article task.
    actions: (prev, context) => {
      if (context.schemaType !== 'article') return prev
      return prev
        .filter((action) => action.action !== 'delete' && action.action !== 'duplicate')
        .concat([DeleteArticleAction, DuplicateArticleAction])
    },
  },
})
