import {useCallback, useState, type CSSProperties} from 'react'
import {useDocumentOperation, type DocumentActionComponent, type DocumentActionProps} from 'sanity'
import TrashIcon from '@sanity/icons/Trash'

type DialogState = 'idle' | 'confirm' | 'success' | 'error'

const dialogTextStyle: CSSProperties = {padding: '0.5rem 0 1rem', lineHeight: 1.8}
const dialogFooterStyle: CSSProperties = {display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '0 0 0.5rem'}
const cancelButtonStyle: CSSProperties = {
  border: '1px solid #d0d5dd',
  borderRadius: '4px',
  background: 'transparent',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
}
const confirmButtonStyle: CSSProperties = {
  border: '1px solid #c0392b',
  borderRadius: '4px',
  background: '#c0392b',
  color: '#fff',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  fontWeight: 600,
}
const closeButtonStyle: CSSProperties = {
  border: '1px solid #d0d5dd',
  borderRadius: '4px',
  background: 'transparent',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
}

/**
 * A dedicated, clearly-separate "حذف مقاله" action (kept away from
 * Publish) with a real confirmation step and a real success/error message
 * — no @sanity/ui import (it isn't resolvable as a top-level dependency in
 * this project), so every dialog uses Sanity's own dialog chrome with
 * plain JSX content and custom buttons (needed to get the exact Persian
 * button labels "انصراف"/"حذف مقاله" the spec asks for — the built-in
 * 'confirm' dialog type doesn't expose customizable button text).
 * Permission is read from the operation's real `disabled` reason (Sanity's
 * own grants system), never hand-rolled. Deleting works the same way
 * whether the article is a draft or already published — the same warning
 * dialog covers both cases, per spec.
 */
export const DeleteArticleAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const {id, type, onComplete} = props
  const {delete: deleteOp} = useDocumentOperation(id, type)
  const [dialogState, setDialogState] = useState<DialogState>('idle')

  const handleConfirm = useCallback(() => {
    try {
      deleteOp.execute()
      setDialogState('success')
    } catch (error) {
      // Never surface the raw exception to the editor — log it for
      // developers, show only the friendly Persian message in the UI.
      console.error('Article delete failed:', error)
      setDialogState('error')
    }
  }, [deleteOp])

  const isDisabled = Boolean(deleteOp.disabled)

  return {
    label: 'حذف مقاله',
    icon: TrashIcon,
    tone: 'critical',
    disabled: isDisabled,
    title: isDisabled ? 'شما اجازه حذف این مقاله را ندارید.' : undefined,
    onHandle: () => setDialogState('confirm'),
    dialog:
      dialogState === 'confirm'
        ? {
            type: 'dialog',
            header: 'حذف مقاله',
            onClose: () => setDialogState('idle'),
            content: (
              <div>
                <p style={dialogTextStyle}>
                  آیا مطمئن هستید که می‌خواهید این مقاله برای همیشه حذف شود؟
                  <br />
                  این عمل قابل بازگشت نیست.
                </p>
                <div style={dialogFooterStyle}>
                  <button type="button" style={cancelButtonStyle} onClick={() => setDialogState('idle')}>
                    انصراف
                  </button>
                  <button type="button" style={confirmButtonStyle} onClick={handleConfirm}>
                    حذف مقاله
                  </button>
                </div>
              </div>
            ),
          }
        : dialogState === 'success'
          ? {
              type: 'dialog',
              header: 'حذف موفق',
              onClose: () => {
                setDialogState('idle')
                onComplete()
              },
              content: (
                <div>
                  <p style={dialogTextStyle}>مقاله با موفقیت حذف شد.</p>
                  <div style={dialogFooterStyle}>
                    <button
                      type="button"
                      style={closeButtonStyle}
                      onClick={() => {
                        setDialogState('idle')
                        onComplete()
                      }}
                    >
                      باشه
                    </button>
                  </div>
                </div>
              ),
            }
          : dialogState === 'error'
            ? {
                type: 'dialog',
                header: 'حذف انجام نشد',
                onClose: () => setDialogState('idle'),
                content: (
                  <div>
                    <p style={dialogTextStyle}>مقاله حذف نشد. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.</p>
                    <div style={dialogFooterStyle}>
                      <button type="button" style={closeButtonStyle} onClick={() => setDialogState('idle')}>
                        باشه
                      </button>
                    </div>
                  </div>
                ),
              }
            : undefined,
  }
}
