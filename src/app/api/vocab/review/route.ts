import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateNextReview } from '@/lib/srs'
import type { ReviewGrade, VocabItem } from '@/types/vocab'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const body = (await req.json()) as {
    vocabItemId?: string
    grade: ReviewGrade
    term?: string
    translation?: string
    context?: string
  }

  let item: VocabItem | null = null

  if (body.vocabItemId) {
    const raw = await prisma.vocabItem.findUnique({ where: { id: body.vocabItemId } })
    if (raw && raw.userId === userId) {
      item = {
        ...raw,
        lastScore: raw.lastScore ?? null,
      }
    }
  }

  if (!item) {
    // Tutor introduced a new word — create it
    const created = await prisma.vocabItem.create({
      data: {
        userId,
        term: body.term ?? '',
        translation: body.translation ?? '',
        context: body.context ?? null,
      },
    })
    item = { ...created, lastScore: null }
  }

  const srsResult = calculateNextReview(item, body.grade)

  const updated = await prisma.vocabItem.update({
    where: { id: item.id },
    data: {
      repetitions: srsResult.repetitions,
      easeFactor: srsResult.easeFactor,
      interval: srsResult.interval,
      dueAt: srsResult.dueAt,
      lastScore: body.grade,
    },
  })

  return NextResponse.json(updated)
}
