'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useSyncExternalStore } from 'react'

import { useTheme } from '@/components/layout/ThemeProvider'

import { cn } from '@/lib/utils'

type ThemeToggleProps = {
  className?: string
}

const noop = () => () => {}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolved, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false
  )

  if (!mounted) return <div className={cn('size-9', className)} />

  const isDark = resolved === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-sm',
        'border border-border bg-bg-elevated',
        'text-text-secondary transition-colors duration-150',
        'hover:border-accent hover:text-accent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          className="flex items-center justify-center"
        >
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
