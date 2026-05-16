import type { ReviewGrade, SrsResult, VocabItem } from '@/types/vocab'

export function calculateNextReview(item: VocabItem, grade: ReviewGrade): SrsResult {
  const MIN_EASE_FACTOR = 1.3

  let { repetitions, easeFactor, interval } = item

  if (grade < 3) {
    repetitions = 0
    interval = 1
  } else {
    easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor)

    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }

    repetitions += 1
  }

  const dueAt = new Date()
  dueAt.setDate(dueAt.getDate() + interval)
  dueAt.setHours(0, 0, 0, 0)

  return { repetitions, easeFactor, interval, dueAt }
}

export function gradeFromScore(score: number): ReviewGrade {
  if (score <= 1) return 0
  if (score <= 3) return 1
  if (score <= 4) return 2
  if (score <= 6) return 3
  if (score <= 8) return 4
  return 5
}
