import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '../RegisterForm'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }) }))
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))
jest.mock('next-auth/react', () => ({
  signIn: jest.fn().mockResolvedValue({ ok: true }),
}))

global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as jest.Mock

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200 })
  })

  it('renders name, email, and password fields', () => {
    render(<RegisterForm />)
    expect(screen.getByText('Имя')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Пароль')).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', async () => {
    render(<RegisterForm />)
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText(/должно содержать не менее 2/)).toBeInTheDocument()
    })
  })

  it('shows PasswordStrengthIndicator when password is typed', async () => {
    render(<RegisterForm />)
    const passwordInput = screen.getAllByPlaceholderText(/пароль/i)[0]
    await userEvent.type(passwordInput, 'test')
    expect(screen.getByText('Слабый')).toBeInTheDocument()
  })

  it('shows duplicate email error on 409 response', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({ ok: false, status: 409 })
    render(<RegisterForm />)
    // Name label renders as "Имя *", use placeholder to find the input
    await userEvent.type(screen.getByPlaceholderText('Иван'), 'Ivan')
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'existing@test.com')
    const passwords = document.querySelectorAll('input[type="password"]')
    await userEvent.type(passwords[0], 'Password1!')
    await userEvent.type(passwords[1], 'Password1!')
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText('Пользователь с таким email уже существует')).toBeInTheDocument()
    })
  })

  it('shows Create Account submit button', () => {
    render(<RegisterForm />)
    expect(screen.getByRole('button', { name: 'Создать аккаунт' })).toBeInTheDocument()
  })
})
