'use client'

type Props = { password: string }

type Strength = { score: number; label: string; color: string }

function getStrength(password: string): Strength {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[!@#$%^&*]/.test(password)) score++

  if (score <= 1) return { score, label: 'Слабый', color: 'var(--error)' }
  if (score === 2) return { score, label: 'Средний', color: 'var(--warning)' }
  if (score === 3) return { score, label: 'Хороший', color: '#FACC15' }
  return { score, label: 'Надёжный', color: 'var(--success)' }
}

export function PasswordStrengthIndicator({ password }: Props) {
  if (!password) return null

  const { score, label, color } = getStrength(password)
  const widthPct = Math.min((score / 5) * 100, 100)

  return (
    <div className="flex flex-col gap-1">
      <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${widthPct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px]" style={{ color }}>
        {label}
      </span>
    </div>
  )
}
