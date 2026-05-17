'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, LogOut } from 'lucide-react'

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[90%] max-w-[400px] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-7"
          >
            <div className="flex flex-col items-center">
              {variant === 'danger' ? (
                <AlertTriangle size={32} className="text-[var(--error)]" />
              ) : (
                <LogOut size={32} className="text-[var(--warning)]" />
              )}

              <p className="mt-3 text-center text-[18px] font-semibold text-[var(--text-primary)]">
                {title}
              </p>

              <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">{description}</p>

              <div className="mt-6 flex w-full gap-3">
                <Button variant="secondary" size="md" className="flex-1" onClick={onCancel}>
                  {cancelText}
                </Button>

                <button
                  onClick={onConfirm}
                  className={cn(
                    'flex-1 rounded-[var(--radius-sm)] border-none py-2 text-sm font-semibold',
                    'cursor-pointer transition-opacity duration-150 hover:opacity-85',
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
