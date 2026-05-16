import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCached, setCached } from '@/lib/redis'

const CACHE_TTL = 60 * 60 // 1 hour
const progressKey = (userId: string) => `progress:${userId}`

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const cacheKey = progressKey(userId)

  const cached = await getCached<object>(cacheKey)
  if (cached) return NextResponse.json(cached)

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)

  const [totalWords, dueToday, recentSessions, allItems] = await Promise.all([
    prisma.vocabItem.count({ where: { userId } }),
    prisma.vocabItem.count({ where: { userId, dueAt: { lte: now } } }),
    prisma.learningSession.findMany({
      where: { userId, endedAt: { not: null } },
      orderBy: { startedAt: 'desc' },
      take: 7,
      select: {
        id: true,
        format: true,
        startedAt: true,
        endedAt: true,
        score: true,
        exercisesTotal: true,
        exercisesCorrect: true,
      },
    }),
    prisma.vocabItem.findMany({
      where: { userId },
      select: { repetitions: true, lastScore: true },
    }),
  ])

  // Word mastery levels
  const newWords = allItems.filter((i) => i.repetitions === 0).length
  const learning = allItems.filter((i) => i.repetitions > 0 && i.repetitions < 5).length
  const mastered = allItems.filter((i) => i.repetitions >= 5).length

  // Accuracy over last 30 days
  const recentForAccuracy = await prisma.learningSession.findMany({
    where: { userId, startedAt: { gte: thirtyDaysAgo }, endedAt: { not: null } },
    select: { exercisesTotal: true, exercisesCorrect: true },
  })
  const totalExercises = recentForAccuracy.reduce((s, r) => s + r.exercisesTotal, 0)
  const totalCorrect = recentForAccuracy.reduce((s, r) => s + r.exercisesCorrect, 0)
  const accuracy30d = totalExercises > 0 ? Math.round((totalCorrect / totalExercises) * 100) : 0

  // Streak — count consecutive days with at least one completed session
  const sessionDays = await prisma.learningSession.findMany({
    where: { userId, endedAt: { not: null } },
    select: { startedAt: true },
    orderBy: { startedAt: 'desc' },
  })

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

  const stats = {
    totalWords,
    newWords,
    learning,
    mastered,
    dueToday,
    streak,
    accuracy30d,
    recentSessions,
  }

  await setCached(cacheKey, stats, CACHE_TTL)

  return NextResponse.json(stats)
}
