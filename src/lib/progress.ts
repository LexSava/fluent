import { prisma } from '@/lib/prisma'
import { getCached, setCached } from '@/lib/redis'

const CACHE_TTL = 60 * 30
const progressKey = (userId: string) => `progress:${userId}`

export type WeeklyActivity = {
  date: string
  exercisesCount: number
  score: number
}

export type ProgressVocabItem = {
  id: string
  term: string
  translation: string
  repetitions: number
  dueAt: string
  lastScore: number | null
}

export type ProgressData = {
  totalWords: number
  newWords: number
  learningWords: number
  masteredWords: number
  dueToday: number
  streak: number
  accuracy: number
  totalSessions: number
  weeklyActivity: WeeklyActivity[]
  recentVocab: ProgressVocabItem[]
}

export async function getProgressData(userId: string): Promise<ProgressData | null> {
  const cacheKey = progressKey(userId)

  const cached = await getCached<ProgressData>(cacheKey)
  if (cached) return cached

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)

  const sevenDaysAgo = new Date(todayStart)
  sevenDaysAgo.setDate(todayStart.getDate() - 6)

  const [
    totalWords,
    dueToday,
    allItems,
    totalSessions,
    rawVocab,
    weeklySessions,
    sessionDays,
    recentForAccuracy,
  ] = await Promise.all([
    prisma.vocabItem.count({ where: { userId } }),
    prisma.vocabItem.count({ where: { userId, dueAt: { lte: now } } }),
    prisma.vocabItem.findMany({
      where: { userId },
      select: { repetitions: true },
    }),
    prisma.learningSession.count({ where: { userId, endedAt: { not: null } } }),
    prisma.vocabItem.findMany({
      where: { userId },
      orderBy: { dueAt: 'asc' },
      take: 50,
      select: {
        id: true,
        term: true,
        translation: true,
        repetitions: true,
        dueAt: true,
        lastScore: true,
      },
    }),
    prisma.learningSession.findMany({
      where: { userId, endedAt: { not: null }, startedAt: { gte: sevenDaysAgo } },
      select: { startedAt: true, exercisesTotal: true, score: true },
    }),
    prisma.learningSession.findMany({
      where: { userId, endedAt: { not: null } },
      select: { startedAt: true },
      orderBy: { startedAt: 'desc' },
    }),
    prisma.learningSession.findMany({
      where: { userId, startedAt: { gte: thirtyDaysAgo }, endedAt: { not: null } },
      select: { exercisesTotal: true, exercisesCorrect: true },
    }),
  ])

  const newWords = allItems.filter((i) => i.repetitions === 0).length
  const learningWords = allItems.filter((i) => i.repetitions >= 1 && i.repetitions <= 3).length
  const masteredWords = allItems.filter((i) => i.repetitions >= 4).length

  const totalExercises = recentForAccuracy.reduce((s, r) => s + r.exercisesTotal, 0)
  const totalCorrect = recentForAccuracy.reduce((s, r) => s + r.exercisesCorrect, 0)
  const accuracy = totalExercises > 0 ? Math.round((totalCorrect / totalExercises) * 100) : 0

  let streak = 0
  const cursor = new Date(todayStart)
  const daySet = new Set(
    sessionDays.map((s) => {
      const d = new Date(s.startedAt)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )
  while (daySet.has(cursor.getTime())) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  const weeklyActivity: WeeklyActivity[] = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(todayStart)
    day.setDate(todayStart.getDate() - (6 - i))
    const dayEnd = new Date(day)
    dayEnd.setHours(23, 59, 59, 999)

    const dayTs = day.getTime()
    const dayEndTs = dayEnd.getTime()

    const daySessions = weeklySessions.filter((s) => {
      const ts = new Date(s.startedAt).getTime()
      return ts >= dayTs && ts <= dayEndTs
    })

    const exercisesCount = daySessions.reduce((sum, s) => sum + s.exercisesTotal, 0)
    const scores = daySessions.filter((s) => s.score != null).map((s) => s.score as number)
    const score =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

    return { date: day.toISOString().split('T')[0], exercisesCount, score }
  })

  const recentVocab: ProgressVocabItem[] = rawVocab.map((v) => ({
    id: v.id,
    term: v.term,
    translation: v.translation,
    repetitions: v.repetitions,
    dueAt: v.dueAt.toISOString(),
    lastScore: v.lastScore,
  }))

  const data: ProgressData = {
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
  }

  await setCached(cacheKey, data, CACHE_TTL)
  return data
}
