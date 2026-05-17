import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockUsePathname = jest.fn().mockReturnValue('/dashboard')

jest.mock('next/navigation', () => ({ usePathname: () => mockUsePathname() }))
jest.mock('@/components/ui/ThemeToggle', () => ({
  ThemeToggle: () => <button aria-label="theme-toggle" />,
}))
jest.mock('@/components/ui/Avatar', () => ({
  Avatar: ({ name }: { name: string }) => <div data-testid="avatar">{name}</div>,
}))
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

import { Header } from '../Header'
import type { UserProfile } from '@/types/user'

const user: UserProfile = {
  id: '1',
  email: 'user@test.com',
  name: 'Ivan',
  image: null,
  targetLang: null,
  cefrLevel: null,
  interests: [],
  isOnboarded: true,
}

describe('Header', () => {
  it('renders correct page title for /dashboard', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<Header user={user} onMenuOpen={jest.fn()} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders "Fluent" for unknown route', () => {
    mockUsePathname.mockReturnValue('/unknown')
    render(<Header user={user} onMenuOpen={jest.fn()} />)
    expect(screen.getByText('Fluent')).toBeInTheDocument()
  })

  it('renders user avatar', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<Header user={user} onMenuOpen={jest.fn()} />)
    expect(screen.getByTestId('avatar')).toBeInTheDocument()
  })

  it('calls onMenuOpen when menu button clicked', async () => {
    mockUsePathname.mockReturnValue('/dashboard')
    const onMenuOpen = jest.fn()
    render(<Header user={user} onMenuOpen={onMenuOpen} />)
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(onMenuOpen).toHaveBeenCalledTimes(1)
  })

  it('renders correct page title for /progress', () => {
    mockUsePathname.mockReturnValue('/progress')
    render(<Header user={user} onMenuOpen={jest.fn()} />)
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })
})
