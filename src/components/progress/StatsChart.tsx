'use client'

import { BarChart2 } from 'lucide-react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

const DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

type WeeklyActivity = {
  date: string
  exercisesCount: number
  score: number
}

type Props = {
  data: WeeklyActivity[]
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; payload: WeeklyActivity }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const { exercisesCount, score } = payload[0].payload
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        fontSize: 12,
        color: 'var(--text-secondary)',
      }}
    >
      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</p>
      <p>Упражнений: {exercisesCount}</p>
      {score > 0 && <p>Средний балл: {score}</p>}
    </div>
  )
}

export default function StatsChart({ data }: Props) {
  const isEmpty = data.every((d) => d.exercisesCount === 0)

  const chartData = data.map((d, i) => {
    const dayIndex = new Date(d.date + 'T12:00:00').getDay()
    return {
      ...d,
      label: DAYS[dayIndex],
      isToday: i === data.length - 1,
    }
  })

  if (isEmpty) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-2">
        <BarChart2 size={28} className="text-text-hint" />
        <p className="text-[13px] text-text-hint">Нет активности за последние 7 дней</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} barSize={24} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--text-hint)', fontSize: 12 }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'var(--bg-elevated)', opacity: 0.5 }}
        />
        <Bar dataKey="exercisesCount" radius={[3, 3, 0, 0]} animationDuration={600}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.isToday ? 'var(--accent)' : 'var(--bg-elevated)'}
              fillOpacity={entry.isToday ? 1 : 0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
