import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card } from '../Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('has no role when onClick is not provided', () => {
    render(<Card>Static</Card>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has role=button when onClick is provided', () => {
    render(<Card onClick={() => {}}>Clickable</Card>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handler = jest.fn()
    render(<Card onClick={handler}>Click me</Card>)
    await userEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('calls onClick on Enter key press', async () => {
    const handler = jest.fn()
    render(<Card onClick={handler}>Keyboard</Card>)
    screen.getByRole('button').focus()
    await userEvent.keyboard('{Enter}')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-card">Content</Card>)
    expect(container.firstChild).toHaveClass('custom-card')
  })
})
