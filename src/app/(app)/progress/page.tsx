import { BookOpen, Flame } from 'lucide-react'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getProgressData } from '@/lib/progress'
import { StatCard } from '@/components/dashboard/StatCard'
import AccuracyRing from '@/components/progress/AccuracyRing'
import StatsChartWrapper from '@/components/progress/StatsChartWrapper'
import StreakCalendar from '@/components/progress/StreakCalendar'
import VocabList from '@/components/progress/VocabList'

export default async function ProgressPage() {
  const session = await auth()
  const data = session?.user?.id ? await getProgressData(session.user.id) : null

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-bg-card py-20">
        <p className="text-[14px] text-text-secondary">
          Не удалось загрузить данные. Попробуйте позже.
        </p>
        <Link
          href="/dashboard"
          className="rounded-sm bg-accent px-4 py-2 text-[13px] font-semibold text-white"
        >
          На главную
        </Link>
      </div>
    )
  }

  const {
    totalWords,
    newWords,
    learningWords,
    masteredWords,
    dueToday,
    streak,
    accuracy,
    totalSessions,
    weeklyActivity,
    recentVocab,
  } = data

  if (totalWords === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-[26px] font-bold tracking-[-0.03em] text-text-primary">Мой прогресс</h1>
        <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-border bg-bg-card py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-md border border-border bg-bg-elevated">
            <BookOpen size={32} className="text-accent" />
          </div>
          <div className="text-center">
            <p className="text-[18px] font-semibold text-text-primary">Начни своё первое занятие</p>
            <p className="mt-1 max-w-xs text-[14px] text-text-secondary">
              Здесь будет появляться твой прогресс, статистика сессий и изученные слова.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-sm bg-accent px-5 py-2.5 text-[13px] font-semibold text-white"
          >
            Начать занятие
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[26px] font-bold tracking-[-0.03em] text-text-primary">Мой прогресс</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Слов изучено" value={totalWords} color="accent" />
        <StatCard label="Выучено" value={masteredWords} color="success" />
        <StatCard label="Учится" value={learningWords} color="warning" />
        <StatCard
          label="Повторить сегодня"
          value={dueToday}
          color="primary"
          hint={dueToday > 0 ? 'Есть задания' : 'Всё готово'}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="flex items-center justify-center rounded-md border border-border bg-bg-card p-4">
          <AccuracyRing value={accuracy} />
        </div>

        <div className="flex flex-col gap-1 rounded-md border border-border bg-bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-hint">
            Серия дней
          </p>
          <div className="flex items-center gap-1">
            <Flame size={20} className="text-warning" />
            <span className="text-[28px] font-bold leading-none text-warning">{streak}</span>
          </div>
          <p className="text-[11px] text-text-hint">
            {streak === 1 ? 'день подряд' : streak < 5 ? 'дня подряд' : 'дней подряд'}
          </p>
        </div>

        <StatCard label="Всего сессий" value={totalSessions} color="accent" />
        <StatCard label="Новых слов" value={newWords} color="primary" />
      </div>

      <section className="rounded-md border border-border bg-bg-card p-4">
        <h2 className="mb-4 text-[18px] font-semibold text-text-primary">Активность за неделю</h2>
        <StatsChartWrapper data={weeklyActivity} />
      </section>

      <section className="rounded-md border border-border bg-bg-card p-4">
        <h2 className="mb-4 text-[18px] font-semibold text-text-primary">История занятий</h2>
        <StreakCalendar weeklyActivity={weeklyActivity} />
      </section>

      <section className="rounded-md border border-border bg-bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-[18px] font-semibold text-text-primary">Мой словарь</h2>
          <span className="rounded-xs border border-border bg-bg-elevated px-2 py-0.5 text-[11px] font-semibold text-text-hint">
            {totalWords} слов
          </span>
        </div>
        <VocabList items={recentVocab} />
      </section>
    </div>
  )
}
