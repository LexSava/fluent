'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BarChart2, LayoutDashboard, Lock, LogOut, MessageCircle, Settings, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'

import { Avatar } from '@/components/ui/Avatar'
import { Popover } from '@/components/ui/Popover'
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
  const router = useRouter()
  const [activeSessionUrl, setActiveSessionUrl] = useState<string | null>(null)
  const [showPopover, setShowPopover] = useState(false)
  const [hasStartedSession, setHasStartedSession] = useState<boolean | null>(null)

  useEffect(() => {
    requestAnimationFrame(() => {
      try {
        setActiveSessionUrl(sessionStorage.getItem('active_session_url'))
        setHasStartedSession(!!localStorage.getItem('hasStartedSession'))
      } catch {}
    })
  }, [pathname])

  const closePopover = useCallback(() => setShowPopover(false), [])

  const content = (
    <div className="flex h-full w-56 flex-col border-r border-[var(--border)] bg-[var(--bg-card)]">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
        <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
          Fluent
        </span>
        <button
          onClick={onClose}
          aria-label="Закрыть меню"
          className="flex size-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-hint)] hover:text-[var(--text-primary)] md:hidden"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Nav */}
      <nav aria-label="Основная навигация" className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isSession = href === '/session'
          const active = pathname.startsWith(href)
          const itemClass = cn(
            'flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors duration-150',
            active
              ? 'bg-[var(--accent-dim)] font-medium text-[var(--accent)]'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
          )

          if (isSession) {
            const hasSession = !!activeSessionUrl
            const showBadge = !hasSession && hasStartedSession === false

            return (
              <div key={href} className="relative">
                {hasSession ? (
                  <a
                    href={activeSessionUrl}
                    title="Вернуться к активной сессии"
                    onClick={(e) => {
                      e.preventDefault()
                      onClose()
                      router.push(activeSessionUrl)
                    }}
                    className={itemClass}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="flex-1">{label}</span>
                    <span className="size-2 shrink-0 rounded-full bg-[var(--success)]" />
                  </a>
                ) : (
                  <button
                    onClick={() => setShowPopover((p) => !p)}
                    aria-haspopup="true"
                    aria-expanded={showPopover}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors duration-150',
                      active
                        ? 'bg-[var(--accent-dim)] font-medium text-[var(--accent)]'
                        : 'cursor-default text-[var(--text-secondary)]'
                    )}
                  >
                    <Icon size={16} className={cn('shrink-0', !active && 'opacity-50')} />
                    <span className={cn('flex-1 text-left', !active && 'opacity-50')}>{label}</span>
                    {showBadge ? (
                      <span className="rounded-[3px] bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-white">
                        Начни здесь
                      </span>
                    ) : (
                      <Lock
                        size={12}
                        className={cn('shrink-0 text-[var(--text-hint)]', !active && 'opacity-50')}
                      />
                    )}
                  </button>
                )}

                <Popover isOpen={showPopover} onClose={closePopover}>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Нет активной сессии
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                    Выбери формат занятия на главной странице чтобы начать
                  </p>
                  <button
                    onClick={() => {
                      closePopover()
                      onClose()
                      router.push('/dashboard')
                    }}
                    className="mt-3 w-full rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Перейти на главную
                  </button>
                </Popover>
              </div>
            )
          }

          return (
            <Link key={href} href={href} onClick={onClose} className={itemClass}>
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
            aria-label="Выйти из аккаунта"
            className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-hint)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--error)]"
          >
            <LogOut size={14} aria-hidden="true" />
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
