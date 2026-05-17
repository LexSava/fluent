import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies primary variant styles by default', () => {
    render(<Button>Primary</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-[var(--accent)]')
  })

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-[var(--bg-elevated)]')
  })

  it('applies ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-transparent')
  })

  it('shows loading spinner and hides text when loading', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.queryByText('Click me')).not.toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('calls onClick when clicked', async () => {
    const handler = jest.fn()
    render(<Button onClick={handler}>Click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const handler = jest.fn()
    render(
      <Button disabled onClick={handler}>
        Click
      </Button>
    )
    await userEvent.click(screen.getByRole('button'))
    expect(handler).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Button className="w-full">Submit</Button>)
    expect(screen.getByRole('button').className).toContain('w-full')
  })
})
