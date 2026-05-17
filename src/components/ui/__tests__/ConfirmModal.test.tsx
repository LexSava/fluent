import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmModal } from '../ConfirmModal'

const defaultProps = {
  isOpen: true,
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
  title: 'Delete item?',
  description: 'This cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  variant: 'danger' as const,
}

describe('ConfirmModal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders title and description when open', () => {
    render(<ConfirmModal {...defaultProps} />)
    expect(screen.getByText('Delete item?')).toBeInTheDocument()
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
  })

  it('renders confirm and cancel buttons', () => {
    render(<ConfirmModal {...defaultProps} />)
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button clicked', async () => {
    render(<ConfirmModal {...defaultProps} />)
    await userEvent.click(screen.getByText('Delete'))
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button clicked', async () => {
    render(<ConfirmModal {...defaultProps} />)
    await userEvent.click(screen.getByText('Cancel'))
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Escape key pressed', () => {
    render(<ConfirmModal {...defaultProps} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('renders nothing when isOpen is false', () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Delete item?')).not.toBeInTheDocument()
  })
})
