import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResetPasswordForm } from '../ResetPasswordForm'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

global.fetch = jest.fn() as jest.Mock

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200 })
  })

  it('renders new password and confirm password fields', () => {
    render(<ResetPasswordForm token="abc123" />)
    expect(screen.getByText('Новый пароль')).toBeInTheDocument()
    expect(screen.getByText('Подтвердите пароль')).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', async () => {
    render(<ResetPasswordForm token="abc123" />)
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText(/не менее 8 символов/)).toBeInTheDocument()
    })
  })

  it('shows PasswordStrengthIndicator when password typed', async () => {
    render(<ResetPasswordForm token="abc123" />)
    const passwords = document.querySelectorAll('input[type="password"]')
    await userEvent.type(passwords[0], 'test')
    expect(screen.getByText('Слабый')).toBeInTheDocument()
  })

  it('shows server error on 400 response', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({ ok: false, status: 400 })
    render(<ResetPasswordForm token="bad-token" />)
    const passwords = document.querySelectorAll('input[type="password"]')
    await userEvent.type(passwords[0], 'Password1!')
    await userEvent.type(passwords[1], 'Password1!')
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText('Ссылка недействительна или устарела')).toBeInTheDocument()
    })
  })

  it('renders Save Password button', () => {
    render(<ResetPasswordForm token="abc123" />)
    expect(screen.getByRole('button', { name: 'Сохранить пароль' })).toBeInTheDocument()
  })
})
