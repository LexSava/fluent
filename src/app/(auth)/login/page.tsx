import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/auth/LoginForm'
import { auth } from '@/lib/auth'

type Props = { searchParams: Promise<{ reset?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth()
  if (session?.user?.id) redirect('/dashboard')

  const { reset } = await searchParams

  return (
    <>
      {reset === 'success' && (
        <div className="mb-4 rounded-md border border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] px-4 py-3 text-sm text-[var(--success)]">
          Пароль обновлён — войдите с новым паролем.
        </div>
      )}
      <LoginForm />
    </>
  )
}
