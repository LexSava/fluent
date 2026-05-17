import { useEffect, useRef, useState } from 'react'

// ~12ms/char ≈ 83 chars/sec, similar to claude.ai reading pace
const TICK_MS = 12

export function useTypewriter(target: string, isStreaming: boolean): string {
  const [displayed, setDisplayed] = useState(isStreaming ? '' : target)
  const targetRef = useRef(target)
  const posRef = useRef(isStreaming ? 0 : target.length)

  useEffect(() => {
    targetRef.current = target
  }, [target])

  useEffect(() => {
    // Already fully shown — skip animation
    if (!isStreaming && posRef.current >= targetRef.current.length) return

    const id = setInterval(() => {
      const t = targetRef.current
      if (posRef.current < t.length) {
        posRef.current++
        setDisplayed(t.slice(0, posRef.current))
      }
    }, TICK_MS)

    // Safety: force-complete if animation falls behind (e.g. large final chunk)
    const remainingAtStart = targetRef.current.length - posRef.current
    const safety = setTimeout(
      () => {
        clearInterval(id)
        posRef.current = targetRef.current.length
        setDisplayed(targetRef.current)
      },
      (remainingAtStart + 500) * TICK_MS
    )

    return () => {
      clearInterval(id)
      clearTimeout(safety)
    }
  }, [isStreaming])

  return displayed
}
