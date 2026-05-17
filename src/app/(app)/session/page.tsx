'use client'

import {
  ArrowLeft,
  BookOpen,
  Edit3,
  FileText,
  MessageCircle,
  MessageSquare,
  Pencil,
  RotateCcw,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'

import { ChatWindow, clearSessionStorage } from '@/components/session/ChatWindow'
import { ProgressBar } from '@/components/session/ProgressBar'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { SESSION_FORMATS, SessionFormat } from '@/types/session'
import type { Exercise } from '@/types/session'

const FORMAT_ICONS: Record<string, LucideIcon> = {
  RotateCcw,
  BookOpen,
  Pencil,
  FileText,
  Edit3,
  MessageCircle,
}

const TOTAL_EXERCISES = 10

// ── Inner client component that reads searchParams ────────────────────────────

function SessionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get('sessionId') ?? ''
  const rawFormat = searchParams.get('format') ?? ''
  const sessionFormat =
    rawFormat in SessionFormat ? (rawFormat as SessionFormat) : SessionFormat.VOCABULARY

  const [exerciseScores, setExerciseScores] = useState<number[]>(() => {
    try {
      const raw = sessionStorage.getItem(`exercise_count_${sessionId}`)
      const count = raw ? parseInt(raw, 10) : 0
      return Array(count).fill(0)
    } catch {
      return []
    }
  })
  const [isCompleting, setIsCompleting] = useState(false)
  const [endError, setEndError] = useState<string | null>(null)
  const [showExitModal, setShowExitModal] = useState(false)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const endErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Redirect to saved session if URL has no sessionId
  useEffect(() => {
    if (!sessionId) {
      try {
        const savedUrl = sessionStorage.getItem('active_session_url')
        if (savedUrl) {
          router.replace(savedUrl)
        }
      } catch {}
    }
  }, [sessionId, router])

  const exerciseCount = exerciseScores.length
  const formatInfo = SESSION_FORMATS[sessionFormat]

  function handleExerciseDone(score: number) {
    setExerciseScores((prev) => [...prev, score])
  }

  async function doComplete() {
    if (isCompleting) return
    setIsCompleting(true)
    setEndError(null)
    setShowFinishModal(false)

    const exercises: Pick<
      Exercise,
      | 'id'
      | 'sessionId'
      | 'vocabItemId'
      | 'type'
      | 'prompt'
      | 'userAnswer'
      | 'score'
      | 'feedback'
      | 'createdAt'
    >[] = exerciseScores.map((score, i) => ({
      id: `ex-${i}`,
      sessionId,
      vocabItemId: null,
      type: 'ai_evaluated',
      prompt: '',
      userAnswer: '',
      score,
      feedback: '',
      createdAt: new Date(),
    }))

    try {
      const res = await fetch('/api/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, exercises }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      clearSessionStorage(sessionId)
      router.push('/dashboard')
    } catch (err) {
      console.error('Session end error:', err)
      setEndError('Ошибка завершения. Попробуйте снова.')
      if (endErrorTimer.current) clearTimeout(endErrorTimer.current)
      endErrorTimer.current = setTimeout(() => setEndError(null), 4000)
      setIsCompleting(false)
    }
  }

  function handleComplete() {
    setShowFinishModal(true)
  }

  function handleExit() {
    setShowExitModal(true)
  }

  function confirmExit() {
    clearSessionStorage(sessionId)
    router.push('/dashboard')
  }

  // ── No sessionId: informative empty state ─────────────────────────────────
  if (!sessionId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 py-12">
        <MessageSquare size={64} className="text-[var(--accent)]" style={{ opacity: 0.6 }} />

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[22px] font-semibold text-[var(--text-primary)]">
            Выбери формат занятия
          </h1>
          <p className="max-w-[360px] text-[15px] leading-relaxed text-[var(--text-secondary)]">
            Чтобы начать сессию, перейди на главную страницу и выбери формат
          </p>
        </div>

        <div className="grid w-full max-w-lg grid-cols-2 gap-2 sm:grid-cols-3">
          {(Object.keys(SESSION_FORMATS) as SessionFormat[]).map((format) => {
            const info = SESSION_FORMATS[format]
            const Icon = FORMAT_ICONS[info.icon] ?? MessageCircle
            return (
              <button
                key={format}
                onClick={() => router.push('/dashboard?startSession=true')}
                className="flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-4 text-center transition-colors duration-150 hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)]"
              >
                <Icon size={20} className="text-[var(--text-hint)]" />
                <span className="text-xs font-medium text-[var(--text-primary)]">{info.label}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Перейти на главную
        </button>
      </div>
    )
  }

  // ── Active session ────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col">
      {/* Session header */}
      <div className="flex items-center justify-between gap-3 pb-3">
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={15} />
          Выйти
        </button>

        <p className="text-sm font-semibold text-[var(--text-primary)]">{formatInfo.label}</p>

        <Button
          variant="ghost"
          size="sm"
          disabled={isCompleting}
          loading={isCompleting}
          onClick={handleComplete}
        >
          Завершить
        </Button>
      </div>

      {/* Progress bar */}
      <div className="pb-3">
        <ProgressBar current={exerciseCount} total={TOTAL_EXERCISES} />
      </div>

      {/* Error banner */}
      {endError && (
        <div className="mb-2 rounded-sm border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,transparent)] px-3 py-2 text-xs text-[var(--error)]">
          {endError}
        </div>
      )}

      {/* Chat — takes all remaining space; min-h-0 allows flex-1 children to shrink and scroll */}
      <div className="flex min-h-0 flex-1 overflow-hidden border-t border-[var(--border)]">
        <ChatWindow
          sessionId={sessionId}
          sessionFormat={sessionFormat}
          onComplete={doComplete}
          onExerciseDone={handleExerciseDone}
        />
      </div>

      {/* Exit confirmation modal */}
      <ConfirmModal
        isOpen={showExitModal}
        title="Выйти из сессии?"
        description="Прогресс текущей сессии не будет сохранён. Ты уверен?"
        confirmText="Выйти"
        cancelText="Остаться"
        variant="warning"
        onCancel={() => setShowExitModal(false)}
        onConfirm={confirmExit}
      />

      {/* Finish confirmation modal */}
      <ConfirmModal
        isOpen={showFinishModal}
        title="Завершить сессию?"
        description="Результаты будут сохранены и ты увидишь статистику."
        confirmText="Завершить"
        cancelText="Продолжить"
        variant="danger"
        onCancel={() => setShowFinishModal(false)}
        onConfirm={() => void doComplete()}
      />
    </div>
  )
}

// ── Page export with Suspense boundary ────────────────────────────────────────

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <span className="size-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  )
}
