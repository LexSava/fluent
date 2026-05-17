import { render, screen } from '@testing-library/react'
import { OnboardingStep } from '../OnboardingStep'

describe('OnboardingStep', () => {
  const defaultProps = {
    step: 2,
    total: 4,
    title: 'Choose Language',
    description: 'Pick your target language',
    children: <div>Step content</div>,
  }

  it('renders title and description', () => {
    render(<OnboardingStep {...defaultProps} />)
    expect(screen.getByText('Choose Language')).toBeInTheDocument()
    expect(screen.getByText('Pick your target language')).toBeInTheDocument()
  })

  it('renders step indicator text', () => {
    render(<OnboardingStep {...defaultProps} />)
    expect(screen.getByText('Шаг 2 из 4')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<OnboardingStep {...defaultProps} />)
    expect(screen.getByText('Step content')).toBeInTheDocument()
  })

  it('renders progress bar with correct number of segments', () => {
    const { container } = render(<OnboardingStep {...defaultProps} />)
    const segments = container.querySelectorAll('.h-1.flex-1.rounded-full')
    expect(segments).toHaveLength(4)
  })

  it('marks completed segments with accent color', () => {
    const { container } = render(<OnboardingStep {...defaultProps} step={2} total={4} />)
    const segments = container.querySelectorAll('.h-1.flex-1.rounded-full')
    const accentSegments = Array.from(segments).filter((s) => s.className.includes('bg-accent'))
    expect(accentSegments).toHaveLength(2)
  })
})
