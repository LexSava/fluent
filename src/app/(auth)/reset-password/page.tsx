import { redirect } from 'next/navigation'

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

type Props = { searchParams: Promise<{ token?: string }> }

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams
  if (!token) redirect('/forgot-password')

  return <ResetPasswordForm token={token} />
}
