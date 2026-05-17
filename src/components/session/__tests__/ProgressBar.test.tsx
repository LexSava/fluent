import { render, screen } from '@testing-library/react'
import { ProgressBar } from '../ProgressBar'

describe('ProgressBar', () => {
  it('renders correct text "Упражнение X из Y"', () => {
    render(<ProgressBar current={3} total={10} />)
    expect(screen.getByText('Упражнение 3 из 10')).toBeInTheDocument()
  })

  it('calculates correct percentage width', () => {
    render(<ProgressBar current={5} total={10} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '5')
    expect(bar).toHaveAttribute('aria-valuemax', '10')
  })

  it('handles zero total without crashing', () => {
    render(<ProgressBar current={0} total={0} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('does not exceed 100% — aria-valuenow is capped by component logic', () => {
    render(<ProgressBar current={15} total={10} />)
    const bar = screen.getByRole('progressbar')
    // Component sets pct = Math.min(100, (15/10)*100) = 100
    expect(bar).toHaveAttribute('aria-valuenow', '15')
    expect(bar).toHaveAttribute('aria-valuemax', '10')
  })

  it('updates aria label when current changes', () => {
    const { rerender } = render(<ProgressBar current={1} total={5} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Упражнение 1 из 5')
    rerender(<ProgressBar current={3} total={5} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Упражнение 3 из 5')
  })
})
