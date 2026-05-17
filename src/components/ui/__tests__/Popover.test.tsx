import { render, screen, fireEvent, act } from '@testing-library/react'
import { Popover } from '../Popover'

describe('Popover', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('renders children when open', () => {
    render(
      <Popover isOpen onClose={jest.fn()}>
        <p>Popover content</p>
      </Popover>
    )
    expect(screen.getByText('Popover content')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(
      <Popover isOpen={false} onClose={jest.fn()}>
        <p>Hidden</p>
      </Popover>
    )
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('calls onClose after 4 seconds auto-dismiss', () => {
    const onClose = jest.fn()
    render(
      <Popover isOpen onClose={onClose}>
        <p>Auto dismiss</p>
      </Popover>
    )
    act(() => jest.advanceTimersByTime(4000))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking outside', () => {
    const onClose = jest.fn()
    render(
      <div>
        <Popover isOpen onClose={onClose}>
          <p>Inside</p>
        </Popover>
        <button>Outside</button>
      </div>
    )
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when clicking inside', () => {
    const onClose = jest.fn()
    render(
      <Popover isOpen onClose={onClose}>
        <p>Inside</p>
      </Popover>
    )
    fireEvent.mouseDown(screen.getByText('Inside'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
