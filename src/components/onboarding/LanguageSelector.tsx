import { cn } from '@/lib/utils'
import { SUPPORTED_LANGUAGES } from '@/types/user'

const LANGUAGE_FLAGS: Record<string, string> = {
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  it: '🇮🇹',
  en: '🇬🇧',
  pt: '🇵🇹',
  ja: '🇯🇵',
  zh: '🇨🇳',
}

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
            'flex flex-col items-center gap-1.5 rounded-md border px-4 py-3 text-sm font-medium transition-colors duration-150',
            value === code
              ? 'border-accent bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-accent'
              : 'border-border bg-bg-card text-text-secondary hover:border-accent hover:text-text-primary'
          )}
        >
          <span className="text-xl leading-none">{LANGUAGE_FLAGS[code]}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
