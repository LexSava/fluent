'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ForgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(ForgotPasswordSchema) })

  async function onSubmit(data: ForgotPasswordFormData) {
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email }),
    })
    // Always show success regardless of response (don't leak user existence)
    setSubmittedEmail(data.email)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Письмо отправлено на <span className="text-[var(--accent)]">{submittedEmail}</span>
          </p>
          <p className="text-xs text-[var(--text-hint)]">
            Проверьте папку спам если письмо не пришло
          </p>
        </div>
        <Link href="/login" className="text-xs text-[var(--accent)] hover:underline">
          ← Вернуться ко входу
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-[var(--text-secondary)]">
          Введите email, и мы отправим ссылку для сброса пароля.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          spellCheck={false}
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Button type="submit" variant="primary" size="md" loading={isSubmitting} className="w-full">
          Отправить ссылку
        </Button>
      </form>

      <p className="text-center text-xs text-[var(--text-hint)]">
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          ← Вернуться к авторизации
        </Link>
      </p>
    </div>
  )
}
