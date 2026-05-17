import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input', () => {
  it('renders label correctly', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('shows error message when error prop is provided', () => {
    render(<Input error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  it('applies error border class when error is set', () => {
    render(<Input error="Bad input" />)
    expect(screen.getByRole('textbox').className).toContain('border-[var(--error)]')
  })

  it('calls onChange when user types', async () => {
    const handler = jest.fn()
    render(<Input onChange={handler} />)
    await userEvent.type(screen.getByRole('textbox'), 'hello')
    expect(handler).toHaveBeenCalled()
  })

  it('does not allow input when disabled', async () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, 'hello')
    expect(input.value).toBe('')
  })

  it('shows required indicator (*) when required prop is true', () => {
    render(<Input label="Name" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })
})
