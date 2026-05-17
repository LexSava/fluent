export default function SessionLoading() {
  return (
    <div className="flex h-full flex-col animate-pulse">
      {/* Session header */}
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="h-5 w-16 rounded bg-[var(--bg-elevated)]" />
        <div className="h-5 w-32 rounded bg-[var(--bg-elevated)]" />
        <div className="h-7 w-20 rounded-sm bg-[var(--bg-elevated)]" />
      </div>

      {/* Progress bar */}
      <div className="pb-3">
        <div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)]" />
      </div>

      {/* Chat area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-[var(--border)] pt-4 px-4 gap-4">
        <div className="flex justify-start">
          <div className="h-20 w-64 rounded-[2px_8px_8px_8px] bg-[var(--bg-elevated)]" />
        </div>
        <div className="flex justify-end">
          <div className="h-10 w-40 rounded-[8px_2px_8px_8px] bg-[var(--bg-elevated)]" />
        </div>
        <div className="flex justify-start">
          <div className="h-16 w-72 rounded-[2px_8px_8px_8px] bg-[var(--bg-elevated)]" />
        </div>
      </div>

      {/* Input area */}
      <div className="p-4">
        <div className="h-11 w-full rounded-sm bg-[var(--bg-elevated)]" />
      </div>
    </div>
  )
}
