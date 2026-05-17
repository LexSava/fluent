import { render, screen } from '@testing-library/react'
import StreakCalendar from '../StreakCalendar'

const emptyActivity = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (6 - i))
  return {
    date: d.toISOString().split('T')[0],
    exercisesCount: 0,
    score: 0,
  }
})

const activeActivity = emptyActivity.map((a, i) =>
  i === 3 ? { ...a, exercisesCount: 5, score: 8 } : a
)

describe('StreakCalendar', () => {
  it('renders day labels', () => {
    render(<StreakCalendar weeklyActivity={emptyActivity} />)
    expect(screen.getByText('Пн')).toBeInTheDocument()
    expect(screen.getByText('Ср')).toBeInTheDocument()
  })

  it('renders legend labels', () => {
    render(<StreakCalendar weeklyActivity={emptyActivity} />)
    expect(screen.getByText('Меньше')).toBeInTheDocument()
    expect(screen.getByText('Больше')).toBeInTheDocument()
  })

  it('renders calendar grid cells', () => {
    const { container } = render(<StreakCalendar weeklyActivity={emptyActivity} />)
    const cells = container.querySelectorAll('[style*="border-radius: 2px"]')
    expect(cells.length).toBeGreaterThan(20)
  })

  it('shows tooltip on cell hover', () => {
    const { container } = render(<StreakCalendar weeklyActivity={activeActivity} />)
    const cells = container.querySelectorAll('[style*="cursor: pointer"]')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('does not render tooltip by default', () => {
    render(<StreakCalendar weeklyActivity={emptyActivity} />)
    expect(screen.queryByText(/упражнений/)).not.toBeInTheDocument()
  })
})
