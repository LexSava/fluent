import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Success</Badge>)
    expect(screen.getByText('Success')).toBeInTheDocument()
  })

  it('applies neutral variant by default', () => {
    render(<Badge>Label</Badge>)
    expect(screen.getByText('Label').className).toContain('border-border')
  })

  it('applies success variant styles', () => {
    render(<Badge variant="success">OK</Badge>)
    expect(screen.getByText('OK').className).toContain('text-success')
  })

  it('applies error variant styles', () => {
    render(<Badge variant="error">Error</Badge>)
    expect(screen.getByText('Error').className).toContain('text-error')
  })

  it('applies accent variant styles', () => {
    render(<Badge variant="accent">Accent</Badge>)
    expect(screen.getByText('Accent').className).toContain('border-accent')
  })

  it('merges custom className', () => {
    render(<Badge className="extra-class">Tag</Badge>)
    expect(screen.getByText('Tag').className).toContain('extra-class')
  })
})
