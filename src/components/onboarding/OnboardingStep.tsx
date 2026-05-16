import { cn } from '@/lib/utils'

type OnboardingStepProps = {
  step: number
  total: number
  title: string
  description: string
  children: React.ReactNode
  className?: string
}

export function OnboardingStep({
  step,
  total,
  title,
  description,
  children,
  className,
}: OnboardingStepProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Progress */}
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i < step ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
            )}
          />
        ))}
      </div>

      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-hint)]">
          Шаг {step} из {total}
        </p>
        <h2 className="mt-1 text-[26px] font-bold tracking-[-0.03em] text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
      </div>

      {children}
    </div>
  )
}
