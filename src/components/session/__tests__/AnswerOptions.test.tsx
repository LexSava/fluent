import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnswerOptions } from '../AnswerOptions'

jest.mock('../MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => <div>{content}</div>,
}))

const multipleChoiceContent = `Which is correct?
- A) The cat sat on the mat
- B) The cat sit on the mat
- C) The cat sits in the mat
- D) Cat the on mat sat`

describe('AnswerOptions', () => {
  it('renders parsed options as buttons', () => {
    render(<AnswerOptions content={multipleChoiceContent} onSelect={jest.fn()} />)
    expect(screen.getByText(/A\) The cat sat/)).toBeInTheDocument()
    expect(screen.getByText(/B\) The cat sit/)).toBeInTheDocument()
  })

  it('calls onSelect with the chosen option', async () => {
    const onSelect = jest.fn()
    render(<AnswerOptions content={multipleChoiceContent} onSelect={onSelect} />)
    await userEvent.click(screen.getByText(/A\) The cat sat/))
    expect(onSelect).toHaveBeenCalledWith('A) The cat sat on the mat')
  })

  it('disables other options after one is selected', async () => {
    render(<AnswerOptions content={multipleChoiceContent} onSelect={jest.fn()} />)
    await userEvent.click(screen.getByText(/A\) The cat sat/))
    const buttons = screen.getAllByRole('button')
    const disabledButtons = buttons.filter((b) => b.hasAttribute('disabled'))
    expect(disabledButtons.length).toBe(buttons.length)
  })

  it('does not call onSelect twice when already selected', async () => {
    const onSelect = jest.fn()
    render(<AnswerOptions content={multipleChoiceContent} onSelect={onSelect} />)
    await userEvent.click(screen.getByText(/A\) The cat sat/))
    await userEvent.click(screen.getByText(/B\) The cat sit/))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('falls back to MarkdownContent for non-option text', () => {
    render(<AnswerOptions content="Just plain text without options." onSelect={jest.fn()} />)
    expect(screen.getByText('Just plain text without options.')).toBeInTheDocument()
  })

  it('renders intro text above options', () => {
    render(<AnswerOptions content={multipleChoiceContent} onSelect={jest.fn()} />)
    expect(screen.getByText('Which is correct?')).toBeInTheDocument()
  })
})
