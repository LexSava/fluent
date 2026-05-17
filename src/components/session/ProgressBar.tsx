'use client'

import { motion } from 'framer-motion'

type ProgressBarProps = {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] text-text-hint">
        Упражнение {current} из {total}
      </p>
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Упражнение ${current} из ${total}`}
        className="relative h-1 w-full overflow-hidden rounded-full bg-bg-elevated"
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-accent"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
