import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

import { buildSystemPrompt } from '@/lib/ai'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDueItemsCache } from '@/lib/redis'
import { SessionFormat } from '@/types/session'
import type { ChatMessage } from '@/types/session'
import type { UserProfile } from '@/types/user'
import type { CefrLevel } from '@/types/user'

const COMPLEX_FORMATS: SessionFormat[] = [
  SessionFormat.GRAMMAR,
  SessionFormat.READING,
  SessionFormat.WRITING,
]

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const userId = session.user.id
  const body = (await req.json()) as { messages: ChatMessage[]; sessionId: string }

  const [rawUser, learningSession] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
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
    }),
    prisma.learningSession.findUnique({ where: { id: body.sessionId } }),
  ])

  if (!rawUser || !learningSession || learningSession.userId !== userId) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  }

  // Cast Prisma enum to local enum (same string values)
  const user: UserProfile = {
    ...rawUser,
    cefrLevel: rawUser.cefrLevel as CefrLevel | null,
  }

  const dueItemIds = await getDueItemsCache(userId)
  const dueItems = dueItemIds
    ? await prisma.vocabItem.findMany({ where: { id: { in: dueItemIds } } })
    : []

  const sessionFormat = learningSession.format as SessionFormat
  const systemPrompt = buildSystemPrompt(user, dueItems, sessionFormat)

  const model = COMPLEX_FORMATS.includes(sessionFormat)
    ? anthropic('claude-sonnet-4-6')
    : anthropic('claude-haiku-4-5-20251001')

  const result = streamText({
    model,
    system: systemPrompt,
    messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
    maxOutputTokens: 1024,
  })

  return result.toTextStreamResponse()
}
