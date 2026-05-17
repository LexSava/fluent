import { calculateNextReview, gradeFromScore } from '../srs'
import type { VocabItem } from '@/types/vocab'

function makeItem(overrides: Partial<VocabItem> = {}): VocabItem {
  return {
    id: '1',
    userId: 'u1',
    term: 'hello',
    translation: 'привет',
    context: null,
    repetitions: 2,
    easeFactor: 2.5,
    interval: 6,
    dueAt: new Date(),
    lastScore: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('calculateNextReview', () => {
  it('grade < 3 resets repetitions to 0', () => {
    const result = calculateNextReview(makeItem({ repetitions: 5 }), 2)
    expect(result.repetitions).toBe(0)
  })

  it('grade < 3 sets interval to 1', () => {
    const result = calculateNextReview(makeItem({ interval: 30 }), 1)
    expect(result.interval).toBe(1)
  })

  it('grade >= 3 increases interval', () => {
    const item = makeItem({ repetitions: 2, interval: 6, easeFactor: 2.5 })
    const result = calculateNextReview(item, 4)
    expect(result.interval).toBeGreaterThan(6)
  })

  it('easeFactor never drops below 1.3', () => {
    const item = makeItem({ easeFactor: 1.3 })
    const result = calculateNextReview(item, 3)
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('dueAt is set to a future date after review', () => {
    const result = calculateNextReview(makeItem(), 5)
    expect(result.dueAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('grade 3 increments repetitions', () => {
    const item = makeItem({ repetitions: 2 })
    const result = calculateNextReview(item, 3)
    expect(result.repetitions).toBe(3)
  })
})

describe('gradeFromScore', () => {
  it('score 0 returns grade 0', () => expect(gradeFromScore(0)).toBe(0))
  it('score 1 returns grade 0', () => expect(gradeFromScore(1)).toBe(0))
  it('score 3 returns grade 1', () => expect(gradeFromScore(3)).toBe(1))
  it('score 4 returns grade 2', () => expect(gradeFromScore(4)).toBe(2))
  it('score 6 returns grade 3', () => expect(gradeFromScore(6)).toBe(3))
  it('score 8 returns grade 4', () => expect(gradeFromScore(8)).toBe(4))
  it('score 10 returns grade 5', () => expect(gradeFromScore(10)).toBe(5))
})
