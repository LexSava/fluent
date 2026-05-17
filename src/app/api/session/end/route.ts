import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { invalidateCache } from '@/lib/redis'
import type { Exercise } from '@/types/session'

const dueItemsKey = (userId: string) => `due_items:${userId}`
const progressKey = (userId: string) => `progress:${userId}`

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const body = (await req.json()) as { sessionId: string; exercises: Exercise[] }

  const { sessionId, exercises } = body

  const existing = await prisma.learningSession.findUnique({ where: { id: sessionId } })
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const exercisesCorrect = exercises.filter((e) => e.score >= 7).length
  const avgScore =
    exercises.length > 0 ? exercises.reduce((sum, e) => sum + e.score, 0) / exercises.length : 0

  const updated = await prisma.learningSession.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      score: avgScore,
      exercisesTotal: exercises.length,
      exercisesCorrect,
    },
  })

  await Promise.all([invalidateCache(dueItemsKey(userId)), invalidateCache(progressKey(userId))])

  return NextResponse.json(updated)
}
