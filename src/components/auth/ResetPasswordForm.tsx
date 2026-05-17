'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ResetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth'

type Props = { token: string }

export function ResetPasswordForm({ token }: Props) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(ResetPasswordSchema) })

  const passwordValue = watch('password', '')

  async function onSubmit(data: ResetPasswordFormData) {
    setServerError(null)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: data.password }),
    })

    if (res.status === 400) {
      setServerError('Ссылка недействительна или устарела')
      return
    }
    if (!res.ok) {
      setServerError('Произошла ошибка. Попробуйте снова')
      return
    }

    router.push('/login?reset=success')
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-[var(--text-secondary)]">Придумайте новый пароль для аккаунта.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="relative">
            <Input
              label="Новый пароль"
              type={showPassword ? 'text' : 'password'}
              placeholder="Новый пароль"
              autoComplete="new-password"
              error={errors.password?.message}
              className="pr-10"
              required
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              className="absolute right-3 top-[30px] text-[var(--text-hint)] hover:text-[var(--text-secondary)]"
            >
              {showPassword ? (
                <EyeOff size={16} aria-hidden="true" />
              ) : (
                <Eye size={16} aria-hidden="true" />
              )}
            </button>
          </div>
          <PasswordStrengthIndicator password={passwordValue} />
        </div>

        <div className="relative">
          <Input
            label="Подтвердите пароль"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Повторите пароль"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            className="pr-10"
            required
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={
              showConfirm ? 'Скрыть подтверждение пароля' : 'Показать подтверждение пароля'
            }
            className="absolute right-3 top-[30px] text-[var(--text-hint)] hover:text-[var(--text-secondary)]"
          >
            {showConfirm ? (
              <EyeOff size={16} aria-hidden="true" />
            ) : (
              <Eye size={16} aria-hidden="true" />
            )}
          </button>
        </div>

        {serverError && (
          <p className="rounded-[var(--radius-sm)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,transparent)] px-3 py-2 text-xs text-[var(--error)]">
            {serverError}
          </p>
        )}

        <Button type="submit" variant="primary" size="md" loading={isSubmitting} className="w-full">
          Сохранить пароль
        </Button>
      </form>
    </div>
  )
}
