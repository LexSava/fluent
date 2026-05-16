import { cn } from '@/lib/utils'
import { SUPPORTED_LANGUAGES } from '@/types/user'

type LanguageSelectorProps = {
  value: string
  onChange: (lang: string) => void
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {Object.entries(SUPPORTED_LANGUAGES).map(([code, label]) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={cn(
            'rounded-md border px-4 py-3 text-sm font-medium transition-colors duration-150',
            value === code
              ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]'
              : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
