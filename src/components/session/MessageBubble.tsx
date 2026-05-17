'use client'

import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/session'
import { AnswerOptions } from './AnswerOptions'
import { MarkdownContent } from './MarkdownContent'

type ScoreBlock = {
  score: number
  correct: boolean
  feedback: string
}

const JSON_FENCE_RE = /```json\s*([\s\S]*?)\s*```/

function parseScore(content: string): { text: string; score: ScoreBlock | null } {
  const match = content.match(JSON_FENCE_RE)
  if (!match) return { text: content, score: null }

  try {
    const parsed = JSON.parse(match[1]) as Record<string, unknown>
    if (typeof parsed.score !== 'number') return { text: content, score: null }

    return {
      text: content.replace(match[0], '').trim(),
      score: {
        score: parsed.score,
        correct: parsed.correct === true,
        feedback: typeof parsed.feedback === 'string' ? parsed.feedback : '',
      },
    }
  } catch {
    return { text: content, score: null }
  }
}

type MessageBubbleProps = {
  message: ChatMessage
  isStreaming?: boolean
  isFirstInGroup?: boolean
  showTimestamp?: boolean
  timestamp?: string
  onOptionSelect?: (option: string) => void
}

export function MessageBubble({
  message,
  isStreaming = false,
  isFirstInGroup = true,
  showTimestamp = false,
  timestamp,
  onOptionSelect,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const { text, score } = isUser
    ? { text: message.content, score: null }
    : parseScore(message.content)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'flex',
        isUser ? 'justify-end' : 'justify-start',
        isFirstInGroup ? 'mt-4' : 'mt-1'
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-2',
          isUser ? 'max-w-[70%] items-end' : 'max-w-[85%] items-start'
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            'px-4 py-2.5 leading-relaxed',
            isUser
              ? 'rounded-[8px_2px_8px_8px] bg-[var(--accent)] text-white text-[14px]'
              : 'rounded-[2px_8px_8px_8px] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] text-[15px]'
          )}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{text || ' '}</span>
          ) : (
            <>
              {text ? (
                onOptionSelect ? (
                  <AnswerOptions content={text} onSelect={onOptionSelect} />
                ) : (
                  <MarkdownContent content={text} />
                )
              ) : (
                <span> </span>
              )}
              {isStreaming && (
                <span className="ml-1 inline-flex items-center gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="inline-block size-1 rounded-full bg-current opacity-60"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </span>
              )}
            </>
          )}
        </div>

        {/* Score block */}
        {score && (
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                'self-start rounded-[3px] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]',
                score.correct
                  ? 'border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]'
                  : 'border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_12%,transparent)] text-[var(--error)]'
              )}
            >
              {score.score} / 10
            </span>
            {score.feedback && (
              <p className="text-xs text-[var(--text-secondary)]">{score.feedback}</p>
            )}
          </div>
        )}

        {/* Timestamp */}
        {showTimestamp && timestamp && (
          <span className="text-[11px] text-[var(--text-hint)]">{timestamp}</span>
        )}
      </div>
    </motion.div>
  )
}
