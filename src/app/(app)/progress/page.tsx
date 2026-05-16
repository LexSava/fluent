import { BarChart2 } from 'lucide-react'

export default function ProgressPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[26px] font-bold tracking-[-0.03em] text-[var(--text-primary)]">
        Прогресс
      </h1>

      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-[var(--border)] bg-[var(--bg-card)] py-16">
        <BarChart2 size={32} className="text-[var(--text-hint)]" />
        <p className="text-sm text-[var(--text-secondary)]">
          Статистика появится после первой сессии
        </p>
      </div>
    </div>
  )
}
