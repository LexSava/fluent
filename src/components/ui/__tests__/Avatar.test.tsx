import { render, screen } from '@testing-library/react'
import { Avatar } from '../Avatar'

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

describe('Avatar', () => {
  it('renders initials for single-word name', () => {
    render(<Avatar name="Ivan" />)
    expect(screen.getByText('I')).toBeInTheDocument()
  })

  it('renders two initials for two-word name', () => {
    render(<Avatar name="Ivan Petrov" />)
    expect(screen.getByText('IP')).toBeInTheDocument()
  })

  it('renders image when image prop provided', () => {
    render(<Avatar name="User" image="/avatar.jpg" />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/avatar.jpg')
  })

  it('applies md size styles by default', () => {
    const { container } = render(<Avatar name="U" />)
    expect(container.firstChild).toHaveClass('size-9')
  })

  it('applies sm size styles', () => {
    const { container } = render(<Avatar name="U" size="sm" />)
    expect(container.firstChild).toHaveClass('size-7')
  })

  it('applies lg size styles', () => {
    const { container } = render(<Avatar name="U" size="lg" />)
    expect(container.firstChild).toHaveClass('size-12')
  })
})
