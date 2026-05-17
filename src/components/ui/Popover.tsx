'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

type PopoverProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Popover({ isOpen, onClose, children, className }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    const timer = setTimeout(onClose, 4000)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      clearTimeout(timer)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute left-full top-0 z-50 ml-2 w-64 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-4',
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
