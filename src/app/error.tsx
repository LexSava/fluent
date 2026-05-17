'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-base)] px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">
          Что-то пошло не так
        </h1>
        <p className="max-w-xs text-[14px] text-[var(--text-secondary)]">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу.
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-sm bg-[var(--accent)] px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        Попробовать снова
      </button>
    </div>
  )
}
