'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RegisterSchema, type RegisterFormData } from '@/lib/validations/auth'

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(RegisterSchema) })

  const passwordValue = watch('password', '')

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true)
    clearErrors()

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      })

      if (res.status === 409) {
        setError('email', { message: 'Пользователь с таким email уже существует' })
        return
      }

      if (!res.ok) {
        setError('root', { message: 'Ошибка регистрации. Попробуйте снова.' })
        return
      }

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.ok) {
        router.push('/onboarding')
        router.refresh()
      } else {
        setError('root', { message: 'Аккаунт создан. Войдите вручную.' })
        router.push('/login')
      }
    } catch {
      setError('root', { message: 'Ошибка соединения. Попробуйте снова.' })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogle() {
    setIsGoogleLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="flex flex-col gap-5">
      <Button
        type="button"
        variant="secondary"
        size="md"
        loading={isGoogleLoading}
        onClick={handleGoogle}
        className="w-full"
      >
        <GoogleIcon />
        Зарегистрироваться через Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs text-[var(--text-hint)]">или</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Имя"
          type="text"
          placeholder="Иван"
          autoComplete="name"
          error={errors.name?.message}
          required
          {...register('name')}
        />

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

        <div className="flex flex-col gap-1">
          <div className="relative">
            <Input
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              placeholder="Придумайте пароль"
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

        {errors.root && (
          <p
            style={{
              color: 'var(--error)',
              fontSize: '13px',
              padding: '10px 14px',
              background: 'rgba(248,113,113,0.08)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(248,113,113,0.2)',
            }}
          >
            {errors.root.message}
          </p>
        )}

        <Button type="submit" variant="primary" size="md" loading={isLoading} className="w-full">
          Создать аккаунт
        </Button>
      </form>

      <p className="text-center text-xs text-[var(--text-hint)]">
        Уже есть аккаунт?{' '}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          Войти
        </Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
