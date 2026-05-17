import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import { ActiveSessionBanner } from '../ActiveSessionBanner'

describe('ActiveSessionBanner', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('renders nothing when no active session in storage', () => {
    const { container } = render(<ActiveSessionBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('renders banner when active_session_url is in sessionStorage', () => {
    sessionStorage.setItem('active_session_url', '/session?sessionId=123')
    render(<ActiveSessionBanner />)
    expect(screen.getByText(/незавершённая сессия/)).toBeInTheDocument()
  })

  it('banner contains a link to the session url', () => {
    sessionStorage.setItem('active_session_url', '/session?sessionId=abc')
    render(<ActiveSessionBanner />)
    expect(screen.getByRole('link', { name: /Продолжить/ })).toHaveAttribute(
      'href',
      '/session?sessionId=abc'
    )
  })

  it('hides banner when dismiss button is clicked', async () => {
    sessionStorage.setItem('active_session_url', '/session?sessionId=123')
    render(<ActiveSessionBanner />)
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
    expect(screen.queryByText(/незавершённая сессия/)).not.toBeInTheDocument()
  })
})
