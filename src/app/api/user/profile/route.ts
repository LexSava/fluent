import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { CefrLevel } from '@/types/user'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      targetLang: true,
      cefrLevel: true,
      interests: true,
      isOnboarded: true,
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json(user)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as {
    targetLang?: string
    cefrLevel?: CefrLevel
    interests?: string[]
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      targetLang: body.targetLang,
      cefrLevel: body.cefrLevel,
      interests: body.interests ?? [],
      isOnboarded: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      targetLang: true,
      cefrLevel: true,
      interests: true,
      isOnboarded: true,
    },
  })

  return NextResponse.json(user)
}
