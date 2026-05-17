import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }) }))
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  getSession: jest.fn().mockResolvedValue({ user: { isOnboarded: true } }),
}))

import { signIn } from 'next-auth/react'

describe('LoginForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Пароль')).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', async () => {
    render(<LoginForm />)
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }))
    await waitFor(() => {
      expect(screen.getByText('Введите email')).toBeInTheDocument()
    })
  })

  it('shows error for invalid email format', async () => {
    render(<LoginForm />)
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'notanemail')
    // Use fireEvent.submit to bypass native HTML email constraint validation in jsdom
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText('Некорректный email адрес')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    ;(signIn as jest.Mock).mockImplementation(() => new Promise(() => {}))
    render(<LoginForm />)
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'user@test.com')
    await userEvent.type(screen.getByLabelText('Пароль'), 'password123')
    // Capture ref before clicking so we can check it after accessible name changes to spinner
    const submitBtn = document.querySelector('button[type="submit"]')!
    await userEvent.click(submitBtn)
    await waitFor(() => {
      expect(submitBtn).toHaveAttribute('aria-busy', 'true')
    })
  })

  it('displays server error message on failed login', async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ ok: false, error: 'CredentialsSignin' })
    render(<LoginForm />)
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'user@test.com')
    await userEvent.type(screen.getByLabelText('Пароль'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }))
    await waitFor(() => {
      expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument()
    })
  })

  it('calls signIn with correct credentials on valid submission', async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ ok: true, error: null })
    render(<LoginForm />)
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'user@test.com')
    await userEvent.type(screen.getByLabelText('Пароль'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }))
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'user@test.com',
        password: 'password123',
        redirect: false,
      })
    })
  })
})
