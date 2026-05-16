import { type ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] p-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-1">
        <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Fluent</span>
        <span className="text-xs text-[var(--text-hint)]">Your AI language tutor</span>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
