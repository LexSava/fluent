import { render, screen } from '@testing-library/react'
import { MessageBubble } from '../MessageBubble'
import type { ChatMessage } from '@/types/session'

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...rest}>{children}</div>
    ),
  },
}))

jest.mock('@/hooks/useTypewriter', () => ({
  useTypewriter: (target: string) => target,
}))

jest.mock('../AnswerOptions', () => ({
  AnswerOptions: ({ content }: { content: string }) => <div>{content}</div>,
}))

jest.mock('../mdComponents', () => ({ mdComponents: {} }))

function msg(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return { id: '1', role: 'assistant', content: 'Hello world', ...overrides }
}

describe('MessageBubble', () => {
  it('renders user message with right alignment', () => {
    const { container } = render(<MessageBubble message={msg({ role: 'user', content: 'Hi' })} />)
    expect(container.querySelector('.justify-end')).toBeInTheDocument()
  })

  it('renders assistant message with left alignment', () => {
    const { container } = render(
      <MessageBubble message={msg({ role: 'assistant', content: 'Hello' })} />
    )
    expect(container.querySelector('.justify-start')).toBeInTheDocument()
  })

  it('parses and hides JSON score block from visible content', () => {
    const content = 'Good job!\n```json\n{"score":8,"correct":true,"feedback":"Nice"}\n```'
    render(<MessageBubble message={msg({ content })} />)
    expect(screen.queryByText(/score/i)).not.toBeInTheDocument()
    expect(screen.getByText('Good job!')).toBeInTheDocument()
  })

  it('shows score badge after JSON parsing', () => {
    const content = 'Well done!\n```json\n{"score":9,"correct":true,"feedback":"Excellent"}\n```'
    render(<MessageBubble message={msg({ content })} />)
    expect(screen.getByText('9 / 10')).toBeInTheDocument()
  })

  it('renders user message content directly', () => {
    render(<MessageBubble message={msg({ role: 'user', content: 'My answer' })} />)
    expect(screen.getByText('My answer')).toBeInTheDocument()
  })

  it('shows streaming indicator class when isStreaming is true', () => {
    const { container } = render(
      <MessageBubble message={msg({ content: 'Loading...' })} isStreaming />
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
