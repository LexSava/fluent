import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ForgotPasswordForm } from '../ForgotPasswordForm'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

global.fetch = jest.fn().mockResolvedValue({ ok: true }) as jest.Mock

describe('ForgotPasswordForm', () => {
  beforeEach(() => (fetch as jest.Mock).mockClear())

  it('renders email input and submit button', () => {
    render(<ForgotPasswordForm />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Отправить ссылку' })).toBeInTheDocument()
  })

  it('shows validation error for empty submit', async () => {
    render(<ForgotPasswordForm />)
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText('Введите корректный email')).toBeInTheDocument()
    })
  })

  it('calls fetch with correct endpoint on valid email', async () => {
    render(<ForgotPasswordForm />)
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'user@test.com')
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/forgot-password', expect.any(Object))
    })
  })

  it('shows success state after submission', async () => {
    render(<ForgotPasswordForm />)
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'user@test.com')
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText(/Письмо отправлено на/)).toBeInTheDocument()
    })
  })

  it('shows the submitted email in success state', async () => {
    render(<ForgotPasswordForm />)
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'me@example.com')
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText('me@example.com')).toBeInTheDocument()
    })
  })
})
