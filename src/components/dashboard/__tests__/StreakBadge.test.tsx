import { render, screen } from '@testing-library/react'
import { StreakBadge } from '../StreakBadge'

describe('StreakBadge', () => {
  it('renders streak count', () => {
    render(<StreakBadge streak={5} />)
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it('uses "день" for streak of 1', () => {
    render(<StreakBadge streak={1} />)
    expect(screen.getByText('1 день подряд')).toBeInTheDocument()
  })

  it('uses "дня" for streak of 3', () => {
    render(<StreakBadge streak={3} />)
    expect(screen.getByText('3 дня подряд')).toBeInTheDocument()
  })

  it('uses "дней" for streak of 7', () => {
    render(<StreakBadge streak={7} />)
    expect(screen.getByText('7 дней подряд')).toBeInTheDocument()
  })

  it('shows inactive style when streak is 0', () => {
    const { container } = render(<StreakBadge streak={0} />)
    expect(container.firstChild).toHaveClass('border-[var(--border)]')
  })

  it('shows active style when streak > 0', () => {
    const { container } = render(<StreakBadge streak={3} />)
    expect(container.firstChild).toHaveClass('border-[var(--warning)]')
  })
})
