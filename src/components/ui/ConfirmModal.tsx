'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, LogOut } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'

import { cn } from '@/lib/utils'
import { Button } from './Button'

type ConfirmModalProps = {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description: string
  confirmText: string
  cancelText: string
  variant: 'danger' | 'warning'
}

export function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText,
  cancelText,
  variant,
}: ConfirmModalProps) {
  const titleId = useId()
  const descId = useId()
  const confirmRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    cancelRef.current?.focus()
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancel}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[4px]"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[90%] max-w-[400px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-7"
          >
            <div className="flex flex-col items-center">
              {variant === 'danger' ? (
                <AlertTriangle size={32} className="text-[var(--error)]" aria-hidden="true" />
              ) : (
                <LogOut size={32} className="text-[var(--warning)]" aria-hidden="true" />
              )}

              <p
                id={titleId}
                className="mt-3 text-center text-[18px] font-semibold text-[var(--text-primary)]"
              >
                {title}
              </p>

              <p id={descId} className="mt-2 text-center text-sm text-[var(--text-secondary)]">
                {description}
              </p>

              <div className="mt-6 flex w-full gap-3">
                <Button
                  ref={cancelRef}
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  onClick={onCancel}
                >
                  {cancelText}
                </Button>

                <button
                  ref={confirmRef}
                  onClick={onConfirm}
                  className={cn(
                    'flex-1 rounded-[var(--radius-sm)] border-none py-2 text-sm font-semibold',
                    'cursor-pointer transition-opacity duration-150 hover:opacity-85',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
                    variant === 'danger'
                      ? 'bg-[var(--error)] text-white'
                      : 'bg-[var(--warning)] text-[#1a1a1a]'
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
