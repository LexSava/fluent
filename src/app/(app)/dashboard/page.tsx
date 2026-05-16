import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionPicker } from '@/components/dashboard/SessionPicker'
import { StatCard } from '@/components/dashboard/StatCard'
import { StreakBadge } from '@/components/dashboard/StreakBadge'
import { SUPPORTED_LANGUAGES } from '@/types/user'

async function getProgress(userId: string) {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)

  const [totalWords, dueToday, allItems, sessionCount, recentForAccuracy, sessionDays, user] =
    await Promise.all([
      prisma.vocabItem.count({ where: { userId } }),
      prisma.vocabItem.count({ where: { userId, dueAt: { lte: now } } }),
      prisma.vocabItem.findMany({
        where: { userId },
        select: { repetitions: true },
      }),
      prisma.learningSession.count({ where: { userId } }),
      prisma.learningSession.findMany({
        where: { userId, startedAt: { gte: thirtyDaysAgo }, endedAt: { not: null } },
        select: { exercisesTotal: true, exercisesCorrect: true },
      }),
      prisma.learningSession.findMany({
        where: { userId, endedAt: { not: null } },
        select: { startedAt: true },
        orderBy: { startedAt: 'desc' },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, targetLang: true },
      }),
    ])

  const mastered = allItems.filter((i) => i.repetitions >= 5).length

  const totalEx = recentForAccuracy.reduce((s, r) => s + r.exercisesTotal, 0)
  const totalOk = recentForAccuracy.reduce((s, r) => s + r.exercisesCorrect, 0)
  const accuracy = totalEx > 0 ? Math.round((totalOk / totalEx) * 100) : null

  // Streak — consecutive days with at least one completed session
  const daySet = new Set(
    sessionDays.map((s) => {
      const d = new Date(s.startedAt)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )
  let streak = 0
  const cursor = new Date(todayStart)
  while (daySet.has(cursor.getTime())) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return { totalWords, mastered, dueToday, sessionCount, accuracy, streak, user }
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const { totalWords, mastered, dueToday, sessionCount, accuracy, streak, user } =
    await getProgress(userId)

  const firstName = user?.name?.split(' ')[0] ?? 'друг'
  const langLabel = user?.targetLang
    ? (SUPPORTED_LANGUAGES[user.targetLang] ?? user.targetLang)
    : null

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-[var(--text-primary)]">
            Привет, {firstName} 👋
          </h1>
          {langLabel && (
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
              Изучаешь: <span className="font-medium text-[var(--text-primary)]">{langLabel}</span>
            </p>
          )}
        </div>
        <StreakBadge streak={streak} />
      </div>

      {/* Stats */}
      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-hint)]">
          Статистика
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Слов выучено"
            value={mastered}
            color="success"
            hint={`из ${totalWords} всего`}
          />
          <StatCard
            label="Точность"
            value={accuracy !== null ? `${accuracy}%` : '—'}
            color="accent"
            hint="за 30 дней"
          />
          <StatCard
            label="К повторению"
            value={dueToday}
            color={dueToday > 0 ? 'warning' : 'primary'}
            hint="слов сегодня"
          />
          <StatCard label="Сессий всего" value={sessionCount} color="primary" />
        </div>
      </section>

      {/* Session picker */}
      <section>
        <h2 className="mb-3 text-[18px] font-semibold text-[var(--text-primary)]">
          Начать занятие
        </h2>
        <SessionPicker />
      </section>
    </div>
  )
}
