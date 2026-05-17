import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionPicker } from '../SessionPicker'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

global.fetch = jest.fn() as jest.Mock

describe('SessionPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ session: { id: 'sess-1' } }),
    })
  })

  it('renders all 6 session format buttons', () => {
    render(<SessionPicker />)
    expect(screen.getByText('Повторение')).toBeInTheDocument()
    expect(screen.getByText('Словарный запас')).toBeInTheDocument()
    expect(screen.getByText('Грамматика')).toBeInTheDocument()
    expect(screen.getByText('Чтение')).toBeInTheDocument()
    expect(screen.getByText('Письмо')).toBeInTheDocument()
    expect(screen.getByText('Разговор')).toBeInTheDocument()
  })

  it('calls fetch when a format is selected', async () => {
    render(<SessionPicker />)
    await userEvent.click(screen.getByText('Повторение'))
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/session/start', expect.any(Object))
    })
  })

  it('disables other buttons while one is loading', async () => {
    ;(fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))
    render(<SessionPicker />)
    await userEvent.click(screen.getByText('Повторение'))
    const buttons = screen.getAllByRole('button')
    const disabledButtons = buttons.filter((b) => b.hasAttribute('disabled'))
    expect(disabledButtons.length).toBeGreaterThan(0)
  })

  it('renders session descriptions', () => {
    render(<SessionPicker />)
    expect(screen.getByText(/карточкам/)).toBeInTheDocument()
  })
})
