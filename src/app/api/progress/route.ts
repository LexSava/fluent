import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { getProgressData } from '@/lib/progress'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await getProgressData(session.user.id)
  if (!data) return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 })

  return NextResponse.json(data)
}
