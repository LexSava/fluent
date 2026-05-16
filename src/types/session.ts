export enum SessionFormat {
  REVIEW = 'REVIEW',
  VOCABULARY = 'VOCABULARY',
  GRAMMAR = 'GRAMMAR',
  READING = 'READING',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
}

export type SessionFormatInfo = {
  label: string
  icon: string
  description: string
}

export const SESSION_FORMATS: Record<SessionFormat, SessionFormatInfo> = {
  [SessionFormat.REVIEW]: {
    label: 'Повторение',
    icon: 'RotateCcw',
    description: 'Повторение изученных слов и фраз по карточкам',
  },
  [SessionFormat.VOCABULARY]: {
    label: 'Словарный запас',
    icon: 'BookOpen',
    description: 'Изучение новых слов и выражений в контексте',
  },
  [SessionFormat.GRAMMAR]: {
    label: 'Грамматика',
    icon: 'Pencil',
    description: 'Упражнения на грамматические конструкции',
  },
  [SessionFormat.READING]: {
    label: 'Чтение',
    icon: 'FileText',
    description: 'Работа с текстами и задания на понимание',
  },
  [SessionFormat.WRITING]: {
    label: 'Письмо',
    icon: 'Edit3',
    description: 'Свободное письмо с обратной связью от тьютора',
  },
  [SessionFormat.SPEAKING]: {
    label: 'Разговор',
    icon: 'MessageCircle',
    description: 'Свободный диалог с AI-тьютором',
  },
}

export type LearningSession = {
  id: string
  userId: string
  format: SessionFormat
  startedAt: Date
  endedAt: Date | null
  score: number | null
  exercisesTotal: number
  exercisesCorrect: number
}

export type Exercise = {
  id: string
  sessionId: string
  vocabItemId: string | null
  type: string
  prompt: string
  userAnswer: string
  score: number
  feedback: string
  createdAt: Date
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}
