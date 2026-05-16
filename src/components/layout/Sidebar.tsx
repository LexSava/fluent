'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BarChart2, LayoutDashboard, LogOut, MessageCircle, Settings, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types/user'

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Session', href: '/session', icon: MessageCircle },
  { label: 'Progress', href: '/progress', icon: BarChart2 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

type SidebarProps = {
  user: UserProfile
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const content = (
    <div className="flex h-full w-56 flex-col border-r border-[var(--border)] bg-[var(--bg-card)]">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
        <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
          Fluent
        </span>
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="flex size-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-hint)] hover:text-[var(--text-primary)] md:hidden"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors duration-150',
                active
                  ? 'bg-[var(--accent-dim)] font-medium text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + sign out */}
      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-2 rounded-[var(--radius-sm)] p-1">
          <Avatar name={user.name ?? user.email} image={user.image} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[var(--text-primary)]">
              {user.name ?? 'User'}
            </p>
            <p className="truncate text-[10px] text-[var(--text-hint)]">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sign out"
            className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-hint)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--error)]"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop — always visible */}
      <aside className="hidden h-screen shrink-0 md:flex">{content}</aside>

      {/* Mobile — slide-in overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
