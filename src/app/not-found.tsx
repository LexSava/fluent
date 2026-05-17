import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-base)] px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-[72px] font-bold leading-none tracking-[-0.04em] text-[var(--bg-elevated)]">
          404
        </span>
        <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">
          Страница не найдена
        </h1>
        <p className="max-w-xs text-[14px] text-[var(--text-secondary)]">
          Такой страницы не существует или она была перемещена.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="rounded-sm bg-[var(--accent)] px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        На главную
      </Link>
    </div>
  )
}
