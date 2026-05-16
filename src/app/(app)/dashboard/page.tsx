import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionPicker } from '@/components/dashboard/SessionPicker'
import { StatCard } from '@/components/dashboard/StatCard'
import { StreakBadge } from '@/components/dashboard/StreakBadge'
import { SUPPORTED_LANGUAGES } from '@/types/user'

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const [sessionCount, vocabCount, user] = await Promise.all([
    prisma.learningSession.count({ where: { userId } }),
    prisma.vocabItem.count({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, targetLang: true },
    }),
  ])

  const langLabel = user?.targetLang
    ? (SUPPORTED_LANGUAGES[user.targetLang] ?? user.targetLang)
    : 'не выбран'

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-[var(--text-primary)]">
            Привет, {user?.name?.split(' ')[0] ?? 'друг'} 👋
          </h1>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">Изучаешь: {langLabel}</p>
        </div>
        <StreakBadge streak={0} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Сессий" value={sessionCount} />
        <StatCard label="Слов" value={vocabCount} />
        <StatCard label="Точность" value="—" hint="начни сессию" />
        <StatCard label="Серия" value="0" hint="дней подряд" />
      </div>

      {/* Session picker */}
      <div>
        <h2 className="mb-3 text-[18px] font-semibold text-[var(--text-primary)]">Начать сессию</h2>
        <SessionPicker />
      </div>
    </div>
  )
}
