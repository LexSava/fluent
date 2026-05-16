import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { RegisterApiSchema } from '@/lib/validations/auth'

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = RegisterApiSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { name, email, passwordHash, isOnboarded: false },
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
