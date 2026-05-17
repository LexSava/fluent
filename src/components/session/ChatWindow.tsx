'use client'

import { BookOpen, MessageCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { SessionFormat } from '@/types/session'
import type { ChatMessage } from '@/types/session'
import { InputBar } from './InputBar'
import { MessageBubble } from './MessageBubble'

const INIT_TEXT = 'Начни учебную сессию. Поприветствуй меня и дай первое упражнение.'
const JSON_FENCE_RE = /```json\s*([\s\S]*?)\s*```/
const TOTAL_EXERCISES = 10

type LocalMessage = ChatMessage & { createdAt: Date }

type ChatWindowProps = {
  sessionId: string
  sessionFormat: SessionFormat
  onComplete: () => void
  onExerciseDone?: (score: number) => void
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function getPlaceholder(format: SessionFormat, isLoading: boolean): string {
  if (isLoading) return 'Тьютор печатает...'
  switch (format) {
    case SessionFormat.VOCABULARY:
      return 'Введи перевод или используй слово в предложении...'
    case SessionFormat.GRAMMAR:
      return 'Напиши правильную форму...'
    case SessionFormat.READING:
      return 'Ответь на вопрос по тексту...'
    default:
      return 'Напиши свой ответ...'
  }
}

// toTextStreamResponse streams plain UTF-8 text — just decode directly
function extractStreamText(raw: string): string {
  return raw
}

function loadStoredMessages(sessionId: string): LocalMessage[] {
  try {
    const raw = sessionStorage.getItem(`chat_messages_${sessionId}`)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<ChatMessage & { createdAt: string }>
    return parsed.map((m) => ({ ...m, createdAt: new Date(m.createdAt) }))
  } catch {
    return []
  }
}

function loadStoredExerciseCount(sessionId: string): number {
  try {
    const raw = sessionStorage.getItem(`exercise_count_${sessionId}`)
    return raw ? parseInt(raw, 10) : 0
  } catch {
    return 0
  }
}

export function clearSessionStorage(sessionId: string) {
  sessionStorage.removeItem(`chat_messages_${sessionId}`)
  sessionStorage.removeItem(`exercise_count_${sessionId}`)
  sessionStorage.removeItem('active_session_id')
  sessionStorage.removeItem('active_session_format')
  sessionStorage.removeItem('active_session_url')
}

export function ChatWindow({
  sessionId,
  sessionFormat,
  onComplete,
  onExerciseDone,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exerciseCount, setExerciseCount] = useState<number>(0)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const initSentRef = useRef(false)
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const forceScrollRef = useRef(false)
  const isMountedRef = useRef(false)

  // Scroll to bottom whenever content height grows (new messages or typewriter animation).
  // ResizeObserver fires after layout, so the DOM is always fully measured.
  // Only auto-scrolls when user is already near the bottom (< 200px away),
  // so manual scroll-up is preserved.
  useEffect(() => {
    const container = scrollContainerRef.current
    const inner = messagesContainerRef.current
    if (!container || !inner) return

    const scrollToBottom = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      if (scrollHeight - scrollTop - clientHeight < 200) {
        container.scrollTop = scrollHeight
      }
    }

    const observer = new ResizeObserver(scrollToBottom)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isMountedRef.current) return
    try {
      sessionStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(messages))
    } catch {}
  }, [messages, sessionId])

  useEffect(() => {
    if (!isMountedRef.current) return
    try {
      sessionStorage.setItem(`exercise_count_${sessionId}`, String(exerciseCount))
    } catch {}
  }, [exerciseCount, sessionId])

  useEffect(() => {
    try {
      sessionStorage.setItem('active_session_id', sessionId)
      sessionStorage.setItem('active_session_format', sessionFormat)
      sessionStorage.setItem(
        'active_session_url',
        `/session?sessionId=${sessionId}&format=${sessionFormat}`
      )
    } catch {}
  }, [sessionId, sessionFormat])

  useEffect(() => {
    isMountedRef.current = true
    const stored = loadStoredMessages(sessionId)
    const storedCount = loadStoredExerciseCount(sessionId)
    if (!initSentRef.current) {
      initSentRef.current = true
      if (stored.length === 0) {
        void sendMessage(INIT_TEXT, [])
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages(stored)

        setExerciseCount(storedCount)
        // Restored session: scroll to bottom instantly after DOM paint
        requestAnimationFrame(() => {
          const container = scrollContainerRef.current
          if (container) container.scrollTop = container.scrollHeight
        })
      }
    }
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    }
  }, [])

  // Smooth scroll after user sends a message (forceScrollRef set in handleSend)
  useEffect(() => {
    if (!forceScrollRef.current) return
    forceScrollRef.current = false
    const container = scrollContainerRef.current
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function showError(msg: string) {
    setError(msg)
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    errorTimerRef.current = setTimeout(() => setError(null), 4000)
  }

  async function sendMessage(content: string, currentMessages: LocalMessage[]) {
    const userMsg: LocalMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date(),
    }
    const newMessages = [...currentMessages, userMsg]
    setMessages(newMessages)
    setIsLoading(true)

    const assistantId = crypto.randomUUID()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          sessionId,
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const assistantCreatedAt = new Date()
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', createdAt: assistantCreatedAt },
      ])
      setStreamingId(assistantId)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullContent += extractStreamText(decoder.decode(value, { stream: true }))
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m))
        )
      }

      handleFinish(fullContent, newMessages)
    } catch (err) {
      console.error('Chat error:', err)
      showError('Ошибка соединения. Попробуйте снова.')
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
    } finally {
      setIsLoading(false)
      setStreamingId(null)
    }
  }

  function handleFinish(content: string, contextMessages: LocalMessage[]) {
    // Skip scoring if the user hasn't actually answered yet (first AI message)
    const hasRealUserMessage = contextMessages.some(
      (m) => m.role === 'user' && m.content !== INIT_TEXT
    )
    if (!hasRealUserMessage) return

    const match = content.match(JSON_FENCE_RE)
    if (!match) return

    try {
      const parsed = JSON.parse(match[1]) as Record<string, unknown>
      if (typeof parsed.score !== 'number') return

      const score = parsed.score as number
      const correct = parsed.correct === true

      setExerciseCount((prev) => prev + 1)
      onExerciseDone?.(score)

      if (parsed.vocabTerm && typeof parsed.vocabTerm === 'string') {
        const grade = score >= 8 ? 5 : score >= 6 ? 4 : score >= 4 ? 3 : score >= 2 ? 2 : 1
        void fetch('/api/vocab/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ term: parsed.vocabTerm, grade }),
        }).catch((err: unknown) => console.error('Vocab review error:', err))
      }

      void correct
    } catch (err) {
      console.error('Score parse error:', err)
    }
  }

  function handleSend(text: string) {
    if (isLoading) return
    forceScrollRef.current = true
    void sendMessage(text, messages)
  }

  const displayMessages = messages.filter((m) => !(m.role === 'user' && m.content === INIT_TEXT))

  const isInitialLoading = displayMessages.length === 0 && isLoading

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      {/* Messages */}
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <div ref={messagesContainerRef} className="mx-auto flex max-w-2xl flex-col">
          {/* Empty state while waiting for first message */}
          {isInitialLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="flex size-12 items-center justify-center rounded-md border border-border bg-bg-elevated">
                <BookOpen size={22} className="text-accent" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-medium text-text-primary">
                  Тьютор готовит первое упражнение...
                </p>
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block size-1.5 rounded-full bg-accent"
                      style={{
                        animation: 'pulse 1.2s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}

          {/* No messages yet but not loading */}
          {!isLoading && displayMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <MessageCircle size={32} className="text-text-hint" />
              <p className="text-sm text-text-secondary">Начни сессию</p>
            </div>
          )}

          {/* Message list */}
          {displayMessages.map((msg, index) => {
            const prevMsg = displayMessages[index - 1]
            const nextMsg = displayMessages[index + 1]
            const isFirstInGroup = !prevMsg || prevMsg.role !== msg.role
            const isLastInGroup = !nextMsg || nextMsg.role !== msg.role
            const showTimestamp = isLastInGroup

            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={msg.id === streamingId}
                isFirstInGroup={isFirstInGroup}
                showTimestamp={showTimestamp && !isLoading}
                timestamp={formatTime(msg.createdAt)}
                onOptionSelect={msg.role === 'assistant' ? handleSend : undefined}
              />
            )
          })}

          {/* Typing indicator while streaming (after first message appeared) */}
          {isLoading && displayMessages.length > 0 && !streamingId && (
            <div className="mt-4 flex justify-start">
              <div className="rounded-[2px_8px_8px_8px] border border-border bg-bg-card px-4 py-3">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        'inline-block size-1.5 rounded-full bg-text-hint',
                        'animate-bounce'
                      )}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}

          <div className="h-5 shrink-0" />
        </div>
      </div>

      {/* Complete button at 10 exercises */}
      {exerciseCount >= TOTAL_EXERCISES && (
        <div className="px-4 pb-2">
          <div className="mx-auto max-w-2xl">
            <Button variant="primary" size="md" className="w-full" onClick={onComplete}>
              Завершить сессию — все упражнения выполнены!
            </Button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2">
          <div className="mx-auto max-w-2xl rounded-sm border border-error bg-[color-mix(in_srgb,var(--error)_10%,transparent)] px-3 py-2 text-xs text-error">
            {error}
          </div>
        </div>
      )}

      {/* Input */}
      <InputBar
        onSend={handleSend}
        disabled={isLoading}
        placeholder={getPlaceholder(sessionFormat, isLoading)}
      />
    </div>
  )
}
