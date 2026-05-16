import { redirect } from 'next/navigation'

import { AppShell } from './_shell'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { CefrLevel } from '@/types/user'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

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

  if (!user) redirect('/login')
  if (!user.isOnboarded) redirect('/onboarding')

  return (
    <AppShell
      user={{
        ...user,
        cefrLevel: user.cefrLevel as CefrLevel | null,
      }}
    >
      {children}
    </AppShell>
  )
}
