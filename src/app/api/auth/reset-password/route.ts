import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { ResetPasswordApiSchema } from '@/lib/validations/auth'

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = ResetPasswordApiSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { token, password } = parsed.data

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Ссылка недействительна' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  })

  await prisma.passwordResetToken.delete({ where: { token } })

  return NextResponse.json({ success: true })
}
