'use client'

import { AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { LanguageSelector } from '@/components/onboarding/LanguageSelector'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { Button } from '@/components/ui/Button'
import { CefrLevel } from '@/types/user'
import { cn } from '@/lib/utils'

const TOTAL_STEPS = 3

const CEFR_LEVELS: { value: CefrLevel; label: string; hint: string }[] = [
  { value: CefrLevel.A1, label: 'A1', hint: 'Начинающий' },
  { value: CefrLevel.A2, label: 'A2', hint: 'Элементарный' },
  { value: CefrLevel.B1, label: 'B1', hint: 'Средний' },
  { value: CefrLevel.B2, label: 'B2', hint: 'Выше среднего' },
  { value: CefrLevel.C1, label: 'C1', hint: 'Продвинутый' },
  { value: CefrLevel.C2, label: 'C2', hint: 'Свободное владение' },
]

const INTERESTS_LIST = [
  'Путешествия',
  'Бизнес',
  'Технологии',
  'Культура',
  'Спорт',
  'Еда',
  'Музыка',
  'Кино',
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [targetLang, setTargetLang] = useState('')
  const [cefrLevel, setCefrLevel] = useState<CefrLevel | ''>('')
  const [interests, setInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.replace('/login')
      return
    }
    if ((session.user as { isOnboarded?: boolean }).isOnboarded) {
      router.replace('/dashboard')
    }
  }, [session, status, router])

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  function toggleInterest(item: string) {
    setInterests((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  async function handleFinish() {
    if (!targetLang || !cefrLevel) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLang, cefrLevel, interests }),
      })
      if (!res.ok) throw new Error('Ошибка сохранения')
      router.push('/dashboard')
    } catch {
      setError('Не удалось сохранить настройки. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <span className="size-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-xl overflow-hidden rounded-lg border border-border bg-bg-card p-8">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <OnboardingStep
              key={1}
              step={1}
              total={TOTAL_STEPS}
              direction={direction}
              title="Какой язык учишь?"
              description="Выбери язык, который хочешь освоить."
            >
              <LanguageSelector value={targetLang} onChange={setTargetLang} />
              <Button
                variant="primary"
                size="md"
                className="mt-2 w-full"
                disabled={!targetLang}
                onClick={() => goTo(2)}
              >
                Далее
              </Button>
            </OnboardingStep>
          )}

          {step === 2 && (
            <OnboardingStep
              key={2}
              step={2}
              total={TOTAL_STEPS}
              direction={direction}
              title="Твой уровень"
              description="Оцени свой текущий уровень владения языком."
            >
              <div className="grid grid-cols-3 gap-2">
                {CEFR_LEVELS.map(({ value, label, hint }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCefrLevel(value)}
                    aria-pressed={cefrLevel === value}
                    className={cn(
                      'flex flex-col items-center rounded-md border px-3 py-4 transition-colors duration-150',
                      cefrLevel === value
                        ? 'border-accent bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-accent'
                        : 'border-border bg-bg-elevated text-text-secondary hover:border-accent'
                    )}
                  >
                    <span className="text-lg font-bold">{label}</span>
                    <span className="mt-0.5 text-[11px]">{hint}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-3">
                <Button variant="ghost" size="md" className="flex-1" onClick={() => goTo(1)}>
                  Назад
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  disabled={!cefrLevel}
                  onClick={() => goTo(3)}
                >
                  Далее
                </Button>
              </div>
            </OnboardingStep>
          )}

          {step === 3 && (
            <OnboardingStep
              key={3}
              step={3}
              total={TOTAL_STEPS}
              direction={direction}
              title="Твои интересы"
              description="Выбери темы — AI-тьютор будет использовать их в сессиях."
            >
              <div className="flex flex-wrap gap-2">
                {INTERESTS_LIST.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    aria-pressed={interests.includes(item)}
                    className={cn(
                      'rounded-xs border px-3 py-1.5 text-sm font-medium transition-colors duration-150',
                      interests.includes(item)
                        ? 'border-accent bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-accent'
                        : 'border-border bg-bg-card text-text-secondary hover:border-accent'
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {error && (
                <p className="rounded-sm border border-error bg-[color-mix(in_srgb,var(--error)_10%,transparent)] px-3 py-2 text-xs text-error">
                  {error}
                </p>
              )}

              <div className="mt-2 flex gap-3">
                <Button variant="ghost" size="md" className="flex-1" onClick={() => goTo(2)}>
                  Назад
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  loading={loading}
                  onClick={handleFinish}
                >
                  Начать обучение
                </Button>
              </div>
            </OnboardingStep>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
