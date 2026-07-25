import {useCallback, useState} from 'react'
import {useClient, type DocumentActionComponent, type DocumentActionProps} from 'sanity'
import {useRouter} from 'sanity/router'
import CopyIcon from '@sanity/icons/Copy'

/**
 * Part 3 item 4 — a copy that avoids the values that must stay unique per
 * article: a fresh document id, slug cleared (so the editor picks/confirms
 * a new one — publishing with the old slug would collide), status reset to
 * draft, publishedAt/lastUpdated cleared, and a freshly generated
 * "شناسه گل‌رو" instead of copying the original's. Everything else (body,
 * SEO, images, references, FAQ, relations) copies over so the editor isn't
 * retyping shared content.
 */
export const DuplicateArticleAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const {type, draft, published} = props
  const client = useClient({apiVersion: '2024-01-01'})
  const router = useRouter()
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const source = (draft ?? published) as Record<string, unknown> | null

  const handleDuplicate = useCallback(async () => {
    if (!source) return
    setIsDuplicating(true)
    setErrorMessage(null)
    try {
      const newId = `drafts.article-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const {_id, _rev, _createdAt, _updatedAt, ...rest} = source
      void _id
      void _rev
      void _createdAt
      void _updatedAt

      const originalTitle = typeof rest.title === 'string' ? rest.title : ''

      await client.create({
        ...rest,
        _id: newId,
        _type: type,
        title: originalTitle ? `${originalTitle} (کپی)` : originalTitle,
        slug: undefined,
        status: 'draft',
        publishedAt: undefined,
        lastUpdated: undefined,
        articleId: `GR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      })

      router.navigateIntent('edit', {id: newId, type})
    } catch (error) {
      console.error('Article duplicate failed:', error)
      setErrorMessage('مقاله کپی نشد. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsDuplicating(false)
    }
  }, [source, client, type, router])

  return {
    label: isDuplicating ? 'در حال کپی‌کردن...' : 'تکرار مقاله (کپی)',
    icon: CopyIcon,
    disabled: !source || isDuplicating,
    onHandle: handleDuplicate,
    dialog: errorMessage
      ? {
          type: 'dialog',
          header: 'کپی‌کردن انجام نشد',
          onClose: () => setErrorMessage(null),
          content: <p style={{padding: '0.5rem 0'}}>{errorMessage}</p>,
        }
      : undefined,
  }
}
