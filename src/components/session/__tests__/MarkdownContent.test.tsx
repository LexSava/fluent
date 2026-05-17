import { render, screen } from '@testing-library/react'
import { MarkdownContent } from '../MarkdownContent'

jest.mock('../mdComponents', () => ({ mdComponents: {} }))

describe('MarkdownContent', () => {
  it('renders provided text content', () => {
    render(<MarkdownContent content="Hello world" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders empty string without crashing', () => {
    const { container } = render(<MarkdownContent content="" />)
    expect(container).toBeInTheDocument()
  })

  it('renders multiline content', () => {
    render(<MarkdownContent content={'Line one\nLine two'} />)
    expect(screen.getByText(/Line one/)).toBeInTheDocument()
  })
})
