'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Avatar } from '@/components/ui/Avatar'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types/user'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/session': 'Session',
  '/progress': 'Progress',
  '/settings': 'Settings',
}

type HeaderProps = {
  user: UserProfile
  onMenuOpen: () => void
  className?: string
}

export function Header({ user, onMenuOpen, className }: HeaderProps) {
  const pathname = usePathname()

  const title =
    Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] ?? 'Fluent'

  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)]',
        'bg-[var(--bg-card)] px-4',
        className
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          aria-label="Open menu"
          className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] md:hidden"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Avatar name={user.name ?? user.email} image={user.image} size="sm" />
      </div>
    </header>
  )
}
