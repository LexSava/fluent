'use client'

import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
}

const transition = { duration: 0.18, ease: 'easeOut' as const }

type OnboardingStepProps = {
  step: number
  total: number
  title: string
  description: string
  direction?: number
  children: React.ReactNode
  className?: string
}

export function OnboardingStep({
  step,
  total,
  title,
  description,
  direction = 1,
  children,
  className,
}: OnboardingStepProps) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className={cn('flex flex-col gap-6', className)}
    >
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i < step ? 'bg-accent' : 'bg-border'
            )}
          />
        ))}
      </div>

      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-hint">
          Шаг {step} из {total}
        </p>
        <h2 className="mt-1 text-[26px] font-bold tracking-[-0.03em] text-text-primary">{title}</h2>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>

      {children}
    </motion.div>
  )
}
