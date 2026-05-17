import { render, screen } from '@testing-library/react'
import { StatCard } from '../StatCard'

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Sessions" value={42} />)
    expect(screen.getByText('Sessions')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders string value', () => {
    render(<StatCard label="Score" value="88%" />)
    expect(screen.getByText('88%')).toBeInTheDocument()
  })

  it('renders hint when provided', () => {
    render(<StatCard label="Words" value={100} hint="last 30 days" />)
    expect(screen.getByText('last 30 days')).toBeInTheDocument()
  })

  it('does not render hint when not provided', () => {
    render(<StatCard label="Words" value={100} />)
    expect(screen.queryByText('last 30 days')).not.toBeInTheDocument()
  })

  it('applies success color class', () => {
    const { container } = render(<StatCard label="OK" value={5} color="success" />)
    expect(container.querySelector('.text-\\[var\\(--success\\)\\]')).toBeInTheDocument()
  })

  it('applies custom className to outer div', () => {
    const { container } = render(<StatCard label="X" value={1} className="col-span-2" />)
    expect(container.firstChild).toHaveClass('col-span-2')
  })
})
