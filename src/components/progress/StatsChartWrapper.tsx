'use client'

import dynamic from 'next/dynamic'
import type { WeeklyActivity } from '@/lib/progress'
import { BarChart2 } from 'lucide-react'

const StatsChart = dynamic(() => import('./StatsChart'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[200px] flex-col items-center justify-center gap-2">
      <BarChart2 size={28} className="text-[var(--text-hint)]" />
    </div>
  ),
})

export default function StatsChartWrapper({ data }: { data: WeeklyActivity[] }) {
  return <StatsChart data={data} />
}
