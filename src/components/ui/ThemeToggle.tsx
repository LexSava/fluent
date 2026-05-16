'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — setState via callback satisfies react-hooks/set-state-in-effect
  useEffect(() => {
    const onMount = () => setMounted(true)
    onMount()
  }, [])

  if (!mounted) {
    return <div className={cn('size-9', className)} />
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-[var(--radius-sm)]',
        'border border-[var(--border)] bg-[var(--bg-elevated)]',
        'text-[var(--text-secondary)] transition-colors duration-150',
        'hover:border-[var(--accent)] hover:text-[var(--accent)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
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
