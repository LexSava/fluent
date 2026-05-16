export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5

export type VocabItem = {
  id: string
  userId: string
  term: string
  translation: string
  context: string | null
  repetitions: number
  easeFactor: number
  interval: number
  dueAt: Date
  lastScore: number | null
  createdAt: Date
  updatedAt: Date
}

export type SrsResult = {
  repetitions: number
  easeFactor: number
  interval: number
  dueAt: Date
}
