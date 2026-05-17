# SRS Algorithm

This document explains the spaced repetition system (SRS) that drives vocabulary scheduling in Fluent — what SM-2 is, how the formulas work, how grades are derived from exercise scores, and the full lifecycle of a vocabulary item.

---

## What is Spaced Repetition?

Spaced repetition is a memory technique that schedules reviews at increasing intervals. Instead of reviewing all words every day, the system shows a word shortly after you first learn it, then again a few days later, then a week later, then a month — with the interval growing each time you recall it correctly. Words you find difficult are shown more often; words you know well are shown less.

This exploits the **spacing effect**: information is retained far better when reviews are spread over time rather than massed together (cramming).

---

## The SM-2 Algorithm

Fluent implements the **SuperMemo 2 (SM-2)** algorithm, introduced by Piotr Woźniak in 1987. It remains the most widely deployed SRS algorithm and is the basis for tools like Anki.

The core implementation lives in `src/lib/srs.ts`.

### Input

Each review takes a `grade` between 0 and 5:

| Grade | Meaning |
|-------|---------|
| 0 | Complete blackout — no recall at all |
| 1 | Incorrect, but on seeing the answer it was recognizable |
| 2 | Incorrect, but the answer felt easy once seen |
| 3 | Correct with significant difficulty |
| 4 | Correct with some hesitation |
| 5 | Perfect recall with no hesitation |

### Ease Factor Update Formula

The **ease factor (EF)** is a multiplier that reflects how easy a word is for the user. It starts at 2.5 and is adjusted after every review:

```
EF_new = EF_old + (0.1 − (5 − grade) × (0.08 + (5 − grade) × 0.02))
```

The ease factor never falls below **1.3** (hard minimum). A word can always get harder, but the interval will never grow slower than 1.3× per cycle.

### Interval Calculation

The interval (in days) is determined by how many successful reviews the word has had:

```
If grade < 3:
  interval = 1
  repetitions = 0   ← reset to start

If grade ≥ 3:
  repetitions == 0: interval = 1
  repetitions == 1: interval = 6
  repetitions >= 2: interval = round(interval_prev × EF)
  repetitions += 1
```

The first two intervals are fixed (1 day, then 6 days) regardless of EF. From the third review onward, the interval grows exponentially by the ease factor.

### Due Date Calculation

After computing the new interval, the next review is scheduled at **midnight UTC** of `today + interval` days. Using midnight normalizes scheduling so that all reviews due on the same calendar day are grouped together.

---

## VocabItem Fields Related to SRS

| Field | Type | Role |
|-------|------|------|
| `repetitions` | Int | Number of consecutive successful reviews. Resets to 0 on failure. |
| `easeFactor` | Float | Difficulty multiplier. Starts at 2.5; minimum 1.3. |
| `interval` | Int | Days until next review. |
| `dueAt` | DateTime | Absolute date when the item is next due for review. |
| `lastScore` | Int? | The grade (0–5) from the most recent review, stored for analytics. |

---

## Converting Score to Grade

The tutor returns a `score` (0–10) in its JSON response. This is converted to an SM-2 `grade` (0–5) by the `gradeFromScore()` function in `src/lib/srs.ts`:

| Score range | Grade | Interpretation |
|-------------|-------|----------------|
| 0–1 | 0 | Complete failure |
| 2–3 | 1 | Poor — mostly incorrect |
| 4 | 2 | Weak — incorrect but close |
| 5–6 | 3 | Acceptable — correct with difficulty |
| 7–8 | 4 | Good — correct with minor hesitation |
| 9–10 | 5 | Excellent — perfect recall |

---

## What Happens on a Correct Answer (grade ≥ 3)

1. The ease factor is adjusted upward (grade 5) or slightly downward (grade 3) using the formula.
2. The interval grows: 1 → 6 → `round(6 × EF)` → `round(prev × EF)` → …
3. `repetitions` is incremented.
4. `dueAt` is set to `today + new interval` at midnight UTC.
5. `lastScore` is updated to the grade.

For a word with EF = 2.5 after the second successful review:
- Third review: interval = `round(6 × 2.5)` = 15 days
- Fourth review: interval = `round(15 × 2.5)` = 38 days
- Fifth review: interval = `round(38 × 2.5)` = 95 days

---

## What Happens on an Incorrect Answer (grade < 3)

1. `repetitions` is reset to 0.
2. `interval` is reset to 1.
3. The ease factor is still adjusted (slightly downward) — the word becomes a little harder.
4. `dueAt` is set to tomorrow.
5. `lastScore` is updated to the failing grade.

The word effectively restarts its learning cycle from scratch, but EF carries memory of the difficulty history, so it typically takes longer to reach long intervals again.

---

## Example Lifecycle of a Single Word

Suppose a user learns the German word **"Schlüssel" (key)**:

| Event | Score | Grade | Repetitions | Interval | EF | Due in |
|-------|-------|-------|-------------|----------|----|--------|
| Added | — | — | 0 | 0 | 2.50 | Today |
| First review | 7/10 | 4 | 1 | 1 day | 2.50 | Tomorrow |
| Second review | 9/10 | 5 | 2 | 6 days | 2.60 | +6 days |
| Third review | 8/10 | 4 | 3 | 16 days | 2.60 | +16 days |
| Fourth review | 4/10 | 2 | 0 (reset) | 1 day | 2.42 | Tomorrow |
| Fifth review | 9/10 | 5 | 1 | 1 day | 2.52 | Tomorrow |
| Sixth review | 10/10 | 5 | 2 | 6 days | 2.62 | +6 days |
| Seventh review | 9/10 | 5 | 3 | 16 days | 2.72 | +16 days |

After two full cycles without failure, the word would reach intervals of 40+ days and be considered effectively mastered.

---

## Why SM-2 Rather Than FSRS?

FSRS (Free Spaced Repetition Scheduler) is a newer, more mathematically sophisticated algorithm that outperforms SM-2 in controlled studies. However, SM-2 was chosen for Fluent for the following reasons:

1. **Simplicity** — SM-2 is straightforward to implement, test, and reason about. The entire algorithm fits in ~30 lines of TypeScript with no external dependencies.
2. **Reliability** — It has decades of real-world use across millions of learners. Its behavior is well understood and predictable.
3. **Sufficient quality** — For the scale and use case of Fluent, SM-2 provides excellent results. FSRS's gains require large personal review datasets to calibrate, which new users don't have.

FSRS could be a worthwhile upgrade in the future once per-user review history is more substantial.

---

## See Also

- [database.md](./database.md) — Full VocabItem model with all field types
- [session-flow.md](./session-flow.md) — How grades are submitted after each exercise
- [ai-integration.md](./ai-integration.md) — How the tutor generates the score that feeds into grading
- [api-routes.md](./api-routes.md) — `/api/vocab/review` endpoint specification
