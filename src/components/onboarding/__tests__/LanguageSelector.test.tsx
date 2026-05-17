import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageSelector } from '../LanguageSelector'

describe('LanguageSelector', () => {
  it('renders all supported languages', () => {
    render(<LanguageSelector value="" onChange={jest.fn()} />)
    expect(screen.getByText('Немецкий')).toBeInTheDocument()
    expect(screen.getByText('Французский')).toBeInTheDocument()
    expect(screen.getByText('Английский')).toBeInTheDocument()
  })

  it('calls onChange with language code when clicked', async () => {
    const onChange = jest.fn()
    render(<LanguageSelector value="" onChange={onChange} />)
    await userEvent.click(screen.getByText('Английский'))
    expect(onChange).toHaveBeenCalledWith('en')
  })

  it('applies active styles to selected language', () => {
    render(<LanguageSelector value="de" onChange={jest.fn()} />)
    const deButton = screen.getByText('Немецкий').closest('button')!
    expect(deButton.className).toContain('border-accent')
  })

  it('applies inactive border style to unselected languages', () => {
    render(<LanguageSelector value="de" onChange={jest.fn()} />)
    const frButton = screen.getByText('Французский').closest('button')!
    // inactive uses border-border, not the direct (non-hover) accent border
    expect(frButton.className).toContain('border-border')
  })

  it('renders 8 language options', () => {
    render(<LanguageSelector value="" onChange={jest.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(8)
  })

  it('calls onChange with correct code for Japanese', async () => {
    const onChange = jest.fn()
    render(<LanguageSelector value="" onChange={onChange} />)
    await userEvent.click(screen.getByText('Японский'))
    expect(onChange).toHaveBeenCalledWith('ja')
  })
})
