import { render, screen, act } from '@testing-library/react'
import AccuracyRing from '../AccuracyRing'

describe('AccuracyRing', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('renders the value percentage text', () => {
    render(<AccuracyRing value={75} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('renders "Точность" label', () => {
    render(<AccuracyRing value={50} />)
    expect(screen.getByText('Точность')).toBeInTheDocument()
  })

  it('renders an SVG element', () => {
    const { container } = render(<AccuracyRing value={80} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('animates offset after 100ms', () => {
    const { container } = render(<AccuracyRing value={60} />)
    const circles = container.querySelectorAll('circle')
    const initialOffset = circles[1].getAttribute('stroke-dashoffset')
    act(() => jest.advanceTimersByTime(150))
    const animatedOffset = circles[1].getAttribute('stroke-dashoffset')
    expect(parseFloat(animatedOffset!)).not.toBe(parseFloat(initialOffset!))
  })

  it('renders 0% label for value 0', () => {
    render(<AccuracyRing value={0} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('renders 100% label for value 100', () => {
    render(<AccuracyRing value={100} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })
})
