import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VocabList from '../VocabList'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

type Item = {
  id: string
  term: string
  translation: string
  repetitions: number
  dueAt: string
  lastScore: number | null
}

function makeItem(id: string, term: string, repetitions: number): Item {
  const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString()
  return { id, term, translation: `tr-${term}`, repetitions, dueAt: future, lastScore: null }
}

const items: Item[] = [
  makeItem('1', 'apple', 0),
  makeItem('2', 'banana', 2),
  makeItem('3', 'cherry', 5),
]

describe('VocabList', () => {
  it('renders list of vocab items', () => {
    render(<VocabList items={items} />)
    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.getByText('banana')).toBeInTheDocument()
    expect(screen.getByText('cherry')).toBeInTheDocument()
  })

  it('filters items by search query', async () => {
    render(<VocabList items={items} />)
    await userEvent.type(screen.getByPlaceholderText('Поиск по словам...'), 'apple')
    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.queryByText('banana')).not.toBeInTheDocument()
  })

  it('shows correct badge for each knowledge level', () => {
    render(<VocabList items={items} />)
    // badges appear as <span> elements; tabs also use these labels, so use getAllBy
    expect(screen.getAllByText('Новое').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Учится').length).toBeGreaterThanOrEqual(2) // tab + badge
    expect(screen.getAllByText('Выучено').length).toBeGreaterThanOrEqual(2) // tab + badge
  })

  it('shows empty state when items array is empty', () => {
    render(<VocabList items={[]} />)
    expect(screen.getByText(/Словарь пока пуст/)).toBeInTheDocument()
  })

  it('"Show more" button loads next 20 items', async () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => makeItem(String(i), `word${i}`, 0))
    render(<VocabList items={manyItems} />)
    expect(screen.queryByText('word20')).not.toBeInTheDocument()
    await userEvent.click(screen.getByText(/Показать ещё/))
    expect(screen.getByText('word20')).toBeInTheDocument()
  })

  it('tab filter correctly filters by learning status', async () => {
    render(<VocabList items={items} />)
    await userEvent.click(screen.getByRole('button', { name: 'Учится' }))
    expect(screen.getByText('banana')).toBeInTheDocument()
    expect(screen.queryByText('apple')).not.toBeInTheDocument()
    expect(screen.queryByText('cherry')).not.toBeInTheDocument()
  })
})
