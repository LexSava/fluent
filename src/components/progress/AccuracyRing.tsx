'use client'

import { useEffect, useState } from 'react'

type Props = {
  value: number // 0–100
}

const SIZE = 120
const STROKE = 10
const R = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * R

export default function AccuracyRing({ value }: Props) {
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 100)
    return () => clearTimeout(timer)
  }, [value])

  const offset = CIRCUMFERENCE - (animated / 100) * CIRCUMFERENCE

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: SIZE, height: SIZE, position: 'relative' }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background arc */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth={STROKE}
          />
          {/* Active arc */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        {/* Center text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}
          >
            {value}%
          </span>
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-hint)',
              fontWeight: 400,
            }}
          >
            Точность
          </span>
        </div>
      </div>
    </div>
  )
}
