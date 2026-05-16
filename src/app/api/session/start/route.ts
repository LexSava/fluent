import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDueItemsCache, setDueItemsCache } from '@/lib/redis'
import type { SessionFormat } from '@/types/session'

const MAX_DUE_ITEMS = 10

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const body = (await req.json()) as { format: SessionFormat }

  const learningSession = await prisma.learningSession.create({
    data: { userId, format: body.format },
  })

  // Try Redis cache first
  let dueItemIds = await getDueItemsCache(userId)

  if (!dueItemIds) {
    const items = await prisma.vocabItem.findMany({
      where: { userId, dueAt: { lte: new Date() } },
      orderBy: { dueAt: 'asc' },
      take: MAX_DUE_ITEMS,
      select: { id: true },
    })
    dueItemIds = items.map((i) => i.id)
    await setDueItemsCache(userId, dueItemIds)
  }

  const dueItems = await prisma.vocabItem.findMany({
    where: { id: { in: dueItemIds.slice(0, MAX_DUE_ITEMS) } },
    orderBy: { dueAt: 'asc' },
  })

  return NextResponse.json({ session: learningSession, dueItems })
}
