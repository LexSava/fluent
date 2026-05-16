import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/resend'
import { ForgotPasswordSchema } from '@/lib/validations/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = ForgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json({ error: 'Некорректный email' }, { status: 400 })
    }

    const { email } = parsed.data
    const user = await prisma.user.findUnique({ where: { email } })

    // Always return 200 — don't reveal whether email exists
    if (!user) {
      return Response.json({ success: true })
    }

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    await sendPasswordResetEmail(email, resetUrl, user.name ?? '')

    return Response.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
