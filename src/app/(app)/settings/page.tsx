import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SUPPORTED_LANGUAGES, CefrLevel } from '@/types/user'

export default async function SettingsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id! },
    select: { name: true, email: true, targetLang: true, cefrLevel: true, interests: true },
  })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[26px] font-bold tracking-[-0.03em] text-[var(--text-primary)]">
        Настройки
      </h1>

      <div className="flex max-w-lg flex-col gap-4">
        {/* Profile */}
        <section className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="mb-4 text-[18px] font-semibold text-[var(--text-primary)]">Профиль</h2>
          <dl className="flex flex-col gap-3">
            <Row label="Имя" value={user?.name ?? '—'} />
            <Row label="Email" value={user?.email ?? '—'} />
            <Row
              label="Язык"
              value={
                user?.targetLang ? (SUPPORTED_LANGUAGES[user.targetLang] ?? user.targetLang) : '—'
              }
            />
            <Row label="Уровень" value={user?.cefrLevel ?? '—'} />
          </dl>
        </section>

        <p className="text-xs text-[var(--text-hint)]">
          Редактирование настроек будет доступно в следующих версиях.
        </p>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-hint)]">
        {label}
      </dt>
      <dd className="text-sm text-[var(--text-primary)]">{value}</dd>
    </div>
  )
}
