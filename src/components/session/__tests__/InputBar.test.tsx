import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InputBar } from '../InputBar'

describe('InputBar', () => {
  it('renders textarea with placeholder', () => {
    render(<InputBar onSend={jest.fn()} />)
    expect(screen.getByPlaceholderText('Напиши свой ответ...')).toBeInTheDocument()
  })

  it('calls onSend with trimmed value on button click', async () => {
    const onSend = jest.fn()
    render(<InputBar onSend={onSend} />)
    await userEvent.type(screen.getByRole('textbox'), 'Hello world')
    await userEvent.click(screen.getByRole('button', { name: 'Отправить сообщение' }))
    expect(onSend).toHaveBeenCalledWith('Hello world')
  })

  it('clears textarea after sending', async () => {
    render(<InputBar onSend={jest.fn()} />)
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    await userEvent.type(textarea, 'test')
    await userEvent.click(screen.getByRole('button', { name: 'Отправить сообщение' }))
    expect(textarea.value).toBe('')
  })

  it('sends on Enter key (without Shift)', async () => {
    const onSend = jest.fn()
    render(<InputBar onSend={onSend} />)
    await userEvent.type(screen.getByRole('textbox'), 'message{Enter}')
    expect(onSend).toHaveBeenCalledWith('message')
  })

  it('does not send on Shift+Enter', async () => {
    const onSend = jest.fn()
    render(<InputBar onSend={onSend} />)
    await userEvent.type(screen.getByRole('textbox'), 'line{Shift>}{Enter}{/Shift}')
    expect(onSend).not.toHaveBeenCalled()
  })

  it('disables send button when disabled prop is true', () => {
    render(<InputBar onSend={jest.fn()} disabled />)
    expect(screen.getByRole('button', { name: 'Отправить сообщение' })).toBeDisabled()
  })
})
