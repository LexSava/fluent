'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Streamdown } from 'streamdown'

import { useTypewriter } from '@/hooks/useTypewriter'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/session'
import { AnswerOptions } from './AnswerOptions'
import { mdComponents } from './mdComponents'

type ScoreBlock = {
  score: number
  correct: boolean
  feedback: string
}

const JSON_FENCE_RE = /```json\s*([\s\S]*?)\s*```/

// Always strip the JSON block from text used for animation so it's never visible
// while typing — even during the post-streaming typewriter catch-up phase.
function stripJsonBlock(content: string): string {
  const fenceStart = content.indexOf('```json')
  if (fenceStart !== -1) return content.substring(0, fenceStart).trim()
  const jsonStart = content.indexOf('{"score"')
  if (jsonStart !== -1) return content.substring(0, jsonStart).trim()
  return content
}

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

export const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming = false,
  isFirstInGroup = true,
  showTimestamp = false,
  timestamp,
  onOptionSelect,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'

  // Typewriter target: always strip JSON so it's never animated onto screen
  const targetText = isUser ? message.content : stripJsonBlock(message.content)

  // Typewriter: animate displayed chars from '' → full text
  const displayed = useTypewriter(targetText, isStreaming)

  // isStillAnimating: typewriter hasn't caught up yet
  const isStillAnimating = displayed.length < targetText.length

  // For finished assistant messages: parse score block
  const { text: finalText, score } =
    !isUser && !isStreaming && !isStillAnimating
      ? parseScore(message.content)
      : { text: displayed, score: null }

  // Show interactive options only once animation is fully done
  const showOptions = !isUser && !isStreaming && !isStillAnimating && !!onOptionSelect

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
            <span className="whitespace-pre-wrap">{message.content || ' '}</span>
          ) : showOptions ? (
            <AnswerOptions content={finalText} onSelect={onOptionSelect!} />
          ) : displayed ? (
            <Streamdown
              isAnimating={isStreaming || isStillAnimating}
              caret="circle"
              controls={false}
              linkSafety={{ enabled: false }}
              components={mdComponents}
            >
              {displayed}
            </Streamdown>
          ) : (
            <span> </span>
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
})
