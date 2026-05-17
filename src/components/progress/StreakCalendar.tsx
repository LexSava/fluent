'use client'

import { useState } from 'react'

type WeeklyActivity = {
  date: string
  exercisesCount: number
  score: number
}

type Props = {
  weeklyActivity: WeeklyActivity[]
  // For now we use weeklyActivity as source; full 28-day data would need API extension
}

function getColor(count: number): string {
  if (count === 0) return 'var(--bg-elevated)'
  if (count <= 3) return 'color-mix(in srgb, var(--accent) 30%, transparent)'
  if (count <= 7) return 'color-mix(in srgb, var(--accent) 60%, transparent)'
  return 'var(--accent)'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function StreakCalendar({ weeklyActivity }: Props) {
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    date: string
    count: number
  } | null>(null)

  // Build 28 days ending today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const activityMap = new Map<string, number>()
  weeklyActivity.forEach((a) => activityMap.set(a.date, a.exercisesCount))

  const days: { date: string; count: number; dayOfWeek: number }[] = []
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      count: activityMap.get(dateStr) ?? 0,
      dayOfWeek: (d.getDay() + 6) % 7, // Monday=0
    })
  }

  // Group into columns (weeks) for grid layout
  // Pad start so first day aligns to its weekday
  const firstDayOfWeek = days[0].dayOfWeek
  const cells: ((typeof days)[0] | null)[] = [...Array(firstDayOfWeek).fill(null), ...days]

  // Build columns: each column = one week (Mon-Sun)
  const columns: ((typeof days)[0] | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7))
  }
  // Pad last column
  while (columns[columns.length - 1].length < 7) {
    columns[columns.length - 1].push(null)
  }

  const SQUARE = 12
  const GAP = 3

  return (
    <div className="relative select-none">
      <div style={{ display: 'flex', gap: GAP, alignItems: 'flex-start' }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginRight: 4 }}>
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              style={{
                height: SQUARE,
                fontSize: 10,
                color: 'var(--text-hint)',
                display: 'flex',
                alignItems: 'center',
                // Show only Пн, Ср, Пт
                opacity: i % 2 === 0 ? 1 : 0,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid columns */}
        {columns.map((col, colIdx) => (
          <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
            {col.map((cell, rowIdx) => (
              <div
                key={rowIdx}
                style={{
                  width: SQUARE,
                  height: SQUARE,
                  borderRadius: 2,
                  background: cell ? getColor(cell.count) : 'transparent',
                  cursor: cell ? 'pointer' : 'default',
                  transition: 'opacity 150ms',
                  animation: cell ? `fadeIn 300ms ${(colIdx * 7 + rowIdx) * 15}ms both` : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!cell) return
                  const rect = (e.target as HTMLElement).getBoundingClientRect()
                  setTooltip({
                    x: rect.left + SQUARE / 2,
                    y: rect.top - 8,
                    date: cell.date,
                    count: cell.count,
                  })
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '5px 10px',
            fontSize: 12,
            color: 'var(--text-secondary)',
            pointerEvents: 'none',
            zIndex: 50,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {formatDate(tooltip.date)}
          </span>
          {' — '}
          {tooltip.count > 0 ? `${tooltip.count} упражнений` : 'нет активности'}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>Меньше</span>
        {[0, 2, 5, 8].map((n, i) => (
          <div
            key={i}
            style={{
              width: SQUARE,
              height: SQUARE,
              borderRadius: 2,
              background: getColor(n),
            }}
          />
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-hint)' }}>Больше</span>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
