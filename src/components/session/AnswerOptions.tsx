'use client'

import { useState } from 'react'

import { MarkdownContent } from './MarkdownContent'

type Props = {
  content: string
  onSelect: (option: string) => void
}

const OPTION_RE = /^[-*]?\s*([A-D])\)\s*(.+)$/gm

type Parsed = { intro: string; options: string[] }

function parseOptions(content: string): Parsed | null {
  const matches = [...content.matchAll(OPTION_RE)]
  if (matches.length < 2) return null

  const firstIndex = matches[0].index ?? 0
  const intro = content.slice(0, firstIndex).trim()
  const options = matches.map((m) => `${m[1]}) ${m[2].trim()}`)

  return { intro, options }
}

export function AnswerOptions({ content, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const parsed = parseOptions(content)

  if (!parsed) {
    return <MarkdownContent content={content} />
  }

  function handleClick(option: string) {
    if (selected !== null) return
    setSelected(option)
    onSelect(option)
  }

  return (
    <div className="flex flex-col gap-3">
      {parsed.intro && <MarkdownContent content={parsed.intro} />}
      <div className="flex flex-col gap-1.5">
        {parsed.options.map((option) => {
          const isSelected = selected === option
          const isDimmed = selected !== null && !isSelected

          return (
            <button
              key={option}
              onClick={() => handleClick(option)}
              disabled={selected !== null}
              className="w-full rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm transition-colors duration-150 disabled:cursor-default"
              style={{
                background: isSelected ? 'var(--accent)' : 'var(--bg-elevated)',
                borderColor: isSelected
                  ? 'var(--accent)'
                  : isDimmed
                    ? 'var(--border)'
                    : 'var(--border)',
                color: isSelected ? '#fff' : isDimmed ? 'var(--text-hint)' : 'var(--text-primary)',
                opacity: isDimmed ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (selected !== null) return
                const el = e.currentTarget
                el.style.background = 'var(--accent-dim)'
                el.style.borderColor = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                if (selected !== null) return
                const el = e.currentTarget
                el.style.background = 'var(--bg-elevated)'
                el.style.borderColor = 'var(--border)'
              }}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
