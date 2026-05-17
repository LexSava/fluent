import { render, screen } from '@testing-library/react'
import { PasswordStrengthIndicator } from '../PasswordStrengthIndicator'

describe('PasswordStrengthIndicator', () => {
  it('renders nothing for empty password', () => {
    const { container } = render(<PasswordStrengthIndicator password="" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows "Слабый" for short lowercase password', () => {
    render(<PasswordStrengthIndicator password="abc" />)
    expect(screen.getByText('Слабый')).toBeInTheDocument()
  })

  it('shows "Средний" for password with uppercase + lowercase (no length/digit/special)', () => {
    render(<PasswordStrengthIndicator password="ABcde" />)
    expect(screen.getByText('Средний')).toBeInTheDocument()
  })

  it('shows "Хороший" for password with length + uppercase + lowercase', () => {
    render(<PasswordStrengthIndicator password="Abcdefgh" />)
    expect(screen.getByText('Хороший')).toBeInTheDocument()
  })

  it('shows "Надёжный" for strong password with all criteria', () => {
    render(<PasswordStrengthIndicator password="Abcdef12!" />)
    expect(screen.getByText('Надёжный')).toBeInTheDocument()
  })

  it('renders a progress bar element', () => {
    const { container } = render(<PasswordStrengthIndicator password="test" />)
    const bar = container.querySelector('.h-full')
    expect(bar).toBeInTheDocument()
  })
})
