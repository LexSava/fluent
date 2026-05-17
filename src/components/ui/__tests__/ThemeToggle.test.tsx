import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockSetTheme = jest.fn()

jest.mock('@/components/layout/ThemeProvider', () => ({
  useTheme: () => ({ resolved: 'dark', setTheme: mockSetTheme }),
}))

import { ThemeToggle } from '../ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => mockSetTheme.mockClear())

  it('renders a button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has aria-label for switching to light when dark theme active', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light theme')
  })

  it('calls setTheme with "light" when dark and clicked', async () => {
    render(<ThemeToggle />)
    await userEvent.click(screen.getByRole('button'))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('applies custom className', () => {
    render(<ThemeToggle className="custom" />)
    expect(screen.getByRole('button').className).toContain('custom')
  })
})
