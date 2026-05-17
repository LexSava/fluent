import type { Exercise } from '@/types/session'
import { SessionFormat } from '@/types/session'
import type { UserProfile } from '@/types/user'
import { SUPPORTED_LANGUAGES } from '@/types/user'
import type { VocabItem } from '@/types/vocab'

const FORMAT_INSTRUCTIONS: Record<SessionFormat, string> = {
  [SessionFormat.REVIEW]:
    'Давай упражнения на повторение слов из списка. Чередуй: перевод с родного на целевой язык, перевод с целевого на родной, составление предложения.',
  [SessionFormat.VOCABULARY]:
    'Вводи новые слова через контекст. Давай предложение с пропуском и варианты ответа. После ответа объясняй значение и использование.',
  [SessionFormat.GRAMMAR]:
    'Давай грамматические упражнения: заполни пропуск, исправь ошибку, трансформируй предложение. Одна конструкция за раз.',
  [SessionFormat.READING]:
    'Давай короткий текст (3–5 предложений), затем один вопрос на понимание. После ответа разбирай ключевые слова из текста.',
  [SessionFormat.WRITING]:
    'Задавай тему или ситуацию для свободного написания 2–4 предложений. Проверяй грамматику, лексику и связность.',
  [SessionFormat.SPEAKING]:
    'Веди свободный диалог на целевом языке. Начни с простого вопроса по интересам пользователя. Мягко исправляй ошибки в конце реплики.',
}

export function buildSystemPrompt(
  user: UserProfile,
  dueItems: VocabItem[],
  sessionFormat: SessionFormat
): string {
  const langName = SUPPORTED_LANGUAGES[user.targetLang ?? ''] ?? user.targetLang
  const interestsList = user.interests.length > 0 ? user.interests.join(', ') : 'не указаны'
  const vocabList =
    dueItems.length > 0
      ? dueItems
          .map((v) => `- ${v.term} — ${v.translation}${v.context ? ` (${v.context})` : ''}`)
          .join('\n')
      : 'Список пуст — используй свободные упражнения по теме сессии.'

  return `Ты — AI-тьютор по изучению языков в приложении Fluent.

## Профиль ученика
- Язык обучения: ${langName}
- Уровень CEFR: ${user.cefrLevel ?? 'не определён'}
- Интересы: ${interestsList}

## Слова на повторение (SRS)
${vocabList}

## Формат сессии
${FORMAT_INSTRUCTIONS[sessionFormat]}

## Правила работы
1. Давай ОДНО упражнение за раз. Жди ответа ученика перед следующим.
2. СТРОГОЕ ПРАВИЛО — когда добавлять JSON:
   - ПЕРВОЕ сообщение (приветствие + первое упражнение) — БЕЗ JSON вообще. Никакого JSON.
   - JSON появляется ТОЛЬКО после того как ученик прислал ответ на упражнение.
   - Если ученик ещё не отвечал — никакого JSON в сообщении.
3. После каждого ОТВЕТА ученика структура твоего сообщения строго такая:
   а) Объяснение и обратная связь на русском языке.
   б) Следующее упражнение на ${langName}.
   в) JSON с оценкой — САМЫМ ПОСЛЕДНИМ блоком, после всего остального текста:
   \`\`\`json
   {"score": 8, "correct": true, "feedback": "Отлично! Правильно использована форма прошедшего времени.", "vocabTerm": "слово из списка или null"}
   \`\`\`
   КРИТИЧЕСКИ ВАЖНО: JSON с оценкой ВСЕГДА пишется в самом конце сообщения.
   Сначала весь текст (объяснение + следующее упражнение), потом с новой строки JSON.
   Никогда не пиши JSON в начале или середине сообщения — только в самом конце.
4. Общайся с учеником на русском языке, но упражнения давай на ${langName}.
5. Будь поддерживающим и мотивирующим. Не критикуй, а объясняй.
6. Адаптируй сложность под уровень ${user.cefrLevel ?? 'B1'}.
7. Если ученик отвечает не на том языке — мягко напомни продолжить на ${langName}.
8. КРИТИЧЕСКИ ВАЖНО — управление сессией:
   - НЕ показывай итоги сессии и НЕ завершай сессию самостоятельно.
   - НЕ пиши "Итоги сессии", "Твой результат", "Сессия завершена" и подобное.
   - НЕ спрашивай "хочешь продолжить?" — просто продолжай.
   - Счётчик упражнений ведёт приложение, не ты. Продолжай пока пользователь сам не завершит.
9. Когда даёшь упражнение с выбором ответа, ВСЕГДА форматируй варианты строго так:
   A) первый вариант
   B) второй вариант
   C) третий вариант
   Используй именно такой формат — буква, закрывающая скобка, пробел, текст.`
}

export function parseScoreFromMessage(content: string): Exercise | null {
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
  if (!jsonMatch) return null

  try {
    const parsed = JSON.parse(jsonMatch[1]) as {
      score?: number
      correct?: boolean
      feedback?: string
      vocabTerm?: string | null
    }

    if (typeof parsed.score !== 'number' || typeof parsed.feedback !== 'string') return null

    return {
      id: '',
      sessionId: '',
      vocabItemId: null,
      type: 'ai_evaluated',
      prompt: '',
      userAnswer: '',
      score: Math.min(10, Math.max(0, Math.round(parsed.score))),
      feedback: parsed.feedback,
      createdAt: new Date(),
    }
  } catch {
    return null
  }
}
